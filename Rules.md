# Core Development Rules

All contributors and AI agents must strictly adhere to the following core rules when working within this repository:

---

## 📜 Golden Rules

1. **No Code without Context**: Always read relevant files, types, and tests before making modifications.
2. **Never Break Working Tests**: Ensure all existing tests pass before pushing changes or proposing PRs.
3. **Strict Type Safety**: Use strict TypeScript / strong typing across frontend and backend. Avoid `any` or untyped data passes.
4. **Security by Default**: Validate and sanitize all user inputs, enforce auth checks at the handler level, and never log sensitive data (passwords, tokens, PII).
5. **Atomic Commits**: Keep changes focused on single concerns. Follow Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
6. **No Phantom Dependencies**: Do not introduce new npm packages or external libraries without assessing security, license, and bundle impact.
7. **Document Architecture Changes**: Any new endpoint, schema change, or service addition must be documented in `docs/` and referenced in `Memory.md`.

---

## 🔍 Rule References
Detailed rules are split into granular rulebooks located in [`.agents/rules/`](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules):
- [Product Rules](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/product-rules.md)
- [Architecture Rules](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/architecture-rules.md)
- [File Upload Security](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/file-upload-security.md)
- [Authentication](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/authentication.md)
- [Anti-Hallucination](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/anti-hallucination.md)
- [Coding Standards](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/coding-standards.md)
- [Testing](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/testing.md)
- [Security](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/security.md)
- [Git](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/git.md)
