# Render CLI Setup Script for Windows
# This script helps set up the Render CLI environment

param(
    [Parameter(Mandatory = $false)]
    [string]$ApiKey,
    
    [Parameter(Mandatory = $false)]
    [switch]$InstallCLI = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$Permanent = $false
)

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success { Write-Host "[✓] $($args[0])" -ForegroundColor Green }
function Write-Info { Write-Host "[i] $($args[0])" -ForegroundColor Blue }
function Write-Warning { Write-Host "[!] $($args[0])" -ForegroundColor Yellow }
function Write-Error { Write-Host "[✗] $($args[0])" -ForegroundColor Red }

Write-Header "Render CLI Setup for School Store Application"

# Step 1: Check/Install Node.js
Write-Info "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js is installed (version $nodeVersion)"
}
catch {
    Write-Error "Node.js is not installed"
    Write-Info "Please install Node.js from: https://nodejs.org/"
    Write-Info "After installing, run this script again"
    exit 1
}

# Step 2: Install Render CLI if requested
if ($InstallCLI) {
    Write-Info "Installing Render CLI..."
    try {
        npm install -g @render-oss/render-cli
        Write-Success "Render CLI installed successfully"
    }
    catch {
        Write-Error "Failed to install Render CLI"
        Write-Info "Try running as Administrator or use: npm install -g @render-oss/render-cli"
        exit 1
    }
}
else {
    # Check if CLI is installed
    try {
        $version = render --version
        Write-Success "Render CLI is already installed"
    }
    catch {
        Write-Warning "Render CLI is not installed"
        Write-Info "Run this script with -InstallCLI flag to install it"
        Write-Info "Or install manually with: npm install -g @render-oss/render-cli"
    }
}

# Step 3: Configure API Key
if ($ApiKey) {
    Write-Info "Configuring API key..."
    
    if ($Permanent) {
        # Set permanently at user level
        [System.Environment]::SetEnvironmentVariable("RENDER_API_KEY", $ApiKey, "User")
        Write-Success "API key set permanently (user level)"
        Write-Info "You may need to restart your terminal for changes to take effect"
    }
    else {
        # Set for current session
        $env:RENDER_API_KEY = $ApiKey
        Write-Success "API key set for current session"
    }
    
    # Test authentication
    Write-Info "Testing authentication..."
    try {
        $whoami = render whoami 2>&1 | Out-String
        if ($whoami -match "error" -or $whoami -match "unauthorized") {
            throw "Authentication failed"
        }
        Write-Success "Successfully authenticated with Render!"
        Write-Info "Logged in as: $whoami"
    }
    catch {
        Write-Error "Authentication failed - please check your API key"
        Write-Info "Get your API key from: https://dashboard.render.com/account/api-keys"
    }
}
else {
    if ($env:RENDER_API_KEY) {
        Write-Info "API key already configured in environment"
        
        # Test existing authentication
        try {
            $whoami = render whoami 2>&1 | Out-String
            if ($whoami -match "error" -or $whoami -match "unauthorized") {
                throw "Authentication failed"
            }
            Write-Success "Existing API key is valid"
        }
        catch {
            Write-Warning "Existing API key appears to be invalid"
            Write-Info "Run this script with -ApiKey parameter to set a new key"
        }
    }
    else {
        Write-Warning "No API key configured"
        Write-Info "To set up API key:"
        Write-Info "1. Get your key from: https://dashboard.render.com/account/api-keys"
        Write-Info "2. Run: .\setup-render-cli.ps1 -ApiKey 'your-key-here'"
        Write-Info "3. Add -Permanent flag to save permanently"
    }
}

# Step 4: Check project structure
Write-Header "Checking Project Structure"

$requiredFiles = @(
    "render.yaml",
    "deploy.ps1",
    "deploy.cmd",
    "school_store_backend\requirements.txt",
    "school_store_backend\src\main.py",
    "school_store_frontend\package.json"
)

$allPresent = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file"
    }
    else {
        Write-Error "$file (missing)"
        $allPresent = $false
    }
}

if ($allPresent) {
    Write-Success "All required files are present"
}
else {
    Write-Warning "Some files are missing - deployment may fail"
}

# Step 5: Display next steps
Write-Header "Setup Complete!"

Write-Info "Quick Start Commands:"
Write-Host ""
Write-Host "  Deploy everything:      " -NoNewline
Write-Host ".\deploy.ps1" -ForegroundColor Yellow
Write-Host "  Deploy backend only:    " -NoNewline
Write-Host ".\deploy.ps1 -Action backend" -ForegroundColor Yellow
Write-Host "  Deploy frontend only:   " -NoNewline
Write-Host ".\deploy.ps1 -Action frontend" -ForegroundColor Yellow
Write-Host "  Check status:          " -NoNewline
Write-Host ".\deploy.ps1 -Action status" -ForegroundColor Yellow
Write-Host "  View logs:             " -NoNewline
Write-Host ".\deploy.ps1 -Action logs" -ForegroundColor Yellow
Write-Host ""

if (-not $env:RENDER_API_KEY) {
    Write-Warning "Remember to set your API key before deploying!"
    Write-Info "Run: .\setup-render-cli.ps1 -ApiKey 'your-key' -Permanent"
}

Write-Info "For detailed instructions, see RENDER_CLI_DEPLOYMENT.md"
Write-Info "For quick reference, see RENDER_CLI_QUICKSTART.md"

# Step 6: Offer to create PowerShell aliases
Write-Host ""
$createAliases = Read-Host "Would you like to create PowerShell aliases for quick access? (y/n)"
if ($createAliases -eq 'y') {
    $profileContent = @"

# Render CLI Aliases for School Store
function Deploy-SchoolStore { & "$PWD\deploy.ps1" @args }
function Deploy-Backend { & "$PWD\deploy.ps1" -Action backend }
function Deploy-Frontend { & "$PWD\deploy.ps1" -Action frontend }
function Show-DeployStatus { & "$PWD\deploy.ps1" -Action status }
function Show-DeployLogs { & "$PWD\deploy.ps1" -Action logs }

Set-Alias -Name rsd -Value Deploy-SchoolStore
Set-Alias -Name rsdb -Value Deploy-Backend
Set-Alias -Name rsdf -Value Deploy-Frontend
Set-Alias -Name rsds -Value Show-DeployStatus
Set-Alias -Name rsdl -Value Show-DeployLogs

Write-Host "School Store Render aliases loaded. Commands:" -ForegroundColor Green
Write-Host "  rsd   - Deploy all" -ForegroundColor Yellow
Write-Host "  rsdb  - Deploy backend" -ForegroundColor Yellow
Write-Host "  rsdf  - Deploy frontend" -ForegroundColor Yellow
Write-Host "  rsds  - Show status" -ForegroundColor Yellow
Write-Host "  rsdl  - Show logs" -ForegroundColor Yellow
"@

    # Check if profile exists
    if (!(Test-Path $PROFILE)) {
        New-Item -ItemType File -Path $PROFILE -Force | Out-Null
    }
    
    # Add to profile
    Add-Content -Path $PROFILE -Value $profileContent
    Write-Success "Aliases added to PowerShell profile"
    Write-Info "Restart PowerShell or run: . `$PROFILE"
    Write-Info "Then use: rsd, rsdb, rsdf, rsds, rsdl"
}

Write-Host ""
Write-Success "Setup complete! Happy deploying! 🚀"