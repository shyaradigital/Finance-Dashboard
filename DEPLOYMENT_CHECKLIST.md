# Pre-Deployment Checklist

Use this checklist before deploying to Render to ensure everything is ready.

## ✅ Code Preparation

- [ ] All code is committed to Git
- [ ] Code is pushed to GitHub repository
- [ ] No `.env` files are committed (check `.gitignore`)
- [ ] All dependencies are in `package.json` files
- [ ] No hardcoded secrets or API URLs in code

## ✅ Environment Variables Ready

Generate secrets using:
```bash
node scripts/generate-secrets.js
```

### Backend Variables Needed:
- [ ] `JWT_SECRET` (32+ characters)
- [ ] `JWT_REFRESH_SECRET` (32+ characters)
- [ ] `ENCRYPTION_KEY` (32+ characters, optional)
- [ ] `FRONTEND_URL` (will set after frontend deploys)

### Frontend Variables Needed:
- [ ] `VITE_API_URL` (backend API URL, e.g., `https://finance-tracker-backend.onrender.com/api`)

## ✅ Database Setup

- [ ] PostgreSQL database will be created automatically by Render (if using `render.yaml`)
- [ ] Or manually create database and note the connection string

## ✅ Build Commands Verified

### Backend:
- Build: `cd backend && npm install && npm run build && npm run prisma:generate`
- Start: `cd backend && npm run prisma:migrate:deploy && npm start`

### Frontend:
- Build: `npm install && npm run build`
- Publish: `dist` directory

## ✅ Testing Locally

- [ ] Backend runs locally without errors
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Database migrations run successfully
- [ ] API endpoints work correctly
- [ ] Frontend connects to backend API

## ✅ Render Account

- [ ] Render account created
- [ ] GitHub account connected to Render
- [ ] Repository is accessible from Render

## ✅ Deployment Steps

1. [ ] Push code to GitHub
2. [ ] Create Blueprint on Render (or manual setup)
3. [ ] Wait for database to be created
4. [ ] Wait for backend to deploy
5. [ ] Wait for frontend to deploy
6. [ ] Set environment variables
7. [ ] Update `FRONTEND_URL` in backend with frontend URL
8. [ ] Restart backend service
9. [ ] Test deployment

## ✅ Post-Deployment Testing

- [ ] Backend health check: `https://your-backend.onrender.com/health`
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] API calls from frontend work
- [ ] Database operations work
- [ ] No CORS errors in browser console

## ✅ Security Checklist

- [ ] All secrets are in Render environment variables (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled (already in code)

## Common Issues to Watch For

- **Build fails**: Check logs, verify all dependencies are in `package.json`
- **Database connection fails**: Verify `DATABASE_URL` is correct
- **CORS errors**: Ensure `FRONTEND_URL` matches actual frontend URL
- **401 errors**: Check JWT secrets are set correctly
- **Migration fails**: Check Prisma schema is up to date

## Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Check [RENDER_QUICK_START.md](./RENDER_QUICK_START.md) for quick setup
- Review Render logs in dashboard
- Check service status in Render dashboard

