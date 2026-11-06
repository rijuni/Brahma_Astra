// Centralized EDITH Client Service communicating with Node.js API (:3000)
import { apiClient } from '../api-client';

export const edithService = {
  // Create an EDITH workspace attached to a project
  async createWorkspace(projectId, name) {
    return apiClient.post('/edith/workspaces', { projectId, name });
  },

  // Get EDITH workspace details
  async getWorkspace(workspaceId) {
    return apiClient.get(`/edith/workspaces/${workspaceId}`);
  },

  // Create an AI coding task (plans code changes via EDITH Engine :8002)
  async createCodingTask(workspaceId, instruction, title = 'Coding Task') {
    return apiClient.post('/edith/tasks', { workspaceId, instruction, title });
  },

  // Poll coding task details and patch proposal
  async getCodingTask(taskId) {
    try {
      return await apiClient.get(`/edith/tasks/${taskId}`);
    } catch (err) {
      return null;
    }
  },

  // Approve and apply proposed patch
  async approveCodingTask(taskId) {
    return apiClient.post(`/edith/tasks/${taskId}/approve`, {});
  },

  // Cancel coding task
  async cancelCodingTask(taskId) {
    return apiClient.post(`/edith/tasks/${taskId}/cancel`, {});
  }
};

export const astraService = edithService;
