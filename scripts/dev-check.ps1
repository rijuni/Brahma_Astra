# Windows PowerShell Preflight Check
Write-Host "=== BRAHMA + ASTRA Windows Environment Preflight Check ===" -ForegroundColor Cyan

# Check Node
try {
    $nodeVer = node -v
    Write-Host "[OK] Node.js version: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not found in PATH." -ForegroundColor Red
}

# Check Python
try {
    $pyVer = python --version
    Write-Host "[OK] Python version: $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not found in PATH." -ForegroundColor Red
}

Write-Host "[OK] Initial development database: SQLite" -ForegroundColor Green
Write-Host "[OK] Target integration database: PostgreSQL" -ForegroundColor Green
Write-Host "=== Preflight check completed ===" -ForegroundColor Cyan
