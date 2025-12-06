import { PrismaClient } from "@prisma/client";
import { throwError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const createGoal = async (userId, goalData) => {
  try {
    const { title, description, targetHours, categoryId, endDate } = goalData;

    if (!title || !targetHours) {
      throwError("Title and target hours are required", 400);
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetHours,
        goalType: goalData.goalType || "habit", // ADD THIS LINE
        categoryId,
        endDate: endDate ? new Date(endDate) : null,
        startDate: new Date(),
        user: {
          connect: { id: userId },
        },
      },

      include: {
        category: true,
        progress: true,
      },
    });

    return goal;
  } catch (error) {
    throw error;
  }
};

export const getGoals = async (userId, filters = {}) => {
  const { status = "active" } = filters;

  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    include: {
      category: true,
      progress: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate progress for each goal
  const goalsWithProgress = goals.map((goal) => {
    const totalLogged = goal.progress.reduce(
      (sum, p) => sum + p.hoursLogged,
      0
    );
    const weeksSinceStart = Math.ceil(
      (new Date() - new Date(goal.startDate)) / (7 * 24 * 60 * 60 * 1000)
    );
    const expectedHours = goal.targetHours * weeksSinceStart;
    const progressPercent =
      expectedHours > 0 ? Math.round((totalLogged / expectedHours) * 100) : 0;

    return {
      ...goal,
      totalLogged,
      weeksSinceStart,
      expectedHours,
      progressPercent,
      isOnTrack: progressPercent >= 80,
    };
  });

  return goalsWithProgress;
};

export const updateGoal = async (userId, goalId, updates) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    throwError("Goal not found", 404);
  }

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.targetHours && { targetHours: updates.targetHours }),
      ...(updates.status && { status: updates.status }),
    },
    include: {
      category: true,
      progress: true,
    },
  });

  return updated;
};

export const completeGoal = async (userId, goalId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    throwError("Goal not found", 404);
  }

  const completed = await prisma.goal.update({
    where: { id: goalId },
    data: { status: "completed" },
  });

  // Create celebration insight
  await createInsight(userId, {
    type: "milestone",
    title: "🎉 Goal Completed!",
    message: `You've successfully completed "${goal.title}"!`,
  });

  return completed;
};

export const logGoalProgress = async (userId, goalId, hoursLogged) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    throwError("Goal not found", 404);
  }

  const progress = await prisma.goalProgress.create({
    data: {
      goalId,
      hoursLogged,
      date: new Date(),
    },
  });

  return progress;
};

export const deleteGoal = async (userId, goalId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    throwError("Goal not found", 404);
  }

  await prisma.goal.delete({ where: { id: goalId } });
  return { success: true };
};
