import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth.js';
import {
  analyzeUserPatterns,
  detectPatternDeviations,
  generateProactiveSuggestions,
  getPatternInsights,
  checkPatternsAndSuggest,
} from '../services/pattern-recognition.service.js';
import {
  markSuggestionAsActedOn,
  markSuggestionAsRead,
} from '../services/pattern-suggestions.service.js';

const prisma = new PrismaClient();

const router = express.Router();

/**
 * GET /api/patterns/analyze
 * Analyze user's behavioral patterns
 */
router.get('/analyze', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const analysis = await analyzeUserPatterns(userId);
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patterns',
      error: error.message,
    });
  }
});

/**
 * GET /api/patterns/insights
 * Get pattern insights for dashboard
 */
router.get('/insights', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const insights = await getPatternInsights(userId);
    
    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Pattern insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pattern insights',
      error: error.message,
    });
  }
});

/**
 * GET /api/patterns/suggestions
 * Get proactive suggestions based on current patterns and deviations
 */
router.get('/suggestions', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await checkPatternsAndSuggest(userId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Pattern suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pattern suggestions',
      error: error.message,
    });
  }
});

/**
 * POST /api/patterns/suggestions/:suggestionId/act
 * Mark a suggestion as acted upon and optionally log activity
 */
router.post('/suggestions/:suggestionId/act', authenticateUser, async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const userId = req.userId;
    
    // Get the suggestion details first
    const suggestion = await prisma.patternSuggestion.findFirst({
      where: {
        id: suggestionId,
        userId,
      },
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found',
      });
    }

    // If the action type is log_activity, create an activity
    if (suggestion.actionType === 'log_activity') {
      // Find a category that matches the suggestion category
      const category = await prisma.category.findFirst({
        where: {
          name: {
            contains: suggestion.category,
            mode: 'insensitive',
          },
        },
      });

      if (category) {
        // Create the activity
        await prisma.activity.create({
          data: {
            userId,
            categoryId: category.id,
            description: `${suggestion.category} activity (from pattern suggestion)`,
            startTime: new Date(),
            duration: 30, // Default 30 minutes
            confidenceScore: 1.0,
          },
        });
      }
    }
    
    // Mark suggestion as acted upon
    const success = await markSuggestionAsActedOn(userId, suggestionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update suggestion',
      });
    }
    
    res.json({
      success: true,
      message: suggestion.actionType === 'log_activity' 
        ? 'Activity logged and suggestion marked as completed'
        : 'Suggestion marked as acted upon',
      activityLogged: suggestion.actionType === 'log_activity',
    });
  } catch (error) {
    console.error('Suggestion action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update suggestion',
      error: error.message,
    });
  }
});

/**
 * POST /api/patterns/suggestions/:suggestionId/dismiss
 * Dismiss a suggestion
 */
router.post('/suggestions/:suggestionId/dismiss', authenticateUser, async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const userId = req.userId;
    
    const success = await markSuggestionAsRead(userId, suggestionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Suggestion dismissed',
    });
  } catch (error) {
    console.error('Suggestion dismiss error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss suggestion',
      error: error.message,
    });
  }
});

/**
 * GET /api/patterns/deviations
 * Get current pattern deviations
 */
router.get('/deviations', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    
    // First analyze patterns
    const patterns = await analyzeUserPatterns(userId);
    const deviations = await detectPatternDeviations(userId, patterns.patterns);
    
    res.json({
      success: true,
      data: {
        deviations,
        patternCount: {
          daily: patterns.patterns.daily.length,
          weekly: patterns.patterns.weekly.length,
          temporal: patterns.patterns.temporal.length,
        },
        analysisDate: patterns.analysisDate,
      },
    });
  } catch (error) {
    console.error('Pattern deviations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pattern deviations',
      error: error.message,
    });
  }
});

/**
 * GET /api/patterns/strength
 * Get user's overall pattern strength score
 */
router.get('/strength', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const analysis = await analyzeUserPatterns(userId);
    
    // Calculate pattern strength
    const totalPatterns = analysis.patterns.daily.length + 
                         analysis.patterns.weekly.length + 
                         analysis.patterns.temporal.length;
    
    const avgConfidence = analysis.patterns.daily.length > 0 
      ? analysis.patterns.daily.reduce((sum, p) => sum + p.confidence, 0) / analysis.patterns.daily.length
      : 0;
    
    const patternDiversity = Math.min(totalPatterns / 10, 1);
    const overallStrength = Math.round((avgConfidence * 0.7 + patternDiversity * 0.3) * 100);
    
    res.json({
      success: true,
      data: {
        overallStrength,
        totalPatterns,
        avgConfidence: Math.round(avgConfidence * 100),
        patternBreakdown: {
          daily: analysis.patterns.daily.length,
          weekly: analysis.patterns.weekly.length,
          temporal: analysis.patterns.temporal.length,
          category: analysis.patterns.category.length,
        },
        topPatterns: analysis.patterns.daily.slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Pattern strength error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate pattern strength',
      error: error.message,
    });
  }
});

export default router;