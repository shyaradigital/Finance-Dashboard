# Fix 404 Issues - Step by Step Guide

## Issue 1: API Requests Missing `/api` Prefix

**Problem:** Requests are going to `/auth/signup` instead of `/api/auth/signup`

**Solution:** Set `VITE_API_URL` in the frontend service

### Steps:
1. Go to Render Dashboard
2. Click on `finance-tracker-frontend` service
3. Go to **Environment** tab
4. Click **Edit** or **+ Add Environment Variable**
5. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://finance-tracker-backend-5li2.onrender.com/api`
     - ⚠️ **Important:** Replace `finance-tracker-backend-5li2` with your actual backend service name/URL
     - ⚠️ **Important:** Must end with `/api` (not just the base URL)
6. Click **Save Changes**
7. **Rebuild the frontend:**
   - Go to frontend service
   - Click **Manual Deploy** → **Clear build cache & deploy**
   - Wait for deployment to complete

### How to Find Your Backend URL:
1. Go to `finance-tracker-backend` service in Render
2. Look at the top of the page - it shows the service URL
3. Copy that URL and add `/api` to the end

**Example:**
- Backend URL: `https://finance-tracker-backend-5li2.onrender.com`
- VITE_API_URL should be: `https://finance-tracker-backend-5li2.onrender.com/api`

---

## Issue 2: Page Reload Shows "Not Found"

**Problem:** When you reload on `/auth` or any route, you get a 404 error

**Solution:** This is fixed by the `_redirects` file I just created. After you rebuild the frontend, this should work.

### Steps:
1. The `public/_redirects` file has been created
2. Rebuild the frontend (same as above)
3. The redirects file will be included in the build
4. All routes will now serve `index.html` (SPA routing)

---

## Quick Checklist

### Backend Service:
- [ ] `FRONTEND_URL` is set to your frontend URL (e.g., `https://finance-tracker-frontend.onrender.com`)
- [ ] All other environment variables are set
- [ ] Service is running and shows "Live" status

### Frontend Service:
- [ ] `VITE_API_URL` is set to: `https://YOUR-BACKEND-URL.onrender.com/api`
- [ ] `VITE_API_URL` ends with `/api`
- [ ] Frontend has been rebuilt after setting `VITE_API_URL`

### Test:
1. Open your frontend URL
2. Try to sign up or log in
3. Check browser DevTools → Network tab
4. Verify requests are going to `/api/auth/signup` (not `/auth/signup`)
5. Try reloading on `/auth` page - should work now

---

## Still Not Working?

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** - Look for any errors
3. **Check Network tab** - Verify the actual URL being called
4. **Check Render logs** - Both frontend and backend services
5. **Verify environment variables** - Make sure they're saved correctly

---

## Common Mistakes:

❌ **Wrong:** `VITE_API_URL = https://finance-tracker-backend.onrender.com`
✅ **Correct:** `VITE_API_URL = https://finance-tracker-backend.onrender.com/api`

❌ **Wrong:** `VITE_API_URL = https://finance-tracker-backend.onrender.com/api/`
✅ **Correct:** `VITE_API_URL = https://finance-tracker-backend.onrender.com/api`

❌ **Wrong:** Setting it but not rebuilding frontend
✅ **Correct:** Must rebuild frontend after changing `VITE_API_URL`

