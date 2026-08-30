# Authentication & Authorization Rules

## 🔐 Auth System Standards

### 1. Password Management
- Use modern cryptographic hashing: **Argon2id** or **bcrypt** (work factor >= 12).
- Enforce password strength: minimum 8 characters, requiring mixed case, numbers, and symbols.
- Never store, log, or transmit raw passwords in plain text.

### 2. Token & Session Management
- **Access Tokens**: Short-lived (e.g. 15 minutes), signed with asymmetric keys (RS256) or strong HMAC secrets (HS256 with >= 256-bit entropy).
- **Refresh Tokens**: Long-lived (e.g. 7–30 days), stored in database with token rotation and revocation support.
- **Cookies**: Store auth tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS and CSRF attacks.

### 3. Role-Based Access Control (RBAC)
- All protected endpoints must execute middleware verifying:
  1. Valid token authentication (`isAuthenticated`).
  2. Workspace / resource ownership or valid permission scope (`hasPermission`).
- Reject unauthorized requests with `401 Unauthorized` (missing/invalid token) or `403 Forbidden` (insufficient role/ownership).

### 4. Rate Limiting & Brute Force Prevention
- Apply rate limiting to all auth endpoints (`/login`, `/register`, `/forgot-password`, `/reset-password`).
- Max 5 failed attempts per IP / account before exponential backoff or CAPTCHA requirement.
