@echo off
title Rename Project Folder to FRIDAY-EDITH
echo ===============================================================
echo   FRIDAY + EDITH -- Root Project Directory Rename Utility
echo ===============================================================
echo.
echo NOTE: Antigravity IDE must be closed so Windows releases its file handle lock on M:\brahma-astra.
echo If Antigravity IDE is currently open, please close it before pressing any key.
echo.
pause
echo.
echo [1/3] Removing junction if present...
if exist "M:\friday-edith" (
  rmdir "M:\friday-edith" 2>nul
)

echo [2/3] Renaming physical folder M:\brahma-astra to M:\friday-edith...
ren "M:\brahma-astra" "friday-edith"
if errorlevel 1 (
  echo.
  echo [ERROR] Could not rename M:\brahma-astra.
  echo Reason: A process is still locking the directory (close IDE and PowerShell terminals).
  echo Re-creating junction so M:\friday-edith is immediately usable...
  mklink /J "M:\friday-edith" "M:\brahma-astra"
  echo.
  pause
  exit /b 1
)

echo [3/3] Creating backward-compatibility junction M:\brahma-astra -^> M:\friday-edith...
mklink /J "M:\brahma-astra" "M:\friday-edith"

echo.
echo ===============================================================
echo   SUCCESS! The physical directory on disk is now M:\friday-edith
echo ===============================================================
echo You can now reopen Antigravity IDE:
echo   1. Launch Antigravity IDE
echo   2. Click "File" -^> "Open Folder..."
echo   3. Select "M:\friday-edith"
echo.
pause

