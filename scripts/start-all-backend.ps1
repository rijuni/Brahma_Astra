<#
.SYNOPSIS
  Starts all 4 BRAHMA + ASTRA backend services in dedicated PowerShell windows.
#>

$root = Resolve-Path "$PSScriptRoot\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting All BRAHMA + ASTRA Backend Services (Windows)  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Node.js Application API (Port 3000)
Write-Host "[1/4] Spawning Node.js Application API (:3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\services\api'; Write-Host '--- Application API (:3000) ---' -ForegroundColor Cyan; node src\server.js"

# 2. BRAHMA Core (Port 8001)
Write-Host "[2/4] Spawning BRAHMA Core FastAPI (:8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\services\brahma-core'; Write-Host '--- BRAHMA Core (:8001) ---' -ForegroundColor Cyan; & '$root\.venv\Scripts\python.exe' -m uvicorn app.main:app --port 8001 --reload"

# 3. ASTRA Engine (Port 8002)
Write-Host "[3/4] Spawning ASTRA Engine FastAPI (:8002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\services\astra-engine'; Write-Host '--- ASTRA Engine (:8002) ---' -ForegroundColor Cyan; & '$root\.venv\Scripts\python.exe' -m uvicorn app.main:app --port 8002 --reload"

# 4. ASTRA Runner (Port 8003)
Write-Host "[4/4] Spawning ASTRA Runner Execution Boundary (:8003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\services\astra-runner'; Write-Host '--- ASTRA Runner (:8003) ---' -ForegroundColor Cyan; & '$root\.venv\Scripts\python.exe' -m uvicorn app.main:app --port 8003 --reload"

Write-Host ""
Write-Host "All 4 backend services launched successfully in separate terminal windows:" -ForegroundColor Green
Write-Host "  - Application API:  http://localhost:3000" -ForegroundColor White
Write-Host "  - BRAHMA Core:      http://localhost:8001" -ForegroundColor White
Write-Host "  - ASTRA Engine:     http://localhost:8002" -ForegroundColor White
Write-Host "  - ASTRA Runner:     http://localhost:8003" -ForegroundColor White
