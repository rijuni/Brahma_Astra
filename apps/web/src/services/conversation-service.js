import { apiClient } from './api-client.js';

export const conversationService = {
  async list(projectId = null) {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return apiClient.get(`/conversations${query}`);
  },

  async get(conversationId) {
    return apiClient.get(`/conversations/${conversationId}`);
  },

  async create(title, projectId = null) {
    return apiClient.post('/conversations', { title, projectId });
  },

  async addMessage(conversationId, content, role = 'user') {
    return apiClient.post(`/conversations/${conversationId}/messages`, { content, role });
  }
};
