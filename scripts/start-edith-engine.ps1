<#
.SYNOPSIS
  Starts EDITH Engine FastAPI service on Port 8002 natively.
#>

Write-Host "Starting EDITH Engine on http://localhost:8002..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\services\edith-engine"
try {
  & "$PSScriptRoot\..\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
} finally {
  Pop-Location
}
