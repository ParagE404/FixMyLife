import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import activityRoutes from './routes/activity.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

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
});
