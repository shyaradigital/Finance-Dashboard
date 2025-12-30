# Quick Start: Deploy to Render in 5 Minutes

## Prerequisites
- ✅ Code pushed to GitHub
- ✅ Render account (free at [render.com](https://render.com))

## Step-by-Step Deployment

### 1. Generate Secrets (Optional but Recommended)

Run this locally to generate secure secrets:
```bash
node scripts/generate-secrets.js
```

Save the output - you'll need these values.

### 2. Deploy Using Blueprint (Easiest Method)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### 3. Configure Environment Variables

After deployment starts, configure these:

#### Backend Service (`finance-tracker-backend`)
1. Go to the service → **Environment** tab
2. Add these variables:
   - `FRONTEND_URL` = `https://finance-tracker-frontend.onrender.com` (update after frontend deploys)
   - `JWT_SECRET` = (use generated secret or create one - min 32 chars)
   - `JWT_REFRESH_SECRET` = (use generated secret or create one - min 32 chars)
   - `ENCRYPTION_KEY` = (optional, use generated secret or create one - min 32 chars)

#### Frontend Service (`finance-tracker-frontend`)
1. Go to the service → **Environment** tab
2. Add:
   - `VITE_API_URL` = `https://finance-tracker-backend.onrender.com/api`

### 4. Update Backend FRONTEND_URL

1. Once frontend is deployed, copy its URL
2. Go to backend service → Environment
3. Update `FRONTEND_URL` with the frontend URL
4. Click **"Save Changes"** (service will restart)

### 5. Test Your Deployment

- **Backend Health**: `https://finance-tracker-backend.onrender.com/health`
- **Frontend**: Visit your frontend URL

## Manual Setup (Alternative)

If you prefer manual setup, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correct (auto-set if using Render database)

### Frontend can't connect to API
- Verify `VITE_API_URL` matches your backend URL
- Check backend CORS settings (`FRONTEND_URL` must match frontend URL)
- Check browser console for errors

### Database connection errors
- Ensure database is created and running
- Verify `DATABASE_URL` uses internal connection string
- Check database logs in Render dashboard

## Next Steps

1. ✅ Test user registration/login
2. ✅ Verify API endpoints work
3. ✅ Check database migrations ran successfully
4. ✅ Set up custom domain (optional)

## Support

- Render Docs: https://render.com/docs
- Check service logs in Render dashboard
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting

