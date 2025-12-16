import api from './api.service.js';

/**
 * Cross-Correlation Analysis Service
 * Handles API calls for multi-domain habit cross-correlation features
 */

class CorrelationsService {
  // Get full correlation analysis
  async analyzeCorrelations() {
    try {
      const response = await api.get('/correlations/analyze');
      return response.data; // Backend wraps in { success: true, data: {...} }
    } catch (error) {
      console.error('Correlation analysis error:', error);
      throw error;
    }
  }

  // Get correlation summary
  async getCorrelationSummary() {
    try {
      const response = await api.get('/correlations/summary');
      return response.data;
    } catch (error) {
      console.error('Correlation summary error:', error);
      throw error;
    }
  }

  // Get correlation insights
  async getCorrelationInsights() {
    try {
      const response = await api.get('/correlations/insights');
      return response.data;
    } catch (error) {
      console.error('Correlation insights error:', error);
      throw error;
    }
  }

  // Get predictive insights
  async getPredictiveInsights() {
    try {
      const response = await api.get('/correlations/predictions');
      return response.data;
    } catch (error) {
      console.error('Predictive insights error:', error);
      throw error;
    }
  }

  // Get correlation matrix for visualization
  async getCorrelationMatrix() {
    try {
      const response = await api.get('/correlations/matrix');
      return response.data;
    } catch (error) {
      console.error('Correlation matrix error:', error);
      throw error;
    }
  }

  // Get correlations for a specific category
  async getCategoryCorrelations(categoryName) {
    try {
      const response = await api.get(`/correlations/category/${encodeURIComponent(categoryName)}`);
      return response.data;
    } catch (error) {
      console.error('Category correlation error:', error);
      throw error;
    }
  }

  // Format correlation coefficient for display
  formatCorrelationCoefficient(coefficient) {
    return (coefficient >= 0 ? '+' : '') + coefficient.toFixed(3);
  }

  // Get correlation strength color
  getCorrelationStrengthColor(coefficient) {
    const abs = Math.abs(coefficient);
    
    if (abs >= 0.8) return 'text-purple-600';
    if (abs >= 0.6) return 'text-blue-600';
    if (abs >= 0.4) return 'text-green-600';
    if (abs >= 0.2) return 'text-yellow-600';
    return 'text-gray-600';
  }

  // Get correlation direction icon
  getCorrelationDirectionIcon(coefficient) {
    return coefficient > 0 ? '↗️' : '↘️';
  }

  // Get correlation strength badge color
  getCorrelationBadgeColor(coefficient) {
    const abs = Math.abs(coefficient);
    
    if (abs >= 0.8) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (abs >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (abs >= 0.4) return 'bg-green-100 text-green-800 border-green-200';
    if (abs >= 0.2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }

  // Format insight type for display
  formatInsightType(type) {
    const typeMap = {
      'strong_positive_correlations': 'Strong Positive',
      'strong_negative_correlations': 'Strong Negative',
      'health_correlations': 'Health & Wellness',
      'productivity_correlations': 'Productivity',
    };
    
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get insight icon
  getInsightIcon(type) {
    const iconMap = {
      'strong_positive_correlations': '📈',
      'strong_negative_correlations': '📉',
      'health_correlations': '🏃‍♂️',
      'productivity_correlations': '💼',
    };
    
    return iconMap[type] || '🔍';
  }

  // Format prediction confidence
  formatPredictionConfidence(confidence) {
    const percentage = Math.round(confidence * 100);
    
    if (percentage >= 80) return { text: 'Very High', color: 'text-green-600' };
    if (percentage >= 60) return { text: 'High', color: 'text-blue-600' };
    if (percentage >= 40) return { text: 'Moderate', color: 'text-yellow-600' };
    return { text: 'Low', color: 'text-gray-600' };
  }

  // Get prediction type icon
  getPredictionTypeIcon(type) {
    const iconMap = {
      'correlation_prediction': '🔮',
    };
    
    return iconMap[type] || '💡';
  }

  // Calculate correlation matrix heatmap color
  getHeatmapColor(coefficient) {
    const abs = Math.abs(coefficient);
    const intensity = Math.round(abs * 255);
    
    if (coefficient > 0) {
      // Positive correlation - blue scale
      return `rgba(59, 130, 246, ${abs})`;
    } else if (coefficient < 0) {
      // Negative correlation - red scale
      return `rgba(239, 68, 68, ${abs})`;
    } else {
      // No correlation - gray
      return 'rgba(156, 163, 175, 0.1)';
    }
  }

  // Format category name for display
  formatCategoryName(categoryName) {
    return categoryName.replace(/([A-Z])/g, ' $1').trim();
  }

  // Get correlation description
  getCorrelationDescription(correlation) {
    const { categoryA, categoryB, coefficient, strength, direction } = correlation;
    const directionText = direction === 'positive' ? 'increases with' : 'decreases with';
    
    return `${this.formatCategoryName(categoryA)} ${directionText} ${this.formatCategoryName(categoryB)} (${strength.toLowerCase()})`;
  }

  // Check if correlation is actionable
  isCorrelationActionable(correlation) {
    return Math.abs(correlation.coefficient) >= 0.4 && correlation.significance.includes('significant');
  }

  // Generate correlation recommendation
  generateCorrelationRecommendation(correlation) {
    const { categoryA, categoryB, coefficient } = correlation;
    
    if (coefficient > 0.5) {
      return `Try to maintain consistent ${categoryA} activity to naturally boost ${categoryB} performance.`;
    } else if (coefficient < -0.5) {
      return `Be mindful that increasing ${categoryA} might reduce ${categoryB} time. Consider balancing both.`;
    } else {
      return `Monitor the relationship between ${categoryA} and ${categoryB} for optimization opportunities.`;
    }
  }

  // Sort correlations by strength
  sortCorrelationsByStrength(correlations) {
    return [...correlations].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
  }

  // Filter correlations by minimum strength
  filterCorrelationsByStrength(correlations, minStrength = 0.3) {
    return correlations.filter(c => Math.abs(c.coefficient) >= minStrength);
  }

  // Group correlations by category
  groupCorrelationsByCategory(correlations) {
    const grouped = {};
    
    correlations.forEach(correlation => {
      const { categoryA, categoryB } = correlation;
      
      if (!grouped[categoryA]) {
        grouped[categoryA] = [];
      }
      if (!grouped[categoryB]) {
        grouped[categoryB] = [];
      }
      
      grouped[categoryA].push({ ...correlation, relatedCategory: categoryB });
      grouped[categoryB].push({ ...correlation, relatedCategory: categoryA });
    });
    
    return grouped;
  }
}

export default new CorrelationsService();