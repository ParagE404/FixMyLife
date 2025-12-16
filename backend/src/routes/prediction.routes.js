import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import PredictionService from '../services/prediction.service.js';
import AlertService from '../services/alert.service.js';

const router = express.Router();

// Get habit degradation predictions for current user
router.get('/habits/risk-analysis', authenticateUser, async (req, res) => {
  try {
    const analysis = await AlertService.getCurrentRiskAnalysis(req.userId);
    res.json(analysis);
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze habit risks' });
  }
});

// Get stored predictions
router.get('/habits/predictions', authenticateUser, async (req, res) => {
  try {
    const predictions = await PredictionService.getUserPredictions(req.userId);
    res.json({ predictions });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Failed to get predictions' });
  }
});

// Trigger fresh analysis
router.post('/habits/analyze', authenticateUser, async (req, res) => {
  try {
    const predictions = await PredictionService.analyzeHabitDegradationRisk(req.userId);
    res.json({ 
      predictions,
      message: 'Analysis completed',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Habit analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze habits' });
  }
});

// Get alerts
router.get('/alerts', authenticateUser, async (req, res) => {
  try {
    const { type, read, limit, offset } = req.query;
    const alerts = await AlertService.getUserAlerts(req.userId, {
      type,
      read: read !== undefined ? read === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    
    res.json({ alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Get habit degradation alerts specifically
router.get('/alerts/habit-degradation', authenticateUser, async (req, res) => {
  try {
    const alerts = await AlertService.getHabitDegradationAlerts(req.userId);
    res.json({ alerts });
  } catch (error) {
    console.error('Get habit alerts error:', error);
    res.status(500).json({ error: 'Failed to get habit alerts' });
  }
});

// Mark alert as read
router.patch('/alerts/:alertId/read', authenticateUser, async (req, res) => {
  try {
    const alert = await AlertService.markAlertAsRead(req.userId, req.params.alertId);
    res.json({ alert, message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Mark all alerts as read
router.patch('/alerts/read-all', authenticateUser, async (req, res) => {
  try {
    const { type } = req.body;
    const result = await AlertService.markAllAlertsAsRead(req.userId, type);
    res.json({ 
      message: 'Alerts marked as read',
      count: result.count
    });
  } catch (error) {
    console.error('Mark all alerts read error:', error);
    res.status(500).json({ error: 'Failed to mark alerts as read' });
  }
});

// Delete alert
router.delete('/alerts/:alertId', authenticateUser, async (req, res) => {
  try {
    await AlertService.deleteAlert(req.userId, req.params.alertId);
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Get alert statistics
router.get('/alerts/stats', authenticateUser, async (req, res) => {
  try {
    const stats = await AlertService.getAlertStats(req.userId);
    res.json(stats);
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ error: 'Failed to get alert statistics' });
  }
});

// Trigger intervention for an alert
router.post('/alerts/:alertId/intervention', authenticateUser, async (req, res) => {
  try {
    const interventions = await AlertService.triggerIntervention(req.userId, req.params.alertId);
    res.json({ 
      interventions,
      message: 'Intervention suggestions generated'
    });
  } catch (error) {
    console.error('Trigger intervention error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create custom alert (for testing or manual alerts)
router.post('/alerts', authenticateUser, async (req, res) => {
  try {
    const { type, title, message, actionData } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const alert = await AlertService.createAlert(req.userId, {
      type,
      title,
      message,
      actionData
    });
    
    res.status(201).json({ alert });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

export default router;