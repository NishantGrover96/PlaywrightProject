---
name: playwright-test-generation
description: Generate Playwright test assets including page objects, spec files, helpers, and API and database verification scripts from functional catalogs.
---

# Playwright Test Generation — Prompt 3: Generate Test Assets

## Purpose

Using the Functional Unit Catalog and Test Catalog from Prompt 2, generate all test automation assets:
- Playwright Page Objects (POM)
- Spec files (Smoke, Regression, E2E)
- Helpers (reusable actions)
- API spec files
- Database verification SQL scripts

## When to Use

- After Prompt 2 (Functional Unit Catalog + Test Catalog) is complete
- User says "generate Playwright tests for…", "implement automation for…", "generate test assets for…"

## Inputs

- **Module**: e.g. `coop`
- **Feature**: e.g. `submit-claim`
- **Test Catalog**: `docs/functional-catalogs/{client}/{module}/feature-{feature}/test-catalog.md`
- **Smoke Suite**: `docs/functional-catalogs/{client}/{module}/feature-{feature}/smoke-suite.md`
- **Regression Suite**: `docs/functional-catalogs/{client}/{module}/feature-{feature}/regression-suite.md`
- **E2E Suite**: `docs/functional-catalogs/{client}/{module}/feature-{feature}/e2e-suite.md`
- **Existing DemoPortalV2 tests**: `D:\...\DemoPortalV2\tests\playwright\coop\` — reuse proven selectors and patterns

## Output Files

```
tests/playwright/pages/{client}/{module}/feature-{feature}/{Feature}Page.ts
tests/playwright/helpers/{client}/{module}/feature-{feature}/{feature}.helpers.ts
tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts
tests/playwright/data/{client}/{module}/feature-{feature}/test-data.json
tests/api/{client}/{module}/feature-{feature}/{feature}.api.spec.ts
tests/database/{client}/{module}/feature-{feature}/verify-records.sql
tests/database/{client}/{module}/feature-{feature}/compare-legacy-vs-modern.sql
```

## Page Object Standards

```typescript
// {Feature}Page.ts — never contains test logic
export class SubmitClaimPage {
  readonly page: Page;
  readonly url = '/CoopManagement/Claims/Submit/SubmitClaim';

  // All locators as readonly properties
  readonly programSelect: Locator;
  readonly claimDateInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.programSelect = page.getByLabel(/program/i).first();
    // ... locators from .cshtml selectors
  }

  // Navigation
  async navigate(): Promise<void> { await this.page.goto(this.url); }

  // Actions
  async fillForm(data: FormData): Promise<void> { ... }
  async submit(): Promise<void> { ... }
  async saveDraft(): Promise<void> { ... }

  // Assertions
  async expectSuccessMessage(): Promise<void> { ... }
  async expectValidationError(field: string): Promise<void> { ... }
}
```

## Helpers Standards

```typescript
// {feature}.helpers.ts — reusable multi-step flows
import { Page } from '@playwright/test';
import { SubmitClaimPage } from '../../pages/coop/feature-submit-claim/SubmitClaimPage';
import testData from '../../data/coop/feature-submit-claim/test-data.json';

export async function setupClaimForSubmit(page: Page): Promise<SubmitClaimPage> {
  const claimPage = new SubmitClaimPage(page);
  await claimPage.navigate();
  await claimPage.fillForm({
    programId: testData.valid.programId,
    claimDate: testData.valid.claimDate,
    amount:    testData.valid.amount,
    description: testData.valid.description,
  });
  return claimPage;
}
```

## Spec File Standards

```typescript
// {feature}.spec.ts — organized by test suite sections
import { test, expect } from '@playwright/test';
import { SubmitClaimPage } from '../../../pages/coop/feature-submit-claim/SubmitClaimPage';
import { setupClaimForSubmit } from '../../../helpers/coop/feature-submit-claim/submit-claim.helpers';
import testData from '../../../data/coop/feature-submit-claim/test-data.json';

test.describe('Coop — Submit Claim', () => {

  test.describe('Smoke', () => {
    test('COOP-SMOKE-001 - page loads @smoke', async ({ page }) => { ... });
  });

  test.describe('Happy Path', () => {
    test('COOP-TC-001 - full submit flow @smoke @regression @critical', async ({ page }) => { ... });
  });

  test.describe('Validation', () => {
    test('COOP-TC-010 - program required @regression', async ({ page }) => { ... });
  });

  test.describe('Authorization', () => {
    test('COOP-TC-038 - unauthenticated redirects @smoke @regression @critical', async ({ browser }) => { ... });
  });

});
```

## Test Data Standards

```json
{
  "users": {
    "dealer":  { "email": "", "password": "", "dealerId": "" },
    "dealerB": { "dealerId": "" },
    "admin":   { "email": "", "password": "" }
  },
  "valid":    { "programId": "", "claimDate": "", "amount": "", "description": "" },
  "invalid":  { "futureDate": "", "outsidePeriod": "", "xssPayload": "" },
  "boundary": { "atFundBalance": "", "atPerClaimMax": "" },
  "expectedStatuses": { "draft": "Draft", "submitted": "Received" },
  "expectedErrors":   { "programRequired": "...", "claimDateRequired": "..." }
}
```

## Selector Strategy (priority order)

1. `page.getByLabel(…)` — accessible label (preferred)
2. `page.getByRole(…)` — ARIA role
3. `page.getByTestId(…)` — `data-testid` attribute
4. `page.locator('css')` — CSS selector (last resort, use `.cshtml` as source)

When reading DemoPortalV2 sources:
- Check `.cshtml` for `id=`, `name=`, `asp-for=` attributes as selector hints
- Check `js*.js` files for jQuery selectors (e.g. `$('#txtContactName1')`) → convert to Playwright

## Environment Pattern

```typescript
// Never hardcode URLs — always use BASE_URL
// Auth state loaded from storageState, never re-login per test
use: {
  baseURL: process.env.BASE_URL,
  storageState: 'tests/playwright/fixtures/.auth/user.json',
}
```

## Quality Gate

Test assets are complete when:
- Every Smoke TC in smoke-suite.md has a corresponding `@smoke` test
- Every Regression TC in regression-suite.md has a corresponding `@regression` test
- Every E2E flow in e2e-suite.md has a corresponding `@e2e` test
- Page Object has no hardcoded URLs or test assertions
- Helpers cover multi-step flows used by 2+ tests
- `npx tsc --noEmit` passes with zero errors
