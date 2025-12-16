import { PrismaClient } from '@prisma/client';
import PredictionService from './prediction.service.js';

const prisma = new PrismaClient();

export class AlertService {
  
  // Get all alerts for a user
  static async getUserAlerts(userId, filters = {}) {
    const { type, read, limit = 20, offset = 0 } = filters;
    
    const where = { userId };
    
    if (type) {
      where.type = type;
    }
    
    if (read !== undefined) {
      where.read = read;
    }
    
    const alerts = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
    
    return alerts;
  }
  
  // Get habit degradation alerts specifically
  static async getHabitDegradationAlerts(userId) {
    const alerts = await prisma.notification.findMany({
      where: {
        userId,
        type: 'habit_degradation_alert'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    return alerts;
  }
  
  // Mark alert as read
  static async markAlertAsRead(userId, alertId) {
    const alert = await prisma.notification.findFirst({
      where: { id: alertId, userId }
    });
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    return await prisma.notification.update({
      where: { id: alertId },
      data: { read: true }
    });
  }
  
  // Mark all alerts as read
  static async markAllAlertsAsRead(userId, type = null) {
    const where = { userId, read: false };
    
    if (type) {
      where.type = type;
    }
    
    return await prisma.notification.updateMany({
      where,
      data: { read: true }
    });
  }
  
  // Delete alert
  static async deleteAlert(userId, alertId) {
    const alert = await prisma.notification.findFirst({
      where: { id: alertId, userId }
    });
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    return await prisma.notification.delete({
      where: { id: alertId }
    });
  }
  
  // Get alert statistics
  static async getAlertStats(userId) {
    const [total, unread, habitAlerts, recentAlerts] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.count({ 
        where: { userId, type: 'habit_degradation_alert' } 
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);
    
    return {
      total,
      unread,
      habitAlerts,
      recentAlerts
    };
  }
  
  // Create custom alert
  static async createAlert(userId, alertData) {
    const { type, title, message, actionData } = alertData;
    
    return await prisma.notification.create({
      data: {
        userId,
        type: type || 'custom',
        title,
        message,
        actionData: actionData || {}
      }
    });
  }
  
  // Get current predictions and risk analysis
  static async getCurrentRiskAnalysis(userId) {
    try {
      // Run fresh analysis
      const predictions = await PredictionService.analyzeHabitDegradationRisk(userId);
      
      // Get recent alerts
      const recentAlerts = await this.getHabitDegradationAlerts(userId);
      
      // Calculate summary stats
      const riskSummary = {
        totalCategories: predictions.length,
        criticalRisk: predictions.filter(p => p.riskLevel === 'critical').length,
        highRisk: predictions.filter(p => p.riskLevel === 'high').length,
        mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length,
        averageRiskScore: predictions.length > 0 
          ? predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length 
          : 0
      };
      
      return {
        predictions,
        recentAlerts: recentAlerts.slice(0, 5),
        riskSummary,
        lastAnalyzed: new Date()
      };
    } catch (error) {
      console.error('Risk analysis error:', error);
      throw error;
    }
  }
  
  // Trigger intervention suggestions based on alert
  static async triggerIntervention(userId, alertId) {
    const alert = await prisma.notification.findFirst({
      where: { id: alertId, userId }
    });
    
    if (!alert || alert.type !== 'habit_degradation_alert') {
      throw new Error('Invalid alert for intervention');
    }
    
    const actionData = alert.actionData;
    const categoryName = actionData.categoryName;
    const riskLevel = actionData.riskLevel;
    
    // Generate intervention suggestions
    const interventions = this.generateInterventions(categoryName, riskLevel);
    
    // Create follow-up notification with interventions
    await prisma.notification.create({
      data: {
        userId,
        type: 'intervention_suggestion',
        title: `Action Plan: ${categoryName}`,
        message: `Here are some strategies to get back on track with your ${categoryName.toLowerCase()} habit.`,
        actionData: {
          originalAlertId: alertId,
          categoryName,
          interventions,
          createdFrom: 'habit_degradation_alert'
        }
      }
    });
    
    // Mark original alert as acted upon
    await prisma.notification.update({
      where: { id: alertId },
      data: { 
        read: true,
        actionData: {
          ...actionData,
          interventionTriggered: true,
          interventionDate: new Date()
        }
      }
    });
    
    return interventions;
  }
  
  // Generate intervention strategies
  static generateInterventions(categoryName, riskLevel) {
    const baseInterventions = [
      {
        type: 'immediate',
        title: 'Quick Win',
        description: `Do just 5 minutes of ${categoryName.toLowerCase()} right now`,
        priority: 'high'
      },
      {
        type: 'schedule',
        title: 'Schedule It',
        description: `Block time in your calendar for ${categoryName.toLowerCase()} this week`,
        priority: 'medium'
      },
      {
        type: 'environment',
        title: 'Prepare Your Space',
        description: `Set up your environment to make ${categoryName.toLowerCase()} easier`,
        priority: 'medium'
      }
    ];
    
    const riskSpecificInterventions = {
      critical: [
        {
          type: 'accountability',
          title: 'Get Support',
          description: 'Tell someone about your commitment to restart this habit',
          priority: 'high'
        },
        {
          type: 'reduce_friction',
          title: 'Make It Easier',
          description: 'Identify and remove barriers that are preventing you from starting',
          priority: 'high'
        }
      ],
      high: [
        {
          type: 'habit_stack',
          title: 'Habit Stacking',
          description: `Link ${categoryName.toLowerCase()} to an existing strong habit`,
          priority: 'medium'
        },
        {
          type: 'reminder',
          title: 'Set Reminders',
          description: 'Create visual or digital reminders for this habit',
          priority: 'medium'
        }
      ],
      medium: [
        {
          type: 'review',
          title: 'Review Your Why',
          description: `Reconnect with why ${categoryName.toLowerCase()} is important to you`,
          priority: 'low'
        },
        {
          type: 'adjust',
          title: 'Adjust Expectations',
          description: 'Consider if your current approach needs modification',
          priority: 'low'
        }
      ]
    };
    
    return [
      ...baseInterventions,
      ...(riskSpecificInterventions[riskLevel] || [])
    ];
  }
  
  // Check if user should receive alerts (respects preferences and timing)
  static async shouldSendAlert(userId, alertType = 'habit_degradation_alert') {
    // Check user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true }
    });
    
    if (!user?.preferences?.notificationsEnabled) {
      return false;
    }
    
    // Check if we've sent a similar alert recently (avoid spam)
    const recentSimilarAlert = await prisma.notification.findFirst({
      where: {
        userId,
        type: alertType,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return !recentSimilarAlert;
  }
  
  // Cleanup old alerts
  static async cleanupOldAlerts(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        read: true
      }
    });
    
    return result.count;
  }
}

export default AlertService;