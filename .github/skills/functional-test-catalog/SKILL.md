---
name: functional-test-catalog
description: Discover business rules from analysis reports and generate a comprehensive test catalog organized by tier (Smoke, Regression, E2E).
---

# Functional Test Catalog — Steps 3 & 4: Business Rule Discovery + Test Catalog Generation

## Purpose

**Step 3 — Business Rule Discovery**: Correlate the Repository Analysis Report and UI Analysis Report
to extract and document every functional business rule and acceptance criterion.

**Step 4 — Functional Test Catalog**: Convert discovered business rules into a comprehensive catalog of
test scenarios organized by tier (Smoke, Regression, E2E).

This catalog is the **single source of truth for automation** and must be approved by QA
before Playwright tests are generated.

## When to Use

- Running Steps 3 & 4 of the Functional QA Test Generation pipeline
- User says "generate test catalog for…", "discover business rules for…", "build test scenarios for…"
- Always run after `/repo-analysis` and `/ui-analysis`
- Always run before QA review gate and `/playwright-test-generation`

---

## Inputs

- **Module**: e.g. `coop`
- **Feature**: e.g. `submit-claim`
- **Client**: e.g. `demoportal` — prompt the user: *"Which client does this feature belong to? (e.g. demoportal, certainteed, samsung)"*
- **Repo Analysis Report**: `docs/module-analysis/{client}/{module}/feature-{feature}/repo-analysis.md`
- **UI Analysis Report**: `docs/module-analysis/{client}/{module}/feature-{feature}/ui-analysis.md`

---

## Step 3 — Business Rule Discovery

### Correlation Methodology

For each item in the Repo Analysis Report, cross-reference with UI Analysis Report:

```
For each FORM FIELD in repo-analysis:
  → Find matching UI element in ui-analysis
  → Extract: label text, required status, type, selector, validation rules
  → Map to: test scenarios (valid input, missing required, invalid format, boundary)

For each BUSINESS RULE in repo-analysis:
  → Find where it manifests in the UI (error message, blocked action, hidden element)
  → If rule is server-side only: document as API-level test
  → Map to: test scenarios (rule satisfied, rule violated)

For each VALIDATION RULE in repo-analysis:
  → Match with observed error messages in ui-analysis
  → Confirm exact error message text
  → Map to: test scenario per rule

For each WORKFLOW TRANSITION in repo-analysis:
  → Find triggering UI action (button click, form submit)
  → Find resulting UI state (success message, redirect, status change)
  → Map to: test scenario per transition

For each SECURITY RULE in repo-analysis:
  → Find evidence in UI (redirect on unauthenticated, hidden elements for roles)
  → Map to: test scenario per security constraint

For each DATABASE OPERATION in repo-analysis:
  → Identify triggering user action
  → Document what DB state should exist after action
  → Map to: database verification test step
```

### Business Rule Catalog Format

```markdown
## Business Rule Catalog

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-001 | Program Required | Validation | ClaimService + [Required] on ProgramId | Error shown when Program empty on submit | High |
| BR-002 | Fund Balance Check | Business Logic | BudgetService.ValidateFunds() | Error message after submit; no client indicator | Critical |
| BR-003 | Submit creates Draft status | Workflow | ClaimService.SaveDraft() | Draft confirmation shown | High |
| BR-004 | Unauthenticated redirect | Security | [Authorize] on page model | Redirect to /Account/Login | Critical |
```

### Discovery Checklist

**UI / Form Behaviors** — extract a business rule for each:
- [ ] Page load and initialization (auth guard, data pre-load, default values)
- [ ] Each form field rendering (label, required indicator, type, placeholder)
- [ ] Dropdown/select population (source, timing, default selection)
- [ ] Conditional field show/hide rules
- [ ] Multi-step wizard navigation (if applicable)
- [ ] Read-only vs editable state per role

**Validation Rules** — one BR per rule:
- [ ] Required field — one per required field
- [ ] Field format (date format, currency, numeric range)
- [ ] Field length (min/max characters)
- [ ] Cross-field validation (field B depends on field A)
- [ ] Business rule validation (amounts, dates, limits)

**Business Logic Rules**:
- [ ] Eligibility / enrollment checks
- [ ] Balance / limit calculations (fund balance, per-claim max)
- [ ] Date range validation (fiscal period, program dates)
- [ ] Duplicate detection / prevention
- [ ] Amount / quantity validation

**Workflow Rules** — one BR per transition:
- [ ] Initial state on page load
- [ ] Draft save → temp identifier, status = Draft
- [ ] Submit → final identifier, status = Submitted/Received
- [ ] Each subsequent status transition
- [ ] Email / notification trigger per transition
- [ ] Resubmit / edit flow (if applicable)

**Data Persistence Rules** — one BR per write:
- [ ] Header record created (table, key fields, values)
- [ ] Detail / line-item records
- [ ] Attachment record
- [ ] Workflow step record
- [ ] Audit record (action, old/new status, user, timestamp)

**Security Rules** — one BR per rule:
- [ ] Unauthenticated access → redirect
- [ ] Unauthorized role → 403 / hidden element
- [ ] Data scoping (user sees only own records)
- [ ] Parameter tampering prevention
- [ ] File type / size restriction (server-side enforcement)

---

## Step 4 — Functional Test Catalog Generation

### Test Case Format

```
{MODULE}-TC-{NNN}  {Title}
Tier: Smoke | Regression | E2E
Category: UI | Validation | BusinessLogic | Workflow | DataPersistence | Security | ErrorHandling
Priority: P1-Critical | P2-High | P3-Medium | P4-Low
BR Covered: {BR-IDs}
Precondition: {setup required}
Steps:
  1. {action}
  2. {action}
Expected: {outcome}
Assertions:
  - {assertion 1}
  - {assertion 2}
Test Data: {what data is needed}
```

### Test Scenario Types to Generate

#### Smoke Tests (P1-Critical only — page loads and critical path)
Generate one test case for each:
- [ ] Page loads for authenticated user (200 OK, form visible)
- [ ] Unauthenticated user is redirected
- [ ] Happy path end-to-end (fill form → submit → success message)

#### Regression Tests (all functional paths)

**Happy Path Tests**:
- [ ] Submit with all valid required fields
- [ ] Submit with all valid optional fields populated
- [ ] Save draft (if feature supports it)
- [ ] Submit after editing a draft
- [ ] Each variation of required vs optional fields

**Validation Tests** (one per validation rule):
- [ ] Submit with [field] empty → error "{message}" shown
- [ ] Submit with [field] in wrong format → error "{message}" shown
- [ ] Submit with [field] below minimum → error "{message}" shown
- [ ] Submit with [field] above maximum → error "{message}" shown
- [ ] Fix validation error → error clears and submit succeeds

**Business Rule Tests** (one per business rule):
- [ ] Submit when [business rule condition met] → success
- [ ] Submit when [business rule condition NOT met] → appropriate error
- [ ] [Business rule boundary condition] → expected behavior

**Dropdown / Select Tests**:
- [ ] Dropdown populated on page load
- [ ] Dropdown shows correct options for user's context
- [ ] Selecting each significant option produces correct behavior

**Conditional UI Tests**:
- [ ] [Condition A] shows/hides [field/section]
- [ ] [Condition B] shows/hides [field/section]

**Authorization Tests**:
- [ ] Unauthenticated access redirects to login
- [ ] Role [X] can access feature
- [ ] Role [Y] cannot access feature (if applicable)
- [ ] User can only see their own records (data scoping)

#### E2E Tests (cross-feature workflows)
- [ ] Full workflow: submit → verify record appears in list/dashboard
- [ ] Full workflow: submit → verify email notification triggered
- [ ] Full workflow: submit → admin approves → status updates for dealer
- [ ] Error recovery: submit fails → retry → succeeds

#### Boundary Tests
- [ ] Amount at exactly the minimum allowed value
- [ ] Amount at exactly the maximum allowed value (fund balance cap)
- [ ] Amount at 1 cent above the maximum → error
- [ ] Date at first day of valid period
- [ ] Date at last day of valid period
- [ ] Date one day outside valid period → error
- [ ] Maximum allowed file size → upload succeeds
- [ ] File 1 byte over limit → upload rejected

#### Error Handling Tests
- [ ] Server error (500) response → appropriate error message shown (not stack trace)
- [ ] Network timeout → user-friendly message
- [ ] Duplicate submission prevention
- [ ] Session expiry during form fill → appropriate recovery

---

## Append Mode — Adding Test Cases to an Existing Catalog

When the user includes `mode=append` or `prepend=true` in their request (or says "add new test cases"),
follow these rules instead of generating a fresh catalog:

### Detection
Look for any of these signals:
- `mode=append` parameter
- `prepend=true` parameter
- The request says "add new test cases", "add to existing catalog", "append tests"
- `functional-units.html` already exists and contains real test rows (not just the placeholder)

### Append Rules
1. **Read the existing `functional-units.html` first** — extract all existing test IDs, titles, and the highest numeric suffix per tier (e.g. `SMOKE-007` → last smoke ID is 7).
2. **New test IDs continue from the highest existing ID** — never reuse existing IDs.
3. **New test cases are inserted AT THE TOP of their tier section** — before the first existing row in that tier. This ensures the latest test cases are visible first when the catalog is opened.
4. **Never delete or modify existing rows** — only prepend new rows within each tier.
5. **Update the stat card counts** — increment Total, Smoke/Regression/E2E counts to include the new cases.
6. **Update the status block** — change from "In Progress" to current status, update the generated date.

### New Test Case Position Rule (always enforced, even in full-generate mode)
Within every tier section, **always order test cases newest-first**:
- Highest-numbered test IDs appear at the TOP of the `<tbody>`
- Lowest-numbered (oldest) test IDs appear at the BOTTOM
- This makes it easy for any developer to see what was recently added without scrolling

### Copilot Chat Commands to Trigger Append Mode
```
@workspace /functional-test-catalog
client={clientId}  module={module}  feature={feature}  mode=append  prepend=true
```

---

## Test Catalog Output Format

### Markdown Format (test-catalog.md)

```markdown
# {Module} {Feature} — Functional Test Catalog
Generated: {timestamp}
Total Test Cases: N (Smoke: N | Regression: N | E2E: N)

## Business Rules Covered: N

## Test Cases

### Smoke Suite (N tests)

#### {MODULE}-SMOKE-001 — Page loads for authenticated user
- **Tier**: Smoke
- **Category**: UI
- **Priority**: P1-Critical
- **BR Covered**: BR-001 (page access)
- **Precondition**: User is authenticated as Dealer
- **Steps**:
  1. Navigate to {featureUrl}
- **Expected**: Page loads with status 200; form is visible; heading shows "{Feature Title}"
- **Assertions**:
  - `page.getByRole('heading', { name: /{title}/i }).isVisible()`
  - Form fields visible: {field1}, {field2}

### Regression Suite (N tests)

#### {MODULE}-TC-001 — Happy path: submit with all required fields
...

### E2E Suite (N tests)

#### {MODULE}-E2E-001 — Full workflow: submit to admin review
...
```

### HTML Format (functional-units.html)

**Always use Bootstrap 5** via CDN. Never write hand-rolled custom CSS for tables, cards, badges, or layout.

Required `<head>` block (copy verbatim):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous" defer></script>
<style>
  /* Tier + priority overrides only — no custom table CSS */
  .tier-smoke      { background:#dbeafe; color:#1d4ed8; }
  .tier-regression { background:#ede9fe; color:#6d28d9; }
  .tier-e2e        { background:#d1fae5; color:#065f46; }
  .priority-p1     { background:#fee2e2; color:#991b1b; }
  .priority-p2     { background:#fef3c7; color:#92400e; }
  .priority-p3     { background:#e0f2fe; color:#0369a1; }
  .priority-p4     { background:#f0fdf4; color:#166534; }
  .test-id         { font-family: monospace; font-weight: 700; white-space: nowrap; }
</style>
```

#### Table rules (mandatory for every table)

| Rule | Value |
|---|---|
| Table classes | `table table-bordered table-striped table-hover table-sm align-middle` |
| Header | `<thead class="table-dark">` |
| Column headers | `<th scope="col">` |
| Scroll wrapper | `<div class="table-responsive">` around every table |
| Tier badges | `<span class="badge rounded-pill tier-smoke|tier-regression|tier-e2e">` |
| Priority badges | `<span class="badge priority-p1|priority-p2|priority-p3|priority-p4">` |
| Stat blocks | Bootstrap `.card .card-body` grid (`row g-3`) |
| Status | Bootstrap `.alert alert-warning` / `.alert alert-success` |
| Tier sections | Bootstrap `.accordion` — one panel per tier, Smoke open by default |

#### Full page scaffold (copy and fill in `{tokens}`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Feature Label} — Test Catalog</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous" defer></script>
  <style>
    .tier-smoke      { background:#dbeafe; color:#1d4ed8; }
    .tier-regression { background:#ede9fe; color:#6d28d9; }
    .tier-e2e        { background:#d1fae5; color:#065f46; }
    .priority-p1     { background:#fee2e2; color:#991b1b; }
    .priority-p2     { background:#fef3c7; color:#92400e; }
    .priority-p3     { background:#e0f2fe; color:#0369a1; }
    .priority-p4     { background:#f0fdf4; color:#166534; }
    .test-id         { font-family: monospace; font-weight: 700; white-space: nowrap; }
  </style>
</head>
<body class="bg-light">

<div class="bg-primary text-white px-4 py-3">
  <h1 class="h4 mb-1">{Feature Label} — Test Catalog</h1>
  <p class="mb-0 small opacity-75">{Display Name} | {module} module | {clientId} client</p>
</div>

<div class="container-fluid px-4 py-3">

  <!-- Tier summary badges -->
  <div class="d-flex gap-2 flex-wrap mb-3">
    <span class="badge bg-warning text-dark">In Progress</span>
    <span class="badge rounded-pill tier-smoke">Smoke: {N} tests</span>
    <span class="badge rounded-pill tier-regression">Regression: {N} tests</span>
    <span class="badge rounded-pill tier-e2e">E2E: {N} tests</span>
  </div>

  <!-- Stat cards -->
  <div class="row g-3 mb-4">
    <div class="col-6 col-sm-4 col-md-2">
      <div class="card text-center shadow-sm h-100">
        <div class="card-body py-2">
          <div class="fs-4 fw-bold text-primary">{N}</div>
          <div class="text-muted small">Total Test Cases (Planned)</div>
        </div>
      </div>
    </div>
    <div class="col-6 col-sm-4 col-md-2">
      <div class="card text-center shadow-sm h-100">
        <div class="card-body py-2">
          <div class="fs-4 fw-bold text-primary">{N}</div>
          <div class="text-muted small">Business Rules</div>
        </div>
      </div>
    </div>
    <!-- Add one .col card per metric -->
  </div>

  <!-- Implementation status -->
  <div class="alert alert-warning" role="alert">
    <strong>⚠ Implementation Status: In Progress</strong>
    <p class="mb-1 mt-1 small">Functional test catalog complete. Test asset generation in progress:</p>
    <ol class="mb-0 small">
      <li>{Feature}Page.ts (Page Object with {N}+ locators)</li>
      <li>{feature}.helpers.ts ({N} multi-step helper functions)</li>
      <li>{feature}.spec.ts ({N} comprehensive test cases)</li>
      <li>test-data.json (Complete test data sets)</li>
      <li>verify-records.sql (Database verification)</li>
      <li>{feature}.api.spec.ts (API handler tests)</li>
    </ol>
  </div>

  <h2 class="h5 mb-3">📋 Test Coverage (Planned)</h2>

  <!-- Bootstrap accordion — one panel per tier -->
  <div class="accordion mb-4" id="accordionCatalog">

    <!-- SMOKE -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button"
                data-bs-toggle="collapse" data-bs-target="#sectionSmoke"
                aria-expanded="true" aria-controls="sectionSmoke">
          Smoke Suite
          <span class="badge rounded-pill tier-smoke ms-2">{N} tests</span>
        </button>
      </h2>
      <div id="sectionSmoke" class="accordion-collapse collapse show"
           data-bs-parent="#accordionCatalog">
        <div class="accordion-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Test ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Category</th>
                  <th scope="col">Business Rules</th>
                  <th scope="col">Expected Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="test-id">{MODULE}-SMOKE-001</td>
                  <td>Page loads for authenticated user</td>
                  <td><span class="badge priority-p1">P1-Critical</span></td>
                  <td>Navigation</td>
                  <td>BR-001</td>
                  <td>Page renders with correct heading visible</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- REGRESSION (collapsed by default) -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button"
                data-bs-toggle="collapse" data-bs-target="#sectionRegression"
                aria-expanded="false" aria-controls="sectionRegression">
          Regression Suite
          <span class="badge rounded-pill tier-regression ms-2">{N} tests</span>
        </button>
      </h2>
      <div id="sectionRegression" class="accordion-collapse collapse"
           data-bs-parent="#accordionCatalog">
        <div class="accordion-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Test ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Category</th>
                  <th scope="col">Business Rules</th>
                  <th scope="col">Precondition</th>
                  <th scope="col">Expected Result</th>
                </tr>
              </thead>
              <tbody>
                <!-- one <tr> per regression test -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- E2E (collapsed by default) -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button"
                data-bs-toggle="collapse" data-bs-target="#sectionE2E"
                aria-expanded="false" aria-controls="sectionE2E">
          E2E Suite
          <span class="badge rounded-pill tier-e2e ms-2">{N} tests</span>
        </button>
      </h2>
      <div id="sectionE2E" class="accordion-collapse collapse"
           data-bs-parent="#accordionCatalog">
        <div class="accordion-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Test ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Workflow Steps</th>
                  <th scope="col">Expected Result</th>
                </tr>
              </thead>
              <tbody>
                <!-- one <tr> per E2E test -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /accordion -->
</div><!-- /container -->
</body>
</html>
```

---

## Tier Assignment Rules

| Test Type | Assign to Tier |
|---|---|
| Page loads | Smoke + Regression |
| Auth / unauthenticated redirect | Smoke + Regression |
| Happy path (critical) | Smoke + Regression |
| Happy path (variations) | Regression |
| Required field validation | Regression |
| Format validation | Regression |
| Business rule (critical) | Smoke + Regression |
| Business rule (non-critical) | Regression |
| Boundary values | Regression |
| Dropdown population | Regression |
| Conditional UI | Regression |
| Data scoping | Regression |
| Full workflow | E2E |
| Cross-feature workflow | E2E |
| Error handling | Regression |
| Server error handling | Regression |

---

## Output Files

```
docs/functional-catalogs/{client}/{module}/feature-{feature}/test-catalog.md
docs/functional-catalogs/{client}/{module}/feature-{feature}/functional-units.html
docs/functional-catalogs/{client}/{module}/feature-{feature}/smoke-suite.md
docs/functional-catalogs/{client}/{module}/feature-{feature}/regression-suite.md
docs/functional-catalogs/{client}/{module}/feature-{feature}/e2e-suite.md
docs/module-analysis/{client}/{module}/feature-{feature}/business-rules.md
```

---

## Step 5 — Dashboard Registration

After all catalog files are written, **automatically register the feature on the QA dashboard**.

### 5.1 — Prompt for Client (if not already known)

If `{client}` was not provided as an input, ask:

```
Which client does this feature belong to?
e.g. demoportal | certainteed | samsung
```

### 5.2 — Update `dashboard/catalog-manifest.json`

Add (or update) the feature entry. Set `functionalUnit.implemented: true` since the HTML catalog was just created:

```json
"{module}-{feature}": {
  "feature":     "{Module} — {Feature Label}",
  "catalogFile": "functional-catalogs/{client}/{module}/feature-{feature}/functional-units.html",
  "version":     "v1",
  "generated":   "{YYYY-MM-DD}",
  "auditedAs":   "{client} ({date})",
  "lastUpdated": "{ISO timestamp}",
  "client":      "{client}",
  "pipeline":    "functional-qa",
  "sections":    {N — count of tier sections in functional-units.html},
  "implementationStatus": {
    "smoke":          { "implemented": false, "lastUpdated": null },
    "regression":     { "implemented": false, "lastUpdated": null },
    "e2e":            { "implemented": false, "lastUpdated": null },
    "functionalUnit": { "implemented": true,  "lastUpdated": "{ISO timestamp}" }
  },
  "specFiles": {
    "smoke":      "tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts",
    "regression": "tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts",
    "e2e":        "tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts"
  },
  "tests":    { "total": {N from catalog}, "implemented": 0, "fixme": 0 },
  "coverage": { "functional": 0, "validation": 0, "workflow": 0, "database": 0, "security": 0 },
  "gaps":     { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "lastRun":  null
}
```

**Rules**:
- If the entry already exists, update only `generated`, `auditedAs`, `lastUpdated`, `sections`, `tests.total`, and `functionalUnit.implemented`/`lastUpdated`. Preserve all other fields.
- If the entry does not exist, create the full entry above.

### 5.3 — Update `dashboard/index.html`

Ensure the feature checkbox exists in the correct module section.

**Check**: search for `data-value="{module}-{feature}"` — if already present, skip.

**If missing**, add after the last `</label>` in the `{module}` group (or after the last existing module group if this is a new module):

```html
<label class="checkbox-item" data-value="{module}-{feature}" data-module="{module}">
  <input type="checkbox" value="{module}-{feature}" />
  <span class="cb-label">{Feature Label}</span>
  <span class="cb-tag">{module}</span>
</label>
```

Also ensure the module exists in the module dropdown (`sel-module`) and in the JS `currentClientFlags` / `moduleEnabled` block. If missing, add:

```html
<!-- in module dropdown -->
<option value="{module}">{Module Label}</option>
```

```js
// in currentClientFlags
let currentClientFlags = { ..., {module}: true };

// in moduleEnabled map
"{module}": currentClientFlags.{module} !== false,
```

### 5.4 — Registration Confirmation

Output to user:

```
## Dashboard Registration

✅ catalog-manifest.json — {module}-{feature} entry written  (client: {client})
✅ dashboard/index.html  — checkbox confirmed  (data-module="{module}")
   Total tests registered: {N}  (Smoke: N | Regression: N | E2E: N)
   View on dashboard: npm run dashboard → {Module} → {Feature Label}
```

---

## Quality Gate

Test catalog is complete and ready for QA review when:
- Every form field has ≥ 1 smoke/regression test
- Every required field has ≥ 1 missing-field validation test
- Every business rule has ≥ 1 positive (rule met) and ≥ 1 negative (rule violated) test
- Every workflow transition has ≥ 1 test
- Every security rule has ≥ 1 test
- Smoke suite covers: page load + unauthenticated + happy path
- E2E suite covers: ≥ 1 full workflow scenario
- Total test count documented with per-tier breakdown
- Business Rules Catalog complete with all BR IDs
