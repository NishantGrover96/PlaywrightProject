# API Verification Skill

## Purpose

Generate and execute API validation tests that verify the Modern platform's REST API endpoints produce correct responses, enforce authentication/authorization, validate inputs, and return data that matches legacy behavior.

## When to Use

Invoke when:
- Running Phase 9 of the migration QA pipeline
- User says "validate API for..." or "generate API tests for..."
- Modern platform exposes REST APIs replacing legacy DLL business logic

## Inputs

- **Module**: e.g., `coop`
- **Feature**: e.g., `submit-claim`
- **API Base URL**: Modern API base URL
- **API Documentation / Swagger**: Path or URL to API spec (if available)
- **Legacy DLL Methods**: Methods from legacy DLL that the API replaces

## Output Files

```
tests/api/{module}/{feature}.api.spec.ts
```

## Test Categories

### Authentication
- Request without token → 401 Unauthorized
- Request with expired token → 401 Unauthorized
- Request with invalid token → 401 Unauthorized

### Authorization
- User with correct role → 200/201
- User without required role → 403 Forbidden
- User accessing another dealer's data → 403 Forbidden / 404 Not Found

### Input Validation
- Missing required fields → 400 Bad Request with field errors
- Invalid field formats → 400 with specific field errors
- Boundary values (min/max amounts, dates) → expected behavior
- Injection attempts → 400 Bad Request (never 500)

### Business Logic
- Valid submission → correct HTTP status + response body
- Business rule violations → 422 Unprocessable Entity with business error message
- Eligibility failures → correct error response

### Response Schema
- Response shape matches expected schema
- Required fields present in response
- Data types correct (number vs string, date format)
- No sensitive data leaked in error responses

### Idempotency / Side Effects
- Duplicate submission prevention
- Correct database state after successful call
- No state change on failed validation

## Spec File Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Coop Submit Claim API', () => {
  test.describe('Authentication', () => {
    test('returns 401 without token', async ({ request }) => {
      const res = await request.post('/api/coop/claims');
      expect(res.status()).toBe(401);
    });
  });
  
  test.describe('Happy Path', () => {
    test('creates claim with valid data', async ({ request }) => {
      const res = await request.post('/api/coop/claims', {
        headers: { Authorization: `Bearer ${token}` },
        data: validClaimPayload
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toMatchObject({ claimId: expect.any(Number), status: 'Draft' });
    });
  });
});
```

## Legacy Parity Checks

For each API endpoint, document:
- The legacy DLL method it replaces
- The equivalent business logic behavior
- Any known behavioral differences (document, do not silently accept)
