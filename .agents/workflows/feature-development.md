# Feature Development Workflow

This workflow defines the standard process for conceptualizing, implementing, and delivering features in NoteNest.

---

## 🔄 Step-by-Step Process

```
1. Scope & PRD ──► 2. Architecture Review ──► 3. Branch Creation ──► 4. Implementation ──► 5. Test & Verify ──► 6. PR & Review
```

### Step 1: Requirements Alignment
- Verify feature goals against [PRD.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/PRD.md) and target milestone in [Phases.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Phases.md).
- Clarify data models, user flows, and edge cases before writing code.

### Step 2: Architecture & Security Check
- Consult [Architecture.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Architecture.md) and relevant `.agents/rules/` (e.g. auth, file security).
- If changing database schema or introducing new service boundaries, draft an ADR in `docs/decisions/`.

### Step 3: Branch Setup
- Create a feature branch: `git checkout -b feature/short-feature-name`.

### Step 4: Implementation
- Implement backend services, endpoints, and validation schemas first (or frontend mock contracts).
- Follow UI/UX tokens in [Design.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Design.md).
- Adhere to [coding-standards.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/coding-standards.md).

### Step 5: Testing & Verification
- Author unit tests for core domain logic.
- Run integration tests on affected API routes.
- Verify zero regression in existing test suites.

### Step 6: PR Creation
- Commit with conventional commit messages.
- Open PR with clear description, linked issues, and screenshots/recordings for UI changes.
