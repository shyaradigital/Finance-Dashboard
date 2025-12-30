# Finance Tracker - Local Development Script
# This script sets up and runs both frontend and backend locally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Finance Tracker - Local Development" -ForegroundColor Cyan
Write-Host "Frontend + Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if npm is installed
Write-Host "Checking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
    Write-Host "Please install npm (usually comes with Node.js)" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# ============ FRONTEND SETUP ============
Write-Host "=== Frontend Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if frontend node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules") -or -not (Test-Path "node_modules\.bin")) {
    Write-Host "Frontend dependencies not found or incomplete. Installing..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Failed to install frontend dependencies!" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    # Rebuild native modules if needed
    Write-Host "Rebuilding native modules..." -ForegroundColor Yellow
    npm rebuild @swc/core 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "[OK] Frontend dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] Frontend dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

# ============ BACKEND SETUP ============
Write-Host "=== Backend Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] Backend directory not found!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Change to backend directory
Push-Location backend

# Check if backend node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Backend dependencies not found. Installing..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Failed to install backend dependencies!" -ForegroundColor Red
        Pop-Location
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    Write-Host ""
    Write-Host "[OK] Backend dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] Backend dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

# Check if Prisma client is generated
if (-not (Test-Path "node_modules\.prisma")) {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Failed to generate Prisma client!" -ForegroundColor Red
        Pop-Location
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    Write-Host "[OK] Prisma client generated" -ForegroundColor Green
    Write-Host ""
}

# Return to root directory
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking for existing servers..." -ForegroundColor Yellow
Write-Host ""

# Check if ports are already in use
$backendPortInUse = $false
$frontendPortInUse = $false

try {
    $backendCheck = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($backendCheck) {
        $backendPortInUse = $true
        Write-Host "[WARNING] Port 3000 (backend) is already in use!" -ForegroundColor Yellow
        Write-Host "  You may need to stop the existing process first." -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    # Port is free
}

try {
    $frontendCheck = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($frontendCheck) {
        $frontendPortInUse = $true
        Write-Host "[WARNING] Port 5173 (frontend) is already in use!" -ForegroundColor Yellow
        Write-Host "  You may need to stop the existing process first." -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    # Port is free
}

if (-not $backendPortInUse -and -not $frontendPortInUse) {
    Write-Host "[OK] Ports are available" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$rootDir = (Get-Location).Path

# Start backend in a new PowerShell window (only if port is free)
if (-not $backendPortInUse) {
    $backendScriptPath = Join-Path $env:TEMP "start-backend.ps1"
    $backendScript = "Set-Location '$rootDir\backend'; npm run dev"
    $backendScript | Out-File -FilePath $backendScriptPath -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit", "-File", $backendScriptPath
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    Write-Host "[OK] Backend server started" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[SKIP] Backend port already in use, skipping backend start" -ForegroundColor Yellow
    Write-Host ""
}

# Start frontend (this will block in current window)
if ($frontendPortInUse) {
    Write-Host "[WARNING] Frontend port already in use!" -ForegroundColor Yellow
    Write-Host "Please stop the existing frontend server first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Starting frontend server..." -ForegroundColor Yellow
Write-Host ""
npm run dev
