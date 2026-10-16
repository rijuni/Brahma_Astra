const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('Project Endpoints', () => {
  const user1Email = `p_user1_${Date.now()}@brahma-astra.local`;
  const user2Email = `p_user2_${Date.now()}@brahma-astra.local`;
  let token1, token2;
  let user1Id;
  let createdProjectId;

  beforeAll(async () => {
    // Create User 1
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: user1Email, password: 'Password123!' });
    token1 = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    // Create User 2
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: user2Email, password: 'Password123!' });
    token2 = res2.body.data.token;
  });

  afterAll(async () => {
    await prisma.project.deleteMany({
      where: { ownerId: user1Id }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { email: { in: [user1Email, user2Email] } }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('POST /api/v1/projects creates a new project', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Project Alpha',
        description: 'First test project'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Project Alpha');
    expect(res.body.data.ownerId).toBe(user1Id);
    createdProjectId = res.body.data.id;
  });

  it('GET /api/v1/projects lists projects for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(p => p.id === createdProjectId)).toBe(true);
  });

  it('GET /api/v1/projects/:id returns project details for owner', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdProjectId);
  });

  it('GET /api/v1/projects/:id blocks unauthorized user (User 2)', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('PATCH /api/v1/projects/:id updates project details', async () => {
    const res = await request(app)
      .patch(`/api/v1/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Project Alpha Renamed'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Project Alpha Renamed');
  });

  it('DELETE /api/v1/projects/:id deletes project', async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
