# Render CLI Deployment Script for School Store Application
# PowerShell Version

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "backend", "frontend", "status", "logs")]
    [string]$Action = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = $env:RENDER_API_KEY,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false
)

# Configuration
$BackendService = "school-store-backend"
$FrontendService = "school-store-frontend"
$ProjectRoot = Get-Location
$BackendPath = Join-Path $ProjectRoot "school_store_backend"
$FrontendPath = Join-Path $ProjectRoot "school_store_frontend"

# Color functions
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Info { Write-Host $args[0] -ForegroundColor Cyan }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if Render CLI is installed
    try {
        $null = render --version
        Write-Success "✓ Render CLI is installed"
    } catch {
        Write-Error "✗ Render CLI is not installed"
        Write-Info "Install with: npm install -g @render-oss/render-cli"
        exit 1
    }
    
    # Check API key
    if (-not $ApiKey) {
        Write-Error "✗ RENDER_API_KEY is not set"
        Write-Info "Set with: `$env:RENDER_API_KEY = 'your-api-key'"
        exit 1
    }
    Write-Success "✓ API key is configured"
    
    # Check Node.js for frontend build
    try {
        $null = node --version
        Write-Success "✓ Node.js is installed"
    } catch {
        Write-Warning "⚠ Node.js is not installed (required for frontend build)"
    }
    
    # Verify authentication
    try {
        $whoami = render whoami 2>&1
        if ($whoami -match "error") {
            throw "Authentication failed"
        }
        Write-Success "✓ Authenticated with Render"
    } catch {
        Write-Error "✗ Authentication failed"
        Write-Info "Check your API key and try again"
        exit 1
    }
}

# Deploy backend
function Deploy-Backend {
    Write-Info "`nDeploying backend service..."
    
    Set-Location $BackendPath
    
    # Check if requirements.txt exists
    if (-not (Test-Path "requirements.txt")) {
        Write-Error "requirements.txt not found in backend directory"
        return $false
    }
    
    # Deploy
    try {
        Write-Info "Triggering backend deployment..."
        $result = render deploy --service $BackendService 2>&1
        
        if ($result -match "error") {
            throw $result
        }
        
        Write-Success "✓ Backend deployment triggered successfully"
        Write-Info "Check deployment status with: render deploys list --service $BackendService"
        return $true
    } catch {
        Write-Error "✗ Backend deployment failed: $_"
        return $false
    } finally {
        Set-Location $ProjectRoot
    }
}

# Deploy frontend
function Deploy-Frontend {
    Write-Info "`nDeploying frontend service..."
    
    Set-Location $FrontendPath
    
    # Build frontend if not skipped
    if (-not $SkipBuild) {
        Write-Info "Building frontend..."
        
        # Install dependencies
        Write-Info "Installing dependencies..."
        npm install --silent
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "✗ Failed to install dependencies"
            Set-Location $ProjectRoot
            return $false
        }
        
        # Build
        Write-Info "Running build..."
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "✗ Build failed"
            Set-Location $ProjectRoot
            return $false
        }
        
        Write-Success "✓ Frontend built successfully"
    }
    
    # Check if dist directory exists
    if (-not (Test-Path "dist")) {
        Write-Error "dist directory not found. Run build first or remove -SkipBuild flag"
        Set-Location $ProjectRoot
        return $false
    }
    
    # Deploy
    try {
        Write-Info "Triggering frontend deployment..."
        $result = render deploy --service $FrontendService --path dist 2>&1
        
        if ($result -match "error") {
            throw $result
        }
        
        Write-Success "✓ Frontend deployment triggered successfully"
        Write-Info "Check deployment status with: render deploys list --service $FrontendService"
        return $true
    } catch {
        Write-Error "✗ Frontend deployment failed: $_"
        return $false
    } finally {
        Set-Location $ProjectRoot
    }
}

# Show service status
function Show-Status {
    Write-Info "`nFetching service status..."
    
    try {
        Write-Info "`nBackend Service ($BackendService):"
        render services get --name $BackendService
        
        Write-Info "`nFrontend Service ($FrontendService):"
        render services get --name $FrontendService
        
        Write-Info "`nRecent Deployments:"
        Write-Info "Backend:"
        render deploys list --service $BackendService --limit 3
        
        Write-Info "`nFrontend:"
        render deploys list --service $FrontendService --limit 3
    } catch {
        Write-Error "Failed to fetch status: $_"
    }
}

# Show logs
function Show-Logs {
    Write-Info "Streaming backend logs (Ctrl+C to stop)..."
    render logs --service $BackendService --follow
}

# Deploy all services using render.yaml
function Deploy-All-Blueprint {
    Write-Info "`nDeploying all services using render.yaml..."
    
    if (-not (Test-Path "render.yaml")) {
        Write-Error "render.yaml not found in project root"
        return $false
    }
    
    try {
        Write-Info "Triggering blueprint deployment..."
        $result = render blueprint deploy --file render.yaml 2>&1
        
        if ($result -match "error") {
            throw $result
        }
        
        Write-Success "✓ Blueprint deployment triggered successfully"
        Write-Info "Services are being deployed. Check status with: deploy.ps1 -Action status"
        return $true
    } catch {
        Write-Error "✗ Blueprint deployment failed: $_"
        return $false
    }
}

# Main execution
function Main {
    Write-Info "="*50
    Write-Info "School Store Render CLI Deployment Script"
    Write-Info "="*50
    
    # Check prerequisites
    Test-Prerequisites
    
    # Execute based on action
    switch ($Action) {
        "all" {
            if (Test-Path "render.yaml") {
                $success = Deploy-All-Blueprint
            } else {
                $backendSuccess = Deploy-Backend
                $frontendSuccess = Deploy-Frontend
                $success = $backendSuccess -and $frontendSuccess
            }
            
            if ($success) {
                Write-Success "`n✓ Deployment completed successfully!"
                Write-Info "Monitor deployment at: https://dashboard.render.com"
            } else {
                Write-Error "`n✗ Deployment failed. Check the errors above."
                exit 1
            }
        }
        "backend" {
            $success = Deploy-Backend
            if (-not $success) { exit 1 }
        }
        "frontend" {
            $success = Deploy-Frontend
            if (-not $success) { exit 1 }
        }
        "status" {
            Show-Status
        }
        "logs" {
            Show-Logs
        }
    }
    
    Write-Info "`n"
    Write-Info "="*50
    Write-Success "Script completed"
}

# Run main function
Main