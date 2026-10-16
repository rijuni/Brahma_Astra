const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');
const brahmaCoreClient = require('../src/clients/brahmaCore.client');

describe('AI Orchestration Endpoints', () => {
  const userEmail = `ai_user_${Date.now()}@brahma-astra.local`;
  let token;
  let userId;
  let taskId;
  let executeSpy;
  let cancelSpy;

  beforeAll(async () => {
    // Mock the external network call so unit tests stay isolated and predictable
    executeSpy = jest.spyOn(brahmaCoreClient, 'executeTask').mockImplementation(async ({ taskId }) => {
      // simulate in-progress / mock execution
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            task_id: taskId,
            status: 'completed',
            provider: 'mock',
            result: { summary: 'Completed' }
          });
        }, 100);
      });
    });

    cancelSpy = jest.spyOn(brahmaCoreClient, 'cancelTask').mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: userEmail, password: 'Password123!' });
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    executeSpy.mockRestore();
    cancelSpy.mockRestore();

    await prisma.aiTask.deleteMany({
      where: { userId }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { email: userEmail }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('POST /api/v1/ai/tasks creates an AI task and returns 202', async () => {
    const res = await request(app)
      .post('/api/v1/ai/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        prompt: 'Analyze repository architecture and suggest improvements',
        taskType: 'research'
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prompt).toBe('Analyze repository architecture and suggest improvements');
    taskId = res.body.data.id;
  });

  it('GET /api/v1/ai/tasks lists AI tasks for user', async () => {
    const res = await request(app)
      .get('/api/v1/ai/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(t => t.id === taskId)).toBe(true);
  });

  it('GET /api/v1/ai/tasks/:id returns task details', async () => {
    const res = await request(app)
      .get(`/api/v1/ai/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(taskId);
  });

  it('POST /api/v1/ai/tasks/:id/cancel cancels the AI task', async () => {
    // Create a fresh task to cancel immediately while in running/pending status
    const createRes = await request(app)
      .post('/api/v1/ai/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'Task to cancel immediately' });

    const cancelTaskId = createRes.body.data.id;

    const res = await request(app)
      .post(`/api/v1/ai/tasks/${cancelTaskId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });
});
