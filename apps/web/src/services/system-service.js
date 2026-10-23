import { apiClient } from './api-client.js';

export const systemService = {
  async getLiveHealth() {
    return apiClient.get('/health/live');
  },

  async getReadyHealth() {
    return apiClient.get('/health/ready');
  },

  async getAuditEvents() {
    return apiClient.get('/audit');
  }
};
