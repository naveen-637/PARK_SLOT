import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API Health', () => {
  it('returns server health payload', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Server is running');
    expect(response.body).toHaveProperty('timestamp');
  });
});
