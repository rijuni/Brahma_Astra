<#
.SYNOPSIS
  Starts ASTRA Runner Execution Service on Port 8003 natively.
#>

Write-Host "Starting ASTRA Runner on http://localhost:8003 (Execution Mode: disabled)..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\services\astra-runner"
try {
  & "$PSScriptRoot\..\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8003 --reload
} finally {
  Pop-Location
}
