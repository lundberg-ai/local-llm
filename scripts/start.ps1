#!/usr/bin/env pwsh

# Local LLM Full Stack Startup Script (Windows PowerShell)
# Compatible with: Windows 10/11, Windows Server
# This script starts both the frontend and backend servers

Write-Host "🚀 Starting Local LLM Full Stack Application" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
	exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
	Write-Host "❌ npm is not installed. Please install npm and try again." -ForegroundColor Red
	exit 1
}

Write-Host "✅ Node.js and npm are available" -ForegroundColor Green

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "📁 Project root: $RootDir" -ForegroundColor Blue

# Check if dependencies are installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow

# Check frontend dependencies
$FrontendNodeModules = Join-Path $RootDir "node_modules"
if (-not (Test-Path $FrontendNodeModules)) {
	Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
	Set-Location $RootDir
	npm install
	if ($LASTEXITCODE -ne 0) {
		Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
		exit 1
	}
}

# Check backend dependencies
$BackendDir = Join-Path $RootDir "backend"
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

Write-Host "✅ All dependencies are installed" -ForegroundColor Green

# Check if models are downloaded
$ModelsDir = Join-Path $BackendDir "models"
$MagistralModel = Join-Path $ModelsDir "magistral-small-2506.gguf"

if (-not (Test-Path $MagistralModel)) {
	Write-Host "⚠️  Models not found. Would you like to download them now? (This will take several GB)" -ForegroundColor Yellow
	$response = Read-Host "Download models? (y/N)"
	if ($response -eq "y" -or $response -eq "Y") {
		Write-Host "📥 Downloading models..." -ForegroundColor Yellow
		Set-Location $BackendDir
		npm run setup-models -- --yes
		if ($LASTEXITCODE -ne 0) {
			Write-Host "❌ Failed to download models" -ForegroundColor Red
			Write-Host "💡 You can download them manually later with: npm run setup-models -- --yes" -ForegroundColor Blue
		}
	}
 else {
		Write-Host "⚠️  Continuing without models. Backend will run but chat functionality will be limited." -ForegroundColor Yellow
	}
}

# Start backend server in background
Write-Host "🟢 Starting backend server..." -ForegroundColor Green
Set-Location $BackendDir

$BackendJob = Start-Job -ScriptBlock {
	Set-Location $using:BackendDir
	npm run dev
}

Start-Sleep -Seconds 3

# Check if backend started successfully
$BackendUrl = "http://localhost:3001/api/health"
try {
	$response = Invoke-RestMethod -Uri $BackendUrl -TimeoutSec 5
	Write-Host "✅ Backend server is running on http://localhost:3001" -ForegroundColor Green
}
catch {
	Write-Host "⚠️  Backend server may still be starting up..." -ForegroundColor Yellow
}

# Start frontend server
Write-Host "🟦 Starting frontend server..." -ForegroundColor Green
Set-Location $RootDir

Write-Host ""
Write-Host "🎉 Application is starting up!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "🟢 Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "🟦 Frontend: http://localhost:9002" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Cleanup function for stopping background job
$cleanup = {
	Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
	Stop-Job $BackendJob -ErrorAction SilentlyContinue
	Remove-Job $BackendJob -ErrorAction SilentlyContinue
	Write-Host "✅ Cleanup completed" -ForegroundColor Green
}

# Register cleanup on Ctrl+C
Register-EngineEvent PowerShell.Exiting -Action $cleanup

try {
	# Start frontend (this will block)
	npm run dev
}
finally {
	# Cleanup when frontend exits
	& $cleanup
}
