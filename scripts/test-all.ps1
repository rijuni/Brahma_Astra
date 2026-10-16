# ==========================================================
# BRAHMA + ASTRA Monorepo Automated Test Suite (Windows)
# ==========================================================

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BRAHMA + ASTRA Monorepo Automated Test Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$results = @()

# 1. Prisma & Schema Parity
Write-Host "`n[1/5] Testing Prisma Schema Parity..." -ForegroundColor Yellow
Push-Location "services\api"
node prisma\validate-postgres-compatibility.js
$parityCode = $LASTEXITCODE
Pop-Location
$results += [PSCustomObject]@{ Suite = "Prisma Schema Parity"; Passed = ($parityCode -eq 0) }

# 2. Node.js API (Jest)
Write-Host "`n[2/5] Testing Node.js Application API (Jest)..." -ForegroundColor Yellow
Push-Location "services\api"
npm test
$apiCode = $LASTEXITCODE
Pop-Location
$results += [PSCustomObject]@{ Suite = "Application API (Node.js/Jest)"; Passed = ($apiCode -eq 0) }

# 3. BRAHMA Core (Pytest)
Write-Host "`n[3/5] Testing BRAHMA Core (pytest)..." -ForegroundColor Yellow
Push-Location "services\brahma-core"
..\..\.venv\Scripts\pytest -v
$coreCode = $LASTEXITCODE
Pop-Location
$results += [PSCustomObject]@{ Suite = "BRAHMA Core (FastAPI/pytest)"; Passed = ($coreCode -eq 0) }

# 4. ASTRA Engine (Pytest)
Write-Host "`n[4/5] Testing ASTRA Engine (pytest)..." -ForegroundColor Yellow
Push-Location "services\astra-engine"
..\..\.venv\Scripts\pytest -v
$engineCode = $LASTEXITCODE
Pop-Location
$results += [PSCustomObject]@{ Suite = "ASTRA Engine (FastAPI/pytest)"; Passed = ($engineCode -eq 0) }

# 5. ASTRA Runner (Pytest)
Write-Host "`n[5/5] Testing ASTRA Runner Security Boundary (pytest)..." -ForegroundColor Yellow
Push-Location "services\astra-runner"
..\..\.venv\Scripts\pytest -v
$runnerCode = $LASTEXITCODE
Pop-Location
$results += [PSCustomObject]@{ Suite = "ASTRA Runner (Security Boundary)"; Passed = ($runnerCode -eq 0) }

# Summary Report
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Automated Test Results Summary" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$allPassed = $true
foreach ($res in $results) {
  if ($res.Passed) {
    Write-Host "  [PASSED] $($res.Suite)" -ForegroundColor Green
  } else {
    Write-Host "  [FAILED] $($res.Suite)" -ForegroundColor Red
    $allPassed = $false
  }
}

Write-Host "==========================================================" -ForegroundColor Cyan
if ($allPassed) {
  Write-Host "  ALL TEST SUITES PASSED NATIVELY ON WINDOWS!" -ForegroundColor Green
  exit 0
} else {
  Write-Host "  ONE OR MORE TEST SUITES FAILED." -ForegroundColor Red
  exit 1
}
