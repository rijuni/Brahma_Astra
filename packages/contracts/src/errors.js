/**
 * Standard error codes across BRAHMA + ASTRA services.
 */
const ErrorCodes = {
  // Client & Validation Errors (400 - 422)
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Task & Workflow States (409)
  TASK_ALREADY_CANCELLED: 'TASK_ALREADY_CANCELLED',
  TASK_NOT_APPROVED: 'TASK_NOT_APPROVED',
  TASK_ALREADY_COMPLETED: 'TASK_ALREADY_COMPLETED',

  // Runner & Sandbox Security Errors (403, 500, 504)
  SANDBOX_EXECUTION_TIMEOUT: 'SANDBOX_EXECUTION_TIMEOUT',
  SANDBOX_MEMORY_EXCEEDED: 'SANDBOX_MEMORY_EXCEEDED',
  SANDBOX_POLICY_VIOLATION: 'SANDBOX_POLICY_VIOLATION',
  SANDBOX_DISABLED: 'SANDBOX_DISABLED',

  // Server & Integration Errors (500 - 504)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UPSTREAM_SERVICE_UNAVAILABLE: 'UPSTREAM_SERVICE_UNAVAILABLE',
  UPSTREAM_TIMEOUT: 'UPSTREAM_TIMEOUT',
  SERVICE_UNREADY: 'SERVICE_UNREADY'
};

/**
 * Standard error response formatter.
 * @param {string} code
 * @param {string} message
 * @param {Array|Object|null} [details=null]
 * @param {string|null} [requestId=null]
 * @returns {object}
 */
function createErrorResponse(code, message, details = null, requestId = null) {
  const errorObj = {
    code,
    message,
    requestId: requestId || `req_${Date.now()}`
  };
  if (details) {
    errorObj.details = details;
  }
  return {
    success: false,
    error: errorObj
  };
}

module.exports = {
  ErrorCodes,
  createErrorResponse
};
