import api from './api.service.js';

class PredictionService {
  
  // Get current risk analysis
  async getRiskAnalysis() {
    try {
      const response = await api.get('/predictions/habits/risk-analysis');
      return response || { predictions: [], riskSummary: {}, recentAlerts: [] };
    } catch (error) {
      console.error('Get risk analysis error:', error);
      return { predictions: [], riskSummary: {}, recentAlerts: [] };
    }
  }
  
  // Get stored predictions
  async getPredictions() {
    try {
      const response = await api.get('/predictions/habits/predictions');
      return response?.data?.predictions || [];
    } catch (error) {
      console.error('Get predictions error:', error);
      return [];
    }
  }
  
  // Trigger fresh analysis
  async analyzeHabits() {
    try {
      const response = await api.post('/predictions/habits/analyze');
      return response.data;
    } catch (error) {
      console.error('Analyze habits error:', error);
      throw error;
    }
  }
  
  // Get all alerts
  async getAlerts(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.read !== undefined) params.append('read', filters.read);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      
      const response = await api.get(`/predictions/alerts?${params}`);
      return response?.data?.alerts || [];
    } catch (error) {
      console.error('Get alerts error:', error);
      return [];
    }
  }
  
  // Get habit degradation alerts
  async getHabitAlerts() {
    try {
      const response = await api.get('/predictions/alerts/habit-degradation');
      return response?.data?.alerts || [];
    } catch (error) {
      console.error('Get habit alerts error:', error);
      return [];
    }
  }
  
  // Mark alert as read
  async markAlertAsRead(alertId) {
    try {
      const response = await api.patch(`/predictions/alerts/${alertId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark alert read error:', error);
      throw error;
    }
  }
  
  // Mark all alerts as read
  async markAllAlertsAsRead(type = null) {
    try {
      const response = await api.patch('/predictions/alerts/read-all', { type });
      return response.data;
    } catch (error) {
      console.error('Mark all alerts read error:', error);
      throw error;
    }
  }
  
  // Delete alert
  async deleteAlert(alertId) {
    try {
      const response = await api.delete(`/predictions/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Delete alert error:', error);
      throw error;
    }
  }
  
  // Get alert statistics
  async getAlertStats() {
    try {
      const response = await api.get('/predictions/alerts/stats');
      return response || { total: 0, unread: 0, habitAlerts: 0, recentAlerts: 0 };
    } catch (error) {
      console.error('Get alert stats error:', error);
      return { total: 0, unread: 0, habitAlerts: 0, recentAlerts: 0 };
    }
  }
  
  // Trigger intervention
  async triggerIntervention(alertId) {
    try {
      const response = await api.post(`/predictions/alerts/${alertId}/intervention`);
      return response.data;
    } catch (error) {
      console.error('Trigger intervention error:', error);
      throw error;
    }
  }
  
  // Create custom alert
  async createAlert(alertData) {
    try {
      const response = await api.post('/predictions/alerts', alertData);
      return response.data.alert;
    } catch (error) {
      console.error('Create alert error:', error);
      throw error;
    }
  }
}

export default new PredictionService();