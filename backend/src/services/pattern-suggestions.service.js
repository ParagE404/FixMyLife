import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pattern Suggestions Service
 * Manages storage and retrieval of pattern-based suggestions
 */

// Store pattern suggestions in database
export const storePatternSuggestions = async (userId, suggestions) => {
  try {
    // Clear old suggestions first (older than 4 hours or already read)
    const fourHoursAgo = new Date();
    fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);
    
    await prisma.patternSuggestion.deleteMany({
      where: {
        userId,
        OR: [
          {
            createdAt: {
              lt: fourHoursAgo,
            },
          },
          {
            isRead: true,
          },
          {
            isActedOn: true,
          },
        ],
      },
    });

    // Check for existing similar suggestions to avoid duplicates
    const existingSuggestions = await prisma.patternSuggestion.findMany({
      where: {
        userId,
        isRead: false,
        isActedOn: false,
      },
    });

    // Filter out suggestions that are too similar to existing ones
    const newSuggestions = suggestions.filter(suggestion => {
      return !existingSuggestions.some(existing => 
        existing.type === suggestion.type &&
        existing.category === suggestion.category &&
        existing.timing === suggestion.timing
      );
    });

    if (newSuggestions.length === 0) {
      return 0; // No new suggestions to store
    }

    // Store new suggestions
    const suggestionData = newSuggestions.map(suggestion => ({
      userId,
      type: suggestion.type,
      category: suggestion.category,
      title: suggestion.title,
      message: suggestion.message,
      priority: suggestion.priority,
      confidence: suggestion.confidence,
      timing: suggestion.timing,
      actionType: suggestion.suggestedAction || 'log_activity', // Default action type
      expiresAt: getExpirationDate(suggestion.timing),
    }));

    await prisma.patternSuggestion.createMany({
      data: suggestionData,
    });

    return suggestionData.length;
  } catch (error) {
    console.error('Store pattern suggestions error:', error);
    throw error;
  }
};

// Get active pattern suggestions for user
export const getActivePatternSuggestions = async (userId) => {
  try {
    const now = new Date();
    
    const suggestions = await prisma.patternSuggestion.findMany({
      where: {
        userId,
        expiresAt: {
          gt: now,
        },
        isRead: false,
      },
      orderBy: [
        { priority: 'desc' },
        { confidence: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return suggestions;
  } catch (error) {
    console.error('Get active pattern suggestions error:', error);
    throw error;
  }
};

// Mark suggestion as read
export const markSuggestionAsRead = async (userId, suggestionId) => {
  try {
    const updated = await prisma.patternSuggestion.updateMany({
      where: {
        id: suggestionId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return updated.count > 0;
  } catch (error) {
    console.error('Mark suggestion as read error:', error);
    throw error;
  }
};

// Mark suggestion as acted upon
export const markSuggestionAsActedOn = async (userId, suggestionId) => {
  try {
    const updated = await prisma.patternSuggestion.updateMany({
      where: {
        id: suggestionId,
        userId,
      },
      data: {
        isActedOn: true,
        isRead: true,
      },
    });

    return updated.count > 0;
  } catch (error) {
    console.error('Mark suggestion as acted on error:', error);
    throw error;
  }
};

// Get suggestion statistics
export const getSuggestionStats = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, actedOn, dismissed] = await Promise.all([
      prisma.patternSuggestion.count({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.patternSuggestion.count({
        where: {
          userId,
          isActedOn: true,
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.patternSuggestion.count({
        where: {
          userId,
          isRead: true,
          isActedOn: false,
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    const actionRate = total > 0 ? (actedOn / total) * 100 : 0;
    const dismissalRate = total > 0 ? (dismissed / total) * 100 : 0;

    return {
      total,
      actedOn,
      dismissed,
      actionRate: Math.round(actionRate),
      dismissalRate: Math.round(dismissalRate),
      period: `${days} days`,
    };
  } catch (error) {
    console.error('Get suggestion stats error:', error);
    throw error;
  }
};

// Clean up expired suggestions
export const cleanupExpiredSuggestions = async () => {
  try {
    const now = new Date();
    
    const deleted = await prisma.patternSuggestion.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return deleted.count;
  } catch (error) {
    console.error('Cleanup expired suggestions error:', error);
    throw error;
  }
};

// Get suggestion history for analysis
export const getSuggestionHistory = async (userId, limit = 50) => {
  try {
    const suggestions = await prisma.patternSuggestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Group by type for analysis
    const byType = {};
    const byCategory = {};
    
    suggestions.forEach(suggestion => {
      // By type
      if (!byType[suggestion.type]) {
        byType[suggestion.type] = {
          total: 0,
          actedOn: 0,
          dismissed: 0,
        };
      }
      byType[suggestion.type].total++;
      if (suggestion.isActedOn) byType[suggestion.type].actedOn++;
      if (suggestion.isRead && !suggestion.isActedOn) byType[suggestion.type].dismissed++;

      // By category
      if (!byCategory[suggestion.category]) {
        byCategory[suggestion.category] = {
          total: 0,
          actedOn: 0,
          dismissed: 0,
        };
      }
      byCategory[suggestion.category].total++;
      if (suggestion.isActedOn) byCategory[suggestion.category].actedOn++;
      if (suggestion.isRead && !suggestion.isActedOn) byCategory[suggestion.category].dismissed++;
    });

    return {
      suggestions,
      analytics: {
        byType,
        byCategory,
        totalSuggestions: suggestions.length,
      },
    };
  } catch (error) {
    console.error('Get suggestion history error:', error);
    throw error;
  }
};

// Helper: Get expiration date based on timing
const getExpirationDate = (timing) => {
  const now = new Date();
  
  switch (timing) {
    case 'immediate':
      // Expire in 4 hours
      return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    case 'upcoming':
      // Expire in 6 hours
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case 'sequence':
      // Expire in 2 hours
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case 'weekly':
      // Expire in 24 hours
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    default:
      // Default: expire in 8 hours
      return new Date(now.getTime() + 8 * 60 * 60 * 1000);
  }
};