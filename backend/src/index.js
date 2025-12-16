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
import { errorHandler } from './middleware/errorHandler.js';
import { initializePatternScheduler } from './services/pattern-job.service.js';
import { initializePredictionScheduler } from './services/prediction-job.service.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`✅ Server running on http://localhost:${config.port}`);
  console.log(`📊 Prisma Studio: npx prisma studio`);
  
  // Initialize pattern recognition scheduler
  initializePatternScheduler();
  
  // Initialize prediction scheduler
  initializePredictionScheduler();
});
