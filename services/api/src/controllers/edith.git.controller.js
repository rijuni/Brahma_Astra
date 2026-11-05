const edithGitService = require('../services/edith.git.service');

class EdithGitController {
  async getStatus(req, res, next) {
    try {
      const { projectId } = req.query;
      const data = await edithGitService.getStatus(req.user.id, projectId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getBranches(req, res, next) {
    try {
      const { projectId } = req.query;
      const data = await edithGitService.getBranches(req.user.id, projectId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createBranch(req, res, next) {
    try {
      const { projectId, branchName, checkout } = req.body;
      const data = await edithGitService.createBranch(req.user.id, projectId, { branchName, checkout });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async checkoutBranch(req, res, next) {
    try {
      const { projectId, branchName } = req.body;
      const data = await edithGitService.checkoutBranch(req.user.id, projectId, { branchName });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async stage(req, res, next) {
    try {
      const { projectId, files, all } = req.body;
      const data = await edithGitService.stage(req.user.id, projectId, { files, all });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async unstage(req, res, next) {
    try {
      const { projectId, files, all } = req.body;
      const data = await edithGitService.unstage(req.user.id, projectId, { files, all });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async commit(req, res, next) {
    try {
      const { projectId, message, confirmed } = req.body;
      const data = await edithGitService.commit(req.user.id, projectId, { message, confirmed });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getDiff(req, res, next) {
    try {
      const { projectId, file, staged } = req.query;
      const isStaged = staged === 'true' || staged === true;
      const data = await edithGitService.getDiff(req.user.id, projectId, { file, staged: isStaged });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getLog(req, res, next) {
    try {
      const { projectId, limit } = req.query;
      const data = await edithGitService.getLog(req.user.id, projectId, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EdithGitController();

