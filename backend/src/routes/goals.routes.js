import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  createGoal,
  getGoals,
  updateGoal,
  completeGoal,
  logGoalProgress,
  deleteGoal,
} from '../services/goals.service.js';
import {
  generateRecommendations,
  getInsights,
  markInsightAsRead,
} from '../services/recommendations.service.js';

const router = express.Router();

// Goals endpoints
router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const goal = await createGoal(req.userId, req.body);
    res.json(goal);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const { status } = req.query;
    const goals = await getGoals(req.userId, { status });
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

router.put('/:goalId', authenticateUser, async (req, res, next) => {
  try {
    const goal = await updateGoal(req.userId, req.params.goalId, req.body);
    res.json(goal);
  } catch (error) {
    next(error);
  }
});

router.post('/:goalId/complete', authenticateUser, async (req, res, next) => {
  try {
    const goal = await completeGoal(req.userId, req.params.goalId);
    res.json(goal);
  } catch (error) {
    next(error);
  }
});

router.post('/:goalId/progress', authenticateUser, async (req, res, next) => {
  try {
    const { hoursLogged } = req.body;
    const progress = await logGoalProgress(req.userId, req.params.goalId, hoursLogged);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

router.delete('/:goalId', authenticateUser, async (req, res, next) => {
  try {
    const result = await deleteGoal(req.userId, req.params.goalId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Insights endpoints
router.get('/insights/recommendations', authenticateUser, async (req, res, next) => {
  try {
    const recommendations = await generateRecommendations(req.userId);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

router.get('/insights/list', authenticateUser, async (req, res, next) => {
  try {
    const { unreadOnly, limit } = req.query;
    const insights = await getInsights(req.userId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : 10,
    });
    res.json(insights);
  } catch (error) {
    next(error);
  }
});

router.post('/insights/:insightId/read', authenticateUser, async (req, res, next) => {
  try {
    const insight = await markInsightAsRead(req.userId, req.params.insightId);
    res.json(insight);
  } catch (error) {
    next(error);
  }
});

export default router;
