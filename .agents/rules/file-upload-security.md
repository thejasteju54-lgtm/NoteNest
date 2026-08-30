# File Upload Security Rules

## 🛡 Mandatory File Upload Safeguards

File uploads represent one of the most critical attack vectors. Every upload must pass through the multi-layer security funnel below:

---

## 🔒 Verification Funnel

### 1. Client-Side Pre-Validation
- Check file size against allowed maximum (e.g., 25MB for attachments, 5MB for avatars).
- Filter extension allowlist before initiating upload.

### 2. Server-Side Magic Number & MIME Inspection
- **Do NOT trust the `Content-Type` header sent by client.**
- Inspect the file header magic bytes (e.g. using `file-type` or `mime-types` parser).
- Reject mismatching extensions and MIME types immediately.

### 3. File Sanitization & Renaming
- Never use user-supplied file names directly in the storage path.
- Generate a cryptographically secure UUID/hash for the stored object key: `uploads/{userId}/{uuid}-{sanitizedExtension}`.
- Strip metadata / EXIF tags from uploaded images where applicable.

### 4. Storage Isolation
- Store files outside the web server's public root directory (e.g., in AWS S3, Cloudflare R2, or isolated storage bucket).
- Serve user uploads with secure headers:
  - `Content-Disposition: attachment; filename="..."` (or inline with strict CSP)
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy: default-src 'none'`

### 5. Access Control
- Files must inherit the permissions of the parent note or owner.
- Use pre-signed URLs with short TTLs (e.g., 5–15 minutes) for downloads and previews.
