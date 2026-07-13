---
name: ui-analysis
description: Navigate a live application via Playwright to document UI structure, user journeys, form fields, validations, and error states.
---

# UI Analysis - Step 2: Live Application Analysis via Playwright

## Purpose

Navigate the live application at the provided URL using Playwright's browser automation.
Observe and document the real user interface: page structure, user journeys, form fields,
validations, error states, and expected outcomes.

This produces a **UI Analysis Report** that feeds into `/functional-test-catalog`.
It bridges the gap between source code analysis and actual runtime behavior.

## When to Use

- Running Step 2 of the Functional QA Test Generation pipeline
- User says "analyze UI for...", "inspect live app for...", "observe app behavior for..."
- Always run after `/repo-analysis` and before `/functional-test-catalog`

---

## Inputs

- **Module**: e.g. `coop`
- **Feature**: e.g. `submit-claim`
- **Feature Path**: The URL path of the feature, e.g. `/CoopManagement/Claims/Submit/SubmitClaim`
- **UAT Base URL**: Loaded automatically from `.env.uat` -> `BASE_URL` variable.
  The full feature URL is: `{BASE_URL}{featurePath}`
- **Auth State**: `tests/playwright/fixtures/.auth/user.json` (dealer role) or
  `tests/playwright/fixtures/.auth/admin.json` (admin role)
  - loaded via `TEST_ENV=uat` project config in `playwright.config.ts`

### Environment Setup

All UI analysis targets the **DemoPortal UAT environment**:

```powershell
# Load UAT environment variables
$env:TEST_ENV = "uat"
# playwright.config.ts reads: dotenv.config({ path: `.env.uat` })
# BASE_URL is sourced from .env.uat
```

Verify `.env.uat` exists and `BASE_URL` is set before launching the browser.
If `.env.uat` does not exist, ask the user to provide the UAT base URL directly.

---

## Analysis Steps

### Step 2.1 - Launch Browser and Navigate

```typescript
// All UI analysis targets DemoPortal UAT environment
// TEST_ENV=uat loads .env.uat -> BASE_URL points to DemoPortal UAT

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  baseURL: process.env.BASE_URL,          // loaded from .env.uat via TEST_ENV=uat
  storageState: 'tests/playwright/fixtures/.auth/user.json',  // dealer role
});
const page = await context.newPage();

// Feature URL = UAT BASE_URL + feature path
const featureUrl = `${process.env.BASE_URL}${featurePath}`;
await page.goto(featureUrl);
await page.waitForLoadState('networkidle');
```

**Pre-flight check**:
```powershell
# Confirm UAT environment is configured
if (!(Test-Path ".env.uat")) {
  Write-Error ".env.uat not found. Create it from .env.example and set BASE_URL to DemoPortal UAT URL."
  exit 1
}
# Read and display the UAT BASE_URL being used
$uatUrl = (Get-Content ".env.uat" | Select-String "^BASE_URL=").ToString().Split("=",2)[1]
Write-Host "UI Analysis targeting DemoPortal UAT: $uatUrl"
```

- If `.env.uat` is missing, stop and ask user to configure it
- If auth state is missing, document the unauthenticated redirect behavior (still valid test case)
- Navigate to `{UAT_BASE_URL}{featurePath}`, wait for `networkidle`
- Take a screenshot of the initial page state: `reports/test-results/{client}/{module}/feature-{feature}/ui-analysis/initial.png`

---

### Step 2.2 - Page Structure Mapping

For the landing page of the feature:

**Capture**:
- Page title / heading
- Navigation breadcrumb (if visible)
- All visible form sections / tabs / steps
- All form fields: label text, input type, placeholder text, required indicator
- All buttons: label, position, initial enabled/disabled state
- All dropdowns: default selection, available options (if loaded)
- All static text messages and informational content
- Any tooltips, help icons, or inline help text
- Table / list views (if the page shows data)

**Document**:
```markdown
## Page Structure
- Title: {h1 or page-title text}
- Sections: {list each section/fieldset}
- Form Fields: {name, type, label, required, placeholder}
- Buttons: {label, type, initial state}
- Static Messages: {any instructional or informational text}
```

---

### Step 2.3 - User Journey Mapping

Systematically walk through every user journey the feature supports:

#### Journey 1: Happy Path (Submit)
1. Navigate to feature URL (authenticated)
2. Observe initial state - what data is pre-loaded?
3. Fill all required fields with valid data
4. Click submit / confirm button
5. Observe success state - message, redirect, confirmation

#### Journey 2: Save Draft (if applicable)
1. Fill partial form
2. Click save draft / save for later
3. Observe draft save confirmation

#### Journey 3: Validation Errors
1. Submit the form without filling required fields
2. Observe validation error display: inline, toast, modal, or summary?
3. Document exact error messages shown per field
4. Fill one field at a time and re-submit - capture per-field error behavior

#### Journey 4: Field-Level Interactions
For each interactive field:
- Dropdowns: observe loading behavior, default, options
- Date inputs: date picker behavior, format enforcement
- File uploads: accepted types, size limits, upload feedback
- Auto-populate fields: what triggers population?
- Conditional fields: what shows/hides what?

#### Journey 5: Unauthenticated Access
1. Open a private/incognito window
2. Navigate directly to the feature URL
3. Document redirect behavior (login page URL, redirect_uri parameter)

---

### Step 2.4 - Interaction Catalog

For each form field and interactive element found, document:

```markdown
## Interaction Catalog

| Element | Selector Hint | Type | Behavior | Notes |
|---|---|---|---|---|
| Program select | #ProgramId / [name="ProgramId"] | select | Populated on load from API | Required; shows error if empty |
| Claim Date | #ClaimDate | date | Auto-populated to today | Format: MM/DD/YYYY |
| Amount | #Amount | number | Decimal allowed | Must be > 0 |
| Submit button | button[type=submit] | button | Triggers POST | Disabled until form valid? |
```

---

### Step 2.5 - Validation Behavior Documentation

Document how validations are surfaced:

```markdown
## Validation Behavior

### Trigger
- [ ] On submit
- [ ] On blur (field loses focus)
- [ ] On input (real-time)

### Display Pattern
- [ ] Inline below each field
- [ ] Toast / banner at top
- [ ] Modal dialog
- [ ] Summary list at top of form

### Error Styling
- [ ] Red border on invalid fields
- [ ] Error message in red text
- [ ] Field label color change

### Recovery
- [ ] Error clears when field is corrected
- [ ] Form scrolls to first error
- [ ] Tab order maintained
```

For each validation observed, record:
| Field | Condition | Error Message (exact) | Display Location |
|---|---|---|---|

---

### Step 2.6 - Page State Variations

Capture screenshots and document behavior for:
1. **Initial / Empty state** - page just loaded
2. **Partially filled state** - some fields filled, some empty
3. **Validation error state** - submit clicked with missing/invalid data
4. **Loading state** - during async operations (spinner, disabled buttons)
5. **Success state** - after successful submission
6. **Error state** - server error, network failure, business rule rejection

---

### Step 2.7 - Network / API Calls

While interacting, observe browser network activity:

```markdown
## Observed API Calls

| Action | Method | URL | Request Body | Response |
|---|---|---|---|---|
| Page load | GET | /api/coop/programs | - | [{programId, name}] |
| Submit | POST | /api/coop/claims | {programId, claimDate, amount} | {claimId, status} |
```

Note any:
- AJAX calls for dropdown population
- Real-time validation calls
- File upload endpoints
- Polling / progress endpoints

---

### Step 2.8 - Selector Inventory

For every interactive element, derive the best Playwright selector following priority order:

1. `page.getByLabel(...)` - accessible label (preferred)
2. `page.getByRole(...)` - ARIA role + name
3. `page.getByTestId(...)` - `data-testid` attribute
4. `page.locator('css')` - CSS selector (last resort)

```markdown
## Selector Inventory

| Element | Preferred Selector | Fallback Selector |
|---|---|---|
| Program select | `page.getByLabel(/program/i)` | `page.locator('#ProgramId')` |
| Submit button | `page.getByRole('button', { name: /submit/i })` | `page.locator('button[type=submit]')` |
| Error message | `page.getByRole('alert')` | `page.locator('.validation-error')` |
```

---

## Output Format

### UI Analysis Report

```markdown
# {Module} {Feature} - UI Analysis Report
Generated: {timestamp}
Environment: DemoPortal UAT
App URL: {UAT_BASE_URL}{featurePath}
Auth State: {authenticated as Dealer | authenticated as Admin | unauthenticated}

## Screenshots
- Initial state: reports/test-results/{client}/{module}/feature-{feature}/ui-analysis/initial.png
- Error state:   reports/test-results/{client}/{module}/feature-{feature}/ui-analysis/validation-errors.png
- Success state: reports/test-results/{client}/{module}/feature-{feature}/ui-analysis/success.png

## Page Structure
{page title, sections, fields, buttons}

## Interaction Catalog
{table: element, selector, type, behavior}

## Validation Behavior
{trigger, display pattern, field-level errors}

## User Journeys Observed
{journey 1-N summary}

## Observed API Calls
{table: action, method, url, response shape}

## Selector Inventory
{table: element, preferred selector, fallback}

## Cross-Reference: Code vs UI
| Code Element (repo-analysis) | UI Element | Match? | Notes |
|---|---|---|---|
| ProgramId (required field) | Program select | ✅ | Dropdown populated on load |
| BusinessRule BR-001 (fund balance) | Amount field + submit | [!]️ | Server-side only - no client indicator |

## Gaps Observed (UI vs Code)
| Gap | Description | Impact |
|---|---|---|
| Field present in UI but not in code | - | - |
| Validation in code but not visible in UI | - | Needs test at API level |
```

---

## Output Files

```
docs/module-analysis/{client}/{module}/feature-{feature}/ui-analysis.md
reports/test-results/{client}/{module}/feature-{feature}/ui-analysis/
  ├-- initial.png
  ├-- validation-errors.png
  └-- success.png
```

---

## Quality Gate

UI analysis is complete when:
- All form fields catalogued with selectors
- All user journeys documented (happy path, validation, unauthenticated)
- Validation display pattern documented (trigger, location, message text)
- All API calls observed and documented
- Cross-reference table between code analysis and UI populated
- Screenshots taken for: initial, error, success states
- Selector inventory complete (preferred + fallback for every interactive element)
