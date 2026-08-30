# NoteNest System Architecture

## 🏛 System Classification

**NoteNest is a polished, full-stack application supporting both Supabase Cloud Backend (PostgreSQL + Row Level Security + S3-compatible Cloud Storage + Supabase Auth) and Local Demo Mode (IndexedDB + Local Demo Auth).**

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
│     AuthService, SearchService, MigrationService)      │
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
│  Supabase Cloud Backend  │ │  Local Demo Mode         │
│ (PostgreSQL RLS + S3 PDF │ │  (Browser IndexedDB +    │
│  + Supabase Auth Engine) │ │   Local Demo Auth)       │
└──────────────────────────┘ └──────────────────────────┘
```

---

## 🧭 Supabase Cloud Architecture vs Local Demo Mode

| Domain | Supabase Cloud Architecture | Local Demo Fallback Mode |
| :--- | :--- | :--- |
| **Authentication** | **Supabase Auth** (`SupabaseAuthProvider`) supporting Email/Password signup/login, password reset, session persistence, and Google OAuth | Local Demo Accounts (*Thejas - CS Major*, *Alex - EE Major*) |
| **Database & Tables** | **PostgreSQL** (`profiles`, `subjects`, `notes`) with UUID primary keys and cascading foreign keys | Browser IndexedDB object stores (`subjects`, `notes`, `files`, `users`) |
| **Row Level Security (RLS)** | **PostgreSQL RLS Policies** strictly enforcing `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE | Logical client-side partitioning per `userId` |
| **PDF File Storage** | **Private Supabase Storage Bucket** (`notes`) with user-scoped path structure `{userId}/{subjectId}/{fileName}.pdf` and storage RLS | Binary Blob storage in IndexedDB `files` store |
| **PDF Access & Security** | Authenticated downloads and signed URLs with 1-hour expiration | Local Blob ObjectURLs (`URL.createObjectURL(blob)`) |
| **Data Migration** | **Safe Opt-In Migration**: Prompt to upload local notes to cloud with explicit user confirmation | JSON + PDF Base64 archive export & restore |

---

## 🔒 Security Architecture

### 1. Client Credentials
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed in frontend client code.
- `service_role` keys, database passwords, and private server secrets are **never** used or committed.

### 2. Database Row Level Security (RLS)
```sql
-- Example: subjects table RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own subjects"
  ON public.subjects FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. Storage Bucket Row Level Security
```sql
-- Storage path: {userId}/{subjectId}/{fileName}.pdf
CREATE POLICY "Users can access own notes storage"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 4. Layered File Validation
1. File extension validation (`.pdf`).
2. MIME type inspection (`application/pdf`).
3. Magic number header signature inspection (`%PDF-` / `0x25, 0x50, 0x44, 0x46, 0x2D`).
4. Centralized size limit (`50 MB` in `config/constants.ts`).
