#!/bin/bash

# Local LLM Backend Startup Script
# Compatible with: Linux (Ubuntu, CentOS, etc.), macOS, Windows (WSL/Git Bash)
# This script starts the local LLM backend server

echo "🚀 Starting Local LLM Backend Server"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js is available"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "📁 Backend directory: $BACKEND_DIR"

# Check if backend dependencies are installed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
fi

echo "✅ Backend dependencies are installed"

# Check if models are downloaded
if [ ! -f "$BACKEND_DIR/models/magistral-small-2506.gguf" ] && [ ! -f "$BACKEND_DIR/models/qwen3-embedding-4b.gguf" ] && [ ! -f "$BACKEND_DIR/models/gemma-3-1b-it-qat-q4_0.gguf" ]; then
    echo "⚠️  No models found. Would you like to download them now?"
    echo "Available models:"
    echo "  1. Magistral Small 2506 (~14GB) - Mid-tier model"
    echo "  2. Qwen3 Embedding 4B (~2.3GB) - Lightweight for laptops"  
    echo "  3. Gemma 3 1B IT (~700MB) - Ultra-light for mobile"
    echo ""
    read -p "Download models? (y/N): " response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo "📥 Downloading models..."
        cd "$BACKEND_DIR"
        npm run setup-models -- --yes
        if [ $? -ne 0 ]; then
            echo "❌ Failed to download models"
            echo "💡 You can download them manually later with: cd backend && npm run setup-models -- --yes"
        fi
    else
        echo "⚠️  Continuing without models. Server will run but functionality will be limited."
    fi
fi

# Start backend server
echo "🟢 Starting backend server..."
cd "$BACKEND_DIR"

echo ""
echo "🎉 Backend server is starting!"
echo "=============================="
echo "🟢 Server will be available at: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/api/health"
echo "🤖 Models info: http://localhost:3001/api/models"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
