# Security Policy

The NoteNest team takes the security of our application and user data seriously. This document outlines our security practices, supported versions, and how to report vulnerabilities responsibly.

---

## 🛡️ Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          | Status |
| :--- | :--- | :--- |
| `1.0.x` (Current `main`) | ✅ Supported | Actively Maintained |
| `< 1.0.0` | ❌ Unsupported | Deprecated |

---

## 🔒 Security Architecture & Guarantees

NoteNest enforces a multi-layer defense-in-depth model:

1. **Authentication**: All user sessions are authenticated using Supabase Auth with secure JWT verification and automatic token rotation.
2. **Multi-Tenant Row-Level Security (RLS)**: Database tables (`profiles`, `subjects`, `notes`) enforce PostgreSQL RLS policies where `auth.uid() = user_id`. No user can query or mutate another student's data.
3. **Private Object Storage**: Files uploaded to `notenest-files` bucket are private (`public = false`). Access is gated through user-scoped storage policies and time-limited signed URLs (1 hour expiry).
4. **Layered File Validation**: Uploads are verified client-side and server-side across 4 checkpoints:
   - File extension (`.pdf`)
   - MIME type (`application/pdf`)
   - Magic byte header (`%PDF-` / `0x25 0x50 0x44 0x46 0x2D`)
   - File size cap (50MB maximum)
5. **No Service-Role Key in Frontend**: The frontend only uses `VITE_SUPABASE_ANON_KEY`, relying strictly on PostgreSQL RLS for authorization.

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability in NoteNest, please report it responsibly:

1. **Do NOT open a public GitHub issue** for undisclosed security vulnerabilities.
2. Report the vulnerability via **GitHub Security Advisories**:
   - Go to [https://github.com/thejasteju54-lgtm/NoteNest/security/advisories](https://github.com/thejasteju54-lgtm/NoteNest/security/advisories)
   - Click **"Report a vulnerability"**
3. Alternatively, contact the repository maintainer directly via GitHub profile message.

### What to include in your report:
- Type of vulnerability (e.g., RLS bypass, XSS, authentication flaw, IDOR).
- Step-by-step instructions to reproduce the issue.
- Proof-of-concept code, payload, or screenshots (if applicable).
- Impact assessment.

---

## ⏱️ Response Timeline

- **Initial Acknowledgment**: Within 48 hours.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Disclosure**: We will collaborate with you to release a patched version before public disclosure.
