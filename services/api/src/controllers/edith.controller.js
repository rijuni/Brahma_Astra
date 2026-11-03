const edithService = require('../services/edith.service');

class EdithController {
  async createWorkspace(req, res, next) {
    try {
      const { projectId, name, repositoryUrl } = req.body;
      const workspace = await edithService.createWorkspace(req.user.id, {
        projectId,
        name,
        repositoryUrl
      });
      res.status(201).json({
        success: true,
        data: workspace
      });
    } catch (err) {
      next(err);
    }
  }

  async getWorkspace(req, res, next) {
    try {
      const workspace = await edithService.getWorkspace(req.params.workspaceId, req.user.id);
      res.status(200).json({
        success: true,
        data: workspace
      });
    } catch (err) {
      next(err);
    }
  }

  async createCodingTask(req, res, next) {
    try {
      const { workspaceId, title, instruction } = req.body;
      const task = await edithService.createCodingTask(req.user.id, {
        workspaceId,
        title,
        instruction
      });
      res.status(202).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  async getCodingTask(req, res, next) {
    try {
      const task = await edithService.getCodingTask(req.params.taskId, req.user.id);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  async approveCodingTask(req, res, next) {
    try {
      const result = await edithService.approveCodingTask(req.params.taskId, req.user.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelCodingTask(req, res, next) {
    try {
      const task = await edithService.cancelCodingTask(req.params.taskId, req.user.id);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EdithController();
