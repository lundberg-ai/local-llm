#!/usr/bin/env pwsh

# Local LLM Frontend Startup Script (Windows PowerShell)
# Compatible with: Windows 10/11, Windows Server
# This script starts the Next.js frontend application

Write-Host "🚀 Starting Local LLM Frontend Application" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
	exit 1
}

Write-Host "✅ Node.js is available" -ForegroundColor Green

# Get script directory and frontend directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ScriptDir "frontend"

Write-Host "📁 Frontend directory: $FrontendDir" -ForegroundColor Blue

# Check if frontend dependencies are installed
$FrontendNodeModules = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $FrontendNodeModules)) {
	Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
	Set-Location $FrontendDir
	npm install
	if ($LASTEXITCODE -ne 0) {
		Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
		exit 1
	}
}

Write-Host "✅ Frontend dependencies are installed" -ForegroundColor Green

# Start frontend server
Write-Host "🟦 Starting frontend server..." -ForegroundColor Green
Set-Location $FrontendDir

Write-Host ""
Write-Host "🎉 Frontend application is starting!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host "🟦 Application will be available at: http://localhost:9002" -ForegroundColor Green
Write-Host "📱 Both online and offline modes are supported" -ForegroundColor Green
Write-Host "💡 Make sure to start the backend server for offline mode" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev
