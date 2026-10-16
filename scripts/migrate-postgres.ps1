# ==============================================================================
# PowerShell PostgreSQL Migration & Compatibility Workflow Script
# ==============================================================================
param(
  [string]$DatabaseUrl = $env:DATABASE_URL
)

Write-Host "=== BRAHMA + ASTRA PostgreSQL Migration Workflow ===" -ForegroundColor Cyan

if (-not $DatabaseUrl) {
  Write-Host "[ERROR] DATABASE_URL is not set. A PostgreSQL connection URL is required." -ForegroundColor Red
  Write-Host "Example: .\scripts\migrate-postgres.ps1 -DatabaseUrl 'postgresql://user:pass@localhost:5432/brahma_astra?schema=public'"
  exit 1
}

if (-not ($DatabaseUrl.StartsWith("postgresql://") -or $DatabaseUrl.StartsWith("postgres://"))) {
  Write-Host "[ERROR] DATABASE_URL must start with postgresql:// or postgres://" -ForegroundColor Red
  exit 1
}

Push-Location services\api
try {
  Write-Host "[Step 1] Verifying schema parity..." -ForegroundColor Yellow
  node prisma\validate-postgres-compatibility.js
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host "[Step 2] Validating PostgreSQL Prisma schema syntax..." -ForegroundColor Yellow
  $env:DATABASE_URL = $DatabaseUrl
  npx prisma validate --schema=prisma\schema.postgresql.prisma
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host "[Step 3] Applying PostgreSQL migrations..." -ForegroundColor Yellow
  npx prisma migrate deploy --schema=prisma\schema.postgresql.prisma
  Write-Host "=== PostgreSQL migration completed successfully ===" -ForegroundColor Green
} finally {
  Pop-Location
}
