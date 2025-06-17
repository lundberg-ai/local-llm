#!/bin/bash

# Local LLM Full Stack Startup Script
# This script starts both the frontend and backend servers

echo "🚀 Starting Local LLM Full Stack Application"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Get script directory and root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $ROOT_DIR"

# Check if dependencies are installed
echo "🔍 Checking dependencies..."

# Check frontend dependencies
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$ROOT_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi

# Check backend dependencies
if [ ! -d "$ROOT_DIR/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd "$ROOT_DIR/backend"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
fi

echo "✅ All dependencies are installed"

# Check if models are downloaded
if [ ! -f "$ROOT_DIR/backend/models/magistral-small-2506.gguf" ]; then
    echo "⚠️  Models not found. Would you like to download them now? (This will take several GB)"
    read -p "Download models? (y/N): " response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo "📥 Downloading models..."
        cd "$ROOT_DIR/backend"
        npm run setup-models -- --yes
        if [ $? -ne 0 ]; then
            echo "❌ Failed to download models"
            echo "💡 You can download them manually later with: npm run setup-models -- --yes"
        fi
    else
        echo "⚠️  Continuing without models. Backend will run but chat functionality will be limited."
    fi
fi

# Cleanup function
cleanup() {
    echo -e "\n🛑 Stopping servers..."
    # Kill background processes
    kill $(jobs -p) 2>/dev/null
    echo "✅ Cleanup completed"
    exit 0
}

# Register cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend server in background
echo "🟢 Starting backend server..."
cd "$ROOT_DIR/backend"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend server is running on http://localhost:3001"
else
    echo "⚠️  Backend server may still be starting up..."
fi

# Start frontend server
echo "🟦 Starting frontend server..."
cd "$ROOT_DIR"

echo ""
echo "🎉 Application is starting up!"
echo "================================"
echo "🟢 Backend:  http://localhost:3001"
echo "🟦 Frontend: http://localhost:9002"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start frontend (this will block)
npm run dev

# If we get here, frontend has exited
cleanup
