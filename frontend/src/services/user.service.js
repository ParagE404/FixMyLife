const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const userService = {
  async completeOnboarding(selectedCategories, customCategories, goals, token) {
    const response = await fetch(`${API_URL}/users/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ selectedCategories, customCategories, goals }),
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

  async getUserFocusAreas(token) {
    const response = await fetch(`${API_URL}/users/focus-areas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch focus areas');
    }

    return response.json();
  },

  async updateFocusAreas(selectedCategories, customCategories, token) {
    const response = await fetch(`${API_URL}/users/focus-areas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ selectedCategories, customCategories }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update focus areas');
    }

    return response.json();
  },

  async createCustomCategory(name, token) {
    const response = await fetch(`${API_URL}/users/custom-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create custom category');
    }

    return response.json();
  },

  async deleteCustomCategory(categoryId, token) {
    const response = await fetch(`${API_URL}/users/custom-categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete custom category');
    }

    return response.json();
  },

  async exportUserData(token) {
    const response = await fetch(`${API_URL}/users/export-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to export user data');
    }

    return response.json();
  },

  async clearUserData(token) {
    const response = await fetch(`${API_URL}/users/clear-data`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to clear user data');
    }

    return response.json();
  },

  async deleteAccount(token) {
    const response = await fetch(`${API_URL}/users/delete-account`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete account');
    }

    return response.json();
  },
};