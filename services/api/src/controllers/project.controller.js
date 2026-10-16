const projectService = require('../services/project.service');

class ProjectController {
  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const project = await projectService.createProject({
        name,
        description,
        userId: req.user.id
      });
      res.status(201).json({
        success: true,
        data: project
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const projects = await projectService.listProjects(req.user.id);
      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const project = await projectService.getProject(req.params.projectId, req.user.id);
      res.status(200).json({
        success: true,
        data: project
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { name, description } = req.body;
      const updated = await projectService.updateProject(
        req.params.projectId,
        req.user.id,
        { name, description }
      );
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await projectService.deleteProject(req.params.projectId, req.user.id);
      res.status(200).json({
        success: true,
        data: { message: 'Project deleted successfully' }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProjectController();
