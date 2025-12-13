import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateRecommendations = async (userId) => {
  try {
    const recommendations = [];

    // 1. Get user's activity data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: { gte: thirtyDaysAgo },
      },
      include: { category: true },
    });

    const dailyAggregates = await prisma.dailyAggregate.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
    });

    if (activities.length === 0) {
      return [
        {
          type: 'suggestion',
          title: 'Start Tracking',
          message: 'Log your first activity to get personalized recommendations!',
          priority: 'high',
        },
      ];
    }

    // 2. Analyze patterns
    const categoryBreakdown = {};
    activities.forEach((act) => {
      const catName = act.category?.name || 'Other';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + (act.duration || 0);
    });

    const totalHours = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0) / 60;
    const avgDailyActivities = activities.length / 30;
    const daysActive = dailyAggregates.filter((d) => d.totalActivities > 0).length;
    const consistency = (daysActive / 30) * 100;

    // 3. Generate insights
    if (consistency > 80) {
      recommendations.push({
        type: 'praise',
        title: '⭐ Consistency Star',
        message: `You've been active ${daysActive} out of 30 days! Keep up this amazing streak.`,
        priority: 'info',
      });
    }

    if (consistency < 30) {
      recommendations.push({
        type: 'warning',
        title: '📌 Build Your Habit',
        message: 'Try to log activities on at least 3 days this week. Start small!',
        priority: 'high',
      });
    }

    // 4. Category imbalance detection
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1]); // Sort by duration (second element)

    if (sortedCategories.length > 1) {
      const [topCategoryName, topCategoryHours] = sortedCategories[0];
      const [secondCategoryName, secondCategoryHours] = sortedCategories[1];
      const ratio = topCategoryHours / secondCategoryHours;

      if (ratio > 3) {
        recommendations.push({
          type: 'suggestion',
          title: '⚖️ Balance Your Activities',
          message: `${topCategoryName} is taking up most of your time. Consider exploring "${secondCategoryName}" more.`,
          priority: 'medium',
        });
      }
    }

    // 5. Total hours assessment
    if (totalHours < 5) {
      recommendations.push({
        type: 'suggestion',
        title: 'Log More Activities',
        message: `You've logged ${totalHours.toFixed(1)} hours this month. Try to increase it by 20% next week.`,
        priority: 'medium',
      });
    } else if (totalHours > 100) {
      recommendations.push({
        type: 'praise',
        title: '🚀 Very Active',
        message: `Amazing! You've logged ${totalHours.toFixed(1)} hours. Remember to balance with rest.`,
        priority: 'low',
      });
    }

    // 6. Suggest new categories to explore
    const allCategories = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    const unexploredCategories = allCategories.filter(
      (cat) => !categoryBreakdown[cat.name]
    );

    if (unexploredCategories.length > 0 && Object.keys(categoryBreakdown).length < 3) {
      const suggestion = unexploredCategories[0]; // Get the first unexplored category
      recommendations.push({
        type: 'suggestion',
        title: '🆕 Try Something New',
        message: `Why not explore "${suggestion.name}"? It's a great way to diversify your activities.`,
        priority: 'low',
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Recommendations error:', error);
    throw error;
  }
};

export const createInsight = async (userId, insightData) => {
  try {
    const { type, title, message, metadata } = insightData;

    const insight = await prisma.insight.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
      },
    });

    return insight;
  } catch (error) {
    console.error('Create insight error:', error);
    throw error;
  }
};

export const getInsights = async (userId, filters = {}) => {
  const { unreadOnly = false, limit = 10 } = filters;

  const insights = await prisma.insight.findMany({
    where: {
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return insights;
};

export const markInsightAsRead = async (userId, insightId) => {
  const insight = await prisma.insight.findFirst({
    where: { id: insightId, userId },
  });

  if (!insight) {
    throw new Error('Insight not found');
  }

  const updated = await prisma.insight.update({
    where: { id: insightId },
    data: { isRead: true },
  });

  return updated;
};
