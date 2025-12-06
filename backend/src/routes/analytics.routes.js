import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getWeeklySummary,
  getCategoryBreakdown,
  getFourWeekTrends,
  getCalendarHeatmap,
  getActivityHistory,
  getHabitStrength,
  getDailyStats,
} from '../services/analytics.service.js';

const router = express.Router();

// Get weekly summary
router.get('/weekly', authenticateUser, async (req, res, next) => {
  try {
    const summary = await getWeeklySummary(req.userId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// Get category breakdown
router.get('/categories', authenticateUser, async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const breakdown = await getCategoryBreakdown(req.userId, parseInt(days));
    res.json(breakdown);
  } catch (error) {
    next(error);
  }
});

// Get 4-week trends
router.get('/trends', authenticateUser, async (req, res, next) => {
  try {
    const trends = await getFourWeekTrends(req.userId);
    res.json(trends);
  } catch (error) {
    next(error);
  }
});

// Get calendar heatmap
router.get('/calendar', authenticateUser, async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const heatmap = await getCalendarHeatmap(req.userId, {
      month: month ? parseInt(month) : null,
      year: year ? parseInt(year) : null,
    });
    res.json(heatmap);
  } catch (error) {
    next(error);
  }
});

// Get activity history
router.get('/history', authenticateUser, async (req, res, next) => {
  try {
    const { categoryId, startDate, endDate, search, page, limit } = req.query;
    const history = await getActivityHistory(req.userId, {
      categoryId,
      startDate,
      endDate,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Get habit strength
router.get('/habit-strength', authenticateUser, async (req, res, next) => {
  try {
    const strength = await getHabitStrength(req.userId);
    res.json(strength);
  } catch (error) {
    next(error);
  }
});

// Get daily stats
router.get('/daily/:date', authenticateUser, async (req, res, next) => {
  try {
    const { date } = req.params;
    const stats = await getDailyStats(req.userId, date);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
