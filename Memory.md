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
| 2026-09-06 | Cloud Storage Routing & Hybrid Caching Fix | Removed mock R2 credentials that hijacked PDF uploads, defaulted to verified Supabase Storage (`notenest-files`), added IndexedDB local caching fallback, and added in-modal PDF re-upload recovery. | **Accepted** |
| 2026-09-06 | In-App PDF Rendering with PDF.js Canvas | Replaced native `<iframe>` PDF rendering with `PDFCanvasViewer` using `pdfjs-dist` to enable crisp, responsive, high-DPI in-app PDF viewing across Android Chrome, iOS Safari, PWA, and desktop browsers without plugin dependency. | **Accepted** |
| 2026-09-06 | Backend Hardening & Supercharged Study Suite | Added exponential backoff retry policy (`withRetry`), self-healing `ErrorBoundary`, offline connectivity indicator (`NetworkStatusBar`), in-document PDF search, reading themes (Dark/Sepia), side-by-side study scratchpad, and starred/priority notes. | **Accepted** |
| 2026-09-06 | Top Academic App Synthesis (RemNote, MarginNote, Obsidian, Notion, Zotero) | Integrated 3D Active Recall Flashcards Studio with auto-extraction, Global Spotlight Command Palette (`Ctrl+K`), PDF Page Thumbnail Strip Drawer, Distraction-Free Zen Mode, Built-in Pomodoro Focus Timer with Web Audio synthesizer chime, and Academic Study Streaks Widget. | **Accepted** |
| 2026-09-06 | Continuous Vertical PDF Scroll Mode | Implemented frictionless continuous vertical scrolling across all document pages using `PDFPageCanvas` with `IntersectionObserver` lazy rendering. Users can now scroll continuously from page 1 to the end without repeatedly clicking page-turn buttons, while the page counter auto-updates dynamically. | **Accepted** |
| 2026-09-06 | Full-Size PDF Viewer, Streamlined 46px Toolbar & Isolated Scroll | Replaced 3 stacked headers that occupied 1/4th of screen with a single 46px master toolbar. Added 100vw × 100vh Full-Size viewing mode (`F` shortcut / button) with auto-fit width and eliminated double modal scrollbars using `overscroll-contain` so mouse/touch scrolling isolates exclusively to document pages. | **Accepted** |
| 2026-09-07 | CodeQL Default Setup CI Resolution | Removed redundant `.github/workflows/codeql.yml` to resolve GitHub Code Scanning conflict error (`CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled`). Automated CodeQL scanning continues seamlessly via GitHub repository Default Setup. | **Accepted** |

---

## 🧪 Verification & Audit Results

### ⚙️ Automated Verification
- **50 / 50 Vitest tests passed** across 8 test suites (`tests/topAppFeatures.test.ts`, `tests/academicFeatures.test.ts`, `tests/fileValidation.test.ts`, `tests/authValidation.test.ts`, `tests/liveSupabase.test.ts`, `tests/r2Storage.test.ts`, `tests/supabase.test.ts`, `tests/services.test.ts`).
- **TypeScript strict compilation**: `tsc --noEmit` passed with 0 errors.
- **Production Build**: `vite build` generated production bundle in `dist/` cleanly in 4.75s.
- **Production Deployments**: Both Vercel targets (`note-nest-5gef` and `note-nest`) deployed with `state: "success"`. Live at https://note-nest-5gef.vercel.app/.

### 🖥️ Manual / Browser Verification
- Supabase Auth modal (Sign In, Sign Up, Forgot Password, Google OAuth, Demo switch).
- Migration banner (safe opt-in import).
- Subject and note CRUD operations.
- PDF upload, in-app Canvas preview, full-text search, reading themes, study scratchpad drawer, and download.
- 3D Flashcards Studio with auto-extraction and mastery scoring.
- Global Spotlight Command Palette (`Ctrl+K`).
- Page Thumbnails Strip and Zen Mode in PDF viewer.
- Pomodoro 25m Focus / 5m Break timer with Web Audio chime.
- Academic Study Streaks & Analytics on dashboard.
- Local storage fallback when env variables are not present.

