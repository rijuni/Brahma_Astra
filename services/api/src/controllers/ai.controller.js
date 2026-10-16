const aiService = require('../services/ai.service');

class AiController {
  async createTask(req, res, next) {
    try {
      const { prompt, conversationId, taskType, context } = req.body;
      const task = await aiService.createTask(req.user.id, {
        prompt,
        conversationId,
        taskType,
        context
      });
      res.status(202).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  async getTask(req, res, next) {
    try {
      const task = await aiService.getTask(req.params.taskId, req.user.id);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelTask(req, res, next) {
    try {
      const task = await aiService.cancelTask(req.params.taskId, req.user.id);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  async listTasks(req, res, next) {
    try {
      const tasks = await aiService.listTasks(req.user.id);
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AiController();
