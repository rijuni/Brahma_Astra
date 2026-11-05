const fileService = require('../services/file.service');

class FileController {
  async upload(req, res, next) {
    try {
      const data = await fileService.uploadFile(req.user.id, req.file, req.body?.projectId);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const { projectId } = req.query;
      const data = await fileService.listFiles(req.user.id, projectId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getMetadata(req, res, next) {
    try {
      const data = await fileService.getFile(req.user.id, req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async download(req, res, next) {
    try {
      const { diskPath, filename, mimeType } = await fileService.getFileForDownload(
        req.user.id,
        req.params.id
      );

      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`
      );

      res.sendFile(diskPath);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const data = await fileService.deleteFile(req.user.id, req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FileController();

