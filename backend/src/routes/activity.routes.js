import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  parseAndCreateActivities,
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
  getActivitySuggestions,
} from '../services/activity.service.js';

const router = express.Router();

// Parse and create activities from text
router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const { input } = req.body;
    if (!input || input.trim().length === 0) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const activities = await parseAndCreateActivities(req.userId, input);
    res.status(201).json({
      message: 'Activities created successfully',
      activities,
    });
  } catch (error) {
    next(error);
  }
});

// Create single activity directly
router.post('/manual', authenticateUser, async (req, res, next) => {
  try {
    const { description, categoryId, customCategoryId, startTime, endTime } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const activity = await createActivity(req.userId, {
      description,
      categoryId,
      customCategoryId,
      startTime,
      endTime,
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

// Get activities with filters
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const { categoryId, category, startDate, endDate, search, limit, offset, sort } = req.query;

    const activities = await getActivities(req.userId, {
      categoryId,
      category,
      startDate,
      endDate,
      search,
      sort,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Get activity suggestions (autocomplete)
router.get('/suggestions', authenticateUser, async (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = await getActivitySuggestions(req.userId, q);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

// Get single activity
router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const activity = await prisma.activity.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { category: true, customCategory: true },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// Update activity
router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const updated = await updateActivity(req.userId, req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete activity
router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    await deleteActivity(req.userId, req.params.id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
