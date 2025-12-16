const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Get token from auth store
const getToken = () => {
  const authStore = JSON.parse(localStorage.getItem('auth-store') || '{}');
  return authStore?.state?.token || authStore?.token;
};

class ApiService {
  async get(endpoint) {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }

  async post(endpoint, data = null) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : null,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async put(endpoint, data) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async patch(endpoint, data = null) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : null,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async delete(endpoint) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}

export default new ApiService();