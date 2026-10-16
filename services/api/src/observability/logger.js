const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'secret',
  'internalservicekey',
  'internal_service_key'
]);

function redact(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 5) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => redact(item, depth + 1));
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = redact(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const logger = {
  info(message, meta = {}) {
    const payload = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...redact(meta)
    };
    console.log(JSON.stringify(payload));
  },
  warn(message, meta = {}) {
    const payload = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...redact(meta)
    };
    console.warn(JSON.stringify(payload));
  },
  error(message, error = null, meta = {}) {
    const payload = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error ? { message: error.message, code: error.code } : undefined,
      ...redact(meta)
    };
    console.error(JSON.stringify(payload));
  },
  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const payload = {
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...redact(meta)
      };
      console.log(JSON.stringify(payload));
    }
  }
};

module.exports = logger;
