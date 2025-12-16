import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  analyzeCrossCorrelations,
  detectCrossCorrelations,
  generateCorrelationInsights,
  generatePredictiveInsights,
  getCorrelationSummary,
  storeCorrelationAnalysis,
} from '../services/cross-correlation.service.js';

const router = express.Router();

/**
 * GET /api/correlations/analyze
 * Analyze cross-correlations between activity categories
 */
router.get('/analyze', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const analysis = await analyzeCrossCorrelations(userId);
    
    // Store the analysis results
    await storeCorrelationAnalysis(userId, analysis);
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Correlation analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze correlations',
      error: error.message,
    });
  }
});

/**
 * GET /api/correlations/summary
 * Get correlation analysis summary
 */
router.get('/summary', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const summary = await getCorrelationSummary(userId);
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Correlation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get correlation summary',
      error: error.message,
    });
  }
});

/**
 * GET /api/correlations/insights
 * Get correlation insights
 */
router.get('/insights', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const correlations = await detectCrossCorrelations(userId);
    const insights = await generateCorrelationInsights(correlations);
    
    res.json({
      success: true,
      data: {
        insights,
        correlationCount: correlations.length,
      },
    });
  } catch (error) {
    console.error('Correlation insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get correlation insights',
      error: error.message,
    });
  }
});

/**
 * GET /api/correlations/predictions
 * Get predictive insights based on correlations
 */
router.get('/predictions', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const correlations = await detectCrossCorrelations(userId);
    const predictions = await generatePredictiveInsights(userId, correlations);
    
    res.json({
      success: true,
      data: {
        predictions,
        basedOnCorrelations: correlations.length,
      },
    });
  } catch (error) {
    console.error('Correlation predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get correlation predictions',
      error: error.message,
    });
  }
});

/**
 * GET /api/correlations/matrix
 * Get correlation matrix for visualization
 */
router.get('/matrix', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const correlations = await detectCrossCorrelations(userId);
    
    // Build correlation matrix for visualization
    const categories = [...new Set([
      ...correlations.map(c => c.categoryA),
      ...correlations.map(c => c.categoryB),
    ])];
    
    const matrix = {};
    categories.forEach(catA => {
      matrix[catA] = {};
      categories.forEach(catB => {
        if (catA === catB) {
          matrix[catA][catB] = 1.0; // Perfect correlation with self
        } else {
          const correlation = correlations.find(c => 
            (c.categoryA === catA && c.categoryB === catB) ||
            (c.categoryA === catB && c.categoryB === catA)
          );
          matrix[catA][catB] = correlation ? correlation.coefficient : 0;
        }
      });
    });
    
    res.json({
      success: true,
      data: {
        matrix,
        categories,
        correlations: correlations.length,
      },
    });
  } catch (error) {
    console.error('Correlation matrix error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get correlation matrix',
      error: error.message,
    });
  }
});

/**
 * GET /api/correlations/category/:categoryName
 * Get correlations for a specific category
 */
router.get('/category/:categoryName', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryName } = req.params;
    
    const allCorrelations = await detectCrossCorrelations(userId);
    const categoryCorrelations = allCorrelations.filter(c => 
      c.categoryA === categoryName || c.categoryB === categoryName
    );
    
    res.json({
      success: true,
      data: {
        category: categoryName,
        correlations: categoryCorrelations,
        totalFound: categoryCorrelations.length,
      },
    });
  } catch (error) {
    console.error('Category correlation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category correlations',
      error: error.message,
    });
  }
});

export default router;