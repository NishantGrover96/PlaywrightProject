# Generic Copilot Instructions

This file provides general guidance for AI-assisted coding in any repository.

For tools that support root-level instruction discovery, see `AGENTS.md`.

## Core Behavior
- Think before coding. Clarify assumptions when requirements are ambiguous.
- Prefer the simplest solution that satisfies the request.
- Make focused, minimal changes. Avoid unrelated refactors.
- Match the existing style and conventions in files you touch.

## Code Quality
- Prioritize readability over cleverness.
- Keep functions/components small and cohesive.
- Avoid duplication when practical, but do not over-abstract.
- Add concise comments only where logic is non-obvious.

## Type Safety
- Prefer explicit types at boundaries (inputs, outputs, public APIs).
- Avoid `any` unless unavoidable; use safer alternatives and narrowing.
- Remove unused imports, variables, and dead code introduced by your change.

## Testing Guidance
- Treat tests as behavior checks, not implementation checks.
- Add or update tests when changing behavior.
- Prefer small, targeted test runs first, then broader runs if needed.

## Playwright Page Object & Test Generation — Master Rules

> Applied to every Page Object, spec file, helper, and fixture generated in this repo.

### 1. Understand the UI First
- Analyze every HTML snippet provided before writing a single locator.
- Screenshots are supporting context only — never the primary source.
- If JavaScript dynamically renders content, state this and wait for the final DOM.
- If supplied HTML is incomplete, **explicitly list what additional HTML is needed** before writing any locator.
- Never fabricate DOM structures.

### 2. Locator Preference Order (highest → lowest stability)
1. `id`
2. `data-testid`
3. `data-test` / `data-qa`
4. `aria-label`
5. `getByRole()`
6. `getByLabel()`
7. `getByPlaceholder()`
8. `getByText()`
9. Stable structural CSS selector
10. `nth-child()` — **only** when table column order is fixed and nothing better exists

**Never use:**
- Auto-generated IDs
- Bootstrap layout/styling classes
- Invented attributes (`data-col`, `data-package`, `.package-name`) unless confirmed in HTML

### 3. Validate Every Locator Before Writing Code
For every locator answer:
- Does this selector exist in the supplied HTML?
- Will it uniquely identify the element?
- Will it survive CSS/styling changes?

If any answer is **No** — choose a different locator. Never generate code that will timeout.

### 4. Dynamic Content & AJAX
Assume enterprise apps use AJAX, Fetch, SignalR, DataTables, lazy loading, or server-side pagination.

**Never interact with data immediately after navigation.** Always wait for:
- Loading spinner hidden → `expect(spinner).toBeHidden()`
- Skeleton/loading row removed
- Table body populated → `expect(rows.first()).toBeVisible()` or `expect(rows).toHaveCount(n)`

### 5. Table Handling
- Never assume tables have custom CSS classes — inspect actual HTML
- Use `row.locator('td').nth(n)` only when no stable attribute exists, and only when column order is fixed
- Every table method must handle: records exist / empty / loading / API failure

### 6. Synchronization — Playwright expectations only, never `waitForTimeout()`
```ts
expect(locator).toBeVisible()
expect(locator).toBeHidden()
expect(locator).toHaveCount(n)
expect(page).toHaveURL(/pattern/)
expect(locator).toContainText('...')
```

### 7. Page Object Model
- All locators defined in the constructor
- Public methods: `waitForReady()`, `search()`, `filter()`, `clearFilters()`, `getRowCount()`,
  `getCellText()`, `clickView()`, `clickEdit()`, `delete()`, `save()`, `cancel()`, `isEmpty()`, `getToastMessage()`
- Tests call Page Object methods only — no raw locators in spec files
- Preserve existing public API when modifying a Page Object; explain any breaking changes before applying

### 8. Assertions — Validate Business Behavior
```ts
// ✔ Correct — behavior assertions
expect(await page.getOrderStatus()).toBe('PAID');
expect(await page.isEmpty()).toBe(false);

// ✗ Wrong — implementation/CSS assertions
expect(row).toHaveClass('highlight');
```

### 9. Resilience
Generated code must continue working when:
- An extra column is added
- An optional field is hidden
- Data is empty
- Network is slow
- Pagination changes
- Loading is delayed

### 10. Error Messages
Produce descriptive failures, not generic Playwright timeouts:
```ts
// ✔
throw new Error('Expected at least one order row after loading, but no rows were rendered.');
// ✗
await orderRows.first().click(); // will timeout with no context
```

### 11. Locator Validation Report (required on every output)
Include this table before returning any Page Object or spec file:

| Locator | HTML element matched | Why chosen | Stability | Fixed column index? |
|---|---|---|---|---|
| `page.locator('#orderHistoryBody tr')` | `<tr>` in `#orderHistoryBody` | Stable `id` on `tbody` | High | No |

Flag every selector that references a non-existent attribute — propose a corrected alternative.

### 12. Existing Project Compatibility
- Match file/folder structure under `tests/playwright/pages/`, `tests/playwright/specs/`, `tests/playwright/helpers/`
- TypeScript strict mode — no `any`, explicit return types on public methods
- Reuse existing fixtures from `tests/playwright/fixtures/`

## Security And Secrets
- Never hardcode secrets, tokens, passwords, or private keys.
- Use environment variables or secure configuration sources.
- Validate and sanitize untrusted input.

## Dependency And File Hygiene
- Reuse existing libraries and utilities before adding new dependencies.
- If adding a dependency, keep it minimal and justify its need.
- Do not rename/move/delete unrelated files unless requested.

## Pre-PR Checklist
- Code builds and relevant tests pass.
- No debug logs, temporary flags, or placeholder code left behind.
- No secrets or sensitive data included in code, config, or tests.
- Changes are scoped to the requested task.
