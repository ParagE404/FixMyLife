import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getDefaultCategories,
  getOrCreateCategories,
} from '../services/user.service.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    const user = await getUserProfile(req.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', authenticateUser, async (req, res, next) => {
  try {
    const { name, timezone } = req.body;
    const user = await updateUserProfile(req.userId, { name, timezone });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get preferences
router.get('/me/preferences', authenticateUser, async (req, res, next) => {
  try {
    const preferences = await getUserPreferences(req.userId);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

// Update preferences
router.put('/me/preferences', authenticateUser, async (req, res, next) => {
  try {
    const preferences = await updateUserPreferences(req.userId, req.body);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

// Get default categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await getDefaultCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

export default router;
