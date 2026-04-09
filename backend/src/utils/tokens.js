import jwt from 'jsonwebtoken';

export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const buildAuthResponse = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name
  };

  return {
    token: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user
  };
};
