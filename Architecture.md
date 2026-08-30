# NoteNest System Architecture

## 🏛 System Classification

**NoteNest is a polished, local-first MVP with a production-ready frontend architecture designed for future backend, authentication, and cloud storage integration.**

---

## 🧩 Architectural Layers & Repository Pattern

The application strictly decouples UI presentation, business logic, data contracts, and storage implementations using the Repository Pattern:

```
┌────────────────────────────────────────────────────────┐
│                   UI Components                        │
│   (Dashboard, SubjectDetail, UploadModal, PDFViewer)   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Feature Services                       │
│    (SubjectService, NoteService, FileValidation,       │
│     LocalAuthService, SearchService, BackupService)    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│              Repository Interfaces                     │
│    (ISubjectRepository, INoteRepository, IAuthRepo)     │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐ ┌──────────────────────────┐
│  Current Implementation  │ │    Future Production     │
│ IndexedDB Storage Engine │ │  Backend REST/GraphQL API│
│ (Local Browser Storage)  │ │ (Postgres + Cloud S3/R2) │
└──────────────────────────┘ └──────────────────────────┘
```

---

## 🧭 Current Implementation vs Future Production Architecture

| Domain | Current MVP Implementation | Future Production Target |
| :--- | :--- | :--- |
| **Authentication** | **Local Demo Authentication** (`AuthProvider` -> `LocalDemoAuthProvider`) with isolated demo profiles (*Thejas - CS Major*, *Alex - EE Major*) | Server-side OAuth / OpenID Connect / JWT token authentication |
| **Storage & Persistence** | **Browser IndexedDB Persistence** (PDF Blobs and metadata persist across normal browser sessions and refreshes unless cleared) | Cloud object storage (AWS S3 / Cloudflare R2) + PostgreSQL database |
| **Authorization & Isolation** | **Logical Client-Side Partitioning** per `userId` in repository layer | Server-side RBAC, signed URLs, and tenant database policies |
| **Search** | **Normalized Substring Search** (fast case-insensitive matching across subjects & note titles) | Hybrid database full-text index & vector search over PDF contents |
| **Data Portability** | **JSON + PDF Archive Export & Import** | Automatic cross-device cloud synchronization |

---

## 📄 Layered File Validation Pipeline
Every uploaded file passes through a multi-stage validation pipeline:
1. **Extension Check**: Must end in `.pdf` (case-insensitive).
2. **MIME Type Check**: Must match `application/pdf`.
3. **Magic Byte Signature Check**: First 5 bytes must be `%PDF-` (`0x25, 0x50, 0x44, 0x46, 0x2D`).
4. **Centralized Size Limit**: Max `50 MB` (configured in `config/constants.ts`).
