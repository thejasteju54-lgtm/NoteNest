# NoteNest

> **"Your notes. Organized."**

NoteNest is a fast, minimal academic document organizer built for college students to organize, upload, search, and view lecture PDFs by subject.

---

## 🧭 Architecture Overview

NoteNest is architected with a decoupled **Repository Pattern**, allowing seamless operation in two modes:
1. **Supabase Cloud Backend**: PostgreSQL with Row-Level Security (RLS), Supabase Auth (Email/Password, Password Reset, Google OAuth), and private S3-compatible cloud storage for PDF notes.
2. **Local Demo Mode**: Browser IndexedDB persistence and client-side demo accounts (*Thejas - CS Major*, *Alex - EE Major*) for local exploration and offline use.

---

## ⚙️ Connecting to your Supabase Project

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase Project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### 2. Run Database & Storage Schema Migration
Open your **Supabase Dashboard → SQL Editor** and execute the complete setup script located at:
📁 **[`docs/architecture/supabase_schema.sql`](file:///docs/architecture/supabase_schema.sql)**

This script sets up:
- `public.profiles`, `public.subjects`, and `public.notes` tables.
- Cascading foreign keys and performance indexes.
- **Row Level Security (RLS)** policies strictly restricting row access to `auth.uid() = user_id`.
- The private `'notes'` **Storage Bucket** with user-scoped path security (`{userId}/{subjectId}/*`).

### 3. (Optional) Configure Google OAuth in Supabase Dashboard
1. In Supabase Dashboard, navigate to **Authentication → Providers → Google**.
2. Enable Google Provider and enter your Google Client ID and Secret from Google Cloud Console.
3. Add `http://localhost:5173` (and production domain) to **URL Configuration → Redirect URLs**.

---

## 🔒 Security Principles

- **No Secret Keys in Frontend**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used. No `service_role` keys or database passwords.
- **Database & Storage Row Level Security**: User A cannot read, insert, update, or delete User B's rows or PDF files.
- **Layered File Validation**: Validates `.pdf` extension, MIME type, `%PDF-` signature bytes (`0x25, 0x50, 0x44, 0x46, 0x2D`), and 50MB file size limit.
- **Safe Opt-In Migration**: When signing into a Supabase account with existing local notes on the browser, an explicit import banner is presented.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm.cmd install

# Start local development server
npm.cmd run dev

# Run automated tests
npm.cmd test

# Build production bundle
npm.cmd run build
```
