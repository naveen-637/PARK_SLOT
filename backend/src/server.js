import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/database.js';
import { createApp } from './app.js';

// Load environment variables from .env and override stale shell vars.
dotenv.config({ override: true });

const app = createApp();
const server = http.createServer(app);

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

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by Socket.IO CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Connect to Database
const startServer = async () => {
  try {
    const dbConn = await connectDB();
    app.locals.dbConnected = Boolean(dbConn);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database connected: ${app.locals.dbConnected ? 'yes' : 'no'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
