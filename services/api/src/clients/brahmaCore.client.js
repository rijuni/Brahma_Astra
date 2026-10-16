const env = require('../config/env');
const logger = require('../observability/logger');

class BrahmaCoreClient {
  constructor() {
    this.baseUrl = env.BRAHMA_CORE_URL;
    this.serviceKey = env.INTERNAL_SERVICE_KEY;
    this.timeoutMs = 15000;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/health/live`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch (err) {
      logger.warn('BRAHMA Core health check failed', { error: err.message });
      return false;
    }
  }

  async executeTask({ taskId, prompt, taskType = 'general', context = {} }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': this.serviceKey
        },
        body: JSON.stringify({
          task_id: taskId,
          prompt,
          task_type: taskType,
          context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Brahma Core responded with ${res.status}: ${errorText}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      logger.error('Brahma Core client request failed', err, { taskId });
      throw err;
    }
  }

  async cancelTask(taskId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tasks/${taskId}/cancel`, {
        method: 'POST',
        headers: {
          'X-Internal-Service-Key': this.serviceKey
        }
      });
      return res.ok;
    } catch (err) {
      logger.error('Brahma Core task cancellation failed', err, { taskId });
      return false;
    }
  }
}

module.exports = new BrahmaCoreClient();
