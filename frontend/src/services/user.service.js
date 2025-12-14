const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const userService = {
  async completeOnboarding(selectedCategories, goals, token) {
    const response = await fetch(`${API_URL}/users/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ selectedCategories, goals }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to complete onboarding');
    }

    return response.json();
  },

  async getCategories() {
    const response = await fetch(`${API_URL}/users/categories`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch categories');
    }

    return response.json();
  },

  async getUserProfile(token) {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch user profile');
    }

    return response.json();
  },

  async updateUserProfile(profileData, token) {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update profile');
    }

    return response.json();
  },

  async getUserPreferences(token) {
    const response = await fetch(`${API_URL}/users/me/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch preferences');
    }

    return response.json();
  },

  async updateUserPreferences(preferences, token) {
    const response = await fetch(`${API_URL}/users/me/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update preferences');
    }

    return response.json();
  },

  async changePassword(currentPassword, newPassword, token) {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to change password');
    }

    return response.json();
  },
};