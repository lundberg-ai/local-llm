#!/bin/bash

# Local LLM Frontend Startup Script
# Compatible with: Linux (Ubuntu, CentOS, etc.), macOS, Windows (WSL/Git Bash)
# This script starts the Next.js frontend application

echo "🚀 Starting Local LLM Frontend Application"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js is available"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "📁 Frontend directory: $FRONTEND_DIR"

# Check if frontend dependencies are installed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi

echo "✅ Frontend dependencies are installed"

# Start frontend server
echo "🟦 Starting frontend server..."
cd "$FRONTEND_DIR"

echo ""
echo "🎉 Frontend application is starting!"
echo "==================================="
echo "🟦 Application will be available at: http://localhost:9002"
echo "📱 Both online and offline modes are supported"
echo "💡 Make sure to start the backend server for offline mode"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
