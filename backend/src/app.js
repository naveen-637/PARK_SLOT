import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = () => {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isOriginAllowed = (origin) => {
    if (!origin) return true;

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isLocalhostDev = process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin);

    return isExplicitlyAllowed || isLocalhostDev;
  };

  app.use(helmet());
  app.use(mongoSanitize());

  app.use(cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  }));

  const isProduction = process.env.NODE_ENV === 'production';

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 5000,
    skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later'
  });
  app.use(limiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // In dev, keep API process running even when DB is unavailable.
  app.use((req, res, next) => {
    if (req.path === '/api/health') {
      return next();
    }

    if (app.locals.dbConnected === false) {
      return res.status(503).json({
        success: false,
        message: 'Database is unavailable. Update MongoDB credentials and restart backend.'
      });
    }

    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/parking', parkingRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      message: 'Server is running',
      timestamp: new Date(),
      dbConnected: app.locals.dbConnected !== false
    });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
};
