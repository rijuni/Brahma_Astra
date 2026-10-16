-- Initial setup for PostgreSQL integration-testing and production database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Health verification table
CREATE TABLE IF NOT EXISTS _healthcheck (
  id SERIAL PRIMARY KEY,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
