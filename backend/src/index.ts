import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import agentRoutes from './routes/agent.routes.js';
import integrationRoutes from './routes/integration.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import prisma from './config/db.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', config.corsOrigin],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', integrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/agent', agentRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    await prisma.user.findFirst();
    console.log('Database connected successfully - running with persistent storage.');
    return true;
  } catch (error: any) {
    console.log('Database connection failed.');
    console.log('Error:', error.message);
    console.log('Persistent profile, roadmap, analytics, and integration features will be unavailable.');
    return false;
  }
}

const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`CORS enabled for: ${config.corsOrigin}`);
  console.log('');
  await checkDatabaseConnection();
  console.log('');
});

export default app;
