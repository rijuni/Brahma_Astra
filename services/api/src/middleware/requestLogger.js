const logger = require('../observability/logger');

function requestLoggerMiddleware(req, res, next) {
  // Do not spam logs for high-frequency health probes
  if (req.path === '/health/live' || req.path === '/health/ready') {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('HTTP Request', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  });

  next();
}

module.exports = requestLoggerMiddleware;
