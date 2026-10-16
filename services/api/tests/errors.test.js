const request = require('supertest');
const app = require('../src/app');

describe('Error Handling and Standard Error Shapes', () => {
  it('returns 404 with standardized error response for unknown route', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.requestId).toBeDefined();
  });

  it('returns 400 with VALIDATION_ERROR and details on invalid payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: 'short'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.requestId).toBeDefined();
  });
});
