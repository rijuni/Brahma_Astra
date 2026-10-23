import { apiClient } from './api-client.js';

export const aiService = {
  async createTask({ prompt, conversationId = null, taskType = 'general', context = {} }) {
    return apiClient.post('/ai/tasks', { prompt, conversationId, taskType, context });
  },

  async getTask(taskId) {
    return apiClient.get(`/ai/tasks/${taskId}`);
  },

  async cancelTask(taskId) {
    return apiClient.post(`/ai/tasks/${taskId}/cancel`);
  },

  async listTasks() {
    return apiClient.get('/ai/tasks');
  },

  async executeAndPoll({ prompt, conversationId = null, onProgress, maxAttempts = 30, intervalMs = 1000 }) {
    const task = await this.createTask({ prompt, conversationId });
    if (!task?.id) {
      throw new Error('Failed to create AI task');
    }

    let attempts = 0;
    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      attempts++;

      const updated = await this.getTask(task.id);
      if (onProgress) {
        onProgress(updated);
      }

      if (updated.status === 'completed') {
        let resultText = updated.result;
        try {
          const parsed = JSON.parse(updated.result);
          if (parsed && typeof parsed === 'object') {
            resultText = parsed.response || parsed.content || parsed.text || JSON.stringify(parsed, null, 2);
          }
        } catch {
          // Keep raw string if not JSON
        }
        return { ...updated, text: resultText || updated.result || 'No response generated.' };
      }

      if (updated.status === 'failed') {
        throw new Error(updated.error || 'AI task execution failed');
      }

      if (updated.status === 'cancelled') {
        throw new Error('AI task was cancelled');
      }
    }

    throw new Error('AI task execution timed out. Brahma Core may be processing in the background.');
  }
};
