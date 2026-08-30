# Bug Fixing Workflow

Standard operating procedure for identifying, isolating, patching, and verifying bug fixes.

---

## 🛠 Bug Fixing Protocol

### 1. Reproduction & Isolation
- Reproduce the reported issue in a local or isolated environment.
- Document exact steps to reproduce, expected vs actual behavior, error messages, and stack traces.

### 2. Write a Failing Test (Regression Prevention)
- Before writing the fix, create a unit or integration test that reproduces the bug and fails.
- This ensures the issue cannot resurface silently in the future.

### 3. Implement Minimal Surgical Fix
- Address the root cause directly without introducing unrelated refactoring or side-effects.
- Verify adherence to [anti-hallucination.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/anti-hallucination.md) and [coding-standards.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules/coding-standards.md).

### 4. Verify & Run Test Suite
- Ensure the reproduction test now passes.
- Execute the entire test suite to confirm no regressions were introduced.

### 5. Document & Log
- If the bug was due to architectural oversight or data discrepancy, document findings in [Memory.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Memory.md) or `docs/audits/`.
- Commit with `fix(scope): brief description`.
