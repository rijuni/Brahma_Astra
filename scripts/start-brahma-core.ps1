<#
.SYNOPSIS
  Starts BRAHMA Core FastAPI service on Port 8001 natively.
#>

Write-Host "Starting BRAHMA Core on http://localhost:8001..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\services\brahma-core"
try {
  & "$PSScriptRoot\..\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
} finally {
  Pop-Location
}
