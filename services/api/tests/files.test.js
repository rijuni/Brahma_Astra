const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');
const fileService = require('../src/services/file.service');

describe('FRIDAY Persistent File Storage (/api/v1/files)', () => {
  const user1Email = `files_u1_${Date.now()}@friday-edith.local`;
  const user2Email = `files_u2_${Date.now()}@friday-edith.local`;
  let token1;
  let token2;
  let user1Id;
  let user2Id;
  let uploadedFileId;
  const testFileContent = 'FRIDAY Architecture & Persistent File Storage Test Document';

  beforeAll(async () => {
    // Register User 1
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: user1Email, password: 'Password123!', name: 'File User 1' });
    token1 = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    // Register User 2
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: user2Email, password: 'Password123!', name: 'File User 2' });
    token2 = res2.body.data.token;
    user2Id = res2.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up stored files from test users
    const files = await prisma.storedFile.findMany({
      where: { userId: { in: [user1Id, user2Id] } }
    });
    for (const f of files) {
      const diskPath = path.join(fileService.getUploadsDir(), f.storageKey);
      try {
        if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
      } catch {}
    }
    await prisma.storedFile.deleteMany({
      where: { userId: { in: [user1Id, user2Id] } }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { id: { in: [user1Id, user2Id] } }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/files');
    expect(res.statusCode).toBe(401);
  });

  it('uploads a file and stores both bytes on disk and metadata in SQLite', async () => {
    const res = await request(app)
      .post('/api/v1/files')
      .set('Authorization', `Bearer ${token1}`)
      .attach('file', Buffer.from(testFileContent, 'utf8'), 'architecture_spec.txt');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.filename).toBe('architecture_spec.txt');
    expect(res.body.data.sizeBytes).toBe(Buffer.byteLength(testFileContent, 'utf8'));
    expect(res.body.data.checksum).toBeDefined();

    uploadedFileId = res.body.data.id;

    // Verify record in SQLite database via Prisma
    const dbRecord = await prisma.storedFile.findUnique({
      where: { id: uploadedFileId }
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord.userId).toBe(user1Id);

    // Verify file on disk
    const diskPath = path.join(fileService.getUploadsDir(), dbRecord.storageKey);
    expect(fs.existsSync(diskPath)).toBe(true);
    const contentOnDisk = fs.readFileSync(diskPath, 'utf8');
    expect(contentOnDisk).toBe(testFileContent);
  });

  it('lists stored files for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/files')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((f) => f.id === uploadedFileId)).toBe(true);
  });

  it('retrieves metadata for a specific stored file', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.filename).toBe('architecture_spec.txt');
    expect(res.body.data.sizeBytes).toBe(Buffer.byteLength(testFileContent, 'utf8'));
  });

  it('downloads the stored file with exact byte integrity and headers', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}/download`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-disposition']).toContain('architecture_spec.txt');
    expect(res.text).toBe(testFileContent);
  });

  it('OWNERSHIP ISOLATION: prevents User 2 from downloading User 1 file', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}/download`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(404);
  });

  it('OWNERSHIP ISOLATION: prevents User 2 from deleting User 1 file', async () => {
    const res = await request(app)
      .delete(`/api/v1/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(404);
  });

  it('deletes stored file from both disk and SQLite database', async () => {
    const dbRecordBefore = await prisma.storedFile.findUnique({
      where: { id: uploadedFileId }
    });
    const diskPath = path.join(fileService.getUploadsDir(), dbRecordBefore.storageKey);

    const res = await request(app)
      .delete(`/api/v1/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);

    // Verify deleted from SQLite
    const dbRecordAfter = await prisma.storedFile.findUnique({
      where: { id: uploadedFileId }
    });
    expect(dbRecordAfter).toBeNull();

    // Verify deleted from disk
    expect(fs.existsSync(diskPath)).toBe(false);
  });
});

