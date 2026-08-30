# Coding Standards & Best Practices

## 🧹 General Code Quality

1. **Readability & Simplicity**:
   - Write clear, self-describing code with meaningful variable and function names.
   - Functions should do one thing well (Single Responsibility Principle). Keep functions under 40 lines where feasible.

2. **TypeScript & Type Safety**:
   - Enable `strict: true` in `tsconfig.json`.
   - Never use `any`. Use `unknown`, generic parameters, or explicit interfaces.
   - Co-locate types with the domain model or in dedicated `types/` subdirectories.

3. **Error Handling**:
   - Use structured custom error classes (e.g. `AppError`, `NotFoundError`, `UnauthorizedError`).
   - Always catch errors at layer boundaries and log them with context (avoid silent `catch (e) {}` blocks).
   - Return clean, safe error messages to clients without leaking stack traces or database error messages in production.

4. **Code Organization & Imports**:
   - Group imports logically: (1) Standard libraries, (2) Third-party modules, (3) Internal modules/components, (4) Types/interfaces.
   - Use path aliases (e.g., `@/components/...`, `@/services/...`) rather than deep relative paths (`../../../../`).
