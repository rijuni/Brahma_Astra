<#
.SYNOPSIS
  BRAHMA + ASTRA Native Windows Development Setup Script
.DESCRIPTION
  Automates dependency installation, Prisma SQLite migrations, seed data,
  and Python virtual environment setup for native Windows development.
#>

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BRAHMA + ASTRA — Native Windows Development Setup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Prerequisites
Write-Host "`n[1/5] Verifying Node.js and Python prerequisites..." -ForegroundColor Yellow
try {
  $nodeVer = node -v
  $npmVer = npm -v
  Write-Host "  [OK] Node.js: $nodeVer (npm $npmVer)" -ForegroundColor Green
} catch {
  Write-Host "  [ERROR] Node.js is required but was not found in PATH." -ForegroundColor Red
  exit 1
}

try {
  $pyVer = python --version
  Write-Host "  [OK] Python: $pyVer" -ForegroundColor Green
} catch {
  Write-Host "  [ERROR] Python is required but was not found in PATH." -ForegroundColor Red
  exit 1
}

# 2. Setup Node.js API Dependencies
Write-Host "`n[2/5] Installing Node.js API dependencies..." -ForegroundColor Yellow
Push-Location "services\api"
try {
  npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed in services/api" }
  Write-Host "  [OK] Node.js dependencies installed successfully." -ForegroundColor Green
} finally {
  Pop-Location
}

# 3. Prisma Client & SQLite Migration
Write-Host "`n[3/5] Generating Prisma client and applying SQLite migration..." -ForegroundColor Yellow
Push-Location "services\api"
try {
  npx prisma generate
  if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

  npx prisma migrate dev --name init
  if ($LASTEXITCODE -ne 0) { throw "prisma migrate failed" }

  node prisma\seed.js
  if ($LASTEXITCODE -ne 0) { throw "prisma seed failed" }

  Write-Host "  [OK] SQLite database migrated and seeded successfully." -ForegroundColor Green
} finally {
  Pop-Location
}

# 4. Setup Python Virtual Environment
Write-Host "`n[4/5] Configuring Python virtual environment (.venv)..." -ForegroundColor Yellow
if (-not (Test-Path ".venv")) {
  python -m venv .venv
  Write-Host "  [OK] Created .venv directory." -ForegroundColor Green
} else {
  Write-Host "  [OK] .venv already exists." -ForegroundColor Green
}

Write-Host "  Installing Python dependencies into .venv..." -ForegroundColor Yellow
.\.venv\Scripts\pip install fastapi "uvicorn[standard]" pydantic pydantic-settings httpx pytest pytest-asyncio
if ($LASTEXITCODE -ne 0) {
  Write-Host "  [ERROR] Failed to install Python dependencies." -ForegroundColor Red
  exit 1
}
Write-Host "  [OK] Python dependencies installed successfully." -ForegroundColor Green

# 5. Parity & Configuration Check
Write-Host "`n[5/5] Checking schema parity..." -ForegroundColor Yellow
Push-Location "services\api"
try {
  node prisma\validate-postgres-compatibility.js
} finally {
  Pop-Location
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Setup Complete! Native Windows environment is ready." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`nTo run all tests:      .\scripts\test-all.ps1"
Write-Host "To start Application API: .\scripts\start-api.ps1"
Write-Host "To start BRAHMA Core:     .\scripts\start-brahma-core.ps1"
Write-Host "To start ASTRA Engine:    .\scripts\start-astra-engine.ps1"
Write-Host "To start ASTRA Runner:    .\scripts\start-astra-runner.ps1"
