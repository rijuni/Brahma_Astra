import { apiClient } from './api-client.js';

export const projectService = {
  async list() {
    return apiClient.get('/projects');
  },

  async get(projectId) {
    return apiClient.get(`/projects/${projectId}`);
  },

  async create({ name, description }) {
    return apiClient.post('/projects', { name, description });
  },

  async update(projectId, { name, description }) {
    return apiClient.patch(`/projects/${projectId}`, { name, description });
  },

  async delete(projectId) {
    return apiClient.delete(`/projects/${projectId}`);
  }
};
