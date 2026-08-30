# NoteNest

> **"Your notes. Organized."**

NoteNest is a polished, local-first MVP with a production-ready frontend architecture designed for future backend, authentication, and cloud storage integration.

It is built specifically for college students to organize, upload, search, and view academic PDFs by subject, solving the problem of lost notes in cluttered WhatsApp study groups.

---

## 🧭 Architecture Classification & Current Implementation vs Future

| Aspect | Current MVP Implementation | Future Production Architecture |
| :--- | :--- | :--- |
| **Authentication** | **Local Demo Authentication** (`AuthProvider` -> `LocalDemoAuthProvider`) with isolated demo student profiles (*Thejas - CS Major*, *Alex - EE Major*) | Server-side OAuth / OpenID Connect / JWT token authentication |
| **Storage & Persistence** | **Browser IndexedDB Persistence** (PDF Blobs and metadata persist across normal browser sessions and refreshes) | Cloud object storage (e.g. AWS S3, Cloudflare R2) + Managed PostgreSQL database |
| **Authorization** | **Logical Client-Side Partitioning** per `userId` at the repository layer | Strict server-side RBAC, signed URLs, and tenant database policies |
| **Search** | **Normalized Substring Search** (instant sub-millisecond matching across subjects and note titles) | Hybrid full-text index & vector search over PDF contents |
| **Data Portability** | **JSON + PDF Archive Export & Import** in Settings view | Automatic cross-device cloud sync |

---

## 🏗 Modular Project Structure

```
notenest/
├── index.html                   # HTML entry point (Inter & JetBrains Mono fonts)
├── vite.config.ts               # Vite configuration with @/ alias
├── package.json                 # Core dependencies (React 19, TypeScript, Lucide, Tailwind)
├── tsconfig.json                # Strict TypeScript configuration
├── tailwind.config.js           # Design tokens matching Design.md
│
├── src/
│   ├── main.tsx                 # App mount & StrictMode
│   ├── App.tsx                  # App layout, router view switcher, global toast provider
│   ├── index.css                # CSS variables, glassmorphic utilities, calm academic theme
│   │
│   ├── config/
│   │   └── constants.ts         # Centralized configs: MAX_FILE_SIZE (50MB), ALLOWED_EXTENSIONS
│   │
│   ├── types/                   # Domain Types
│   │   ├── auth.ts              # User, Session, AuthProvider interface
│   │   ├── subject.ts           # Subject, SubjectColor, SubjectStats
│   │   ├── note.ts              # Note, NoteSortOption, FileValidationResult
│   │   └── repository.ts        # ISubjectRepository, INoteRepository, IAuthRepository
│   │
│   ├── repositories/            # Data Access Layer (Repository Pattern)
│   │   ├── index.ts             # Repository factory / dependency injection
│   │   ├── indexeddb/           # Browser IndexedDB implementation
│   │   │   ├── db.ts            # IndexedDB schema, migrations, error handling
│   │   │   ├── subjectRepo.ts   # IndexedDBSubjectRepository
│   │   │   └── noteRepo.ts      # IndexedDBNoteRepository
│   │   └── auth/
│   │       └── localAuthRepo.ts # LocalDemoAuthRepository
│   │
│   ├── services/                # Business Logic Layer
│   │   ├── authService.ts       # Local demo authentication & user sessions
│   │   ├── subjectService.ts    # Subject CRUD, ownership validation, note counts
│   │   ├── noteService.ts       # Note upload, rename, delete, sorting, size calculation
│   │   ├── fileValidationService.ts # Extension, MIME, and %PDF- magic signature check
│   │   ├── searchService.ts     # Normalized substring search across subjects & notes
│   │   └── backupService.ts     # Export/Import JSON + PDF blob backup
│   │
│   ├── context/                 # Application Contexts
│   │   ├── AuthContext.tsx      # Auth state provider
│   │   ├── NoteNestContext.tsx  # Subjects, notes, active view, search query
│   │   └── ToastContext.tsx     # Toast notification dispatcher
│   │
│   ├── components/              # Reusable UI Primitives & Domain Views
│   │   ├── common/              # Button, Input, Modal, Toast, Badge, Dropdown, ConfirmDialog
│   │   ├── layout/              # Navbar, Breadcrumbs, StorageIndicator
│   │   ├── dashboard/           # GreetingBanner, SubjectGrid, SubjectCard, RecentNotes, EmptyState
│   │   ├── subjects/            # SubjectHeader, NoteGrid, NoteList, NoteCard, SubjectModal, NoteRenameModal
│   │   ├── upload/              # UploadModal, DropZone
│   │   ├── viewer/              # PDFViewerModal
│   │   ├── settings/            # SettingsView (Demo user switch, storage stats, backup export/import)
│   │   └── auth/                # AuthModal (Local Demo Login / Switch User)
│   │
│   └── utils/                   # Helpers: formatters (dates, sizes), sample PDF fixtures
│
└── tests/                       # Unit & Integration Tests (Vitest)
    ├── fileValidation.test.ts   # PDF signature, extension, size tests
    └── services.test.ts         # Subject CRUD, note management, search, and backup tests
```

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
