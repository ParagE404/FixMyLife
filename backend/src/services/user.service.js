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

export const completeOnboarding = async (userId, selectedCategories, goals) => {
  // Ensure categories exist
  await getOrCreateCategories();
  
  // Get category IDs for selected categories
  const categories = await prisma.category.findMany({
    where: { name: { in: selectedCategories } }
  });

  // Create goals for selected categories
  const goalPromises = categories.map(category => {
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

  await Promise.all(goalPromises);

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
