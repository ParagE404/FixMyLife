import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import activityRoutes from './routes/activity.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import patternsRoutes from './routes/patterns.routes.js';
import correlationsRoutes from './routes/correlations.routes.js';
import predictionRoutes from './routes/prediction.routes.js';
import cacheRoutes from './routes/cache.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializePatternScheduler } from './services/pattern-job.service.js';
import { initializePredictionScheduler } from './services/prediction-job.service.js';
import redisService from './services/redis.service.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  const redisHealth = await redisService.ping();
  
  // Get basic Redis info if connected
  let redisInfo = null;
  if (redisHealth && redisService.client) {
    try {
      const info = await redisService.client.info('memory');
      const lines = info.split('\r\n');
      const memoryInfo = {};
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (key.includes('memory') || key.includes('keys')) {
            memoryInfo[key] = value;
          }
        }
      });
      redisInfo = memoryInfo;
    } catch (error) {
      console.error('Redis info error:', error);
    }
  }
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: {
      connected: redisHealth,
      info: redisInfo
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/patterns', patternsRoutes);
app.use('/api/correlations', correlationsRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/cache', cacheRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize Redis
async function initializeServer() {
  if (config.redis.enabled) {
    await redisService.connect();
  }
}

// Start server
app.listen(config.port, async () => {
  console.log(`✅ Server running on http://localhost:${config.port}`);
  console.log(`📊 Prisma Studio: npx prisma studio`);
  
  // Initialize Redis
  await initializeServer();
  
  // Initialize pattern recognition scheduler
  initializePatternScheduler();
  
  // Initialize prediction scheduler
  initializePredictionScheduler();
});
