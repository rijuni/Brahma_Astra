const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/repositories/prisma');

describe('Health Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /health/live returns 200 and status ok', async () => {
    const res = await request(app).get('/health/live');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /health/ready returns 200 and status ready when DB is available', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });
});
