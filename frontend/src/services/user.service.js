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
};