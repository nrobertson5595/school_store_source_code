# Render CLI Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Render CLI
```powershell
npm install -g @render-oss/render-cli
```

### 2. Get Your API Key
1. Go to https://dashboard.render.com
2. Navigate to Account Settings → API Keys
3. Create new API key
4. Copy the key

### 3. Set API Key

**PowerShell:**
```powershell
$env:RENDER_API_KEY = "rnd_xxxxxxxxxxxxx"
```

**Command Prompt:**
```cmd
set RENDER_API_KEY=rnd_xxxxxxxxxxxxx
```

### 4. Deploy Everything
```bash
# Using PowerShell script
.\deploy.ps1

# Using Command Prompt script
deploy.cmd

# Or using Render CLI directly
render blueprint deploy
```

## 📋 Common Commands

### Deploy Services
```bash
# Deploy all services
render blueprint deploy

# Deploy backend only
.\deploy.ps1 -Action backend

# Deploy frontend only
.\deploy.ps1 -Action frontend
```

### Check Status
```bash
# View service status
.\deploy.ps1 -Action status

# List all services
render services list

# View recent deployments
render deploys list --service school-store-backend
```

### View Logs
```bash
# Stream live logs
.\deploy.ps1 -Action logs

# View last 100 lines
render logs --service school-store-backend --tail 100
```

### Environment Variables
```bash
# Set a variable
render env set --service school-store-backend KEY=value

# List all variables
render env list --service school-store-backend
```

## 🔧 Troubleshooting

### API Key Not Working
```powershell
# Verify API key is set
echo $env:RENDER_API_KEY

# Test authentication
render whoami
```

### Build Failures
```bash
# View build logs
render builds logs --service school-store-backend

# Clear cache and retry
render builds clear-cache --service school-store-backend
```

### Service Not Starting
```bash
# Check logs for errors
render logs --service school-store-backend --tail 200

# Verify environment variables
render env list --service school-store-backend
```

## 📁 Project Structure Requirements

```
school_store_source_code/
├── render.yaml                 # Render configuration
├── deploy.ps1                  # PowerShell deployment script
├── deploy.cmd                  # CMD deployment script
├── .env.render.example         # Environment template
├── school_store_backend/
│   ├── requirements.txt        # Python dependencies
│   ├── runtime.txt            # Python version
│   └── src/
│       └── main.py           # FastAPI app
└── school_store_frontend/
    ├── package.json           # Node dependencies
    ├── vite.config.js        # Build configuration
    └── dist/                 # Build output (after npm run build)
```

## 🎯 Quick Deployment Checklist

- [ ] Render CLI installed (`render --version`)
- [ ] API key configured (`render whoami`)
- [ ] Repository pushed to GitHub/GitLab
- [ ] render.yaml file present
- [ ] Backend requirements.txt updated
- [ ] Frontend package.json updated
- [ ] Environment variables set in Render dashboard

## 💡 Pro Tips

1. **Use Scripts for Consistency**
   - PowerShell: `.\deploy.ps1`
   - CMD: `deploy.cmd`

2. **Monitor Deployments**
   ```bash
   # Watch deployment progress
   render deploys list --service school-store-backend --watch
   ```

3. **Set Up Aliases** (PowerShell)
   ```powershell
   # Add to $PROFILE
   Set-Alias deploy ".\deploy.ps1"
   Set-Alias render-status ".\deploy.ps1 -Action status"
   ```

4. **Automate with Git Hooks**
   ```bash
   # .git/hooks/pre-push
   #!/bin/sh
   render blueprint deploy --auto-deploy
   ```

## 📚 Resources

- [Full Deployment Guide](./RENDER_CLI_DEPLOYMENT.md)
- [Render CLI Docs](https://render.com/docs/cli)
- [Render Dashboard](https://dashboard.render.com)
- [Support Community](https://community.render.com)

## ⚡ Emergency Commands

```bash
# Rollback to previous version
render deploys rollback --service school-store-backend

# Stop a service
render services suspend --name school-store-backend

# Resume a service
render services resume --name school-store-backend

# Clear all caches
render builds clear-cache --service school-store-backend
render builds clear-cache --service school-store-frontend