@echo off
setlocal

REM ─────────────────────────────────────────────────────────────────────────────
REM  run_shadow_parity.bat
REM  Usage: run_shadow_parity.bat <path\to\latest_python.db>
REM  Example: run_shadow_parity.bat C:\Users\pc\Desktop\swastik\app\site.db
REM ─────────────────────────────────────────────────────────────────────────────

set SCRIPT_DIR=%~dp0
set TARGET=%SCRIPT_DIR%backend\db\lab.db
set MIGRATE=%SCRIPT_DIR%backend\scripts\migrate_from_python.js
set PARITY=%SCRIPT_DIR%backend\scripts\shadow_parity.js

if "%~1"=="" (
    echo.
    echo  ERROR: No source DB provided.
    echo  Usage: run_shadow_parity.bat ^<path\to\python.db^>
    echo.
    pause
    exit /b 1
)

set SOURCE=%~1

if not exist "%SOURCE%" (
    echo.
    echo  ERROR: Source DB not found: %SOURCE%
    echo.
    pause
    exit /b 1
)

if not exist "%TARGET%" (
    echo.
    echo  ERROR: SERN target DB not found: %TARGET%
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   Shadow Parity — Python to SERN
echo   source : %SOURCE%
echo   target : %TARGET%
echo ============================================================
echo.

REM ── Step 1: Migrate ──────────────────────────────────────────────────────────
echo [1/2] Running migration (dry-run first)...
echo.
node "%MIGRATE%" --source "%SOURCE%" --target "%TARGET%" --dry-run
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Dry-run failed. Migration aborted.
    pause
    exit /b 1
)

echo.
set /p CONFIRM="Dry-run OK. Proceed with actual migration? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo  Aborted by user.
    pause
    exit /b 0
)

echo.
echo [1/2] Running migration (live)...
node "%MIGRATE%" --source "%SOURCE%" --target "%TARGET%"
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Migration failed. Parity check skipped.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo [2/2] Running shadow parity check...
echo ============================================================
echo.
node "%PARITY%" --source "%SOURCE%"
set PARITY_EXIT=%errorlevel%

echo.
if %PARITY_EXIT%==0 (
    echo  ALL PARITY CHECKS PASSED.
) else (
    echo  PARITY MISMATCHES FOUND — check shadow_diff_*.json in backend\db\
)

echo.
pause
exit /b %PARITY_EXIT%
