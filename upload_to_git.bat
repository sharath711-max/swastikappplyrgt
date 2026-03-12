@echo off
title Upload to Git
color 0f
cls

echo ========================================================
echo   UPLOAD PROJECT TO NEW GIT REPOSITORY
echo ========================================================
echo.
echo  INSTRUCTIONS:
echo  1. Create a NEW EMPTY repository on GitHub/GitLab/Bitbucket.
echo     (Do NOT check "Initialize with README", .gitignore, or license)
echo  2. Copy the "HTTPS" clone URL (ends in .git).
echo.
echo --------------------------------------------------------
echo.

:ask_url
set /p REMOTE_URL="Paste your Repository URL here: "

if "%REMOTE_URL%"=="" (
    echo.
    echo ❌ Error: URL cannot be empty.
    goto ask_url
)

echo.
echo --------------------------------------------------------
echo  Processing...
echo --------------------------------------------------------
echo.

REM Remove existing origin if any (to be safe)
git remote remove origin >nul 2>&1

REM Add new origin
echo 1. Adding remote origin: %REMOTE_URL%
git remote add origin %REMOTE_URL%
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to add remote. Please check the URL.
    pause
    exit /b
)

REM Push to main
echo.
echo 2. Pushing code to main branch...
echo    (A browser window or login prompt may appear for authentication)
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   ✅ SUCCESS! Project uploaded to Git.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   ❌ FAILED. Please check the following:
    echo      - Is the repository empty?
    echo      - Did you enter the correct URL?
    echo      - Do you have permission to push?
    echo ========================================================
)

echo.
pause
