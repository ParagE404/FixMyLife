import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Constants for correlation analysis
const CORRELATION_ANALYSIS_DAYS = 60; // Analyze last 60 days for correlations
const MIN_DATA_POINTS = 10; // Minimum data points to establish correlation
const CORRELATION_THRESHOLD = 0.3; // Minimum correlation coefficient to consider significant
const TIME_WINDOW_HOURS = 24; // Time window for correlation analysis (24 hours)

/**
 * Multi-Domain Habit Cross-Correlation Service
 * Identifies hidden behavioral relationships between different activity categories
 */

// Main function to analyze cross-correlations
export const analyzeCrossCorrelations = async (userId) => {
  try {
    const correlations = await detectCrossCorrelations(userId);
    const insights = await generateCorrelationInsights(correlations);
    const predictions = await generatePredictiveInsights(userId, correlations);
    
    return {
      correlations,
      insights,
      predictions,
      analysisDate: new Date(),
      dataPoints: correlations.reduce((sum, c) => sum + c.dataPoints, 0),
    };
  } catch (error) {
    console.error('Cross-correlation analysis error:', error);
    throw error;
  }
};

// Detect cross-correlations between different activity categories
export const detectCrossCorrelations = async (userId) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - CORRELATION_ANALYSIS_DAYS);

    // Get activities for correlation analysis
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        customCategory: true,
      },
      orderBy: { startTime: 'asc' },
    });

    if (activities.length < MIN_DATA_POINTS) {
      return [];
    }

    // Group activities by day and category
    const dailyActivities = groupActivitiesByDay(activities);
    
    // Get unique categories
    const categories = getUniqueCategories(activities);
    
    // Calculate correlations between all category pairs
    const correlations = [];
    
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const categoryA = categories[i];
        const categoryB = categories[j];
        
        const correlation = await calculateCategoryCorrelation(
          dailyActivities, 
          categoryA, 
          categoryB
        );
        
        if (correlation && Math.abs(correlation.coefficient) >= CORRELATION_THRESHOLD) {
          correlations.push(correlation);
        }
      }
    }

    // Sort by correlation strength
    return correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
    
  } catch (error) {
    console.error('Cross-correlation detection error:', error);
    throw error;
  }
};

// Group activities by day and category
const groupActivitiesByDay = (activities) => {
  const dailyData = {};
  
  activities.forEach(activity => {
    const dayKey = activity.startTime.toISOString().split('T')[0];
    const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {};
    }
    
    if (!dailyData[dayKey][categoryName]) {
      dailyData[dayKey][categoryName] = {
        count: 0,
        totalDuration: 0,
        activities: [],
      };
    }
    
    dailyData[dayKey][categoryName].count++;
    dailyData[dayKey][categoryName].totalDuration += activity.duration || 0;
    dailyData[dayKey][categoryName].activities.push(activity);
  });
  
  return dailyData;
};

// Get unique categories from activities
const getUniqueCategories = (activities) => {
  const categories = new Set();
  
  activities.forEach(activity => {
    const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
    categories.add(categoryName);
  });
  
  return Array.from(categories);
};

// Calculate correlation between two categories
const calculateCategoryCorrelation = async (dailyActivities, categoryA, categoryB) => {
  const days = Object.keys(dailyActivities);
  
  if (days.length < MIN_DATA_POINTS) {
    return null;
  }
  
  // Extract data points for both categories
  const dataA = [];
  const dataB = [];
  
  days.forEach(day => {
    const dayData = dailyActivities[day];
    
    // Get metrics for category A (duration in hours)
    const valueA = dayData[categoryA] ? dayData[categoryA].totalDuration / 60 : 0;
    
    // Get metrics for category B (duration in hours)
    const valueB = dayData[categoryB] ? dayData[categoryB].totalDuration / 60 : 0;
    
    dataA.push(valueA);
    dataB.push(valueB);
  });
  
  // Calculate Pearson correlation coefficient
  const correlation = calculatePearsonCorrelation(dataA, dataB);
  
  if (isNaN(correlation) || Math.abs(correlation) < CORRELATION_THRESHOLD) {
    return null;
  }
  
  // Calculate additional statistics
  const avgA = dataA.reduce((sum, val) => sum + val, 0) / dataA.length;
  const avgB = dataB.reduce((sum, val) => sum + val, 0) / dataB.length;
  
  return {
    categoryA,
    categoryB,
    coefficient: correlation,
    strength: getCorrelationStrength(correlation),
    direction: correlation > 0 ? 'positive' : 'negative',
    dataPoints: days.length,
    averageA: avgA,
    averageB: avgB,
    significance: calculateSignificance(correlation, days.length),
    relationship: describeRelationship(categoryA, categoryB, correlation),
  };
};

// Calculate Pearson correlation coefficient
const calculatePearsonCorrelation = (x, y) => {
  const n = x.length;
  
  if (n === 0) return 0;
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
};

// Get correlation strength description
const getCorrelationStrength = (coefficient) => {
  const abs = Math.abs(coefficient);
  
  if (abs >= 0.8) return 'Very Strong';
  if (abs >= 0.6) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'Very Weak';
};

// Calculate statistical significance
const calculateSignificance = (correlation, n) => {
  if (n < 3) return 'Insufficient data';
  
  // Simple t-test approximation
  const t = Math.abs(correlation) * Math.sqrt((n - 2) / (1 - correlation * correlation));
  
  // Critical values for different significance levels (approximation)
  if (t > 2.576) return 'Highly significant (p < 0.01)';
  if (t > 1.96) return 'Significant (p < 0.05)';
  if (t > 1.645) return 'Marginally significant (p < 0.10)';
  return 'Not significant';
};

// Describe the relationship between categories
const describeRelationship = (categoryA, categoryB, coefficient) => {
  const direction = coefficient > 0 ? 'increases' : 'decreases';
  const strength = getCorrelationStrength(coefficient).toLowerCase();
  
  return `${strength} ${coefficient > 0 ? 'positive' : 'negative'} relationship: when ${categoryA} activity ${direction}, ${categoryB} activity tends to ${direction} as well`;
};

// Generate correlation insights
export const generateCorrelationInsights = async (correlations) => {
  const insights = [];
  
  // Strongest positive correlations
  const strongPositive = correlations
    .filter(c => c.direction === 'positive' && Math.abs(c.coefficient) >= 0.5)
    .slice(0, 3);
    
  if (strongPositive.length > 0) {
    insights.push({
      type: 'strong_positive_correlations',
      title: 'Strong Positive Correlations',
      description: 'Activities that tend to increase together',
      correlations: strongPositive,
      actionable: true,
    });
  }
  
  // Strongest negative correlations
  const strongNegative = correlations
    .filter(c => c.direction === 'negative' && Math.abs(c.coefficient) >= 0.5)
    .slice(0, 3);
    
  if (strongNegative.length > 0) {
    insights.push({
      type: 'strong_negative_correlations',
      title: 'Strong Negative Correlations',
      description: 'Activities that tend to compete with each other',
      correlations: strongNegative,
      actionable: true,
    });
  }
  
  // Health-related correlations
  const healthCorrelations = correlations.filter(c => 
    isHealthCategory(c.categoryA) || isHealthCategory(c.categoryB)
  );
  
  if (healthCorrelations.length > 0) {
    insights.push({
      type: 'health_correlations',
      title: 'Health & Wellness Connections',
      description: 'How health activities relate to other behaviors',
      correlations: healthCorrelations.slice(0, 3),
      actionable: true,
    });
  }
  
  // Productivity correlations
  const productivityCorrelations = correlations.filter(c => 
    isProductivityCategory(c.categoryA) || isProductivityCategory(c.categoryB)
  );
  
  if (productivityCorrelations.length > 0) {
    insights.push({
      type: 'productivity_correlations',
      title: 'Productivity Patterns',
      description: 'How work and study activities connect to other habits',
      correlations: productivityCorrelations.slice(0, 3),
      actionable: true,
    });
  }
  
  return insights;
};

// Generate predictive insights based on correlations
export const generatePredictiveInsights = async (userId, correlations) => {
  try {
    const predictions = [];
    
    // Get recent activity (last 7 days) to make predictions
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: recentDate,
        },
      },
      include: {
        category: true,
        customCategory: true,
      },
    });
    
    const recentCategoryTotals = {};
    recentActivities.forEach(activity => {
      const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
      if (!recentCategoryTotals[categoryName]) {
        recentCategoryTotals[categoryName] = 0;
      }
      recentCategoryTotals[categoryName] += activity.duration || 0;
    });
    
    // Generate predictions based on strong correlations
    correlations
      .filter(c => Math.abs(c.coefficient) >= 0.5)
      .slice(0, 5)
      .forEach(correlation => {
        const { categoryA, categoryB, coefficient, direction } = correlation;
        
        const recentA = (recentCategoryTotals[categoryA] || 0) / 60; // hours
        const recentB = (recentCategoryTotals[categoryB] || 0) / 60; // hours
        
        // Generate prediction based on correlation
        if (recentA > correlation.averageA * 1.2) {
          // Category A is above average, predict Category B
          const predictedB = correlation.averageB + (coefficient * (recentA - correlation.averageA));
          
          predictions.push({
            type: 'correlation_prediction',
            trigger: categoryA,
            predicted: categoryB,
            confidence: Math.abs(coefficient),
            direction,
            message: generatePredictionMessage(categoryA, categoryB, coefficient, recentA, predictedB),
            recommendation: generateRecommendation(categoryA, categoryB, coefficient),
          });
        }
      });
    
    return predictions.slice(0, 3); // Return top 3 predictions
    
  } catch (error) {
    console.error('Predictive insights error:', error);
    return [];
  }
};

// Helper functions
const isHealthCategory = (category) => {
  const healthKeywords = ['health', 'exercise', 'fitness', 'sleep', 'nutrition', 'wellness', 'physical'];
  return healthKeywords.some(keyword => 
    category.toLowerCase().includes(keyword)
  );
};

const isProductivityCategory = (category) => {
  const productivityKeywords = ['work', 'study', 'learning', 'career', 'education', 'productivity'];
  return productivityKeywords.some(keyword => 
    category.toLowerCase().includes(keyword)
  );
};

const generatePredictionMessage = (categoryA, categoryB, coefficient, recentA, predictedB) => {
  const direction = coefficient > 0 ? 'increase' : 'decrease';
  const strength = getCorrelationStrength(coefficient).toLowerCase();
  
  return `Based on your recent ${categoryA} activity (${recentA.toFixed(1)}h), you're likely to ${direction} ${categoryB} activity. This ${strength} correlation suggests ${predictedB.toFixed(1)}h of ${categoryB} this week.`;
};

const generateRecommendation = (categoryA, categoryB, coefficient) => {
  if (coefficient > 0) {
    return `Consider maintaining your ${categoryA} routine to naturally boost ${categoryB} activity.`;
  } else {
    return `Be mindful that increased ${categoryA} might reduce ${categoryB} time. Plan accordingly.`;
  }
};

// Get correlation summary for a user
export const getCorrelationSummary = async (userId) => {
  try {
    const analysis = await analyzeCrossCorrelations(userId);
    
    return {
      totalCorrelations: analysis.correlations.length,
      strongCorrelations: analysis.correlations.filter(c => Math.abs(c.coefficient) >= 0.5).length,
      topCorrelation: analysis.correlations[0] || null,
      insights: analysis.insights.length,
      predictions: analysis.predictions.length,
      dataPoints: analysis.dataPoints,
      lastAnalyzed: analysis.analysisDate,
    };
  } catch (error) {
    console.error('Correlation summary error:', error);
    throw error;
  }
};

// Store correlation analysis results
export const storeCorrelationAnalysis = async (userId, analysis) => {
  try {
    // Store in a new table for correlation results
    await prisma.correlationAnalysis.upsert({
      where: { userId },
      update: {
        correlations: analysis.correlations,
        insights: analysis.insights,
        predictions: analysis.predictions,
        dataPoints: analysis.dataPoints,
        lastAnalyzed: analysis.analysisDate,
      },
      create: {
        userId,
        correlations: analysis.correlations,
        insights: analysis.insights,
        predictions: analysis.predictions,
        dataPoints: analysis.dataPoints,
        lastAnalyzed: analysis.analysisDate,
      },
    });
  } catch (error) {
    // If table doesn't exist, we'll create it in the schema update
    console.log('Correlation storage not available yet - will be created in schema update');
  }
};