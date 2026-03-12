@echo off
setlocal
chcp 65001 >nul

echo.
echo ================================================
echo   SWASTIK LAB - FRONTEND
echo ================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ERROR: frontend\package.json not found.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    pushd frontend
    call npm install --no-audit --progress=false
    popd
)

set PORT=3000
echo Starting frontend on port %PORT%...
pushd frontend
call npm start
popd

