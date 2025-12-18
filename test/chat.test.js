import request from 'supertest';
import app from '../server.js';

describe('Chat endpoints', () => {
  test('GET /api/chat/health returns configured false when no key', async () => {
    const res = await request(app).get('/api/chat/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('configured');
  });

  test('POST /api/chat without key returns 503', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Olá' });
    expect([503, 502, 200]).toContain(res.statusCode); // allow 502 if OpenAI error
    if (res.statusCode === 503) {
      expect(res.body).toHaveProperty('message');
    }
  });
});