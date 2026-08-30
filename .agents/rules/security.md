# Security Rules & OWASP Compliance

## 🛡 Mandatory Security Invariants

### 1. Injection Prevention
- Use parameterized queries or typed ORMs (e.g. Prisma, Drizzle, TypeORM). Never concatenate user strings into raw SQL queries.
- Sanitize HTML in notes to prevent Cross-Site Scripting (XSS). Use robust sanitizers (e.g., `DOMPurify`, `sanitize-html`) with strict allowlists for tags and attributes.

### 2. Cross-Origin & Header Protection
- Enforce strict CORS policies: explicitly whitelist allowed client origins.
- Set security headers via Helmet or custom middleware:
  - `Content-Security-Policy (CSP)`
  - `Strict-Transport-Security (HSTS)`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### 3. Sensitive Data & Secrets Protection
- Never commit `.env` files, API keys, private certificates, or database credentials.
- Use environment variable validation at startup (e.g. using `zod` or `dotenv-safe`).
- Redact sensitive keys from application logs (e.g. `password`, `authorization`, `token`, `secret`).

### 4. Denial of Service (DoS) Mitigation
- Implement body-size limits on incoming requests (e.g. max 1MB for JSON payloads).
- Enforce rate-limiting per IP and per authenticated user.
- Add timeout limits on long-running queries or external HTTP requests.
