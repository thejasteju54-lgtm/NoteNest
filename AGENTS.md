# AGENTS.md

Welcome to the **NoteNest** repository. This document defines the operating guidelines, behavioral constraints, and instructions for all AI agents and autonomous coding assistants interacting with this codebase.

---

## 📌 Project Identity
**NoteNest is a polished, local-first MVP with a production-ready frontend architecture designed for future backend, authentication, and cloud storage integration.**

---

## 🤖 Agent Principles

1. **Verify Before Action**: Never assume file existence, schema definitions, or API contracts. Read files before modifying.
2. **Adhere to Governance**: Follow all rules defined in [`.agents/rules/`](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules).
3. **Preserve Integrity**: Do not delete existing comments, documentation, or types unless explicitly refactoring.
4. **Enforce Security & Validation**: Always enforce layered file validation (extension, MIME, `%PDF-` signature bytes, 50MB limit) and repository abstractions.
5. **Accurate Technical Claims**: Always distinguish between local demo implementations (client-side auth, IndexedDB storage) and future production architectures (server-side auth, database, cloud S3/R2 storage).
6. **Update Memory**: Document non-trivial architectural decisions or changed state in [Memory.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Memory.md).

---

## 📂 Navigation & Rule Directory

| Category | Reference Document | Purpose |
| :--- | :--- | :--- |
| **Product** | [PRD.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/PRD.md) & [product-rules.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/product-rules.md) | Scope, user stories, requirements |
| **Architecture** | [Architecture.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Architecture.md) & [architecture-rules.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/architecture-rules.md) | System design & boundary rules |
| **Design** | [Design.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Design.md) & [ui-ux.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/skills/ui-ux.md) | Design tokens, aesthetics, component standards |
| **Security** | [security.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/security.md) & [file-upload-security.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/file-upload-security.md) | File validation, upload protection |
| **Auth** | [authentication.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/authentication.md) | Local demo auth abstraction & future provider interface |
| **Quality** | [coding-standards.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/coding-standards.md) & [testing.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/testing.md) | Code quality, linting, test suites |
| **Accessibility** | [accessibility.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/accessibility.md) | WCAG standards, focus states, keyboard navigation |
| **Anti-Hallucination** | [anti-hallucination.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/anti-hallucination.md) | Fact-checking against actual codebase |

---

## 🔄 Standard Workflows

When performing tasks, execute according to the appropriate workflow in `.agents/workflows/`:
- [Feature Development](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/workflows/feature-development.md)
- [Bug Fixing](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/workflows/bug-fixing.md)
- [Code Review](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/workflows/code-review.md)
- [Deployment](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/workflows/deployment.md)
