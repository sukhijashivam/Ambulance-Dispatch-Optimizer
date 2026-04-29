@echo off
REM ============================================
REM Ambulance Optimizer - Complete Runner
REM ============================================

echo.
echo ===== AMBULANCE DISPATCHER SYSTEM =====
echo.

REM Get the project root
cd /d "%~dp0"

REM ===== Check if venv exists =====
if not exist "backend\venv" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv backend\venv
    pause
    exit /b 1
)

echo [1/3] Starting Backend Server (Flask on port 5000)...
start "Ambulance Backend" cmd /k "cd backend && backend\venv\Scripts\python.exe app.py"
timeout /t 2 /nobreak

echo [2/3] Starting Frontend Server (HTTP on port 8000)...
start "Ambulance Frontend" cmd /k "cd frontend && python -m http.server 8000"
timeout /t 2 /nobreak

echo [3/3] Opening Browser...
timeout /t 2 /nobreak
start http://localhost:8000

echo.
echo ===== SYSTEM STARTED =====
echo.
echo Frontend: http://localhost:8000
echo Backend:  http://localhost:5000
echo.
echo Both servers are running in separate windows.
echo Close any window to stop that service.
echo.
pause
