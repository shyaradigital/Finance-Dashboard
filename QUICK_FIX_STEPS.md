# Quick Fix Steps - 404 Errors

## Current Configuration Status

✅ **Backend Environment Variables:** All correct
- DATABASE_URL: ✓
- FRONTEND_URL: ✓ (https://finance-tracker-frontend-rf1n.onrender.com)
- JWT_SECRET: ✓
- JWT_REFRESH_SECRET: ✓
- ENCRYPTION_KEY: ✓
- NODE_ENV: ✓
- PORT: ✓

❌ **Frontend Environment Variable:** Needs fixing
- VITE_API_URL: Currently `https://finance-tracker-backend-5li2.onrender.com`
- Should be: `https://finance-tracker-backend-5li2.onrender.com/api`

## Fix Steps

### Step 1: Update VITE_API_URL

1. Go to Render Dashboard
2. Click on **finance-tracker-frontend** service
3. Go to **Environment** tab
4. Find `VITE_API_URL` and click **Edit** (or the pencil icon)
5. Change the value from:
   ```
   https://finance-tracker-backend-5li2.onrender.com
   ```
   To:
   ```
   https://finance-tracker-backend-5li2.onrender.com/api
   ```
6. Click **Save Changes**

### Step 2: Rebuild Frontend

**IMPORTANT:** You MUST rebuild the frontend after changing `VITE_API_URL` because Vite environment variables are baked into the build at build time.

1. Still in the **finance-tracker-frontend** service
2. Click **Manual Deploy** button (top right)
3. Select **Clear build cache & deploy**
4. Wait for deployment to complete (usually 2-5 minutes)

### Step 3: Verify It Works

1. Open your frontend: https://finance-tracker-frontend-rf1n.onrender.com
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try to sign up or log in
5. Check the Network tab - you should see requests going to:
   - ✅ `https://finance-tracker-backend-5li2.onrender.com/api/auth/signup`
   - ✅ `https://finance-tracker-backend-5li2.onrender.com/api/auth/login`
   
   NOT:
   - ❌ `https://finance-tracker-backend-5li2.onrender.com/auth/signup`

6. Try reloading on `/auth` page - should work now (SPA routing fixed)

## Why This Happens

Vite environment variables (those starting with `VITE_`) are replaced at **build time**, not runtime. So:
- If you change `VITE_API_URL` but don't rebuild → old value is still used
- You must rebuild after changing any `VITE_*` environment variable

## Expected Result

After these steps:
- ✅ Login/Signup should work
- ✅ No more 404 errors
- ✅ Page reloads should work on all routes
- ✅ API calls go to correct `/api/*` endpoints

