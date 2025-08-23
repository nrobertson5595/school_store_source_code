# Render CLI Deployment Guide for School Store Application

This guide provides comprehensive instructions for deploying the School Store application using the Render CLI on Windows.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installing Render CLI](#installing-render-cli)
3. [Authentication](#authentication)
4. [Project Setup](#project-setup)
5. [Deployment](#deployment)
6. [Monitoring and Management](#monitoring-and-management)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:
- A Render account (sign up at https://render.com)
- Node.js installed (for npm)
- Git installed and configured
- Your code pushed to a GitHub/GitLab repository

## Installing Render CLI

### Option 1: Using npm (Recommended)

**PowerShell:**
```powershell
# Install Render CLI globally
npm install -g @render-oss/render-cli

# Verify installation
render --version
```

**Command Prompt:**
```cmd
rem Install Render CLI globally
npm install -g @render-oss/render-cli

rem Verify installation
render --version
```

### Option 2: Using Chocolatey (Alternative)

**PowerShell (Run as Administrator):**
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Render CLI
choco install render-cli
```

## Authentication

### Step 1: Generate API Key

1. Log in to your Render dashboard at https://dashboard.render.com
2. Navigate to Account Settings → API Keys
3. Click "Create API Key"
4. Name it (e.g., "CLI Deployment")
5. Copy the generated key

### Step 2: Configure CLI Authentication

**PowerShell:**
```powershell
# Set API key as environment variable (temporary)
$env:RENDER_API_KEY = "your-api-key-here"

# Or set permanently (user level)
[System.Environment]::SetEnvironmentVariable("RENDER_API_KEY", "your-api-key-here", "User")

# Verify authentication
render whoami
```

**Command Prompt:**
```cmd
rem Set API key as environment variable (temporary)
set RENDER_API_KEY=your-api-key-here

rem Or set permanently
setx RENDER_API_KEY "your-api-key-here"

rem Verify authentication
render whoami
```

## Project Setup

### Step 1: Initialize Render Project

Navigate to your project root:

**PowerShell/CMD:**
```bash
cd C:\Users\nrobe\Downloads\school_store_source_code
```

### Step 2: Create Services Using CLI

Since we have a `render.yaml` file, we can use it to create services:

**PowerShell/CMD:**
```bash
# Create services from render.yaml
render blueprint deploy

# Or create services individually
render services create --name school-store-backend --type web --repo https://github.com/yourusername/school-store
render services create --name school-store-frontend --type static --repo https://github.com/yourusername/school-store
```

## Deployment

### Option 1: Manual Deployment Commands

**Deploy Backend:**
```bash
# Navigate to backend directory
cd school_store_backend

# Deploy the backend service
render deploy --service school-store-backend

# Or trigger a deployment with specific commit
render deploy --service school-store-backend --commit main
```

**Deploy Frontend:**
```bash
# Navigate to frontend directory
cd ..\school_store_frontend

# Build frontend locally first
npm install
npm run build

# Deploy the static site
render deploy --service school-store-frontend --path dist
```

### Option 2: Using Deployment Script

Create and use the automated deployment script (see deploy.ps1 or deploy.cmd below).

## Monitoring and Management

### Check Service Status
```bash
# List all services
render services list

# Get service details
render services get --name school-store-backend

# View logs
render logs --service school-store-backend --tail 100

# Stream logs in real-time
render logs --service school-store-backend --follow
```

### Environment Variables Management
```bash
# List environment variables
render env list --service school-store-backend

# Set environment variable
render env set --service school-store-backend KEY=value

# Remove environment variable
render env unset --service school-store-backend KEY
```

### Scaling and Performance
```bash
# Check service metrics
render metrics --service school-store-backend

# Scale service (if on paid plan)
render services scale --name school-store-backend --num-instances 2
```

## Quick Deploy Commands

### Full Deployment (Both Services)
```bash
# From project root
render blueprint deploy --file render.yaml
```

### Backend Only
```bash
render deploy --service school-store-backend --branch main
```

### Frontend Only
```bash
cd school_store_frontend
npm run build
render deploy --service school-store-frontend --path dist
```

## Environment Configuration

### Required Environment Variables

Create a `.env.render` file for local CLI usage:
```env
# Database
DATABASE_URL=your-postgres-url-here

# Frontend URL (for CORS)
FRONTEND_URL=https://school-store-frontend.onrender.com

# Backend URL (for frontend API calls)
VITE_API_URL=https://school-store-backend.onrender.com

# Python version
PYTHON_VERSION=3.11
```

### Setting Environment Variables via CLI
```bash
# Set multiple environment variables at once
render env set --service school-store-backend \
  DATABASE_URL="your-database-url" \
  FRONTEND_URL="https://school-store-frontend.onrender.com" \
  PYTHON_VERSION="3.11"
```

## Rollback Procedures

### Rollback to Previous Deploy
```bash
# List recent deploys
render deploys list --service school-store-backend

# Rollback to specific deploy
render deploys rollback --service school-store-backend --deploy-id deploy-xxxxx
```

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Failed**
   ```bash
   # Check if API key is set
   echo %RENDER_API_KEY%  # CMD
   echo $env:RENDER_API_KEY  # PowerShell
   
   # Re-authenticate
   set RENDER_API_KEY=your-new-api-key
   ```

2. **Service Not Found**
   ```bash
   # List all services to verify names
   render services list
   
   # Check current project association
   render config get
   ```

3. **Build Failures**
   ```bash
   # View build logs
   render builds logs --service school-store-backend --build-id build-xxxxx
   
   # Clear build cache
   render builds clear-cache --service school-store-backend
   ```

4. **Port Binding Issues**
   ```bash
   # Ensure your app listens on $PORT
   # Backend should use: port = int(os.environ.get("PORT", 10000))
   ```

## Useful CLI Aliases (PowerShell)

Add these to your PowerShell profile for quick access:

```powershell
# Add to $PROFILE
function Deploy-Backend { render deploy --service school-store-backend }
function Deploy-Frontend { 
    cd school_store_frontend
    npm run build
    render deploy --service school-store-frontend --path dist
    cd ..
}
function Show-Logs { render logs --service school-store-backend --follow }
function Deploy-All { render blueprint deploy }

# Usage
Deploy-Backend
Deploy-Frontend
Show-Logs
Deploy-All
```

## Next Steps

1. Set up continuous deployment with GitHub/GitLab integration
2. Configure custom domains
3. Set up monitoring alerts
4. Implement staging environments

## Support

- Render CLI Documentation: https://render.com/docs/cli
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/renderinc/cli/issues