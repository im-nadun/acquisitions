import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import { authenticate, authorize } from '#middleware/auth.middleware.js';
import securityMiddleware from '#middleware/security.middleware.js';
import usersRoutes from '#routes/users.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined', {stream: {write: (message) => logger.info(message.trim())}}));

app.use(securityMiddleware);

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions');

  res.status(200).send('Hello from Acquisitions API');
});

app.get('/health', (req, res) => {
  res.status(200).json({status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api',(req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running!' });
});

// Auth routes (public and protected)
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Example: Protected route (requires authentication)
app.get('/api/profile', authenticate, (req, res) => {
  res.status(200).json({
    message: 'Profile data',
    user: req.user // User info from JWT token
  });
});

// Example: Admin-only route (requires authentication + admin role)
app.get('/api/admin', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({
    message: 'Admin dashboard',
    user: req.user
  });
});

export default app;
