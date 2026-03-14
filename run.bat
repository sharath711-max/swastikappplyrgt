@echo off
setlocal enableextensions enabledelayedexpansion
chcp 65001 >nul 2>&1

REM ============================================================
REM  Swastik Gold & Silver Lab - Windows Launcher
REM  Double-click this file to start the application.
REM ============================================================

REM --- Always run from the directory where this .bat lives ---
cd /d "%~dp0"

:start

cls
echo.
echo  ================================================
echo     SWASTIK GOLD ^& SILVER LAB
echo  ================================================
echo.

REM --- Node.js check ---
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js is NOT installed or not in PATH.
    echo.
    echo  Please download and install Node.js from:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM --- Get Node version ---
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% detected

REM --- npm check ---
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] npm is not found. Please reinstall Node.js.
    pause
    exit /b 1
)
echo  [OK] npm detected

REM --- Verify project structure ---
if not exist "package.json" (
    echo  [ERROR] package.json not found.
    echo         Are you running this from the project root?
    pause
    exit /b 1
)
if not exist "backend" (
    echo  [ERROR] backend folder is missing.
    pause
    exit /b 1
)
if not exist "frontend" (
    echo  [ERROR] frontend folder is missing.
    pause
    exit /b 1
)
if not exist "dev.js" (
    echo  [ERROR] dev.js not found. Cannot launch.
    pause
    exit /b 1
)
echo  [OK] Project structure verified

REM --- Create .env for backend if missing ---
if not exist "backend\.env" (
    echo.
    echo  [WARN] backend\.env not found. Creating defaults...
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "$bytes = New-Object byte[] 48; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [Convert]::ToBase64String($bytes)"`) do set "GENERATED_JWT_SECRET=%%S"
    (
        echo PORT=5000
        echo HOST=0.0.0.0
        echo DB_PATH=./db/lab.db
        echo JWT_SECRET=!GENERATED_JWT_SECRET!
        echo CORS_ALLOWED_ORIGINS=http://localhost:3000
        echo NODE_ENV=development
    ) > "backend\.env"
    echo  [OK] backend\.env created
)

REM --- Ensure DB directory exists ---
if not exist "backend\db" (
    mkdir "backend\db" >nul 2>&1
    echo  [OK] Created backend\db directory
)

REM --- Install dependencies only if node_modules are missing ---
echo.
echo  Checking dependencies...

if not exist "node_modules" (
    echo   Installing root dependencies...
    call npm install --no-audit --silent
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] Root npm install failed.
        pause
        exit /b 1
    )
)

if not exist "backend\node_modules" (
    echo   Installing backend dependencies...
    cd backend
    call npm install --no-audit --silent
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] Backend npm install failed.
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

if not exist "frontend\node_modules" (
    echo   Installing frontend dependencies...
    cd frontend
    call npm install --no-audit --silent
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] Frontend npm install failed.
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

echo  [OK] All dependencies ready
echo.

REM --- Kill any processes already on ports 3000 / 5000 ---
echo  Releasing ports 3000 and 5000...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr "LISTENING" ^| findstr ":3000 :5000" 2^>nul') do (
    if not "%%p"=="0" (
        taskkill /F /T /PID %%p >nul 2>&1
    )
)
REM --- Brief pause to let OS release sockets ---
timeout /t 2 /nobreak >nul 2>&1
REM --- Verify ports are free, force-kill stragglers ---
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr "LISTENING" ^| findstr ":3000 :5000" 2^>nul') do (
    if not "%%p"=="0" (
        taskkill /F /T /PID %%p >nul 2>&1
    )
)
echo  [OK] Ports cleared

echo.
echo  Launching application via dev.js...
echo  (Press Ctrl+C to stop at any time)
echo.

REM --- Start application ---
node dev.js

REM --- On exit / crash ---
echo.
echo  ================================================
echo    Application stopped or crashed.
echo  ================================================
echo.
choice /c YN /m "Restart the application? (Y=Yes / N=Exit)"
if %ERRORLEVEL% EQU 1 goto :start

echo.
echo  Goodbye.
exit /b 0
