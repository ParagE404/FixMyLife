import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Predictive Habit Degradation Analysis
export class PredictionService {
  
  // Main function to analyze habit degradation risk
  static async analyzeHabitDegradationRisk(userId) {
    try {
      const predictions = [];
      
      // Get user's categories with recent activity
      const categories = await this.getUserActiveCategories(userId);
      
      for (const category of categories) {
        const prediction = await this.analyzeCategoryDegradation(userId, category);
        if (prediction && prediction.riskLevel !== 'low') {
          predictions.push(prediction);
        }
      }
      
      // Store predictions in database
      await this.storePredictions(userId, predictions);
      
      return predictions;
    } catch (error) {
      console.error('Habit degradation analysis error:', error);
      throw error;
    }
  }
  
  // Get categories with activity in the last 30 days
  static async getUserActiveCategories(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: { gte: thirtyDaysAgo }
      },
      include: {
        category: true,
        customCategory: true
      }
    });
    
    // Group by category
    const categoryMap = new Map();
    
    activities.forEach(activity => {
      const categoryKey = activity.categoryId || activity.customCategoryId;
      const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
      
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          id: categoryKey,
          name: categoryName,
          isCustom: !!activity.customCategoryId,
          activities: []
        });
      }
      
      categoryMap.get(categoryKey).activities.push(activity);
    });
    
    // Filter categories with at least 5 activities for meaningful analysis
    return Array.from(categoryMap.values()).filter(cat => cat.activities.length >= 5);
  }
  
  // Analyze degradation risk for a specific category
  static async analyzeCategoryDegradation(userId, category) {
    const now = new Date();
    const activities = category.activities.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    // Calculate weekly trends (last 4 weeks)
    const weeklyData = this.calculateWeeklyTrends(activities);
    
    if (weeklyData.length < 2) {
      return null; // Need at least 2 weeks of data
    }
    
    // Calculate trend metrics
    const frequencyTrend = this.calculateFrequencyTrend(weeklyData);
    const durationTrend = this.calculateDurationTrend(weeklyData);
    const consistencyScore = this.calculateConsistencyScore(activities);
    const daysSinceLastActivity = this.getDaysSinceLastActivity(activities);
    
    // Calculate overall risk score
    const riskScore = this.calculateRiskScore({
      frequencyTrend,
      durationTrend,
      consistencyScore,
      daysSinceLastActivity,
      totalActivities: activities.length
    });
    
    const riskLevel = this.getRiskLevel(riskScore);
    
    if (riskLevel === 'low') {
      return null;
    }
    
    // Generate prediction message
    const message = this.generatePredictionMessage(category.name, {
      frequencyTrend,
      durationTrend,
      riskScore,
      riskLevel,
      daysSinceLastActivity
    });
    
    return {
      categoryId: category.id,
      categoryName: category.name,
      isCustomCategory: category.isCustom,
      riskScore,
      riskLevel,
      frequencyTrend,
      durationTrend,
      consistencyScore,
      daysSinceLastActivity,
      message,
      recommendations: this.generateRecommendations(category.name, riskLevel),
      createdAt: now
    };
  }
  
  // Calculate weekly activity trends
  static calculateWeeklyTrends(activities) {
    const weeklyData = [];
    const now = new Date();
    
    // Group activities by week (last 4 weeks)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekActivities = activities.filter(activity => {
        const activityDate = new Date(activity.startTime);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });
      
      const totalDuration = weekActivities.reduce((sum, activity) => {
        return sum + (activity.duration || 0);
      }, 0);
      
      weeklyData.push({
        weekStart,
        weekEnd,
        frequency: weekActivities.length,
        totalDuration: totalDuration / 60, // convert to hours
        activities: weekActivities
      });
    }
    
    return weeklyData;
  }
  
  // Calculate frequency trend (% change)
  static calculateFrequencyTrend(weeklyData) {
    if (weeklyData.length < 2) return 0;
    
    const recent = weeklyData.slice(-2); // Last 2 weeks
    const older = weeklyData.slice(0, 2); // First 2 weeks
    
    const recentAvg = recent.reduce((sum, week) => sum + week.frequency, 0) / recent.length;
    const olderAvg = older.reduce((sum, week) => sum + week.frequency, 0) / older.length;
    
    if (olderAvg === 0) return recentAvg > 0 ? 100 : 0;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }
  
  // Calculate duration trend (% change)
  static calculateDurationTrend(weeklyData) {
    if (weeklyData.length < 2) return 0;
    
    const recent = weeklyData.slice(-2);
    const older = weeklyData.slice(0, 2);
    
    const recentAvg = recent.reduce((sum, week) => sum + week.totalDuration, 0) / recent.length;
    const olderAvg = older.reduce((sum, week) => sum + week.totalDuration, 0) / older.length;
    
    if (olderAvg === 0) return recentAvg > 0 ? 100 : 0;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }
  
  // Calculate consistency score (0-100)
  static calculateConsistencyScore(activities) {
    const last14Days = [];
    const now = new Date();
    
    // Check each of the last 14 days
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const hasActivity = activities.some(activity => {
        const activityDate = new Date(activity.startTime);
        return activityDate >= day && activityDate < nextDay;
      });
      
      last14Days.push(hasActivity);
    }
    
    const activeDays = last14Days.filter(Boolean).length;
    return (activeDays / 14) * 100;
  }
  
  // Get days since last activity
  static getDaysSinceLastActivity(activities) {
    if (activities.length === 0) return Infinity;
    
    const lastActivity = activities[activities.length - 1];
    const now = new Date();
    const lastActivityDate = new Date(lastActivity.startTime);
    
    return Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
  }
  
  // Calculate overall risk score (0-100)
  static calculateRiskScore(metrics) {
    let score = 0;
    
    // Frequency trend impact (40% weight)
    if (metrics.frequencyTrend < -30) score += 40;
    else if (metrics.frequencyTrend < -15) score += 25;
    else if (metrics.frequencyTrend < 0) score += 10;
    
    // Duration trend impact (30% weight)
    if (metrics.durationTrend < -40) score += 30;
    else if (metrics.durationTrend < -20) score += 20;
    else if (metrics.durationTrend < 0) score += 10;
    
    // Consistency impact (20% weight)
    if (metrics.consistencyScore < 30) score += 20;
    else if (metrics.consistencyScore < 50) score += 15;
    else if (metrics.consistencyScore < 70) score += 10;
    
    // Days since last activity (10% weight)
    if (metrics.daysSinceLastActivity > 7) score += 10;
    else if (metrics.daysSinceLastActivity > 3) score += 5;
    
    return Math.min(score, 100);
  }
  
  // Get risk level from score
  static getRiskLevel(score) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
  
  // Generate human-readable prediction message
  static generatePredictionMessage(categoryName, metrics) {
    const { frequencyTrend, riskScore, riskLevel, daysSinceLastActivity } = metrics;
    
    let message = `Your ${categoryName.toLowerCase()} activity `;
    
    if (frequencyTrend < -30) {
      message += `has dropped significantly (${Math.abs(frequencyTrend).toFixed(0)}%) `;
    } else if (frequencyTrend < -15) {
      message += `has decreased (${Math.abs(frequencyTrend).toFixed(0)}%) `;
    } else {
      message += `shows concerning patterns `;
    }
    
    if (daysSinceLastActivity > 1) {
      message += `and it's been ${daysSinceLastActivity} days since your last session. `;
    }
    
    message += `Habit break risk: ${riskScore.toFixed(0)}%.`;
    
    return message;
  }
  
  // Generate recommendations based on risk level
  static generateRecommendations(categoryName, riskLevel) {
    const recommendations = [];
    
    switch (riskLevel) {
      case 'critical':
        recommendations.push(`Schedule a ${categoryName.toLowerCase()} session today`);
        recommendations.push('Start with just 10-15 minutes to rebuild momentum');
        recommendations.push('Set a daily reminder for this habit');
        break;
        
      case 'high':
        recommendations.push(`Plan your next ${categoryName.toLowerCase()} session within 24 hours`);
        recommendations.push('Consider reducing session length to maintain consistency');
        recommendations.push('Review what might be blocking this habit');
        break;
        
      case 'medium':
        recommendations.push(`Schedule regular ${categoryName.toLowerCase()} sessions this week`);
        recommendations.push('Track what times work best for you');
        recommendations.push('Consider habit stacking with existing routines');
        break;
    }
    
    return recommendations;
  }
  
  // Store predictions in database
  static async storePredictions(userId, predictions) {
    if (predictions.length === 0) return;
    
    // Update or create correlation analysis record
    const analysisData = {
      predictions: predictions,
      dataPoints: predictions.reduce((sum, p) => sum + (p.totalActivities || 0), 0),
      lastAnalyzed: new Date()
    };
    
    await prisma.correlationAnalysis.upsert({
      where: { userId },
      update: analysisData,
      create: {
        userId,
        correlations: [],
        insights: [],
        ...analysisData
      }
    });
    
    // Create notifications for high and critical risk predictions
    const alertPredictions = predictions.filter(p => ['high', 'critical'].includes(p.riskLevel));
    
    for (const prediction of alertPredictions) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'habit_degradation_alert',
          title: `${prediction.categoryName} Habit at Risk`,
          message: prediction.message,
          actionData: {
            categoryId: prediction.categoryId,
            categoryName: prediction.categoryName,
            riskLevel: prediction.riskLevel,
            riskScore: prediction.riskScore,
            recommendations: prediction.recommendations
          }
        }
      });
    }
  }
  
  // Get stored predictions for user
  static async getUserPredictions(userId) {
    const analysis = await prisma.correlationAnalysis.findUnique({
      where: { userId }
    });
    
    return analysis?.predictions || [];
  }
  
  // Run prediction analysis for all users (for scheduled job)
  static async runBatchAnalysis() {
    try {
      const users = await prisma.user.findMany({
        where: {
          onboardingCompleted: true,
          preferences: {
            notificationsEnabled: true
          }
        },
        select: { id: true }
      });
      
      const results = [];
      
      for (const user of users) {
        try {
          const predictions = await this.analyzeHabitDegradationRisk(user.id);
          results.push({
            userId: user.id,
            predictionsCount: predictions.length,
            alertsGenerated: predictions.filter(p => ['high', 'critical'].includes(p.riskLevel)).length
          });
        } catch (error) {
          console.error(`Prediction analysis failed for user ${user.id}:`, error);
          results.push({
            userId: user.id,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Batch prediction analysis error:', error);
      throw error;
    }
  }
}

export default PredictionService;