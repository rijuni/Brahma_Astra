const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('Conversation Endpoints', () => {
  const userEmail = `c_user_${Date.now()}@brahma-astra.local`;
  let token;
  let userId;
  let createdConvId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: userEmail, password: 'Password123!' });
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.conversation.deleteMany({
      where: { userId }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { email: userEmail }
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it('POST /api/v1/conversations creates a conversation', async () => {
    const res = await request(app)
      .post('/api/v1/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Architectural Discussion' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Architectural Discussion');
    createdConvId = res.body.data.id;
  });

  it('POST /api/v1/conversations/:id/messages adds a message', async () => {
    const res = await request(app)
      .post(`/api/v1/conversations/${createdConvId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'user',
        content: 'Design BRAHMA architecture.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Design BRAHMA architecture.');
  });

  it('GET /api/v1/conversations/:id returns conversation with messages', async () => {
    const res = await request(app)
      .get(`/api/v1/conversations/${createdConvId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(createdConvId);
    expect(res.body.data.messages.length).toBe(1);
    expect(res.body.data.messages[0].content).toBe('Design BRAHMA architecture.');
  });
});
