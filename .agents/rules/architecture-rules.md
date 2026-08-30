# Architecture Rules & Invariants

## 🏛 Structural Invariants
1. **Layered Separation**:
   - `Controllers / Routes` -> `Services` -> `Repositories / Data Access` -> `Database`.
   - Never query the database directly from controller/route handlers.
   - Keep business logic inside dedicated service modules.
2. **Stateless Backend**:
   - Application servers must remain stateless to allow horizontal scaling.
   - Session states must be managed via JWTs, distributed Redis stores, or database session tables.
3. **API Contract Stability**:
   - Use standard RESTful conventions or clear typed RPC/GraphQL endpoints.
   - Always validate incoming payloads using schemas (e.g. Zod, Joi, class-validator).
   - Standardize error responses: `{ success: false, error: { code: string, message: string, details?: any } }`.

---

## 🚫 Forbidden Patterns
- **Circular Dependencies**: Avoid inter-module circular imports. Use dependency injection or event dispatchers.
- **Leaking Internal Entities**: Never expose database models directly over the wire without DTO transformation / attribute filtering.
- **Client-side DB Access**: Never allow client apps direct access to database credentials or direct database query execution.
