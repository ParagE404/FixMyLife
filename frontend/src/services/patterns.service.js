import api from './api.service.js';

/**
 * Pattern Recognition Service
 * Handles API calls for behavioral pattern recognition features
 */

class PatternsService {
  // Get pattern analysis for current user
  async analyzePatterns() {
    try {
      const response = await api.get('/patterns/analyze');
      return response.data; // Backend wraps in { success: true, data: {...} }
    } catch (error) {
      console.error('Pattern analysis error:', error);
      throw error;
    }
  }

  // Get pattern insights for dashboard
  async getPatternInsights() {
    try {
      const response = await api.get('/patterns/insights');
      return response.data; // Backend wraps in { success: true, data: {...} }
    } catch (error) {
      console.error('Pattern insights error:', error);
      throw error;
    }
  }

  // Get proactive suggestions
  async getPatternSuggestions() {
    try {
      const response = await api.get('/patterns/suggestions');
      console.log('Raw API response:', response);
      if (!response || !response.data) {
        throw new Error('Invalid response structure from API');
      }
      return response.data; // Backend wraps in { success: true, data: {...} }
    } catch (error) {
      console.error('Pattern suggestions error:', error);
      throw error;
    }
  }

  // Mark suggestion as acted upon
  async actOnSuggestion(suggestionId) {
    try {
      const response = await api.post(`/patterns/suggestions/${suggestionId}/act`);
      console.log('Act on suggestion API response:', response);
      return response; // API service already returns the parsed JSON
    } catch (error) {
      console.error('Act on suggestion error:', error);
      throw error;
    }
  }

  // Dismiss a suggestion
  async dismissSuggestion(suggestionId) {
    try {
      const response = await api.post(`/patterns/suggestions/${suggestionId}/dismiss`);
      return response; // Direct response for action endpoints
    } catch (error) {
      console.error('Dismiss suggestion error:', error);
      throw error;
    }
  }

  // Get current pattern deviations
  async getPatternDeviations() {
    try {
      const response = await api.get('/patterns/deviations');
      return response.data; // Backend wraps in { success: true, data: {...} }
    } catch (error) {
      console.error('Pattern deviations error:', error);
      throw error;
    }
  }

  // Get pattern strength score
  async getPatternStrength() {
    try {
      const response = await api.get('/patterns/strength');
      return response.data; // Backend wraps in { success: true, data: {...} }
    } catch (error) {
      console.error('Pattern strength error:', error);
      throw error;
    }
  }

  // Format pattern data for display
  formatPatternTime(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  // Get pattern confidence level text
  getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'Very Strong';
    if (confidence >= 0.6) return 'Strong';
    if (confidence >= 0.4) return 'Moderate';
    if (confidence >= 0.2) return 'Weak';
    return 'Very Weak';
  }

  // Get pattern confidence color
  getConfidenceColor(confidence) {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-blue-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    if (confidence >= 0.2) return 'text-orange-600';
    return 'text-red-600';
  }

  // Get suggestion priority color
  getSuggestionPriorityColor(priority) {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  }

  // Get suggestion type icon
  getSuggestionTypeIcon(type) {
    switch (type) {
      case 'habit_resumption':
        return '🔄';
      case 'upcoming_habit':
        return '⏰';
      case 'sequence_suggestion':
        return '🔗';
      case 'weekly_habit':
        return '📅';
      default:
        return '💡';
    }
  }

  // Format day name
  formatDayName(dayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  }

  // Calculate pattern consistency percentage
  calculateConsistency(occurrences, totalDays) {
    return Math.round((occurrences / totalDays) * 100);
  }

  // Group patterns by category
  groupPatternsByCategory(patterns) {
    const grouped = {};
    
    patterns.forEach(pattern => {
      if (!grouped[pattern.category]) {
        grouped[pattern.category] = [];
      }
      grouped[pattern.category].push(pattern);
    });

    return grouped;
  }

  // Get pattern strength description
  getPatternStrengthDescription(strength) {
    if (strength >= 80) return 'Excellent - You have very consistent habits!';
    if (strength >= 60) return 'Good - Your habits are fairly consistent.';
    if (strength >= 40) return 'Fair - Some patterns are emerging.';
    if (strength >= 20) return 'Developing - Keep building your habits.';
    return 'Just Starting - More data needed to detect patterns.';
  }

  // Check if suggestion is urgent
  isSuggestionUrgent(suggestion) {
    return suggestion.priority === 'high' && suggestion.timing === 'immediate';
  }

  // Format suggestion timing
  formatSuggestionTiming(timing) {
    switch (timing) {
      case 'immediate':
        return 'Right now';
      case 'upcoming':
        return 'Soon';
      case 'sequence':
        return 'Next activity';
      case 'weekly':
        return 'This week';
      default:
        return 'Later';
    }
  }
}

export default new PatternsService();