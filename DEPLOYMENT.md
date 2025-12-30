# Deployment Guide for Render

This guide will help you deploy the Finance Tracker application to Render.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render account (sign up at [render.com](https://render.com))

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   - Make sure all your code is committed and pushed to your GitHub repository

2. **Create a new Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   - After the blueprint is created, you'll need to set the `FRONTEND_URL` environment variable
   - Go to your backend service → Environment
   - Add `FRONTEND_URL` with your frontend URL (e.g., `https://finance-tracker-frontend.onrender.com`)
   - Add `VITE_API_URL` to your frontend service with your backend URL (e.g., `https://finance-tracker-backend.onrender.com/api`)

4. **Deploy**
   - Render will automatically deploy all services defined in `render.yaml`
   - The database will be created automatically
   - Migrations will run automatically on first deploy

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `finance-tracker-db`
   - **Database**: `finance_tracker`
   - **User**: `finance_tracker_user`
   - **Region**: Choose closest to you
   - **Plan**: Free (or Standard for production)
4. Click "Create Database"
5. Copy the **Internal Database URL** (you'll need this)

#### Step 2: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finance-tracker-backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm run prisma:migrate:deploy && npm start`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `DATABASE_URL` = (Internal Database URL from Step 1)
   - `JWT_SECRET` = (Generate a random 32+ character string)
   - `JWT_REFRESH_SECRET` = (Generate a random 32+ character string)
   - `FRONTEND_URL` = (Will set after frontend is deployed, e.g., `https://finance-tracker-frontend.onrender.com`)
   - `ENCRYPTION_KEY` = (Generate a random 32+ character string, optional)
5. Click "Create Web Service"

#### Step 3: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finance-tracker-frontend`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: (leave empty - root of repo)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://finance-tracker-backend.onrender.com/api`
5. Click "Create Static Site"

#### Step 4: Update Backend CORS

1. Go back to your backend service
2. Update `FRONTEND_URL` environment variable with your frontend URL
3. Restart the service

## Environment Variables Reference

### Backend Required Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Render if using internal database)
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (min 32 characters)
- `NODE_ENV` - Set to `production`
- `PORT` - Server port (default: 3000, Render sets this automatically)
- `FRONTEND_URL` - Your frontend URL for CORS (e.g., `https://finance-tracker-frontend.onrender.com`)

### Backend Optional Variables

- `ENCRYPTION_KEY` - Key for vault encryption (min 32 characters)

### Frontend Required Variables

- `VITE_API_URL` - Your backend API URL (e.g., `https://finance-tracker-backend.onrender.com/api`)

## Generating Secure Secrets

You can generate secure random strings using:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use an online generator like: https://randomkeygen.com/
```

## Post-Deployment

1. **Test the API**: Visit `https://finance-tracker-backend.onrender.com/api/health` (if you have a health endpoint)
2. **Test the Frontend**: Visit your frontend URL
3. **Check Logs**: Monitor both services in Render dashboard for any errors

## Troubleshooting

### Backend Issues

- **Database Connection Errors**: Make sure `DATABASE_URL` is set correctly and uses the internal database URL
- **Migration Errors**: Check logs for Prisma migration errors. You may need to run migrations manually
- **Port Errors**: Render sets `PORT` automatically, don't hardcode it

### Frontend Issues

- **API Connection Errors**: Verify `VITE_API_URL` is set correctly and matches your backend URL
- **Build Errors**: Check that all dependencies are in `package.json` and `node_modules` is not committed

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` in backend matches your actual frontend URL
2. **401 Unauthorized**: Check that JWT secrets are set and consistent
3. **Database Migration Fails**: Ensure Prisma schema is up to date and migrations are in the repo

## Updating Your Deployment

1. Push changes to your GitHub repository
2. Render will automatically detect changes and redeploy
3. For database schema changes, migrations will run automatically on backend restart

## Cost Considerations

- **Free Tier**: 
  - Static sites are free
  - Web services sleep after 15 minutes of inactivity (free tier)
  - PostgreSQL has a free tier with 90-day retention
- **Starter Plan**: 
  - $7/month per web service (always on)
  - Better for production use

## Security Notes

1. Never commit `.env` files or secrets to your repository
2. Use Render's environment variable management
3. Keep your JWT secrets secure and rotate them periodically
4. Use HTTPS (automatically provided by Render)

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com

