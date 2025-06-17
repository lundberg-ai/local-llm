#!/usr/bin/env pwsh

# Local LLM Backend Startup Script (Windows PowerShell)
# Compatible with: Windows 10/11, Windows Server
# This script starts the local LLM backend server

Write-Host "🚀 Starting Local LLM Backend Server" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
	exit 1
}

Write-Host "✅ Node.js is available" -ForegroundColor Green

# Get script directory and backend directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"

Write-Host "📁 Backend directory: $BackendDir" -ForegroundColor Blue

# Check if backend dependencies are installed
$BackendNodeModules = Join-Path $BackendDir "node_modules"
if (-not (Test-Path $BackendNodeModules)) {
	Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
	Set-Location $BackendDir
	npm install
	if ($LASTEXITCODE -ne 0) {
		Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
		exit 1
	}
}

Write-Host "✅ Backend dependencies are installed" -ForegroundColor Green

# Check if models are downloaded
$MagistralModel = Join-Path $BackendDir "models" "magistral-small-2506.gguf"
$QwenModel = Join-Path $BackendDir "models" "qwen3-embedding-4b.gguf"
$GemmaModel = Join-Path $BackendDir "models" "gemma-3-1b-it-qat-q4_0.gguf"

if (-not (Test-Path $MagistralModel) -and -not (Test-Path $QwenModel) -and -not (Test-Path $GemmaModel)) {
	Write-Host "⚠️  No models found. Would you like to download them now?" -ForegroundColor Yellow
	Write-Host "Available models:"
	Write-Host "  1. Magistral Small 2506 (~14GB) - Mid-tier model"
	Write-Host "  2. Qwen3 Embedding 4B (~2.3GB) - Lightweight for laptops"
	Write-Host "  3. Gemma 3 1B IT (~700MB) - Ultra-light for mobile"
	Write-Host ""
	$response = Read-Host "Download models? (y/N)"
	if ($response -eq "y" -or $response -eq "Y") {
		Write-Host "📥 Downloading models..." -ForegroundColor Yellow
		Set-Location $BackendDir
		npm run setup-models -- --yes
		if ($LASTEXITCODE -ne 0) {
			Write-Host "❌ Failed to download models" -ForegroundColor Red
			Write-Host "💡 You can download them manually later with: cd backend && npm run setup-models -- --yes" -ForegroundColor Blue
		}
	}
 else {
		Write-Host "⚠️  Continuing without models. Server will run but functionality will be limited." -ForegroundColor Yellow
	}
}

# Start backend server
Write-Host "🟢 Starting backend server..." -ForegroundColor Green
Set-Location $BackendDir

Write-Host ""
Write-Host "🎉 Backend server is starting!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host "🟢 Server will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host "📊 Health check: http://localhost:3001/api/health" -ForegroundColor Green
Write-Host "🤖 Models info: http://localhost:3001/api/models" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev
