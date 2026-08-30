# Anti-Hallucination Rules for AI Agents

## 🎯 Purpose
These guidelines prevent AI coding assistants from making incorrect assumptions, referencing non-existent files, inventing non-existent library APIs, or breaking existing architecture.

---

## 🔍 Mandatory Verification Rules

1. **Verify Files Before Editing**:
   - Always run file inspection tools (`view_file`, `list_dir`, `grep_search`) to verify file paths and existing code structures before proposing edits.
   - Never assume an import path exists without inspecting the project directory structure.

2. **Verify Library APIs**:
   - Check `package.json` / dependency locks to verify exact package versions before using library APIs.
   - Do not invent helper methods or custom functions that are not defined in the codebase.

3. **Check Types & Interfaces**:
   - Always inspect the TypeScript interface, schema, or model definition before adding or modifying properties on objects.

4. **Self-Correction & Lint Check**:
   - After creating or modifying code, verify that all symbols, modules, and types resolve cleanly without syntax or lint errors.

5. **No Speculative Implementations**:
   - If an instruction or requirement is underspecified, verify existing patterns in the codebase or request clarification rather than guessing.
