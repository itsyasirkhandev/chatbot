#!/usr/bin/env pwsh

Write-Host "Starting Gemini Chatbot..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This will start the Next.js development server." -ForegroundColor Yellow
Write-Host "The chatbot will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create a .env.local file with your GEMINI_API_KEY" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
npm run dev
