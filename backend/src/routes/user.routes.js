import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getDefaultCategories,
  getOrCreateCategories,
  completeOnboarding,
  getUserFocusAreas,
  updateUserFocusAreas,
  createCustomCategory,
  deleteCustomCategory,
  exportUserData,
  clearUserData,
  deleteUserAccount,
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

// Complete onboarding
router.post('/complete-onboarding', authenticateUser, async (req, res, next) => {
  try {
    const { selectedCategories, customCategories = [], goals } = req.body;
    const user = await completeOnboarding(req.userId, selectedCategories, customCategories, goals);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user focus areas
router.get('/focus-areas', authenticateUser, async (req, res, next) => {
  try {
    const focusAreas = await getUserFocusAreas(req.userId);
    res.json(focusAreas);
  } catch (error) {
    next(error);
  }
});

// Update user focus areas
router.put('/focus-areas', authenticateUser, async (req, res, next) => {
  try {
    const { selectedCategories, customCategories = [] } = req.body;
    const result = await updateUserFocusAreas(req.userId, selectedCategories, customCategories);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Create custom category
router.post('/custom-categories', authenticateUser, async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await createCustomCategory(req.userId, name);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Delete custom category
router.delete('/custom-categories/:categoryId', authenticateUser, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const result = await deleteCustomCategory(req.userId, categoryId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Export user data
router.get('/export-data', authenticateUser, async (req, res, next) => {
  try {
    const userData = await exportUserData(req.userId);
    res.json(userData);
  } catch (error) {
    next(error);
  }
});

// Clear all user data
router.delete('/clear-data', authenticateUser, async (req, res, next) => {
  try {
    const result = await clearUserData(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/delete-account', authenticateUser, async (req, res, next) => {
  try {
    const result = await deleteUserAccount(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
