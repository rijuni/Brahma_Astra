const edithDbService = require('../services/edith.db.service');

class EdithDbController {
  async getDatabases(req, res, next) {
    try {
      const { projectId } = req.query;
      const data = await edithDbService.getDatabases(req.user.id, projectId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getTables(req, res, next) {
    try {
      const { projectId, database } = req.query;
      const data = await edithDbService.getTables(req.user.id, projectId, database);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getTableSchema(req, res, next) {
    try {
      const { projectId, database } = req.query;
      const table = req.params.table || req.query.table;
      const data = await edithDbService.getTableSchema(req.user.id, projectId, database, table);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getTableRecords(req, res, next) {
    try {
      const { projectId, database, page, limit } = req.query;
      const table = req.params.table || req.query.table;
      const data = await edithDbService.getTableRecords(
        req.user.id,
        projectId,
        database,
        table,
        page,
        limit
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async executeQuery(req, res, next) {
    try {
      const { projectId, database, sql, limit } = req.body;
      const data = await edithDbService.executeQuery(
        req.user.id,
        projectId,
        database,
        sql,
        limit
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EdithDbController();

