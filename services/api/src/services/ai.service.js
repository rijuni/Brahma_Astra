const prisma = require('../repositories/prisma');
const brahmaCoreClient = require('../clients/brahmaCore.client');
const { AppError } = require('../middleware/errorHandler');
const auditService = require('./audit.service');

class AiService {
  async createTask(userId, { prompt, conversationId = null, taskType = 'general', context = {} }) {
    if (conversationId) {
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
      if (!conv || conv.userId !== userId) {
        throw new AppError('Conversation not found or access denied', 404, 'NOT_FOUND');
      }
    }

    const task = await prisma.aiTask.create({
      data: {
        userId,
        conversationId,
        prompt,
        taskType,
        status: 'pending',
        provider: 'mock'
      }
    });

    await auditService.record({
      userId,
      action: 'AI_TASK_CREATED',
      resourceType: 'AiTask',
      resourceId: task.id,
      details: { taskType }
    });

    // Asynchronously or background dispatch to Brahma Core
    this.dispatchToBrahmaCore(task.id, prompt, taskType, context);

    return task;
  }

  async dispatchToBrahmaCore(taskId, prompt, taskType, context) {
    try {
      await prisma.aiTask.update({
        where: { id: taskId },
        data: { status: 'running' }
      });

      const response = await brahmaCoreClient.executeTask({
        taskId,
        prompt,
        taskType,
        context
      });

      await prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          result: JSON.stringify(response.result || response),
          provider: response.provider || 'mock',
          completedAt: new Date()
        }
      });
    } catch (err) {
      // In case Brahma Core is offline or errors
      await prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          error: err.message || 'AI execution failed',
          completedAt: new Date()
        }
      }).catch(() => {});
    }
  }

  async getTask(taskId, userId) {
    const task = await prisma.aiTask.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new AppError('AI Task not found', 404, 'NOT_FOUND');
    }

    if (task.userId !== userId) {
      throw new AppError('Forbidden: Access to this AI task is denied', 403, 'FORBIDDEN');
    }

    return {
      ...task,
      result: task.result ? JSON.parse(task.result) : null
    };
  }

  async cancelTask(taskId, userId) {
    const task = await this.getTask(taskId, userId);

    if (['completed', 'cancelled', 'failed'].includes(task.status)) {
      throw new AppError(`Cannot cancel task in state ${task.status}`, 409, 'CONFLICT');
    }

    await brahmaCoreClient.cancelTask(taskId);

    const updated = await prisma.aiTask.update({
      where: { id: taskId },
      data: {
        status: 'cancelled',
        completedAt: new Date()
      }
    });

    await auditService.record({
      userId,
      action: 'AI_TASK_CANCELLED',
      resourceType: 'AiTask',
      resourceId: taskId
    });

    return updated;
  }

  async listTasks(userId) {
    const tasks = await prisma.aiTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return tasks.map(t => ({
      ...t,
      result: t.result ? JSON.parse(t.result) : null
    }));
  }
}

module.exports = new AiService();
