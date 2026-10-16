const prisma = require('../repositories/prisma');
const logger = require('../observability/logger');

class AuditService {
  async record({ userId = null, action, resourceType, resourceId = null, details = null, ipAddress = null }) {
    try {
      const detailsJson = details ? JSON.stringify(details) : null;
      const event = await prisma.auditEvent.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId,
          details: detailsJson,
          ipAddress
        }
      });
      return event;
    } catch (err) {
      logger.error('Failed to persist audit event', err, { action, resourceType, resourceId });
      // Never crash the primary flow if auditing fails
      return null;
    }
  }

  async list(filter = {}, take = 50) {
    return await prisma.auditEvent.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take
    });
  }
}

module.exports = new AuditService();
