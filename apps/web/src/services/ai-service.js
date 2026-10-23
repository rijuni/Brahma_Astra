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
        let resultText = '';
        if (typeof updated.result === 'object' && updated.result !== null) {
          resultText = updated.result.response || updated.result.content || updated.result.text || updated.result.summary || JSON.stringify(updated.result, null, 2);
        } else if (typeof updated.result === 'string') {
          try {
            const parsed = JSON.parse(updated.result);
            if (parsed && typeof parsed === 'object') {
              resultText = parsed.response || parsed.content || parsed.text || parsed.summary || JSON.stringify(parsed, null, 2);
            } else {
              resultText = updated.result;
            }
          } catch {
            resultText = updated.result;
          }
        } else {
          resultText = String(updated.result ?? 'No response generated.');
        }

        if (typeof resultText !== 'string') {
          resultText = typeof resultText === 'object' ? JSON.stringify(resultText, null, 2) : String(resultText);
        }

        return { ...updated, text: resultText || 'No response generated.' };
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
