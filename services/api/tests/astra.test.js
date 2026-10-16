const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('ASTRA Coding Workspace Endpoints', () => {
  const userEmail = `astra_test_${Date.now()}@brahma-astra.local`;
  let token;
  let userId;
  let projectId;
  let workspaceId;
  let taskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: userEmail, password: 'Password123!' });
    token = res.body.data.token;
    userId = res.body.data.user.id;

    // Create a project
    const pRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ASTRA Host Project' });
    projectId = pRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.codingTask.deleteMany({
      where: { workspaceId }
    }).catch(() => {});
    await prisma.astraWorkspace.deleteMany({
      where: { projectId }
    }).catch(() => {});
    await prisma.project.deleteMany({
      where: { id: projectId }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { email: userEmail }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('POST /api/v1/astra/workspaces creates an ASTRA workspace', async () => {
    const res = await request(app)
      .post('/api/v1/astra/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        name: 'Backend Dev Workspace',
        repositoryUrl: 'https://github.com/example/repo'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Backend Dev Workspace');
    workspaceId = res.body.data.id;
  });

  it('POST /api/v1/astra/tasks creates a coding task with proposed status', async () => {
    const res = await request(app)
      .post('/api/v1/astra/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        workspaceId,
        title: 'Fix SQLite Connection',
        instruction: 'Add connection retry logic'
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('proposed');
    taskId = res.body.data.id;
  });

  it('GET /api/v1/astra/tasks/:id retrieves the task', async () => {
    const res = await request(app)
      .get(`/api/v1/astra/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(taskId);
    expect(res.body.data.status).toBe('proposed');
  });

  it('POST /api/v1/astra/tasks/:id/approve approves task and queues execution job', async () => {
    const res = await request(app)
      .post(`/api/v1/astra/tasks/${taskId}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.status).toBe('approved');
    expect(res.body.data.executionJob).toBeDefined();
    expect(res.body.data.executionJob.status).toBe('queued');
  });
});
