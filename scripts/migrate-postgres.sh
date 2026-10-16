#!/usr/bin/env bash
# ==============================================================================
# PostgreSQL Migration & Compatibility Workflow Script
# Used for Integration Testing environments and Production deployment
# ==============================================================================
set -euo pipefail

echo "=== BRAHMA + ASTRA PostgreSQL Migration Workflow ==="

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[ERROR] DATABASE_URL is not set. A PostgreSQL connection URL is required."
  echo "Example: export DATABASE_URL=\"postgresql://user:pass@localhost:5432/brahma_astra?schema=public\""
  exit 1
fi

if [[ ! "$DATABASE_URL" =~ ^postgresql?:// ]]; then
  echo "[ERROR] DATABASE_URL must start with postgresql:// or postgres://"
  exit 1
fi

cd services/api

echo "[Step 1] Verifying schema compatibility..."
node prisma/validate-postgres-compatibility.js

echo "[Step 2] Validating PostgreSQL Prisma schema..."
npx prisma validate --schema=prisma/schema.postgresql.prisma

echo "[Step 3] Applying PostgreSQL migrations..."
npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma

echo "=== PostgreSQL migration completed successfully ==="
