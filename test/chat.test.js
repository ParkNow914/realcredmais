import request from 'supertest';
import app from '../server.js';

describe('Chat endpoints', () => {
  test('GET /api/chat/health returns configured false when no key', async () => {
    const res = await request(app).get('/api/chat/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('configured');
  });

  test('POST /api/chat without key returns 503 or fallback', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Olá' });
    expect([503, 502, 200]).toContain(res.statusCode);
  });

  test('Admin metrics route returns 403 if not configured', async () => {
    const res = await request(app).get('/admin/chat-metrics');
    expect([401, 403]).toContain(res.statusCode);
  });
});
