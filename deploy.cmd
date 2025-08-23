@echo off
REM Render CLI Deployment Script for School Store Application
REM Command Prompt Version

setlocal enabledelayedexpansion

REM Configuration
set BACKEND_SERVICE=school-store-backend
set FRONTEND_SERVICE=school-store-frontend
set PROJECT_ROOT=%cd%
set BACKEND_PATH=%PROJECT_ROOT%\school_store_backend
set FRONTEND_PATH=%PROJECT_ROOT%\school_store_frontend

REM Parse arguments
set ACTION=all
set SKIP_BUILD=0
set API_KEY=%RENDER_API_KEY%

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="backend" set ACTION=backend
if /i "%~1"=="frontend" set ACTION=frontend
if /i "%~1"=="status" set ACTION=status
if /i "%~1"=="logs" set ACTION=logs
if /i "%~1"=="all" set ACTION=all
if /i "%~1"=="--skip-build" set SKIP_BUILD=1
if /i "%~1"=="--api-key" (
    set API_KEY=%~2
    shift
)
shift
goto :parse_args
:args_done

REM Main execution
echo ========================================
echo School Store Render CLI Deployment
echo ========================================
echo.

REM Check prerequisites
call :check_prerequisites
if %ERRORLEVEL% neq 0 exit /b 1

REM Execute based on action
if /i "%ACTION%"=="all" (
    call :deploy_all
) else if /i "%ACTION%"=="backend" (
    call :deploy_backend
) else if /i "%ACTION%"=="frontend" (
    call :deploy_frontend
) else if /i "%ACTION%"=="status" (
    call :show_status
) else if /i "%ACTION%"=="logs" (
    call :show_logs
) else (
    echo Invalid action: %ACTION%
    call :show_usage
    exit /b 1
)

echo.
echo ========================================
echo Deployment script completed
echo ========================================
exit /b 0

REM ===== Functions =====

:check_prerequisites
echo Checking prerequisites...

REM Check Render CLI
render --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Render CLI is not installed
    echo Install with: npm install -g @render-oss/render-cli
    exit /b 1
)
echo [OK] Render CLI is installed

REM Check API key
if "%API_KEY%"=="" (
    echo [ERROR] RENDER_API_KEY is not set
    echo Set with: set RENDER_API_KEY=your-api-key
    exit /b 1
)
echo [OK] API key is configured

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Node.js is not installed - required for frontend build
) else (
    echo [OK] Node.js is installed
)

REM Verify authentication
render whoami >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Authentication failed
    echo Check your API key and try again
    exit /b 1
)
echo [OK] Authenticated with Render
echo.
exit /b 0

:deploy_backend
echo.
echo Deploying backend service...
cd /d "%BACKEND_PATH%"

REM Check requirements.txt
if not exist requirements.txt (
    echo [ERROR] requirements.txt not found in backend directory
    cd /d "%PROJECT_ROOT%"
    exit /b 1
)

REM Deploy
echo Triggering backend deployment...
render deploy --service %BACKEND_SERVICE%
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend deployment failed
    cd /d "%PROJECT_ROOT%"
    exit /b 1
)

echo [SUCCESS] Backend deployment triggered
cd /d "%PROJECT_ROOT%"
exit /b 0

:deploy_frontend
echo.
echo Deploying frontend service...
cd /d "%FRONTEND_PATH%"

REM Build if not skipped
if %SKIP_BUILD%==0 (
    echo Building frontend...
    
    echo Installing dependencies...
    call npm install --silent
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies
        cd /d "%PROJECT_ROOT%"
        exit /b 1
    )
    
    echo Running build...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Build failed
        cd /d "%PROJECT_ROOT%"
        exit /b 1
    )
    
    echo [SUCCESS] Frontend built successfully
)

REM Check dist directory
if not exist dist (
    echo [ERROR] dist directory not found
    echo Run build first or remove --skip-build flag
    cd /d "%PROJECT_ROOT%"
    exit /b 1
)

REM Deploy
echo Triggering frontend deployment...
render deploy --service %FRONTEND_SERVICE% --path dist
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend deployment failed
    cd /d "%PROJECT_ROOT%"
    exit /b 1
)

echo [SUCCESS] Frontend deployment triggered
cd /d "%PROJECT_ROOT%"
exit /b 0

:deploy_all
echo.
echo Deploying all services...

REM Check for render.yaml
if exist render.yaml (
    echo Using render.yaml for blueprint deployment...
    render blueprint deploy --file render.yaml
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Blueprint deployment failed
        exit /b 1
    )
    echo [SUCCESS] Blueprint deployment triggered
) else (
    call :deploy_backend
    if %ERRORLEVEL% neq 0 exit /b 1
    
    call :deploy_frontend
    if %ERRORLEVEL% neq 0 exit /b 1
)

echo.
echo [SUCCESS] All deployments triggered successfully!
echo Monitor at: https://dashboard.render.com
exit /b 0

:show_status
echo.
echo Fetching service status...
echo.
echo Backend Service (%BACKEND_SERVICE%):
render services get --name %BACKEND_SERVICE%
echo.
echo Frontend Service (%FRONTEND_SERVICE%):
render services get --name %FRONTEND_SERVICE%
echo.
echo Recent Backend Deployments:
render deploys list --service %BACKEND_SERVICE% --limit 3
echo.
echo Recent Frontend Deployments:
render deploys list --service %FRONTEND_SERVICE% --limit 3
exit /b 0

:show_logs
echo.
echo Streaming backend logs (Press Ctrl+C to stop)...
render logs --service %BACKEND_SERVICE% --follow
exit /b 0

:show_usage
echo.
echo Usage: deploy.cmd [action] [options]
echo.
echo Actions:
echo   all       - Deploy both backend and frontend (default)
echo   backend   - Deploy backend only
echo   frontend  - Deploy frontend only  
echo   status    - Show deployment status
echo   logs      - Stream backend logs
echo.
echo Options:
echo   --skip-build     - Skip frontend build
echo   --api-key KEY    - Use specific API key
echo.
echo Examples:
echo   deploy.cmd                    - Deploy everything
echo   deploy.cmd backend            - Deploy backend only
echo   deploy.cmd frontend --skip-build - Deploy frontend without building
echo   deploy.cmd status             - Check deployment status
exit /b 0