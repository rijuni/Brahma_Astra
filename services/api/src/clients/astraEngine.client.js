const env = require('../config/env');
const logger = require('../observability/logger');

class AstraEngineClient {
  constructor() {
    this.baseUrl = env.ASTRA_ENGINE_URL;
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
      logger.warn('ASTRA Engine health check failed', { error: err.message });
      return false;
    }
  }

  async planTask({ taskId, workspaceId, instruction }) {
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
          workspace_id: workspaceId,
          instruction
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ASTRA Engine responded with ${res.status}: ${errorText}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      logger.error('ASTRA Engine client request failed', err, { taskId });
      throw err;
    }
  }

  async executeApprovedTask(taskId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': this.serviceKey
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ASTRA Engine execution responded with ${res.status}: ${errorText}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      logger.error('ASTRA Engine execute task failed', err, { taskId });
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
      logger.error('ASTRA Engine task cancellation failed', err, { taskId });
      return false;
    }
  }
}

module.exports = new AstraEngineClient();
