# Project Memory & Decision Log

This file records key architecture decisions, state transitions, context, and persistent learnings across development sessions.

---

## 📌 Project Classification & Scope
- **Name**: NoteNest ("Your notes. Organized.")
- **Classification**: A polished, local-first MVP with a production-ready frontend architecture designed for future backend, authentication, and cloud storage integration.
- **Core Domain**: Academic PDF note management for college students, subject folders, layered PDF validation, in-browser PDF viewer, instant normalized search, and local demo session persistence.

---

## 🏛 Key Decisions Record (ADR Summary)

| Date | Decision | Context & Rationale | Status |
| :--- | :--- | :--- | :--- |
| Initial | Repository Pattern for Data Access | Built `ISubjectRepository`, `INoteRepository`, `IAuthRepository` abstractions over browser IndexedDB. Future swaps to backend REST/GraphQL/OAuth can occur without modifying any UI components. | **Accepted** |
| Initial | Local Demo Authentication Classification | Explicitly classified client-side auth as local demo mode with preset student profiles (*Thejas - CS Student*, *Alex - EE Student*) and logical data partitioning. | **Accepted** |
| Initial | Layered PDF Validation | Validates (1) `.pdf` extension, (2) `application/pdf` MIME type, (3) `%PDF-` header signature bytes (`0x25, 0x50, 0x44, 0x46, 0x2D`), and (4) Centralized 50MB file size limit. | **Accepted** |
| Initial | Native PDF Viewer with Fallback | In-browser PDF previewer modal with direct download, external tab opening, and printing support. | **Accepted** |
| Initial | Data Portability & Backup | Implemented JSON + base64 binary PDF archive export and restore in Settings view. | **Accepted** |

---

## 🧭 Implementation Matrix: Current MVP vs Future Production Target

- **Current Implementation**:
  - Local Demo Authentication (`AuthProvider` -> `LocalDemoAuthProvider`)
  - Browser IndexedDB persistence across normal browser sessions and refreshes
  - Local PDF Blob storage
  - Logical client-side multi-profile isolation
  - JSON + binary PDF backup export/import
- **Future Production Target**:
  - Server-side OAuth / JWT authentication provider
  - Server-side authorization & signed access URLs
  - PostgreSQL / Managed relational database
  - Cloud S3 / Cloudflare R2 object storage
  - Automatic cross-device synchronization

---

## 🧪 Verification Summary

### ⚙️ Automated Verification
- **13 / 13 Vitest tests passed** (`tests/fileValidation.test.ts`, `tests/services.test.ts`).
- **TypeScript type checking passed** (`tsc --noEmit` with 0 errors).
- **Production build passed** (`vite build` bundle generated in `dist/`).

### 🖥️ Manual / Browser Verification (Live Session)
- Valid PDF upload verified.
- Invalid file rejection (extensions, MIME, corrupted headers) verified.
- PDF preview verified.
- PDF download verified.
- Subject CRUD verified.
- Note CRUD verified.
- Search verified across subjects and notes.
- Browser refresh persistence verified.
- Backup export and restore verified.
- Responsive layout across desktop, tablet, and mobile verified.
- Keyboard navigation (`Esc`, `Enter`, focus states) verified.
- No clipping or overflow during tested viewports.
