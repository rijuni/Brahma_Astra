const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('EDITH Filesystem Integration & Security (/api/v1/edith/fs)', () => {
  const testEmail = `edith_fs_${Date.now()}@friday-edith.local`;
  const otherEmail = `edith_fs_other_${Date.now()}@friday-edith.local`;
  let token;
  let otherToken;
  let userId;
  let otherUserId;
  let workspaceBase;
  let tempRoot;
  let outOfBaseRoot;
  let projectId;
  const originalWorkspaceBase = process.env.EDITH_WORKSPACE_BASE_DIR;

  beforeAll(async () => {
    // 1. Create temporary directory for real filesystem operations
    workspaceBase = fs.mkdtempSync(path.join(os.tmpdir(), 'edith-workspaces-'));
    tempRoot = path.join(workspaceBase, 'project');
    fs.mkdirSync(tempRoot);
    outOfBaseRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'edith-outside-base-'));
    process.env.EDITH_WORKSPACE_BASE_DIR = workspaceBase;
    fs.mkdirSync(path.join(tempRoot, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempRoot, 'src', 'main.js'), 'console.log("EDITH FS Live");\n', 'utf8');
    fs.writeFileSync(path.join(tempRoot, 'README.md'), '# Test Project\n', 'utf8');

    // 2. Register primary test user
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: 'Password123!', name: 'FS Tester' });
    token = res1.body.data.token;
    userId = res1.body.data.user.id;

    // 3. Register secondary user for authorization isolation testing
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: otherEmail, password: 'Password123!', name: 'Other User' });
    otherToken = res2.body.data.token;
    otherUserId = res2.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up temporary disk files
    try {
      if (workspaceBase && fs.existsSync(workspaceBase)) {
        fs.rmSync(workspaceBase, { recursive: true, force: true });
      }
      if (outOfBaseRoot && fs.existsSync(outOfBaseRoot)) fs.rmSync(outOfBaseRoot, { recursive: true, force: true });
    } catch {}
    if (originalWorkspaceBase === undefined) delete process.env.EDITH_WORKSPACE_BASE_DIR;
    else process.env.EDITH_WORKSPACE_BASE_DIR = originalWorkspaceBase;

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

  it('rejects unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/edith/fs/projects');
    expect(res.statusCode).toBe(401);
  });

  it('registers an authorized project root directory', async () => {
    const res = await request(app)
      .post('/api/v1/edith/fs/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project Workspace',
        rootPath: tempRoot
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    projectId = res.body.data.projectId;
    expect(projectId).toBeTruthy();
    expect(res.body.data).not.toHaveProperty('rootPath');
  });

  it('rejects an existing directory outside the configured workspace base', async () => {
    const res = await request(app)
      .post('/api/v1/edith/fs/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Outside Workspace', rootPath: outOfBaseRoot });

    expect(res.statusCode).toBe(403);
  });

  it('rejects registering non-existent directory with 404', async () => {
    const res = await request(app)
      .post('/api/v1/edith/fs/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Root',
        rootPath: path.join(tempRoot, 'does_not_exist_xyz')
      });

    expect(res.statusCode).toBe(404);
  });

  it('lists registered project workspaces for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/edith/fs/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((p) => p.projectId === projectId)).toBe(true);
  });

  it('fetches real hierarchical file tree from disk', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/fs/tree?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('directory');

    const names = res.body.data.children.map((c) => c.name);
    expect(names).toContain('src');
    expect(names).toContain('README.md');
  });

  it('reads real file content from disk', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/fs/read?projectId=${projectId}&path=src/main.js`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('console.log("EDITH FS Live");\n');
    expect(res.body.data.name).toBe('main.js');
  });

  it('writes updated file content persistently to disk', async () => {
    const updatedContent = 'console.log("Updated live content");\nconst x = 42;\n';

    const res = await request(app)
      .put('/api/v1/edith/fs/write')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        path: 'src/main.js',
        content: updatedContent
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify directly on host disk
    const onDisk = fs.readFileSync(path.join(tempRoot, 'src', 'main.js'), 'utf8');
    expect(onDisk).toBe(updatedContent);
  });

  it('creates a new file and intermediate directory', async () => {
    const res = await request(app)
      .post('/api/v1/edith/fs/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        path: 'src/utils/math.js',
        type: 'file'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(fs.existsSync(path.join(tempRoot, 'src', 'utils', 'math.js'))).toBe(true);
  });

  it('renames an existing file on disk', async () => {
    const res = await request(app)
      .patch('/api/v1/edith/fs/rename')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        oldPath: 'src/utils/math.js',
        newPath: 'src/utils/calculator.js'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(fs.existsSync(path.join(tempRoot, 'src', 'utils', 'math.js'))).toBe(false);
    expect(fs.existsSync(path.join(tempRoot, 'src', 'utils', 'calculator.js'))).toBe(true);
  });

  it('deletes a file from disk', async () => {
    const res = await request(app)
      .delete('/api/v1/edith/fs/delete')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        path: 'src/utils/calculator.js'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(fs.existsSync(path.join(tempRoot, 'src', 'utils', 'calculator.js'))).toBe(false);
  });

  // SECURITY TESTS
  it('SECURITY: rejects path traversal attempt outside root with 403', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/fs/read?projectId=${projectId}&path=../../../../Windows/System32/drivers/etc/hosts`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('SECURITY: rejects write traversal attempt with 403', async () => {
    const res = await request(app)
      .put('/api/v1/edith/fs/write')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        path: '../escaped-file.txt',
        content: 'Malicious write'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('SECURITY: rejects direct reads of restricted files', async () => {
    const secretPath = path.join(tempRoot, '.env');
    fs.writeFileSync(secretPath, 'EXAMPLE_SECRET=do-not-read');
    const res = await request(app)
      .get(`/api/v1/edith/fs/read?projectId=${projectId}&path=.env`)
      .set('Authorization', `Bearer ${token}`);
    fs.unlinkSync(secretPath);

    expect(res.statusCode).toBe(403);
  });

  it('SECURITY: refuses to delete a directory containing restricted files', async () => {
    const protectedDir = path.join(tempRoot, 'src', 'protected-config');
    fs.mkdirSync(protectedDir, { recursive: true });
    fs.writeFileSync(path.join(protectedDir, '.env'), 'EXAMPLE_SECRET=do-not-delete');

    const res = await request(app)
      .delete('/api/v1/edith/fs/delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId, path: 'src/protected-config' });

    expect(res.statusCode).toBe(403);
    expect(fs.existsSync(path.join(protectedDir, '.env'))).toBe(true);
    fs.rmSync(protectedDir, { recursive: true, force: true });
  });

  it('SECURITY: rejects deleting root directory itself with 400', async () => {
    const res = await request(app)
      .delete('/api/v1/edith/fs/delete')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        path: ''
      });

    expect(res.statusCode).toBe(400);
  });

  it('AUTHORIZATION: rejects other users accessing project workspace', async () => {
    const res = await request(app)
      .get(`/api/v1/edith/fs/tree?projectId=${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(404);
  });
});

