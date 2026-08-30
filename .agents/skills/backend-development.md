# Backend Development Skill & Best Practices

## ⚙️ Backend Architecture & Principles
- **Runtime**: Node.js / TypeScript (or Go / Python depending on service requirements)
- **API Standards**: RESTful JSON API with OpenAPI/Swagger specifications or typed tRPC endpoints.
- **Data Access**: Typed ORM / Query builder (Prisma, Drizzle, Kysely) with explicit migrations.

---

## 🛠 Backend Engineering Guidelines

1. **Controller-Service-Repository Pattern**:
   ```
   Request ──► Middleware (Auth, RateLimit) ──► Controller (Validation & DTO) 
           ──► Service (Business Logic) ──► Repository (DB queries) ──► Database
   ```

2. **Validation & Type Safety**:
   - Validate every inbound request payload with a schema validator (Zod / Joi).
   - Infer TypeScript types directly from validation schemas to eliminate duplication.

3. **Error Handling & Middleware**:
   - Centralize error handling middleware to format responses consistently:
     ```json
     {
       "success": false,
       "error": {
         "code": "RESOURCE_NOT_FOUND",
         "message": "The requested note does not exist.",
         "details": null
       }
     }
     ```
   - Log unhandled errors with stack traces internally, but never expose stack traces to clients in production.

4. **Security & Performance**:
   - Implement database connection pooling.
   - Enforce pagination limits (default: 20, max: 100) on all collection endpoints.
   - Guard against N+1 queries using batch loading or eager joins.
