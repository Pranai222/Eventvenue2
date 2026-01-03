# Supabase Database Setup Guide for EventVenue

This guide walks you through setting up Supabase (PostgreSQL) for your EventVenue platform.

---

## Step 1: Create a Supabase Account

1. Go to **[https://supabase.com](https://supabase.com)**
2. Click **"Start your project"** (top right)
3. Sign up with **GitHub** (recommended) or email
4. Verify your email if you used email signup

---

## Step 2: Create a New Project

1. After login, click **"New Project"**
2. Fill in the details:
   - **Organization**: Select "Personal" or create one
   - **Project Name**: `eventvenue` (or any name you prefer)
   - **Database Password**: Create a **strong password** ⚠️ **SAVE THIS - YOU'LL NEED IT LATER**
   - **Region**: Select the closest region to your users (e.g., `South Asia (Mumbai)` for India)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be set up

---

## Step 3: Get Your Database Connection Details

Once the project is ready:

1. Look at the **top navigation bar** - you'll see a **"Connect"** button (next to "main" and "PRODUCTION")
2. Click **"Connect"**
3. In the popup, look for connection options
4. Select **"JDBC"** or **"Connection String"** tab
5. Look for the **URI** connection string format

**Alternative Method (from Settings):**
1. Go to **Settings** → **Database** (as shown in your screenshot)
2. Look for **"Database password"** section at the top
3. Your connection details are:

| Field | Value |
|-------|-------|
| **Host** | Found in URL: `db.ncpjazieeyo...supabase.co` (from your browser URL) |
| **Port** | `5432` (always) |
| **Database** | `postgres` |
| **Username** | `postgres` |
| **Password** | Click **"Reset database password"** if you forgot it |

**Your project reference** (from the URL): `ncpjazieeyo...` (the part after `/project/`)

So your full connection URL will be:
```
jdbc:postgresql://db.ncpjazieeyoeedzzwvgy.supabase.co:5432/postgres
```

---

## Step 4: Get Connection String via Connect Button (Recommended)

1. Click the **"Connect"** button in the top navigation bar
2. In the modal that appears, look for:
   - **ORMs** section → Click to expand
   - Find **"JDBC"** or **"Java"** option
3. Copy the connection string provided

**OR** construct it manually:
```
jdbc:postgresql://db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

Replace `[YOUR-PROJECT-REF]` with your project reference from the URL:
- Your URL: `https://supabase.com/dashboard/project/ncpjazieeyoeedzzwvgy/database/settings`
- Project ref: `ncpjazieeyoeedzzwvgy`

**Your JDBC URL:**
```
jdbc:postgresql://db.ncpjazieeyoeedzzwvgy.supabase.co:5432/postgres
```

---

## Step 5: Create Your Database Tables

### Option A: Using Supabase SQL Editor (Recommended)

1. In left sidebar, click **"SQL Editor"**
2. Click **"New query"**
3. Copy and paste the PostgreSQL schema (I'll create this file for you)
4. Click **"Run"** (or press Ctrl+Enter)

### Option B: Let Spring Boot Create Tables

If you set `spring.jpa.hibernate.ddl-auto=update`, Spring Boot will auto-create tables based on your entity classes when the backend first connects.

---

## Step 6: Verify Tables Are Created

1. In left sidebar, click **"Table Editor"**
2. You should see all your tables:
   - `users`
   - `vendors`
   - `venues`
   - `events`
   - `bookings`
   - `products`
   - etc.

---

## Step 7: Connection Values for Your Backend

Once you have Supabase set up, here are the values you'll use in Railway/Render:

### Environment Variables for Backend

```properties
# Database Connection
DATABASE_URL=jdbc:postgresql://db.xxxxxxxxxxxxx.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password

# Other required variables
JWT_SECRET=your-64-character-secret-key-generate-with-openssl-rand-base64
FRONTEND_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_test_your-stripe-key
SPRING_PROFILES_ACTIVE=prod
```

---

## Troubleshooting

### "Connection refused" Error
- Check if your IP is allowed in Supabase
- Go to **Settings → Database → Network** and add your IP or allow all IPs (`0.0.0.0/0`)

### "Password authentication failed"
- Double-check the password you set during project creation
- You can reset it in **Settings → Database → Database Password**

### "SSL required" Error
Add this to your JDBC URL:
```
?sslmode=require
```

Full example:
```
jdbc:postgresql://db.xxxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

---

## Quick Reference Card

| What | Value |
|------|-------|
| Dashboard | https://supabase.com/dashboard |
| Host Format | `db.[project-ref].supabase.co` |
| Port | `5432` |
| Database | `postgres` |
| Username | `postgres` |
| Password | Your project password |

---

## Next Steps

After Supabase is ready:
1. ✅ Create the database project ← **YOU ARE HERE**
2. ⏳ Update backend code for PostgreSQL
3. ⏳ Deploy backend to Railway/Render
4. ⏳ Deploy frontend to Vercel
