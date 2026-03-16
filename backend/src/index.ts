import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import agentRoutes from './routes/agent.routes.js';
import profileRoutes from './routes/api.routes.js';
import prisma from './config/db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', config.corsOrigin],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', profileRoutes);
app.use('/agent', agentRoutes);

// Error handler
app.use(errorHandler);

// Check database connection on startup
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    await prisma.user.findFirst();
    console.log('✅ Database connected successfully - Running in DATABASE MODE');
    return true;
  } catch (error: any) {
    console.log('⚠️  Database connection failed - Running in MOCK MODE');
    console.log('   Error:', error.message);
    console.log('   Profile updates will NOT persist across server restarts');
    return false;
  }
}

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS enabled for: ${config.corsOrigin}`);
  console.log('');
  await checkDatabaseConnection();
  console.log('');
});

export default app;
