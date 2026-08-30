# Database Design & Modeling Skill

## 🗄 Core Database Principles
- **Engine**: PostgreSQL / SQLite (for local embedded mode).
- **Integrity**: Enforce referential integrity using foreign keys, cascading rules, and unique constraints.
- **Auditability**: Maintain `created_at` and `updated_at` timestamps on all entities. Use soft deletes (`deleted_at`) where historical recovery is required.

---

## 📊 Core Entity Model Overview

### 1. `users` Table
- `id` (UUID / ULID, Primary Key)
- `email` (VARCHAR, Unique, Indexed)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `created_at`, `updated_at`

### 2. `workspaces` Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `owner_id` (UUID, FK -> `users.id`)
- `created_at`, `updated_at`

### 3. `notes` Table
- `id` (UUID, Primary Key)
- `workspace_id` (UUID, FK -> `workspaces.id`, Indexed)
- `author_id` (UUID, FK -> `users.id`)
- `parent_id` (UUID, Nullable, FK -> `notes.id`, Self-referencing for hierarchy)
- `title` (VARCHAR)
- `content` (TEXT / JSONB for rich block formats)
- `is_pinned` (BOOLEAN, Default: false)
- `is_archived` (BOOLEAN, Default: false)
- `created_at`, `updated_at`, `deleted_at`

### 4. `tags` & `note_tags` Tables
- `tags`: `id`, `workspace_id`, `name`, `color`
- `note_tags`: `note_id`, `tag_id` (Composite Primary Key)

### 5. `attachments` Table
- `id` (UUID, Primary Key)
- `note_id` (UUID, FK -> `notes.id`)
- `file_key` (VARCHAR, S3/Storage Key)
- `file_name` (VARCHAR)
- `mime_type` (VARCHAR)
- `file_size` (BIGINT)
- `created_at`

---

## ⚡ Indexing & Optimization Guidelines
- Index foreign key columns to avoid slow joins.
- Add composite indexes for common filter combinations: `(workspace_id, is_archived, updated_at DESC)`.
- Use GIN indexes for full-text search (`tsvector`) or JSONB queries.
