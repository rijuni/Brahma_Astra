const auditService = require('../services/audit.service');

class AuditController {
  async list(req, res, next) {
    try {
      // Regular users only see their own audit events, admins can see all
      const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
      const events = await auditService.list(filter, 50);
      res.status(200).json({
        success: true,
        data: events.map(e => ({
          ...e,
          details: e.details ? JSON.parse(e.details) : null
        }))
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
