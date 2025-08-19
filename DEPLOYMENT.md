# School Store Deployment Guide

This guide explains how to deploy the School Store application to Render.

## Architecture

- **Backend**: Flask API deployed as Render Web Service
- **Frontend**: React SPA deployed as Render Static Site  
- **Database**: Render PostgreSQL (free tier)

## Prerequisites

1. GitHub account
2. Render account (free)
3. Project pushed to GitHub repository

## Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing this project
5. Render will automatically detect the `render.yaml` file and create:
   - PostgreSQL database: `school-store-db`
   - Web Service: `school-store-backend` 
   - Static Site: `school-store-frontend`

### 3. Environment Variables

The following environment variables will be automatically configured:

**Backend:**
- `DATABASE_URL` - Auto-generated PostgreSQL connection string
- `SECRET_KEY` - Auto-generated secure key
- `FLASK_ENV=production`

**Frontend:**
- `VITE_API_BASE_URL` - Auto-configured to backend URL

### 4. Monitor Deployment

- Backend will be available at: `https://school-store-backend.onrender.com`
- Frontend will be available at: `https://school-store-frontend.onrender.com`
- Health check: `https://school-store-backend.onrender.com/api/health`

## Free Tier Limitations

- **Backend**: 750 build hours/month, sleeps after 15min inactivity
- **Frontend**: Unlimited builds and bandwidth
- **Database**: 1GB storage, 100 connections

## Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Verify all dependencies in `requirements.txt`
- Ensure `render_runner.py` is correctly configured

### Frontend Issues  
- Verify build command succeeds locally: `npm run build`
- Check environment variables are set correctly
- Ensure API calls use relative paths or environment variable

### Database Issues
- Check DATABASE_URL environment variable
- Verify PostgreSQL connection in logs
- Database auto-migrates on first deployment

## Monitoring

- **Health Check**: `/api/health` endpoint
- **Logs**: Available in Render dashboard
- **Metrics**: Basic metrics in Render dashboard

## Maintenance

### Updates
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. Monitor deployment logs

### Database Backup
- Use Render dashboard database tools
- Export data via pgAdmin if needed

### Scaling
- Upgrade to paid plans for:
  - No sleep mode
  - More database storage
  - Faster builds
  - Priority support