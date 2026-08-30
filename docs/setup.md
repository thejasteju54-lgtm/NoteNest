# NoteNest Setup & Deployment Guide

This guide walks you through setting up NoteNest locally, configuring your Supabase database, connecting cloud storage, and deploying to Vercel.

---

## 📋 Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**
- A free **[Supabase](https://supabase.com)** account
- (Optional) A free **[Cloudflare](https://dash.cloudflare.com)** account for 10 GB R2 storage

---

## 🛠️ 1. Local Development Setup

### Clone Repository & Install Dependencies
```bash
git clone https://github.com/thejasteju54-lgtm/NoteNest.git
cd NoteNest
npm install
```

### Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

---

## 🗄️ 2. Supabase Backend Setup

1. **Create a new Supabase Project**:
   - Go to [database.new](https://database.new) and create a project.
2. **Execute Database & Storage Schema**:
   - In your Supabase Dashboard, open the **SQL Editor** on the left menu.
   - Copy the entire contents of [`docs/architecture/supabase_schema.sql`](architecture/supabase_schema.sql).
   - Paste into the SQL editor and click **Run**.
   - This creates `profiles`, `subjects`, `notes`, performance indexes, hardened triggers, Row-Level Security (RLS) policies, and the private `notenest-files` storage bucket.
3. **Configure Authentication (Optional / Recommended)**:
   - In **Auth → Providers → Email**:
     - For instant signups without SMTP email verification limits, toggle **OFF** *"Confirm email"*.
     - Or connect a custom SMTP provider (e.g., [Resend](https://resend.com)) in **Settings → Authentication → SMTP Settings** for production verification emails.

---

## ☁️ 3. Optional: High-Capacity Cloudflare R2 Storage (10 GB Free)

NoteNest includes a universal storage manager with built-in Cloudflare R2 / S3 support:

1. In Cloudflare Dashboard, go to **R2 Object Storage** → click **Create Bucket** → name it `notenest-files`.
2. Go to **Manage R2 API Tokens** → click **Create Account API Token** with `Object Read & Write` permission.
3. Add the following environment variables to your `.env` or Vercel dashboard:

```env
VITE_R2_ACCOUNT_ID=your_cloudflare_account_id
VITE_R2_ACCESS_KEY_ID=your_r2_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
VITE_R2_BUCKET_NAME=notenest-files
```

*(If these variables are omitted, NoteNest will automatically store files in your private Supabase storage bucket).*

---

## 🚀 4. Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically run `npm run build` and configure HTTP security headers via `vercel.json`.
