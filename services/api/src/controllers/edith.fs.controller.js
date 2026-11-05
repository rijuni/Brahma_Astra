const edithFsService = require('../services/edith.fs.service');

class EdithFsController {
  async getProjects(req, res, next) {
    try {
      const data = await edithFsService.listProjects(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async registerProject(req, res, next) {
    try {
      const data = await edithFsService.registerProject(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getTree(req, res, next) {
    try {
      const { projectId, subpath, maxDepth } = req.query;
      const data = await edithFsService.getTree(req.user.id, projectId, subpath, maxDepth);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async readFile(req, res, next) {
    try {
      const { projectId, path } = req.query;
      const data = await edithFsService.readFile(req.user.id, projectId, path);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async writeFile(req, res, next) {
    try {
      const { projectId, path, content } = req.body;
      const data = await edithFsService.writeFile(req.user.id, projectId, path, content);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createItem(req, res, next) {
    try {
      const { projectId, path, type } = req.body;
      const data = await edithFsService.createItem(req.user.id, projectId, path, type);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async renameItem(req, res, next) {
    try {
      const { projectId, oldPath, newPath } = req.body;
      const data = await edithFsService.renameItem(req.user.id, projectId, oldPath, newPath);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteItem(req, res, next) {
    try {
      const { projectId, path } = req.body;
      const data = await edithFsService.deleteItem(req.user.id, projectId, path);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EdithFsController();

