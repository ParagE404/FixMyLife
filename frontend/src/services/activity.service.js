const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const activityService = {
  // Transcribe audio to text using Whisper
  transcribeAudio: async (audioBlob, token) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(`${API_URL}/activities/transcribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to transcribe audio');
    }

    return response.json();
  },

  // Parse and create activities from text
  parseActivities: async (input, token) => {
    const response = await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse activities');
    }

    return response.json();
  },

  // Get all activities with filters
  getActivities: async (filters = {}, token) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(
      `${API_URL}/activities?${params.toString()}`,
      {
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // Get activity suggestions
  getSuggestions: async (query, token) => {
    const response = await fetch(
      `${API_URL}/activities/suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) return [];
    return response.json();
  },

  // Update activity
  updateActivity: async (id, updates, token) => {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update activity');
    return response.json();
  },

  // Delete activity
  deleteActivity: async (id, token) => {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to delete activity');
    return response.json();
  },
};
