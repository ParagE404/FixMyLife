const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const analyticsService = {
  // Get weekly summary
  getWeeklySummary: async (token) => {
    const response = await fetch(`${API_URL}/analytics/weekly`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch weekly summary');
    return response.json();
  },

  // Get category breakdown
  getCategoryBreakdown: async (days = 7, token) => {
    const response = await fetch(
      `${API_URL}/analytics/categories?days=${days}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Get 4-week trends
  getFourWeekTrends: async (token) => {
    const response = await fetch(`${API_URL}/analytics/trends`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch trends');
    return response.json();
  },

  // Get calendar heatmap
  getCalendarHeatmap: async (token) => {
    const response = await fetch(`${API_URL}/analytics/calendar`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch calendar');
    return response.json();
  },

  // Get activity history
  getActivityHistory: async (filters = {}, token) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(
      `${API_URL}/analytics/history?${params.toString()}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // Get habit strength
  getHabitStrength: async (token) => {
    const response = await fetch(`${API_URL}/analytics/habit-strength`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch habit strength');
    return response.json();
  },

  // Get daily stats
  getDailyStats: async (date, token) => {
    const response = await fetch(`${API_URL}/analytics/daily/${date}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch daily stats');
    return response.json();
  },
};
