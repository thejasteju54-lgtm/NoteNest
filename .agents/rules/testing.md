# Testing Standards & Strategies

## 🧪 Testing Pyramid

```
       /   E2E Tests   \       (Playwright / Cypress) - Critical user journeys
      /─────────────────\
     / Integration Tests \     (API endpoints, DB queries, auth flows)
    /─────────────────────\
   /      Unit Tests       \   (Business logic, utilities, validation, stores)
  /─────────────────────────\
```

---

## 🎯 Requirements & Rules

1. **Unit Testing**:
   - Every utility function, data transformer, and isolated service logic must have unit test coverage.
   - Use mock data factories rather than hardcoded inline blobs.

2. **Integration Testing**:
   - Test full request-response cycles on API routes with a test database container or isolated test environment.
   - Assert both happy paths and edge cases (invalid tokens, duplicate keys, missing payloads, rate-limit triggers).

3. **End-to-End Testing**:
   - Smoke test key user workflows: Sign up -> Create Note -> Add Tags -> Attach File -> Search Note -> Sign out.

4. **Test Co-location & Naming**:
   - Unit tests: `*.test.ts` or `*.spec.ts` co-located with source or placed under `tests/unit/`.
   - Integration tests under `tests/integration/`.
   - E2E tests under `tests/e2e/`.

5. **CI Automation**:
   - No pull request should be merged if test suites fail or code coverage drops below the project target threshold (>= 80%).
