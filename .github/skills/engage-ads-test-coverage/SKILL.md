---
name: engage-ads-test-coverage
description: Generate comprehensive Playwright test cases for EngageAds module features, covering positive, negative, boundary, edge case, role-based, and dynamic UI scenarios. Supplements the global playwright-test-generation skill with EngageAds-specific depth and coverage requirements.
applyTo: tests/playwright/specs/engage-ads/**
---

# EngageAds - Playwright Test Coverage Guidelines

## Scope
Applies to all EngageAds feature specs under `tests/playwright/specs/engage-ads/`.
Supplements (does not replace) `playwright-test-generation` and the master rules in `.github/copilot-instructions.md`.

## Role Accounts
All role-based tests use credentials from the project `.env` files.

| Role | Credential Key | Access Level |
|---|---|---|
| Admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Full access including config and reporting |
| Manager | `MANAGER_EMAIL` / `MANAGER_PASSWORD` | Campaign management, reporting |
| Dealer | `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Own campaigns only |
| Unauthorized | No session / expired token | Redirected to login |

Network error and HTTP fault injection tests are **out of scope** - skip them.

---

## Required Coverage Matrix

For every EngageAds feature, generate tests across all applicable tiers:

### 1. Smoke Tests (`@smoke`)
- Page loads with correct heading
- Authenticated dealer can reach the page
- Unauthenticated user is redirected to login
- Core UI elements render (table, filters, key buttons)

### 2. Authorization Tests (`@auth`)
For each role that has different access:
- Admin sees admin-only controls
- Manager sees manager-scoped data
- Dealer sees own data only
- Unauthorized user cannot access the page (redirect asserted)

### 3. Positive Scenarios (`@regression @happy-path`)
- Successful end-to-end workflow (e.g., place order, submit campaign, view history)
- Expected navigation after action
- Toast / success message appears
- Correct data displayed after save or submit
- Correct modal / dialog content

### 4. Negative Scenarios (`@regression @validation`)
- Required fields: assert inline error when left empty
- Invalid format (e.g., bad date, non-numeric where numeric required)
- Duplicate data submission
- Server-side validation errors surfaced to UI

### 5. Boundary Conditions (`@regression @boundary`)

| Category | Values to Test |
|---|---|
| Text inputs | Empty string, 1 char, max allowed length, max+1 char |
| Numeric inputs | 0, negative, decimal, extremely large |
| Dates | Today, yesterday, far future, far past, same start=end, end before start |
| Amounts/Spend | $0.00, $0.01, max threshold, max+$0.01 |

### 6. Search & Filter Tests (`@regression @filters`)
- Exact match returns correct row
- Partial match (e.g., partial Order ID, partial Package Name)
- Case-insensitive search
- No matching records -> DataTables empty state (`td.dataTables_empty` text "No data available in table")
- Multiple filters combined
- Clear/Reset filters restores full result set
- Invalid filter value (e.g., letters in a numeric field)

### 7. Sorting Tests (`@regression @sort`) - when columns are sortable
- Ascending order (first click)
- Descending order (second click)
- Sort with duplicate values
- Sort with empty/null values in column

### 8. Pagination Tests (`@regression @pagination`) - when table is paginated
- First page: Previous button disabled
- Last page: Next button disabled
- Single page: both Prev/Next disabled
- Empty results: no pagination rendered
- Page size change re-renders correct row count
- Navigate to specific page via page number link

### 9. Date Handling (`@regression @dates`)
- Invalid date range (end before start) -> validation message
- Same start and end date -> valid
- Leap year date (Feb 29) where date pickers used
- Future date -> valid or invalid depending on business rule

### 10. Input Edge Cases (`@regression @edge`)
- Leading/trailing whitespace in search fields -> trimmed and searched
- Special characters in search (e.g., `& < > "`) -> no crash
- HTML injection in search input -> rendered as text, not executed
- SQL injection string in search -> no error, no data exposure

### 11. Dynamic UI (`@regression @dynamic-ui`)
- Loading indicator appears on data fetch
- Loading indicator disappears before interaction
- Disabled buttons cannot be clicked before prerequisites met
- Toast notifications (success/error) appear and dismiss
- Confirmation dialogs: Cancel aborts action, Confirm proceeds
- Modal opens with correct data, closes on dismiss

### 12. User Action Edge Cases (`@regression @ux`)
- Browser refresh during wizard step -> correct behavior (return to step or start)
- Back button mid-wizard -> step persists or prompts unsaved changes
- Cancel action in a multi-step flow -> returns to previous state
- Rapid repeated clicks on submit -> only one submission triggered

---

## Coverage Checklist (run before marking a feature complete)

- [ ] Smoke: page load, auth redirect, core UI visible
- [ ] Auth: each relevant role tested, unauthorized redirected
- [ ] Happy path: full workflow succeeds
- [ ] Negative: all required-field validations triggered
- [ ] Boundary: min / max / out-of-range values tested
- [ ] Filters: match, no-match, combined, reset
- [ ] Pagination: first/last page, page size, empty
- [ ] Dynamic UI: loading states, toasts, modals, disabled controls
- [ ] Input edge cases: whitespace, special chars (no HTML injection execution)
- [ ] No `waitForTimeout()` used anywhere
- [ ] No invented locators - all verified against live DOM or provided HTML
- [ ] Locator Validation Report table included in output
- [ ] Tests are independent (no shared mutable state between tests)
- [ ] Existing helper methods reused (check `tests/playwright/helpers/engage-ads/`)

---

## Spec File Structure (EngageAds standard)

```typescript
import { test, expect } from '../../../fixtures/auth.fixtures';
import { OrderHistoryPage } from '../../../pages/engage-ads/feature-order-history/OrderHistoryPage';
import testData from '../../../data/engage-ads/feature-order-history/test-data.json';

test.describe('EngageAds - Order History', () => {

  test.describe('Smoke', () => {
    test('OH-SMOKE-001 - page loads for authenticated dealer @smoke', async ({ dealerPage }) => { });
    test('OH-SMOKE-002 - unauthenticated user redirected to login @smoke @auth', async ({ page }) => { });
  });

  test.describe('Authorization', () => {
    test('OH-AUTH-001 - admin can view all orders @auth', async ({ adminPage }) => { });
    test('OH-AUTH-002 - dealer sees own orders only @auth', async ({ dealerPage }) => { });
  });

  test.describe('Positive Scenarios', () => {
    test('OH-TC-001 - table renders with at least one order @regression', async ({ dealerPage }) => { });
    test('OH-TC-002 - view order details modal shows correct data @regression', async ({ dealerPage }) => { });
  });

  test.describe('Filters', () => {
    test('OH-TC-010 - filter by order ID returns exact match @regression @filters', async ({ dealerPage }) => { });
    test('OH-TC-011 - filter with no matching records shows empty state @regression @filters', async ({ dealerPage }) => { });
    test('OH-TC-012 - reset filters restores full result set @regression @filters', async ({ dealerPage }) => { });
    test('OH-TC-013 - combined date range and status filter @regression @filters', async ({ dealerPage }) => { });
  });

  test.describe('Boundary Conditions', () => {
    test('OH-TC-020 - date range: same start and end date @regression @boundary', async ({ dealerPage }) => { });
    test('OH-TC-021 - date range: end before start shows validation @regression @boundary', async ({ dealerPage }) => { });
  });

  test.describe('Pagination', () => {
    test('OH-TC-030 - page size change re-renders correct row count @regression @pagination', async ({ dealerPage }) => { });
    test('OH-TC-031 - navigate to page 2 loads next set of records @regression @pagination', async ({ dealerPage }) => { });
  });

  test.describe('Dynamic UI', () => {
    test('OH-TC-040 - loading indicator appears then hides before table interaction @regression @dynamic-ui', async ({ dealerPage }) => { });
  });

  test.describe('E2E', () => {
    test('OH-E2E-001 - filter -> view details -> reset full workflow @e2e', async ({ dealerPage }) => { });
  });

});
```

---

## Assertions Reference

Always assert business behavior, not CSS class presence:

```typescript
// ✅ Correct
expect(await orderPage.getOrderStatus(row)).toBe('PAID');
expect(await orderPage.isEmpty()).toBe(false);
await expect(orderPage.orderDetailsModal).toBeVisible();

// ❌ Wrong
await expect(row).toHaveClass('status-paid');
await expect(modal).toHaveAttribute('style', 'display: block;');
```

### Common EngageAds Assertions

```typescript
// Table not empty
await expect(page.locator('#orderHistoryBody tr').filter({ not: page.locator('td.dataTables_empty') }).first()).toBeVisible();

// DataTables empty state
await expect(page.locator('td.dataTables_empty')).toContainText('No data available in table');

// Modal visible with correct Order ID
await expect(page.locator('#orderDetailsModal')).toBeVisible();
await expect(page.locator('#modalOrderId')).toHaveText(expectedOrderId);

// Toast success
await expect(page.locator('.toast-success, [role="alert"]')).toBeVisible();

// Loading indicator gone before interacting
await expect(page.locator('#orderHistoryBody td').filter({ hasText: 'Loading' })).toBeHidden();
```

---

## Integration with Other Skills

| Skill | When to Use |
|---|---|
| `repo-analysis` | Before generating tests - analyze controller, service, DTO, view to find business rules |
| `ui-analysis` | Inspect live UAT DOM to confirm locators before writing POM |
| `functional-test-catalog` | Generate test IDs and tier assignments before coding specs |
| `playwright-test-generation` | Global generation rules (output structure, POM conventions) |
| `api-verification` | When EngageAds feature calls a REST endpoint that should be separately validated |
| `database-verification` | Verify DB state after order placement, campaign save, etc. |
