# EventVenue - Complete Cloud Deployment Guide

Deploy your EventVenue platform to the cloud in 3 steps:
1. **Supabase** (Database) → 2. **Railway/Render** (Backend) → 3. **Vercel** (Frontend)

---

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub account (your project should be pushed to GitHub)
- [ ] Supabase account (free): https://supabase.com
- [ ] Railway account (free trial): https://railway.app OR Render account (free tier): https://render.com
- [ ] Vercel account (free): https://vercel.com
- [ ] Your Stripe API keys (test or live)

---

## Step 1: Deploy Database (Supabase)

### 1.1 Create Supabase Project

1. Go to **[supabase.com](https://supabase.com)** → Sign up with GitHub
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `eventvenue`
   - **Database Password**: Create a strong password → **⚠️ SAVE THIS!**
   - **Region**: Select closest to your users
4. Click **"Create new project"** → Wait 2-3 minutes

### 1.2 Run the Schema

1. In sidebar, click **"SQL Editor"**
2. Click **"New query"**
3. Copy the entire contents of `backend/src/main/resources/schema-postgresql.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (Ctrl+Enter)
6. Verify: Go to **"Table Editor"** → You should see all tables

### 1.3 Get Connection Details

1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **"Connection string"** → Click **"JDBC"** tab
3. Copy these values:

| Variable | Where to Find |
|----------|---------------|
| Host | `db.xxxxx.supabase.co` |
| Port | `5432` |
| Database | `postgres` |
| Username | `postgres` |
| Password | Your database password |

**Your JDBC URL format:**
```
jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
```

---

## Step 2: Deploy Backend (Railway)

### 2.1 Push to GitHub

First, push your project to GitHub if not already done:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/eventvenue.git
git push -u origin main
```

### 2.2 Create Railway Project

1. Go to **[railway.app](https://railway.app)** → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `eventvenue` repository
4. Railway will auto-detect it's a Java project

### 2.3 Configure Environment Variables

In Railway dashboard, go to your service → **Variables** tab → Add these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres` |
| `DATABASE_USERNAME` | `postgres` |
| `DATABASE_PASSWORD` | Your Supabase database password |
| `JWT_SECRET` | Generate: `openssl rand -base64 64` (must be 64+ chars) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `MAIL_USERNAME` | Your Gmail address |
| `MAIL_PASSWORD` | Your Gmail App Password |

### 2.4 Configure Build Settings

1. Go to **Settings** → **Build & Deploy**
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `mvn clean package -DskipTests`
4. Set **Start Command**: `java -Dspring.profiles.active=prod -jar target/eventvenue-backend-1.0.0.jar`

### 2.5 Deploy

1. Click **"Deploy"** → Wait for build to complete
2. Once deployed, copy your Railway URL: `https://eventvenue-backend-production.up.railway.app`

### 2.6 Verify Backend

Test if backend is working:
```bash
curl https://your-railway-url.up.railway.app/api/health
```

Or visit in browser: `https://your-railway-url.up.railway.app/api/events`

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Project

1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your `eventvenue` repository
4. Set **Root Directory**: `.` (the frontend is in root)
5. Framework Preset: **Next.js** (auto-detected)

### 3.2 Configure Environment Variables

Add these environment variables in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.up.railway.app/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key |

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app is live at: `https://your-app.vercel.app`

### 3.4 Update Backend CORS

**Important!** Go back to Railway and update `FRONTEND_URL`:
```
FRONTEND_URL=https://your-app.vercel.app
```

Railway will auto-redeploy with the new CORS setting.

---

## Post-Deployment Verification

### Quick Checklist

- [ ] Visit `https://your-app.vercel.app` - Homepage loads
- [ ] Click "Sign Up" - Form appears
- [ ] Register a new user - Receives confirmation
- [ ] Log in - Dashboard appears
- [ ] Browse venues/events - Data loads from backend
- [ ] Make a booking - Stripe payment works

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Network Error" on frontend | Check `NEXT_PUBLIC_API_URL` is correct in Vercel |
| CORS errors | Update `FRONTEND_URL` in Railway to your Vercel URL |
| Database connection failed | Verify `DATABASE_URL` and password in Railway |
| 500 errors on backend | Check Railway logs for details |
| Stripe not working | Verify Stripe keys match in both frontend & backend |

---

## Environment Variables Summary

### Backend (Railway)
```env
DATABASE_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-supabase-password
JWT_SECRET=your-64-char-secret-key
FRONTEND_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_test_...
SPRING_PROFILES_ACTIVE=prod
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

---

## Alternative: Using Render Instead of Railway

If you prefer Render (has a free tier):

1. Go to **[render.com](https://render.com)** → Sign in with GitHub
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -Dspring.profiles.active=prod -jar target/eventvenue-backend-1.0.0.jar`
5. Add the same environment variables as Railway
6. Click **"Create Web Service"**

---

## Next Steps After Deployment

1. **Create Admin Account**: Use Postman to `POST /api/auth/admin/create-admin`
2. **Approve Vendors**: Log in as admin to approve vendor registrations
3. **Add Content**: Create venues and events
4. **Configure Email**: Set up Gmail App Password for OTP emails
5. **Switch to Live Stripe**: Replace test keys with live keys when ready

---

**🎉 Congratulations! Your EventVenue platform is now live!**
