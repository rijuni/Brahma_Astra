<#
.SYNOPSIS
  Renames the physical root folder from M:\brahma-astra to M:\friday-edith.
  Antigravity IDE must be closed so Windows releases its file handle lock.
#>

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   FRIDAY + EDITH -- Root Directory Physical Rename Utility    " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Windows blocks renaming a directory while any running process (like Antigravity IDE) has it open." -ForegroundColor Yellow
Write-Host "Please close Antigravity IDE before continuing." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter when Antigravity IDE is closed..."

# Remove junction if present
if (Test-Path "M:\friday-edith") {
    $item = Get-Item "M:\friday-edith"
    if ($item.LinkType -eq 'Junction') {
        cmd /c rmdir "M:\friday-edith" 2>$null
    }
}

try {
    Write-Host "[1/2] Renaming physical folder M:\brahma-astra -> M:\friday-edith..." -ForegroundColor Cyan
    cmd /c ren "M:\brahma-astra" "friday-edith"
    if ($LASTEXITCODE -ne 0) {
        throw "Rename command returned non-zero exit code"
    }

    Write-Host "[2/2] Creating backward-compatibility junction (M:\brahma-astra -> M:\friday-edith)..." -ForegroundColor Cyan
    cmd /c mklink /J "M:\brahma-astra" "M:\friday-edith"

    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host "   SUCCESS! Physical folder is now M:\friday-edith             " -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host "Now open Antigravity IDE -> File -> Open Folder -> M:\friday-edith" -ForegroundColor White
} catch {
    Write-Host "[ERROR] Could not rename M:\brahma-astra." -ForegroundColor Red
    Write-Host "Make sure Antigravity IDE and all PowerShell terminal windows are closed." -ForegroundColor Red
    cmd /c mklink /J "M:\friday-edith" "M:\brahma-astra" 2>$null
}

