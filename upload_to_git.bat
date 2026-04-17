@echo off
title Swastik Gold V2 - Production Git Upload
color 0a
cls

echo ========================================================
echo   SWASTIK GOLD V2: SECURE GIT DEPLOYMENT
echo ========================================================
:: Display the current remote if it exists
echo.
echo Current Repository Status:
git remote -v | findstr "(push)" || echo [NO REMOTE CONFIGURED]
echo --------------------------------------------------------
echo.

:: 1. GIT INITIALIZATION CHECK
if not exist .git (
    echo [*] Initializing new Git repository...
    git init
    git checkout -b main
)

:: 2. INTEGRITY CHECK: .gitignore
if not exist .gitignore (
    echo [!] ERROR: .gitignore file not found! 
    echo Please create the .gitignore file first to protect your DB and Env.
    pause
    exit /b
)

:: 3. CLEANING STAGING AREA
echo [*] Refreshing staging area...
git rm -r --cached . >nul 2>&1

:: 4. STAGING HARDENED ARCHITECTURE
echo [*] Staging hardened SERN v2 files...
git add .

echo.
echo --------------------------------------------------------
echo   COMMIT DETAILS
echo --------------------------------------------------------
set /p COMMIT_MSG="Enter Commit Message (default: 'feat: v2 migration - idempotency and gst hardening'): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=feat: v2 migration - idempotency and gst hardening

git commit -m "%COMMIT_MSG%"

echo.
echo --------------------------------------------------------
echo   DESTINATION CONFIGURATION
echo --------------------------------------------------------
:ask_url
set /p REMOTE_URL="Paste your NEW Repository URL (HTTPS): "

if "%REMOTE_URL%"=="" (
    echo.
    echo ❌ Error: URL cannot be empty.
    goto ask_url
)

:: 5. REMOTE ORIGIN SETUP
echo.
echo [*] Resetting remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REMOTE_URL%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to add remote. Please check your URL.
    pause
    exit /b
)

:: 6. THE FINAL PUSH
echo.
echo [*] Pushing code to main...
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   ✅ SUCCESS! Project is now live at:
    echo   %REMOTE_URL%
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   ❌ FAILED. 
    echo   - Check your internet connection.
    echo   - Check if the Repository URL is correct.
    echo   - Ensure you have write permissions.
    echo ========================================================
)

echo.
pause