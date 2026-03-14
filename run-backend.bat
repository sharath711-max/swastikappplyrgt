@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

echo.
echo ================================================
echo   SWASTIK LAB - BACKEND
echo ================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

if not exist "backend\package.json" (
    echo ERROR: backend\package.json not found.
    pause
    exit /b 1
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    pushd backend
    call npm install --no-audit --progress=false
    popd
)

if not exist "backend\.env" (
    echo Creating backend\.env...
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "$bytes = New-Object byte[] 48; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [Convert]::ToBase64String($bytes)"`) do set "GENERATED_JWT_SECRET=%%S"
    (
        echo PORT=5000
        echo HOST=0.0.0.0
        echo DB_PATH=./db/lab.db
        echo JWT_SECRET=!GENERATED_JWT_SECRET!
        echo CORS_ALLOWED_ORIGINS=http://localhost:3000
        echo NODE_ENV=development
    ) > backend\.env
)

echo Starting backend on port 5000...
pushd backend
call npm run dev
popd

