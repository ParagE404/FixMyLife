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
    res.json({ categories: breakdown });
  } catch (error) {
    next(error);
  }
});

// Get 4-week trends
router.get('/trends', authenticateUser, async (req, res, next) => {
  try {
    const weeklyData = await getFourWeekTrends(req.userId);
    
    // Calculate trends from weekly data
    let weeklyChange = 0;
    let monthlyAverage = 0;
    let bestDay = 'N/A';
    let consistency = 0;
    
    if (weeklyData.length >= 2) {
      const currentWeek = weeklyData[weeklyData.length - 1];
      const previousWeek = weeklyData[weeklyData.length - 2];
      
      if (previousWeek.totalHours > 0) {
        weeklyChange = ((currentWeek.totalHours - previousWeek.totalHours) / previousWeek.totalHours) * 100;
      }
    }
    
    if (weeklyData.length > 0) {
      monthlyAverage = weeklyData.reduce((sum, week) => sum + week.totalHours, 0) / weeklyData.length;
      
      // Find best performing week
      const bestWeek = weeklyData.reduce((best, week) => 
        week.totalHours > best.totalHours ? week : best, weeklyData[0]);
      bestDay = new Date(bestWeek.week).toLocaleDateString('en-US', { weekday: 'long' });
      
      // Calculate consistency (weeks with activity / total weeks)
      const weeksWithActivity = weeklyData.filter(week => week.totalHours > 0).length;
      consistency = (weeksWithActivity / weeklyData.length) * 100;
    }
    
    res.json({
      weeklyChange,
      monthlyAverage,
      bestDay,
      consistency,
      weeklyData
    });
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
    res.json({
      score: strength.consistencyScore,
      message: strength.level,
      daysWithActivity: strength.daysWithActivity,
      totalDays: strength.totalDays,
      avgHoursPerDay: strength.avgHoursPerDay,
      avgActivitiesPerDay: strength.avgActivitiesPerDay
    });
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
