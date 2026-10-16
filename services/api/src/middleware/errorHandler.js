const logger = require('../observability/logger');

class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function errorHandlerMiddleware(err, req, res, next) {
  const requestId = req.id || `req_${Date.now()}`;
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected internal error occurred'
    : err.message || 'An error occurred';

  // Log error with request ID and context
  logger.error('Handled Error', err, {
    requestId,
    statusCode,
    code,
    path: req.originalUrl,
    method: req.method
  });

  const responseBody = {
    success: false,
    error: {
      code,
      message,
      requestId
    }
  };

  if (err.details) {
    responseBody.error.details = err.details;
  }

  // Include stack only in local test/dev when explicitly debugging
  if (process.env.NODE_ENV === 'test-debug') {
    responseBody.error.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

module.exports = {
  AppError,
  errorHandlerMiddleware
};
