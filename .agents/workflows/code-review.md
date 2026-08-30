# Code Review Workflow & Checklist

## 🔍 Code Review Goals
Ensure code quality, maintainability, performance, security, and strict adherence to project standards before changes enter `develop` or `main`.

---

## ✅ Reviewer Checklist

### 1. Correctness & Architecture
- [ ] Does the change satisfy the requirements stated in the PR?
- [ ] Does the implementation conform to [Architecture.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Architecture.md)?
- [ ] Are boundaries maintained between controllers, services, and repositories?

### 2. Security & Data Protection
- [ ] Are all inputs validated and sanitized?
- [ ] Are authorization checks enforced on sensitive endpoints?
- [ ] Are secrets, keys, or credentials excluded from code and git history?
- [ ] Does file handling comply with [file-upload-security.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/file-upload-security.md)?

### 3. Quality & Testing
- [ ] Are new tests provided for new functionality?
- [ ] Do all automated tests pass in CI?
- [ ] Are TypeScript types strict with no `any` usages?
- [ ] Are errors handled gracefully with meaningful logging?

### 4. Performance & UX
- [ ] Are there potential N+1 query problems or missing database indexes?
- [ ] Are expensive frontend operations debounced or memoized?
- [ ] Does the UI follow [Design.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Design.md) and handle loading/empty states?
