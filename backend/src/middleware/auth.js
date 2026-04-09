import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../config/constants.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const isOwner = (req, res, next) => {
  if (req.user?.role !== USER_ROLES.OWNER) {
    return res.status(403).json({ message: 'Owner access required' });
  }
  next();
};
