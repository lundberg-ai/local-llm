@echo off
setlocal

REM Local LLM Full Stack Startup Script (Windows Batch)
REM Compatible with: Windows 7/8/10/11, Windows Server
REM This script starts both the frontend and backend servers

echo 🚀 Starting Local LLM Full Stack Application
echo ==========================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available

REM Get script directory and root directory
set "ROOT_DIR=%~dp0.."

echo 📁 Project root: %ROOT_DIR%

REM Check if dependencies are installed
echo 🔍 Checking dependencies...

REM Check frontend dependencies
if not exist "%ROOT_DIR%\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd /d "%ROOT_DIR%"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

REM Check backend dependencies
if not exist "%ROOT_DIR%\backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd /d "%ROOT_DIR%\backend"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)

echo ✅ All dependencies are installed

REM Check if models are downloaded
if not exist "%ROOT_DIR%\backend\models\magistral-small-2506.gguf" (
    echo ⚠️  Models not found. Would you like to download them now? (This will take several GB)
    set /p response="Download models? (y/N): "
    if /i "%response%"=="y" (
        echo 📥 Downloading models...
        cd /d "%ROOT_DIR%\backend"
        call npm run setup-models -- --yes
        if %ERRORLEVEL% neq 0 (
            echo ❌ Failed to download models
            echo 💡 You can download them manually later with: npm run setup-models -- --yes
        )
    ) else (
        echo ⚠️  Continuing without models. Backend will run but chat functionality will be limited.
    )
)

REM Start backend server in background
echo 🟢 Starting backend server...
cd /d "%ROOT_DIR%\backend"
start "Backend Server" cmd /c "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 >nul

REM Start frontend server
echo 🟦 Starting frontend server...
cd /d "%ROOT_DIR%"

echo.
echo 🎉 Application is starting up!
echo ================================
echo 🟢 Backend:  http://localhost:3001
echo 🟦 Frontend: http://localhost:9002
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start frontend (this will block)
call npm run dev

pause
