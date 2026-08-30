# Project Memory & Decision Log

This file records key architecture decisions, state transitions, context, and persistent learnings across development sessions.

---

## 📌 Project Identity & Scope
- **Name**: NoteNest ("Your notes. Organized.")
- **Architecture**: Dual-backend support (Supabase Cloud PostgreSQL + RLS + S3 Cloud Storage + Auth, with fallback to Local Demo IndexedDB storage).

---

## 🏛 Key Decisions Record (ADR Summary)

| Date | Decision | Context & Rationale | Status |
| :--- | :--- | :--- | :--- |
| Initial | Repository Pattern for Data Access | Built `ISubjectRepository`, `INoteRepository`, `IAuthRepository` abstractions over both Supabase and browser IndexedDB. UI code does not know or care which backend is active. | **Accepted** |
| Initial | Supabase Backend Integration | Implemented `SupabaseSubjectRepository`, `SupabaseNoteRepository`, `SupabaseFileStorageRepository`, and `SupabaseAuthService` using `@supabase/supabase-js`. | **Accepted** |
| Initial | Row Level Security (RLS) | Strictly enabled database and storage RLS ensuring users can only read, insert, update, and delete their own subjects, notes, and PDF files. | **Accepted** |
| Initial | User-Scoped Storage Paths | PDF storage paths formatted as `{userId}/{subjectId}/{timestamp}_{fileName}.pdf` in private `'notes'` bucket. | **Accepted** |
| Initial | Safe Opt-In Local Migration | When signing in to Supabase, an opt-in banner allows importing existing local IndexedDB notes to the cloud account with explicit confirmation. | **Accepted** |

---

## 🧪 Verification & Audit Results

### ⚙️ Automated Verification
- **16 / 16 Vitest tests passed** (`tests/fileValidation.test.ts`, `tests/services.test.ts`, `tests/supabase.test.ts`).
- **TypeScript strict compilation**: `tsc --noEmit` passed with 0 errors.
- **Production Build**: `vite build` generated production bundle in `dist/`.

### 🖥️ Manual / Browser Verification
- Supabase Auth modal (Sign In, Sign Up, Forgot Password, Google OAuth, Demo switch).
- Migration banner (safe opt-in import).
- Subject and note CRUD operations.
- PDF upload, preview, and download.
- Local storage fallback when env variables are not present.
