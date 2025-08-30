# Vercel Deployment Guide for School Store Application

This guide will help you deploy your School Store application (both frontend and backend) to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional but recommended)
   ```bash
   npm install -g vercel
   ```
3. A PostgreSQL database (you can use services like Supabase, Neon, or Vercel Postgres)

## Project Structure

The project is now configured for Vercel deployment with the following structure:
- `api/` - Backend API serverless functions
- `school_store_frontend/` - React frontend application
- `school_store_backend/` - Original backend source code
- `vercel.json` - Vercel configuration file

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel CLI**
   ```bash
   vercel login
   ```

2. **Deploy the application**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No (for first deployment)
   - Project name: `school-store` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: No

3. **Set Environment Variables**
   ```bash
   # Set production environment variables
   vercel env add DATABASE_URL production
   vercel env add SECRET_KEY production
   ```
   
   Enter the values when prompted:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: A secure random string for sessions

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import project on Vercel Dashboard**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Other
     - Build Command: `cd school_store_frontend && npm install --legacy-peer-deps && npm run build`
     - Output Directory: `school_store_frontend/dist`
     - Install Command: `npm install --prefix school_store_frontend --legacy-peer-deps`

3. **Add Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add the following:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SECRET_KEY`: A secure random string
     - `PYTHON_VERSION`: `3.9`

4. **Deploy**
   - Click "Deploy" to start the deployment

## Database Setup

### Using Vercel Postgres (Recommended for Vercel)

1. Go to your Vercel dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Copy the connection string
5. Add it as `DATABASE_URL` environment variable

### Using External PostgreSQL (Supabase, Neon, etc.)

1. Create a database on your preferred service
2. Get the connection string
3. Make sure it starts with `postgresql://` (not `postgres://`)
4. Add it as `DATABASE_URL` environment variable

## Post-Deployment Configuration

### 1. Verify API Endpoints
Your API will be available at:
- Development: `https://your-project.vercel.app/api`
- Production: `https://your-domain.com/api`

### 2. Test the Application
1. Visit your deployed URL
2. Test user registration and login
3. Verify store functionality
4. Check points management

### 3. Monitor Logs
```bash
vercel logs
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `SECRET_KEY` | Secret key for sessions | `your-secret-key-here` |
| `PYTHON_VERSION` | Python runtime version | `3.9` |

## Troubleshooting

### Build Failures
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `requirements.txt` and `package.json`
- Verify Node.js and Python versions

### API Not Working
- Check function logs: `vercel logs --filter=error`
- Verify environment variables are set correctly
- Ensure database connection is working

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is configured if required

### Frontend API Connection Issues
- The frontend automatically uses `/api` for production
- Check browser console for CORS errors
- Verify API routes are returning data

## Local Development

To test Vercel functions locally:

```bash
vercel dev
```

This will simulate the Vercel environment locally.

## Updating the Application

1. Make your changes locally
2. Test with `vercel dev`
3. Deploy to preview: `vercel`
4. Deploy to production: `vercel --prod`

## Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Support

- Vercel Documentation: https://vercel.com/docs
- Check deployment logs in Vercel dashboard
- Function logs: Available in the Functions tab

## Migration from Render

If you're migrating from Render:
1. Export your database from Render
2. Import to your new PostgreSQL provider
3. Update the `DATABASE_URL` in Vercel
4. Deploy using the steps above

Your application is now ready for Vercel deployment! The configuration handles both the Flask backend (as serverless functions) and the React frontend (as static files).