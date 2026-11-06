const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { DatabaseSync } = require('node:sqlite');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('EDITH Read-Only Database Explorer (/api/v1/edith/database)', () => {
  const testEmail = `edith_db_${Date.now()}@friday-edith.local`;
  const otherEmail = `edith_db_other_${Date.now()}@friday-edith.local`;
  let token;
  let otherToken;
  let userId;
  let otherUserId;
  let tempRoot;
  let projectId;

  beforeAll(async () => {
    // 1. Create temporary directory for workspace
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'edith-db-suite-'));

    // Create a custom workspace SQLite database
    const customDbPath = path.join(tempRoot, 'workspace_data.db');
    const customDb = new DatabaseSync(customDbPath);
    customDb.exec('CREATE TABLE test_items (id INTEGER PRIMARY KEY, name TEXT, stock INTEGER);');
    customDb.exec("INSERT INTO test_items (name, stock) VALUES ('Quantum Sensor', 25);");
    customDb.exec("INSERT INTO test_items (name, stock) VALUES ('Telemetry Node', 10);");
    customDb.close();

    // 2. Register primary test user
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: 'Password123!', name: 'DB Analyst' });
    token = res1.body.data.token;
    userId = res1.body.data.user.id;

    // 3. Register secondary user
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: otherEmail, password: 'Password123!', name: 'Other User' });
    otherToken = res2.body.data.token;
    otherUserId = res2.body.data.user.id;

    // 4. Register tempRoot as project root for primary user
    const regRes = await request(app)
      .post('/api/v1/edith/fs/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Database Explorer Project',
        rootPath: tempRoot
      });
    projectId = regRes.body.data.projectId;
  });

  afterAll(async () => {
    // Clean up temporary disk files
    try {
      if (tempRoot && fs.existsSync(tempRoot)) {
        fs.rmSync(tempRoot, { recursive: true, force: true });
      }
    } catch {}

    // Clean up test database records
    await prisma.edithWorkspace.deleteMany({
      where: { project: { ownerId: { in: [userId, otherUserId] } } }
    }).catch(() => {});
    await prisma.project.deleteMany({
      where: { ownerId: { in: [userId, otherUserId] } }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get(`/api/v1/edith/database/databases?projectId=${projectId}`);
    expect(res.statusCode).toBe(401);
  });

  it('discovers only databases inside the project workspace', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/database/databases?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const dbs = res.body.data.databases;
    expect(Array.isArray(dbs)).toBe(true);

    expect(dbs.some((d) => d.id === 'default' || d.isDefault)).toBe(false);

    // Workspace database should also be discovered
    const workspaceDb = dbs.find((d) => d.name === 'workspace_data.db');
    expect(workspaceDb).toBeDefined();
  });

  it('lists tables and views with row counts from the project database', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/database/tables?projectId=${projectId}&database=workspace_data.db`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.tables)).toBe(true);

    const tableNames = res.body.data.tables.map((t) => t.name);
    expect(tableNames).toContain('test_items');
  });

  it('inspects column schema, primary keys, and types for a table', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/database/schema/test_items?projectId=${projectId}&database=workspace_data.db`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tableName).toBe('test_items');

    const colNames = res.body.data.columns.map((c) => c.name);
    expect(colNames).toContain('id');
    expect(colNames).toContain('stock');

    const idCol = res.body.data.columns.find((c) => c.name === 'id');
    expect(idCol.pk).toBe(true);
  });

  it('retrieves paginated records from a table', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/database/records/test_items?projectId=${projectId}&database=workspace_data.db&page=1&limit=5`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(5);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.rows)).toBe(true);
    expect(Array.isArray(res.body.data.columns)).toBe(true);
  });

  it('executes a safe read-only SELECT query and measures execution time', async () => {
    const res = await request(app)
      .post('/api/v1/edith/database/query')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        database: 'workspace_data.db',
        sql: 'SELECT id, name, stock FROM test_items LIMIT 10'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rowCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.columns).toEqual(['id', 'name', 'stock']);
    expect(typeof res.body.data.executionTimeMs).toBe('number');
  });

  it('executes read-only queries against project-internal SQLite databases', async () => {
    const res = await request(app)
      .post('/api/v1/edith/database/query')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        database: 'workspace_data.db',
        sql: 'SELECT * FROM test_items ORDER BY stock DESC'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.rowCount).toBe(2);
    expect(res.body.data.rows[0].name).toBe('Quantum Sensor');
    expect(res.body.data.rows[0].stock).toBe(25);
  });

  describe('Read-Only Enforcement & Security Guardrails', () => {
    it('blocks INSERT queries with 403', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: "INSERT INTO test_items (name, stock) VALUES ('hacked', 0)"
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('READ_ONLY_VIOLATION');
    });

    it('blocks UPDATE queries with 403', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: "UPDATE test_items SET stock = 0"
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('READ_ONLY_VIOLATION');
    });

    it('blocks DELETE queries with 403', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: 'DELETE FROM test_items'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('READ_ONLY_VIOLATION');
    });

    it('blocks DROP TABLE queries with 403', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: 'DROP TABLE test_items'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('READ_ONLY_VIOLATION');
    });

    it('blocks ALTER TABLE queries with 403', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: 'ALTER TABLE test_items ADD COLUMN compromised INT'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('READ_ONLY_VIOLATION');
    });

    it('blocks multiple statements separated by semicolons with 400', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: 'SELECT * FROM test_items; DROP TABLE test_items'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/semicolon/i);
    });

    it('blocks comments designed to evade parsers with 400', async () => {
      const res = await request(app)
        .post('/api/v1/edith/database/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
        database: 'workspace_data.db',
        sql: 'SELECT * FROM test_items -- bypass check'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/comment/i);
    });

    it('rejects database paths with directory traversal escaping project root', async () => {
      const res = await request(app)
        .get(`/api/v1/edith/database/tables?projectId=${projectId}&database=../../evil.db`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });

    it('rejects database operations from unauthorized users on another project', async () => {
      const res = await request(app)
        .get(`/api/v1/edith/database/databases?projectId=${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});

