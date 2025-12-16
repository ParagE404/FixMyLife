import { PrismaClient } from '@prisma/client';
import { throwError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      timezone: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throwError('User not found', 404);
  }

  return user;
};

export const updateUserProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      timezone: data.timezone,
    },
    select: {
      id: true,
      email: true,
      name: true,
      timezone: true,
    },
  });

  return user;
};

export const getUserPreferences = async (userId) => {
  let preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await prisma.userPreferences.create({
      data: {
        userId,
        rememberMeEnabled: true,
        notificationsEnabled: true,
        dailyReminders: true,
        weeklyReports: true,
        goalAchievements: true,
        streakAlerts: false,
        emailNotifications: false,
        theme: 'system',
        accentColor: 'green',
        categoryOrder: [],
        hiddenCategories: [],
      },
    });
  }

  return preferences;
};

export const updateUserPreferences = async (userId, data) => {
  // First ensure preferences exist
  await getUserPreferences(userId);
  
  const preferences = await prisma.userPreferences.update({
    where: { userId },
    data: {
      rememberMeEnabled: data.rememberMeEnabled,
      notificationsEnabled: data.notificationsEnabled,
      dailyReminders: data.dailyReminders,
      weeklyReports: data.weeklyReports,
      goalAchievements: data.goalAchievements,
      streakAlerts: data.streakAlerts,
      emailNotifications: data.emailNotifications,
      theme: data.theme,
      accentColor: data.accentColor,
      categoryOrder: data.categoryOrder,
      hiddenCategories: data.hiddenCategories,
    },
  });

  return preferences;
};

export const getDefaultCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  return categories;
};

export const getOrCreateCategories = async () => {
  const defaultCategories = [
    { name: 'Physical Health', description: 'Exercise, sleep, nutrition, medical care', order: 0 },
    { name: 'Career & Finances', description: 'Work, learning, professional development', order: 1 },
    { name: 'Relationships', description: 'Family, friends, romantic partners', order: 2 },
    { name: 'Emotional & Mental Health', description: 'Meditation, therapy, self-care', order: 3 },
    { name: 'Personal Growth', description: 'Hobbies, creativity, skill development', order: 4 },
  ];

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  return await prisma.category.findMany({ orderBy: { order: 'asc' } });
};

export const completeOnboarding = async (userId, selectedCategories, customCategories, goals) => {
  // Ensure categories exist
  await getOrCreateCategories();
  
  // Create custom categories first
  const customCategoryPromises = customCategories.map(categoryName => 
    prisma.customCategory.create({
      data: {
        userId,
        name: categoryName
      }
    })
  );
  
  const createdCustomCategories = await Promise.all(customCategoryPromises);
  
  // Get category IDs for selected default categories
  const defaultCategories = await prisma.category.findMany({
    where: { name: { in: selectedCategories.filter(cat => !customCategories.includes(cat)) } }
  });

  // Create goals for selected default categories
  const defaultGoalPromises = defaultCategories.map(category => {
    const goalDescription = goals[category.name];
    if (goalDescription) {
      return prisma.goal.create({
        data: {
          userId,
          title: `${category.name} Goal`,
          description: goalDescription,
          targetHours: 7, // Default 1 hour per day
          categoryId: category.id,
          startDate: new Date(),
          status: 'active'
        }
      });
    }
    return null;
  }).filter(Boolean);

  // Create goals for custom categories
  const customGoalPromises = createdCustomCategories.map(category => {
    const goalDescription = goals[category.name];
    if (goalDescription) {
      return prisma.goal.create({
        data: {
          userId,
          title: `${category.name} Goal`,
          description: goalDescription,
          targetHours: 7, // Default 1 hour per day
          customCategoryId: category.id,
          startDate: new Date(),
          status: 'active'
        }
      });
    }
    return null;
  }).filter(Boolean);

  await Promise.all([...defaultGoalPromises, ...customGoalPromises]);

  // Mark onboarding as completed
  const user = await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
    select: {
      id: true,
      email: true,
      name: true,
      onboardingCompleted: true,
    }
  });

  return user;
};

export const getUserFocusAreas = async (userId) => {
  const [defaultCategories, customCategories, userGoals] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.customCategory.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.goal.findMany({
      where: { userId, status: 'active' },
      include: {
        category: true,
        customCategory: true
      }
    })
  ]);

  // Get selected categories from active goals
  const selectedDefaultCategories = userGoals
    .filter(goal => goal.categoryId)
    .map(goal => goal.category.name);
    
  const selectedCustomCategories = userGoals
    .filter(goal => goal.customCategoryId)
    .map(goal => goal.customCategory.name);

  return {
    defaultCategories,
    customCategories,
    selectedCategories: [...selectedDefaultCategories, ...selectedCustomCategories]
  };
};

export const updateUserFocusAreas = async (userId, selectedCategories, customCategories) => {
  // Ensure default categories exist
  await getOrCreateCategories();
  
  // Get current custom categories for this user
  const existingCustomCategories = await prisma.customCategory.findMany({
    where: { userId }
  });
  
  // Create new custom categories
  const newCustomCategories = customCategories.filter(
    name => !existingCustomCategories.some(cat => cat.name === name)
  );
  
  const createPromises = newCustomCategories.map(name =>
    prisma.customCategory.create({
      data: { userId, name }
    })
  );
  
  await Promise.all(createPromises);
  
  // Remove custom categories that are no longer selected
  const categoriesToRemove = existingCustomCategories.filter(
    cat => !customCategories.includes(cat.name)
  );
  
  const deletePromises = categoriesToRemove.map(cat =>
    prisma.customCategory.delete({
      where: { id: cat.id }
    })
  );
  
  await Promise.all(deletePromises);
  
  return { success: true };
};

export const createCustomCategory = async (userId, name) => {
  const category = await prisma.customCategory.create({
    data: {
      userId,
      name
    }
  });
  
  return category;
};

export const deleteCustomCategory = async (userId, categoryId) => {
  // Verify the category belongs to the user
  const category = await prisma.customCategory.findFirst({
    where: { id: categoryId, userId }
  });
  
  if (!category) {
    throwError('Custom category not found', 404);
  }
  
  await prisma.customCategory.delete({
    where: { id: categoryId }
  });
  
  return { success: true };
};

export const exportUserData = async (userId) => {
  const [user, activities, goals, customCategories, preferences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        createdAt: true,
      }
    }),
    prisma.activity.findMany({
      where: { userId },
      include: {
        category: true,
        customCategory: true,
      }
    }),
    prisma.goal.findMany({
      where: { userId },
      include: {
        category: true,
        customCategory: true,
        progress: true,
      }
    }),
    prisma.customCategory.findMany({
      where: { userId }
    }),
    prisma.userPreferences.findUnique({
      where: { userId }
    })
  ]);

  return {
    user,
    activities,
    goals,
    customCategories,
    preferences,
    exportedAt: new Date().toISOString(),
  };
};

export const clearUserData = async (userId) => {
  // Delete all user data except the user account itself
  await Promise.all([
    prisma.activity.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.customCategory.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.insight.deleteMany({ where: { userId } }),
    prisma.streak.deleteMany({ where: { userId } }),
    prisma.milestone.deleteMany({ where: { userId } }),
    prisma.dailyAggregate.deleteMany({ where: { userId } }),
    prisma.weeklyAggregate.deleteMany({ where: { userId } }),
    prisma.activitySuggestion.deleteMany({ where: { userId } }),
    prisma.userPatterns.deleteMany({ where: { userId } }),
    prisma.patternSuggestion.deleteMany({ where: { userId } }),
    prisma.correlationAnalysis.deleteMany({ where: { userId } }),
  ]);

  // Reset user onboarding status
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: false }
  });

  return { success: true, message: 'All user data cleared successfully' };
};

export const deleteUserAccount = async (userId) => {
  // This will cascade delete all related data due to foreign key constraints
  await prisma.user.delete({
    where: { id: userId }
  });

  return { success: true, message: 'Account deleted successfully' };
};
