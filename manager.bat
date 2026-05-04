@echo off
setlocal enableextensions
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo.
echo  ================================================
echo     SWASTIK GOLD ^& SILVER LAB - MANAGER
echo  ================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Node.js is not installed.
    echo  Trying silent install with winget...
    echo.

    where winget >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    )

    where node >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo  [ERROR] Node.js could not be installed automatically.
        echo  Please download Node.js LTS from https://nodejs.org/
        echo  Then re-run this file.
        echo.
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% detected
echo.
echo  Starting manager on http://localhost:9000 ...
echo  Login requires a user with role=superadmin.
echo  (Close this window or press Ctrl+C to stop)
echo.

node manager.js

echo.
echo  Manager stopped.
pause
