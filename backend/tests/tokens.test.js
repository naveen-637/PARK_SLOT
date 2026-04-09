import jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken } from '../src/utils/tokens.js';

describe('Token helpers', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  });

  it('creates a valid access token', () => {
    const token = signAccessToken({ id: '123', role: 'customer' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toHaveProperty('id', '123');
    expect(decoded).toHaveProperty('role', 'customer');
  });

  it('creates a valid refresh token', () => {
    const token = signRefreshToken({ id: '123', role: 'customer' });
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    expect(decoded).toHaveProperty('id', '123');
    expect(decoded).toHaveProperty('role', 'customer');
  });
});
