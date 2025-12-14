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
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!preferences) {
    throwError('Preferences not found', 404);
  }

  return preferences;
};

export const updateUserPreferences = async (userId, data) => {
  const preferences = await prisma.userPreferences.update({
    where: { userId },
    data: {
      rememberMeEnabled: data.rememberMeEnabled,
      notificationsEnabled: data.notificationsEnabled,
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
