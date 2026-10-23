import { apiClient } from './api-client.js';

export const authService = {
  async register({ email, password, name }) {
    const result = await apiClient.post('/auth/register', { email, password, name });
    if (result?.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },

  async login({ email, password }) {
    const result = await apiClient.post('/auth/login', { email, password });
    if (result?.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network failures on logout
    } finally {
      apiClient.setToken(null);
    }
  },

  async me() {
    const result = await apiClient.get('/auth/me');
    return result?.user || result;
  }
};
