const path = require('path');
const dotenv = require('dotenv');

// Load .env from root or local
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_insecure_jwt_secret_change_in_production_min_32_chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || 'dev_internal_service_key_change_in_production',
  BRAHMA_CORE_URL: process.env.BRAHMA_CORE_URL || 'http://localhost:8001',
  ASTRA_ENGINE_URL: process.env.ASTRA_ENGINE_URL || 'http://localhost:8002',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 500
};

// Validate critical production configurations
function validateEnv() {
  if (env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('[FATAL] JWT_SECRET must be at least 32 characters in production.');
    }
    if (!process.env.INTERNAL_SERVICE_KEY || process.env.INTERNAL_SERVICE_KEY.length < 32) {
      throw new Error('[FATAL] INTERNAL_SERVICE_KEY must be configured securely in production.');
    }
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
      console.warn('[WARN] Running in production with SQLite DATABASE_URL. PostgreSQL is the production target.');
    }
  }
}

validateEnv();

module.exports = env;
