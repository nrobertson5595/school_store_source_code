# Render Deployment Guide for School Store Application

This guide will walk you through deploying your School Store application to Render as a full-stack application where Flask serves both the API and the frontend.

## Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com) if you haven't already
3. **Git**: Ensure Git is installed and configured on your machine

## Configuration Overview

The application is configured for a **full-stack deployment** where:
- Flask serves both the API endpoints and the static frontend files
- Frontend and backend run on the same domain (no CORS issues)
- Frontend uses relative paths (`/api`) to communicate with the backend
- PostgreSQL database is automatically provisioned by Render

## Native Dependencies Note

The frontend build process uses several native dependencies that require platform-specific binaries:
- **@rollup/rollup**: Used by Vite for bundling JavaScript modules
- **lightningcss**: Used by @tailwindcss/vite for CSS optimization and processing  
- **esbuild**: Used by Vite internally for fast bundling and minification

These are configured as optional dependencies with platform-specific binaries in package.json and will be automatically rebuilt during deployment via the postinstall script:
```json
"postinstall": "npm rebuild @rollup/rollup-linux-x64-gnu lightningcss esbuild || true"
```

The optional dependencies ensure the correct platform binaries are available during the Render build process.

## Step 1: Prepare Your Repository

### 1.1 Ensure All Files Are Committed

First, check your git status and commit all changes:

```bash
git add .
git commit -m "Configure for Render deployment"
```

### 1.2 Push to GitHub

If you haven't already created a GitHub repository:

```bash
# Create a new repository on GitHub (via web interface)
# Then add it as origin:
git remote add origin https://github.com/YOUR_USERNAME/school-store.git
git branch -M main
git push -u origin main
```

If you already have a repository:

```bash
git push origin main
```

## Step 2: Deploy to Render

### 2.1 Connect Your GitHub Account

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click on your profile icon → **Account Settings**
3. Go to the **GitHub** section
4. Click **Connect GitHub** and authorize Render

### 2.2 Create New Blueprint Instance

1. From the Render Dashboard, click **New +** → **Blueprint**
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file
4. Review the configuration:
   - **Service Name**: `school-store-app`
   - **Database Name**: `school-store-db`
5. Click **Apply**

### 2.3 Monitor Deployment

1. Render will start building your application
2. You can monitor the progress in the **Events** tab
3. The build process will:
   - Install Node.js dependencies
   - Build the React frontend
   - Copy frontend files to Flask's static directory
   - Install Python dependencies
   - Start the Gunicorn server

### 2.4 Wait for Deployment

The first deployment typically takes 10-15 minutes. You'll see:
- "Build started"
- Frontend build logs
- Python dependency installation
- "Deploy live for service"

## Step 3: Verify Deployment

### 3.1 Access Your Application

Once deployed, your application will be available at:
```
https://school-store-app.onrender.com
```

(The exact URL will be shown in your Render dashboard)

### 3.2 Test the Application

1. **Homepage**: Navigate to the URL - you should see the login page
2. **API Health Check**: Visit `/api/health` - should return `{"status": "healthy"}`
3. **Login**: Use the default teacher credentials:
   - Username: `teacher`
   - Password: `pass123`

### 3.3 Seed Initial Data (Optional)

If you need to add initial data, you can run the seed script:

1. Go to your service in Render Dashboard
2. Click on **Shell** tab
3. Run:
```bash
cd school_store_backend
python seed_data.py
```

## Step 4: Environment Variables (Already Configured)

The following environment variables are automatically set by Render:

- `DATABASE_URL`: Connection string for PostgreSQL (auto-configured)
- `SECRET_KEY`: Randomly generated secret key for Flask sessions
- `FLASK_ENV`: Set to `production`
- `NODE_ENV`: Set to `production`

## Step 5: Custom Domain (Optional)

To add a custom domain:

1. Go to your service in Render Dashboard
2. Click **Settings** → **Custom Domains**
3. Add your domain and follow the DNS configuration instructions

## Troubleshooting

### Build Failures

If the build fails:
1. Check the build logs in Render Dashboard
2. Common issues:
   - Missing dependencies in `requirements.txt`
   - Node version incompatibility (add `.nvmrc` file if needed)
   - Build script permissions (already handled in our setup)

### Application Errors

If the application deploys but doesn't work:
1. Check the **Logs** tab in Render Dashboard
2. Verify database connection:
   - Ensure database is created and running
   - Check DATABASE_URL is properly set
3. Check browser console for frontend errors

### Database Issues

If you encounter database errors:
1. Ensure the database service is running (check Render Dashboard)
2. You may need to manually run migrations:
   ```bash
   # In Render Shell
   cd school_store_backend
   python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
   ```

### Slow Initial Load

Render free tier services sleep after 15 minutes of inactivity. The first request after sleeping takes 30-60 seconds. Consider upgrading to a paid plan for always-on service.

## Monitoring Your Application

### View Logs

1. Go to your service in Render Dashboard
2. Click on **Logs** tab
3. You can filter by:
   - Build logs
   - Deploy logs
   - Service logs

### Check Metrics

1. Go to your service in Render Dashboard
2. Click on **Metrics** tab
3. Monitor:
   - Request count
   - Response times
   - Memory usage
   - CPU usage

## Updating Your Application

To deploy updates:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. Render will automatically detect the push and redeploy

## Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - Limited to 750 hours/month across all free services
   - Database has 1GB storage limit

2. **Production Considerations**:
   - Set strong passwords for all user accounts
   - Regularly backup your database
   - Monitor application logs for errors
   - Consider implementing rate limiting

3. **Security**:
   - Never commit sensitive data to Git
   - Use environment variables for secrets
   - Keep dependencies updated
   - Enable 2FA on GitHub and Render accounts

## Next Steps

After successful deployment:

1. **Test all features**: Login, student management, store items, purchases
2. **Create teacher accounts**: Use the teacher dashboard to add teachers
3. **Add students**: Create student accounts for your class
4. **Configure store items**: Add items students can purchase
5. **Set up points system**: Configure how students earn points

## Support

If you encounter issues:
1. Check Render's [documentation](https://render.com/docs)
2. Review application logs in Render Dashboard
3. Check the [Render Community](https://community.render.com)

## Summary

Your School Store application is now configured for deployment on Render with:
- ✅ Full-stack deployment (Flask serves both API and frontend)
- ✅ PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Continuous deployment from GitHub
- ✅ Production-ready configuration
- ✅ Health monitoring endpoint
- ✅ Proper error logging

The application will be accessible at your Render URL once deployment completes!