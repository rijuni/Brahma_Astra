<#
.SYNOPSIS
  Starts the Node.js Application API on Port 3000 natively.
#>

Write-Host "Starting BRAHMA + ASTRA Application API on http://localhost:3000..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\services\api"
try {
  node src\server.js
} finally {
  Pop-Location
}
