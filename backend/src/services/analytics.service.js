import { PrismaClient } from '@prisma/client';
import { throwError } from '../middleware/errorHandler.js';
import redisService from './redis.service.js';

const prisma = new PrismaClient();

// Helper function to calculate activity duration
const getActivityDuration = (activity) => {
  if (activity.duration) return activity.duration;
  if (activity.endTime && activity.startTime) {
    return Math.round((new Date(activity.endTime) - new Date(activity.startTime)) / (1000 * 60));
  }
  return 0;
};

// Get weekly summary for current week
export const getWeeklySummary = async (userId) => {
  try {
    // Check cache first
    const cacheKey = redisService.getAnalyticsKey(userId, 'weekly');
    const cached = await redisService.get(cacheKey);
    if (cached) {
      console.log('📦 Weekly summary served from cache');
      return cached;
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfWeek,
          lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: { category: true },
    });

    // Build daily breakdown
    const dailyBreakdown = {};
    const categoryTotals = {};

    activities.forEach((activity) => {
      const dayKey = activity.startTime.toISOString().split('T')[0];
      if (!dailyBreakdown[dayKey]) {
        dailyBreakdown[dayKey] = 0;
      }

      const catName = activity.category?.name || 'Other';
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = 0;
      }

      const duration = getActivityDuration(activity);
      dailyBreakdown[dayKey] += duration / 60; // convert to hours
      categoryTotals[catName] += duration / 60;
    });

    // Format for chart
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayKey = date.toISOString().split('T')[0];
      const dayName = weekDays[i];

      chartData.push({
        day: dayName,
        date: dayKey,
        hours: dailyBreakdown[dayKey] || 0,
      });
    }

    const result = {
      chartData,
      categoryTotals,
      totalHours: Object.values(dailyBreakdown).reduce((a, b) => a + b, 0),
      activityCount: activities.length,
    };

    // Cache for 1 hour (3600 seconds)
    await redisService.set(cacheKey, result, 3600);
    console.log('💾 Weekly summary cached');

    return result;
  } catch (error) {
    console.error('Weekly summary error:', error);
    throw error;
  }
};

// Get category breakdown
export const getCategoryBreakdown = async (userId, days = 7) => {
  try {
    // Check cache first
    const cacheKey = redisService.getAnalyticsKey(userId, 'category', days);
    const cached = await redisService.get(cacheKey);
    if (cached) {
      console.log('📦 Category breakdown served from cache');
      return cached;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
        },
      },
      include: { 
        category: true,
        customCategory: true 
      },
    });

    const categoryData = {};

    activities.forEach((activity) => {
      const catName = activity.category?.name || activity.customCategory?.name || 'Other';
      if (!categoryData[catName]) {
        categoryData[catName] = {
          name: catName,
          hours: 0,
          count: 0,
          color: getCategoryColor(catName), // Add color for better visualization
        };
      }

      const duration = getActivityDuration(activity);
      categoryData[catName].hours += duration / 60;
      categoryData[catName].count += 1;
    });

    const result = Object.values(categoryData).sort((a, b) => b.hours - a.hours);

    // Cache for 2 hours
    await redisService.set(cacheKey, result, 7200);
    console.log('💾 Category breakdown cached');

    return result;
  } catch (error) {
    console.error('Category breakdown error:', error);
    throw error;
  }
};

// Get 4-week trends
export const getFourWeekTrends = async (userId) => {
  try {
    const today = new Date();
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: fourWeeksAgo,
        },
      },
      include: { category: true },
    });

    // Group by week
    const weeklyData = {};

    activities.forEach((activity) => {
      const actDate = new Date(activity.startTime);
      const weekStart = new Date(actDate);
      weekStart.setDate(actDate.getDate() - actDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          totalHours: 0,
          activityCount: 0,
        };
      }

      const duration = getActivityDuration(activity);
      weeklyData[weekKey].totalHours += duration / 60;
      weeklyData[weekKey].activityCount += 1;
    });

    // Sort by week
    const sortedWeeks = Object.values(weeklyData).sort(
      (a, b) => new Date(a.week) - new Date(b.week)
    );

    return sortedWeeks;
  } catch (error) {
    console.error('Four week trends error:', error);
    throw error;
  }
};

// Get calendar heatmap data
export const getCalendarHeatmap = async (userId, month = null) => {
  try {
    let startDate = new Date();
    let endDate = new Date();

    if (month) {
      startDate = new Date(month.year, month.month, 1);
      endDate = new Date(month.year, month.month + 1, 0);
    } else {
      // Current month
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Build heatmap data
    const heatmapData = {};

    activities.forEach((activity) => {
      const dateKey = activity.startTime.toISOString().split('T')[0];
      if (!heatmapData[dateKey]) {
        heatmapData[dateKey] = 0;
      }
      const duration = getActivityDuration(activity);
      heatmapData[dateKey] += duration / 60; // hours
    });

    // Convert to array for calendar
    const calendarData = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const hours = heatmapData[dateKey] || 0;

      calendarData.push({
        date: dateKey,
        hours,
        dayOfWeek: current.getDay(),
        dayOfMonth: current.getDate(),
        intensity: getIntensity(hours),
      });

      current.setDate(current.getDate() + 1);
    }

    return {
      data: calendarData,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Calendar heatmap error:', error);
    throw error;
  }
};

// Get detailed activity history with pagination
export const getActivityHistory = async (userId, filters = {}) => {
  const { categoryId, startDate, endDate, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where = { userId };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) {
      where.startTime.gte = new Date(startDate);
    }
    if (endDate) {
      where.startTime.lte = new Date(endDate);
    }
  }

  if (search) {
    where.description = {
      search: search.split(' ').join(' & '),
    };
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        category: true,
        customCategory: true,
      },
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get habit strength (consistency score)
export const getHabitStrength = async (userId) => {
  try {
    // Check cache first
    const cacheKey = redisService.getAnalyticsKey(userId, 'habit-strength');
    const cached = await redisService.get(cacheKey);
    if (cached) {
      console.log('📦 Habit strength served from cache');
      return cached;
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Get activities for the last 30 days
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Group activities by date
    const dailyData = {};
    activities.forEach((activity) => {
      const dateKey = activity.startTime.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          activities: 0,
          totalDuration: 0,
        };
      }
      dailyData[dateKey].activities += 1;
      dailyData[dateKey].totalDuration += getActivityDuration(activity);
    });

    // Calculate consistency
    const daysWithActivity = Object.keys(dailyData).length;
    const consistencyScore = (daysWithActivity / 30) * 100;

    // Calculate average hours per day
    const totalHours = Object.values(dailyData).reduce((sum, day) => sum + (day.totalDuration / 60 || 0), 0);
    const avgHoursPerDay = totalHours / 30;

    // Calculate activity frequency
    const totalActivities = Object.values(dailyData).reduce((sum, day) => sum + (day.activities || 0), 0);
    const avgActivitiesPerDay = totalActivities / 30;

    const result = {
      consistencyScore: Math.round(consistencyScore),
      daysWithActivity,
      totalDays: 30,
      avgHoursPerDay: parseFloat(avgHoursPerDay.toFixed(1)),
      avgActivitiesPerDay: parseFloat(avgActivitiesPerDay.toFixed(1)),
      level: getHabitLevel(consistencyScore),
    };

    // Cache for 4 hours
    await redisService.set(cacheKey, result, 14400);
    console.log('💾 Habit strength cached');

    return result;
  } catch (error) {
    console.error('Habit strength error:', error);
    throw error;
  }
};

// Get daily stats for a specific date
export const getDailyStats = async (userId, date) => {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      include: {
        category: true,
      },
    });

    const categoryBreakdown = {};
    let totalHours = 0;

    activities.forEach((activity) => {
      const catName = activity.category?.name || 'Other';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = 0;
      }

      const duration = getActivityDuration(activity);
      categoryBreakdown[catName] += duration / 60;
      totalHours += duration / 60;
    });

    return {
      date: targetDate.toISOString().split('T')[0],
      activities,
      categoryBreakdown,
      totalHours: totalHours.toFixed(1),
      activityCount: activities.length,
    };
  } catch (error) {
    console.error('Daily stats error:', error);
    throw error;
  }
};

// Helper: Get intensity level for heatmap
function getIntensity(hours) {
  if (hours === 0) return 'none';
  if (hours < 2) return 'low';
  if (hours < 4) return 'medium';
  if (hours < 6) return 'high';
  return 'very-high';
}

// Helper: Get habit level
function getHabitLevel(score) {
  if (score === 0) return 'No Activity';
  if (score < 25) return 'Just Started';
  if (score < 50) return 'Building';
  if (score < 75) return 'Established';
  return 'Mastered';
}

// Helper: Get category color
function getCategoryColor(categoryName) {
  const colors = [
    '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
    '#db2777', '#0891b2', '#65a30d', '#dc2626', '#9333ea'
  ];
  
  // Simple hash function to assign consistent colors
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
