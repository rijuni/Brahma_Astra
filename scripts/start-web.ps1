<#
.SYNOPSIS
  Starts the React + Vite frontend on Port 5173 natively on Windows.
#>

Write-Host "Starting BRAHMA + ASTRA Frontend on http://localhost:5173..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\apps\web"
try {
  npm run dev
} finally {
  Pop-Location
}
