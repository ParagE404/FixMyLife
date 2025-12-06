const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const goalsService = {
  // Create goal
  createGoal: async (goalData, token) => {
    const response = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  // Get all goals
  getGoals: async (status = 'active', token) => {
    const response = await fetch(`${API_URL}/goals?status=${status}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  // Update goal
  updateGoal: async (goalId, updates, token) => {
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },

  // Complete goal
  completeGoal: async (goalId, token) => {
    const response = await fetch(`${API_URL}/goals/${goalId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to complete goal');
    return response.json();
  },

  // Log progress
  logProgress: async (goalId, hoursLogged, token) => {
    const response = await fetch(`${API_URL}/goals/${goalId}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ hoursLogged }),
    });
    if (!response.ok) throw new Error('Failed to log progress');
    return response.json();
  },

  // Delete goal
  deleteGoal: async (goalId, token) => {
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete goal');
    return response.json();
  },

  // Get recommendations
  getRecommendations: async (token) => {
    const response = await fetch(`${API_URL}/goals/insights/recommendations`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  // Get insights
  getInsights: async (token) => {
    const response = await fetch(`${API_URL}/goals/insights/list`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch insights');
    return response.json();
  },

  // Mark insight as read
  markInsightAsRead: async (insightId, token) => {
    const response = await fetch(`${API_URL}/goals/insights/${insightId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to mark insight as read');
    return response.json();
  },
};
