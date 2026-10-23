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
    const payload = { title: title || 'New Conversation' };
    if (projectId) {
      payload.projectId = projectId;
    }
    return apiClient.post('/conversations', payload);
  },

  async addMessage(conversationId, content, role = 'user') {
    let textContent = content;
    if (typeof content === 'object' && content !== null) {
      textContent = content.response || content.content || content.text || content.summary || JSON.stringify(content);
    } else if (typeof content !== 'string') {
      textContent = String(content ?? '');
    }
    return apiClient.post(`/conversations/${conversationId}/messages`, { content: textContent, role });
  }
};
