import { PrismaClient } from '@prisma/client';
import { parseActivityWithLLM } from './llm.service.js';
import { throwError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const parseAndCreateActivities = async (userId, textInput) => {
  try {
    // Get user's custom categories
    const customCategories = await prisma.customCategory.findMany({
      where: { userId },
      select: { name: true },
    });

    const customCategoryNames = customCategories.map((c) => c.name);

    // Parse with LLM
    const parsedActivities = await parseActivityWithLLM(textInput, customCategoryNames);

    if (!Array.isArray(parsedActivities) || parsedActivities.length === 0) {
      throwError('Could not parse activities from input', 400);
    }

    // Convert to database format and create
    const createdActivities = [];
    const today = new Date();

    for (const parsed of parsedActivities) {
      // Find category
      let categoryId = null;
      let customCategoryId = null;

      const defaultCategory = await prisma.category.findUnique({
        where: { name: parsed.category },
      });

      if (defaultCategory) {
        categoryId = defaultCategory.id;
      } else {
        const customCat = await prisma.customCategory.findFirst({
          where: { userId, name: parsed.category },
        });
        if (customCat) {
          customCategoryId = customCat.id;
        } else {
          // Default to first category if not found
          const firstCat = await prisma.category.findFirst();
          categoryId = firstCat.id;
        }
      }

      // Parse times
      let startTime = parseTime(parsed.startTime, today);
      let endTime = parsed.endTime ? parseTime(parsed.endTime, today) : null;

      // If startTime is null, use current time (required field)
      if (!startTime) {
        startTime = new Date();
      }

      // Calculate duration
      let duration = null;
      if (startTime && endTime) {
        duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes
      }

      // Build data object with proper relations
      const activityData = {
        description: parsed.description,
        startTime, // Now guaranteed to be non-null
        endTime,
        duration,
        confidenceScore: parsed.confidenceScore || 0.5,
        user: {
          connect: { id: userId },
        },
      };

      // Connect category if found
      if (categoryId) {
        activityData.category = {
          connect: { id: categoryId },
        };
      }

      // Connect custom category if found
      if (customCategoryId) {
        activityData.customCategory = {
          connect: { id: customCategoryId },
        };
      }

      // Create activity
      const activity = await prisma.activity.create({
        data: activityData,
        include: {
          category: true,
          customCategory: true,
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      // Update activity suggestion
      await updateActivitySuggestion(userId, parsed.description, categoryId);

      // Update daily aggregate
      await updateDailyAggregate(userId, startTime);

      // Update goal progress for matching categories
      await updateGoalProgressFromActivity(userId, categoryId, customCategoryId, duration);

      createdActivities.push(activity);
    }

    return createdActivities;
  } catch (error) {
    console.error('Activity creation error:', error);
    throw error;
  }
};

export const createActivity = async (userId, activityData) => {
  try {
    const { description, categoryId, customCategoryId, startTime, endTime } = activityData;

    if (!categoryId && !customCategoryId) {
      throwError('Either category or custom category is required', 400);
    }

    let start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : null;

    if (end && start >= end) {
      throwError('End time must be after start time', 400);
    }

    let duration = null;
    if (end) {
      duration = Math.round((end - start) / (1000 * 60));
    }

    // Build data object
    const createData = {
      description,
      startTime: start,
      endTime: end,
      duration,
      confidenceScore: 1.0,
      user: {
        connect: { id: userId },
      },
    };

    // Connect category if provided
    if (categoryId) {
      createData.category = {
        connect: { id: categoryId },
      };
    }

    // Connect custom category if provided
    if (customCategoryId) {
      createData.customCategory = {
        connect: { id: customCategoryId },
      };
    }

    const activity = await prisma.activity.create({
      data: createData,
      include: {
        category: true,
        customCategory: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    await updateActivitySuggestion(userId, description, categoryId);
    await updateDailyAggregate(userId, start);

    // Update goal progress for matching categories
    await updateGoalProgressFromActivity(userId, categoryId, customCategoryId, duration);

    return activity;
  } catch (error) {
    throw error;
  }
};

export const getActivities = async (userId, filters = {}) => {
  const { categoryId, category, startDate, endDate, search, limit = 50, offset = 0, sort = 'newest' } = filters;

  const where = { userId };

  if (categoryId) {
    where.categoryId = categoryId;
  } else if (category) {
    // Filter by category name
    where.OR = [
      {
        category: {
          name: category
        }
      },
      {
        customCategory: {
          name: category
        }
      }
    ];
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

  // Determine sort order
  let orderBy = { startTime: 'desc' }; // default: newest first
  
  if (sort === 'oldest') {
    orderBy = { startTime: 'asc' };
  } else if (sort === 'duration') {
    orderBy = { duration: 'desc' };
  }

  const activities = await prisma.activity.findMany({
    where,
    include: {
      category: true,
      customCategory: true,
      user: {
        select: { id: true, email: true, name: true },
      },
    },
    orderBy,
    take: limit,
    skip: offset,
  });

  return activities;
};

export const updateActivity = async (userId, activityId, updates) => {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
  });

  if (!activity) {
    throwError('Activity not found', 404);
  }

  const updateData = {};

  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }
  if (updates.startTime !== undefined) {
    updateData.startTime = updates.startTime;
  }
  if (updates.endTime !== undefined) {
    updateData.endTime = updates.endTime;
  }
  if (updates.confidenceScore !== undefined) {
    updateData.confidenceScore = updates.confidenceScore;
  }

  // Handle category connection
  if (updates.categoryId !== undefined) {
    if (updates.categoryId) {
      updateData.category = {
        connect: { id: updates.categoryId },
      };
    }
  }

  // Handle custom category connection
  if (updates.customCategoryId !== undefined) {
    if (updates.customCategoryId) {
      updateData.customCategory = {
        connect: { id: updates.customCategoryId },
      };
    }
  }

  const updated = await prisma.activity.update({
    where: { id: activityId },
    data: updateData,
    include: {
      category: true,
      customCategory: true,
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return updated;
};

export const deleteActivity = async (userId, activityId) => {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
  });

  if (!activity) {
    throwError('Activity not found', 404);
  }

  await prisma.activity.delete({ where: { id: activityId } });
  return { success: true };
};

export const getActivitySuggestions = async (userId, query) => {
  if (!query || query.length < 2) {
    return [];
  }

  const suggestions = await prisma.activitySuggestion.findMany({
    where: {
      userId,
      description: {
        search: query.split(' ').join(' & '),
      },
    },
    orderBy: { frequency: 'desc' },
    take: 5,
  });

  return suggestions;
};

// Helper: Parse time string to Date
function parseTime(timeStr, baseDate = new Date()) {
  if (!timeStr) return null;

  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const [_, hours, minutes] = match;
  const date = new Date(baseDate);
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
}

// Helper: Update activity suggestion
async function updateActivitySuggestion(userId, description, categoryId) {
  try {
    const existing = await prisma.activitySuggestion.findFirst({
      where: { userId, description },
    });

    if (existing) {
      await prisma.activitySuggestion.update({
        where: { id: existing.id },
        data: {
          frequency: existing.frequency + 1,
          lastUsed: new Date(),
        },
      });
    } else {
      await prisma.activitySuggestion.create({
        data: {
          userId,
          description,
          categoryId: categoryId || null,
          frequency: 1,
          lastUsed: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Activity suggestion error:', error);
    // Don't throw - this is optional
  }
}

// Helper: Update daily aggregate
async function updateDailyAggregate(userId, activityDate) {
  try {
    if (!activityDate) return;

    const date = new Date(activityDate);
    date.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: { category: true },
    });

    // Calculate totals
    let totalDuration = 0;
    const categoryBreakdown = {};

    activities.forEach((activity) => {
      const catName = activity.category?.name || 'Other';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = 0;
      }

      if (activity.duration) {
        totalDuration += activity.duration;
        categoryBreakdown[catName] += activity.duration / 60; // convert to hours
      }
    });

    await prisma.dailyAggregate.upsert({
      where: { userId_date: { userId, date } },
      update: {
        totalActivities: activities.length,
        totalDuration,
        categoryBreakdown,
      },
      create: {
        userId,
        date,
        totalActivities: activities.length,
        totalDuration,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Daily aggregate error:', error);
    // Don't throw - this is optional
  }
}

// Helper: Update goal progress from activity
async function updateGoalProgressFromActivity(userId, categoryId, customCategoryId, duration) {
  try {
    if (!duration || duration <= 0) return;

    // Find active goals that match the activity's category
    const matchingGoals = await prisma.goal.findMany({
      where: {
        userId,
        status: 'active',
        OR: [
          ...(categoryId ? [{ categoryId }] : []),
          ...(customCategoryId ? [{ customCategoryId }] : []),
        ],
      },
    });

    if (matchingGoals.length === 0) return;

    const hoursLogged = duration / 60; // convert minutes to hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update progress for each matching goal
    for (const goal of matchingGoals) {
      // Check if we already have progress logged for today
      const existingProgress = await prisma.goalProgress.findFirst({
        where: {
          goalId: goal.id,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existingProgress) {
        // Update existing progress for today
        await prisma.goalProgress.update({
          where: { id: existingProgress.id },
          data: {
            hoursLogged: existingProgress.hoursLogged + hoursLogged,
          },
        });
      } else {
        // Create new progress entry for today
        await prisma.goalProgress.create({
          data: {
            goalId: goal.id,
            date: today,
            hoursLogged,
          },
        });
      }
    }
  } catch (error) {
    console.error('Goal progress update error:', error);
    // Don't throw - this is optional
  }
}