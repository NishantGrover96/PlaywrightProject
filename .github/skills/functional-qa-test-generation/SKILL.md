# Functional QA Test Generation — Orchestrator

## Purpose

Collect module/feature details and live application URL via questions, then orchestrate the full
**analyze-to-automate** pipeline for generating new functional test coverage:

```
Step 1  Repository Analysis          /repo-analysis
Step 2  UI Analysis (live app)       /ui-analysis
Step 3  Business Rule Discovery      /functional-test-catalog (Step 3)
Step 4  Functional Test Catalog      /functional-test-catalog (Step 4)
        ↓
        ← GATE: QA Review & Sign-Off (user approves catalog)
        ↓  (only if approved)
Step 5  Playwright Test Generation   /playwright-test-generation
Step 6  Test Suite Verification      /run-tests
Step 7  Final Deliverables Summary
```

> This skill does **not** compare legacy vs. modern implementations.
> It analyzes the current codebase and live application behavior to establish
> comprehensive functional test coverage from scratch.

---

## When to Use

- User says "generate functional tests for…", "create QA coverage for…", "automate testing for…"
- Starting from zero test coverage for a feature
- Establishing baseline automation for an existing feature not yet covered

---

## Step 0 — Collect Inputs via AskUserQuestion (ALWAYS first)

Ask in **two rounds** (max 4 questions per round).

### Round 1 — Module / Feature Identity

```
Q1. Module name  [kebab-case]
    e.g. coop | popshop | rebate | dealer-management

Q2. Feature name  [kebab-case]
    e.g. submit-claim | dealer-search | invoice-approval

Q3. Feature label  [human-readable]
    e.g. "Submit Claim" | "Dealer Search" | "Invoice Approval"

Q4. Feature page URL
    The full URL of the feature in the live application.
    e.g. http://localhost:5000/CoopManagement/Claims/Submit/SubmitClaim
    (used for Playwright UI analysis — must be accessible)
```

### Round 2 — Source Code Location

```
Q5. Source Root Folder
    Root of the codebase on your machine.
    e.g. D:\Projects\DemoPortalV2
    (check config/repos.local.json — if already set, confirm or override)

Q6. Web Project Folder  [relative to source root]
    The web project containing the feature files.
    e.g. Presentation\Web    OR    src\Web    OR    .  (if root IS the web project)

Q7. Feature Folder  [relative to source root]
    The folder containing the feature's primary files (.cshtml, Controller, Pages, etc.)
    e.g. Pages\CoopManagement\Claims\Submit
    OR   Controllers\Coop\Claims
    OR   Features\CoopClaims\Submit

Q8. Auth State for Playwright  [optional — press Enter to skip]
    Path to Playwright storage state for pre-authenticated sessions.
    e.g. tests/playwright/fixtures/.auth/user.json
    (skip if feature is public or if login will be handled manually)
```

---

## Step 0.5 — Resolve and Confirm Paths

Compute resolved paths and show to user before proceeding:

```
Feature source files:
  {sourceRoot}\{featureFolder}\

Derived dependencies (auto-discovered):
  Services:    {sourceRoot}\Libraries\BusinessLogic\Services\
               OR {sourceRoot}\src\Services\{module}\
  Validators:  {sourceRoot}\src\Validators\{module}\
  Entities:    {sourceRoot}\Libraries\CommonEntity\
               OR {sourceRoot}\src\Models\{module}\
  Resources:   {sourceRoot}\RAL\Resources\{ModuleTitle}\
  JS Scripts:  {sourceRoot}\{webFolder}\wwwroot\WebScripts\{moduleFolder}\
  Existing tests: {sourceRoot}\tests\playwright\{module}\

Live Application:
  Feature URL: {featureUrl}
  Auth State:  {authStatePath OR "Not provided — manual login or public page"}
```

Write / update `config/repos.local.json` with the provided paths:
```json
{
  "legacy": {
    "root": "{sourceRoot}",
    "webFolder": "{webFolder}",
    "modules": {
      "{module}": {
        "features": {
          "{feature}": {
            "featurePath": "{sourceRoot}\\{featureFolder}",
            "featureUrl": "{featureUrl}",
            "authState": "{authStatePath}"
          }
        }
      }
    }
  }
}
```

Only ask the user to clarify if a derived path does not exist on disk.

---

## Step 0.6 — Feature Folder Structure Validation

Verify that the QA repository folder structure exists for this module/feature. Create only what's missing.
**Uses the identical folder layout as `/migration-qa-framework` Step 2.0** to ensure consistent repo structure.

**Check hierarchy**:
```
1. Module level:   docs/functional-catalogs/{module}/
                   docs/module-analysis/{module}/
                   docs/migration-reports/{module}/
                   tests/playwright/specs/{module}/
                   tests/playwright/pages/{module}/
                   tests/playwright/helpers/{module}/
                   tests/playwright/data/{module}/
                   tests/api/{module}/
                   tests/database/{module}/
                   reports/readiness/{module}/
                   reports/test-results/{module}/

2. Feature level:  {module}/feature-{feature}/
```

**Decision Logic**:

| Module Exists? | Feature Exists? | Action |
|---|---|---|
| ✅ Yes | ✅ Yes | **SKIP** — proceed to Step 1 |
| ✅ Yes | ❌ No | **CREATE FEATURE ONLY** — add feature-{feature}/ under existing module folders |
| ❌ No | ❌ No | **CREATE MODULE + FEATURE** — scaffold complete structure |

---

#### Case 1: Module Exists, Feature Does NOT Exist

**Create feature folder structure only** (same as migration-qa-framework):
```
docs/functional-catalogs/{module}/
  └─ feature-{feature}/          ← CREATE
       ├─ functional-units.html
       ├─ test-catalog.md
       ├─ smoke-suite.md
       ├─ regression-suite.md
       └─ e2e-suite.md

docs/module-analysis/{module}/
  └─ feature-{feature}/          ← CREATE
       ├─ repo-analysis.md
       ├─ ui-analysis.md
       └─ business-rules.md

docs/migration-reports/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ mapping.md              (placeholder — not used in functional QA pipeline)

tests/playwright/specs/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ {feature}.spec.ts

tests/playwright/pages/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ {Feature}Page.ts

tests/playwright/helpers/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ {feature}.helpers.ts

tests/playwright/data/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ test-data.json

tests/api/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ {feature}.api.spec.ts

tests/database/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ verify-records.sql

reports/readiness/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ readiness.md

reports/test-results/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ .gitkeep
```

---

#### Case 2: Module Does NOT Exist

**Create complete module + feature structure**:
```
docs/
  ├─ functional-catalogs/{module}/          ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         ├─ functional-units.html
  │         ├─ test-catalog.md
  │         ├─ smoke-suite.md
  │         ├─ regression-suite.md
  │         └─ e2e-suite.md
  ├─ module-analysis/{module}/              ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         ├─ repo-analysis.md
  │         ├─ ui-analysis.md
  │         └─ business-rules.md
  └─ migration-reports/{module}/            ← CREATE MODULE
       └─ feature-{feature}/                ← CREATE FEATURE
            └─ mapping.md

tests/
  ├─ playwright/
  │    ├─ specs/{module}/                   ← CREATE MODULE
  │    │    └─ feature-{feature}/           ← CREATE FEATURE
  │    │         └─ {feature}.spec.ts
  │    ├─ pages/{module}/                   ← CREATE MODULE
  │    │    └─ feature-{feature}/           ← CREATE FEATURE
  │    │         └─ {Feature}Page.ts
  │    ├─ helpers/{module}/                 ← CREATE MODULE
  │    │    └─ feature-{feature}/           ← CREATE FEATURE
  │    │         └─ {feature}.helpers.ts
  │    └─ data/{module}/                    ← CREATE MODULE
  │         └─ feature-{feature}/           ← CREATE FEATURE
  │              └─ test-data.json
  ├─ api/{module}/                          ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         └─ {feature}.api.spec.ts
  └─ database/{module}/                     ← CREATE MODULE
       └─ feature-{feature}/                ← CREATE FEATURE
            └─ verify-records.sql

reports/
  ├─ readiness/{module}/                    ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         └─ readiness.md
  └─ test-results/{module}/                 ← CREATE MODULE
       └─ feature-{feature}/                ← CREATE FEATURE
            └─ .gitkeep
```

---

**Placeholder file content** for all newly created files:

`functional-units.html` / `test-catalog.md`:
```
# Functional Test Catalog — {Module} / {Feature Label}
<!-- Placeholder — will be populated by functional-test-catalog skill -->
```

`test-data.json`:
```json
{}
```

`{Feature}Page.ts`:
```typescript
// Page Object Model for {Module} — {Feature Label}
// Generated by playwright-test-generation
```

`mapping.md`:
```markdown
# Migration Mapping — {Module} / {Feature Label}
<!-- Placeholder — not used in functional-qa pipeline -->
```

`.gitkeep`, `readiness.md`, SQL, `*.helpers.ts`: empty or minimal placeholder.

---

**Update `dashboard/catalog-manifest.json`** for new features (full schema):
```json
"{module}-{feature}": {
  "feature":     "{Module} — {Feature Label}",
  "catalogFile": "docs/functional-catalogs/{module}/feature-{feature}/functional-units.html",
  "version":     "v1",
  "generated":   "",
  "auditedAs":   "DemoPortal UAT ({featureUrl}, {date})",
  "lastUpdated": "{ISO timestamp}",
  "sections":    0,
  "pipeline":    "functional-qa",
  "implementationStatus": {
    "smoke":          { "implemented": false, "lastUpdated": null },
    "regression":     { "implemented": false, "lastUpdated": null },
    "e2e":            { "implemented": false, "lastUpdated": null },
    "functionalUnit": { "implemented": false, "lastUpdated": null }
  },
  "specFiles": {
    "smoke":      "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
    "regression": "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
    "e2e":        "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts"
  },
  "tests":    { "total": 0, "implemented": 0, "fixme": 0 },
  "coverage": { "functional": 0, "validation": 0, "workflow": 0, "database": 0, "security": 0 },
  "gaps":     { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "lastRun":  null
}
```

**Update `dashboard/server.js`** — add to `FEATURE_FOLDERS`:
```javascript
"{module}-{feature}": "tests/playwright/specs/{module}/feature-{feature}",
```

**Update `dashboard/index.html`** — add checkbox in the correct module section:
```html
<label class="checkbox-item" data-value="{module}-{feature}">
  <input type="checkbox" value="{module}-{feature}" />
  <span class="cb-label">{Module} — {Feature Label}</span>
  <span class="cb-tag">{module}</span>
</label>
```

**Report**:
```
ℹ️  Module '{module}' [exists | does not exist]
✅ Created feature structure: feature-{feature}/
✅ Updated dashboard/catalog-manifest.json
✅ Updated dashboard/server.js
✅ Updated dashboard/index.html
```

---

## Step 1 — Repository Analysis

Invoke `/repo-analysis`.

**Reads** (auto-discovered from feature folder):
```
Primary:    {sourceRoot}\{featureFolder}\*.cshtml, *.cshtml.cs, *Controller.cs
On-demand:  Services, Validators, Entities, DB layer, Resources, JS scripts, Auth attributes
```

**Produces**:
```
docs/module-analysis/{module}/feature-{feature}/repo-analysis.md
```

**Gate**: Do not proceed until `repo-analysis.md` is complete with at least:
- Form fields documented
- Business rules extracted
- Validation rules with error messages

---

## Step 2 — UI Analysis

Invoke `/ui-analysis`.

**Navigates** the live application at `{featureUrl}` using Playwright.

**Captures**:
- Page structure, form fields, selectors
- User journeys (happy path, validation, unauthenticated)
- Validation behavior (trigger, display, error messages)
- API calls observed during interaction
- Selector inventory (preferred + fallback per element)

**Produces**:
```
docs/module-analysis/{module}/feature-{feature}/ui-analysis.md
reports/test-results/{module}/feature-{feature}/ui-analysis/
  ├── initial.png
  ├── validation-errors.png
  └── success.png
```

**Gate**: Do not proceed until `ui-analysis.md` is complete with selector inventory and journey documentation.

---

## Step 3 — Business Rule Discovery + Functional Test Catalog

Invoke `/functional-test-catalog`.

**Reads**:
```
docs/module-analysis/{module}/feature-{feature}/repo-analysis.md
docs/module-analysis/{module}/feature-{feature}/ui-analysis.md
```

**Correlates** code analysis with observed UI to extract every business rule, then generates
a comprehensive test catalog covering:
- Positive (happy path) tests
- Negative (validation failure) tests
- Boundary value tests
- Business rule tests (rule satisfied vs violated)
- Security / authorization tests
- Workflow transition tests
- Error handling tests

**Produces**:
```
docs/module-analysis/{module}/feature-{feature}/business-rules.md
docs/functional-catalogs/{module}/feature-{feature}/test-catalog.md
docs/functional-catalogs/{module}/feature-{feature}/functional-units.html
docs/functional-catalogs/{module}/feature-{feature}/smoke-suite.md
docs/functional-catalogs/{module}/feature-{feature}/regression-suite.md
docs/functional-catalogs/{module}/feature-{feature}/e2e-suite.md
```

**Gate**: Do not proceed until test catalog is complete with:
- Smoke suite: ≥ 3 tests (page load + auth + happy path)
- Regression suite: ≥ 1 test per form field + per business rule
- E2E suite: ≥ 1 full workflow test
- Total test count documented

---

## Step 4 — QA Review Gate (HARD GATE)

**PAUSE and present the test catalog to the user for review and approval.**

Display a summary:

```
## Functional Test Catalog — QA Review Required

Module: {module}
Feature: {Feature Label}

### Catalog Summary
| Tier        | Tests | Coverage Focus |
|---|---|---|
| Smoke       | N     | Page load, auth, critical path |
| Regression  | N     | All validations, business rules, UI paths |
| E2E         | N     | Full workflow scenarios |
| **Total**   | **N** | |

### Business Rules Covered: N
| ID | Title | Priority | Test Count |
|---|---|---|---|

### Files Generated:
- docs/functional-catalogs/{module}/feature-{feature}/test-catalog.md
- docs/functional-catalogs/{module}/feature-{feature}/functional-units.html

Please review the test catalog before automation begins.
→ Open: docs/functional-catalogs/{module}/feature-{feature}/test-catalog.md

Do you approve this catalog and want to proceed with Playwright automation?
Options:
  - ✅ Approve — proceed to Playwright test generation
  - ✏️  Request changes — provide feedback and re-generate catalog
  - 🚫 Reject — stop and review manually
```

**Wait for user response.** Do NOT proceed to Step 5 until approval is given.

### GATE ENFORCEMENT

| Response | Action |
|---|---|
| ✅ Approve | Continue to Step 5 |
| ✏️  Request changes | Incorporate feedback, re-run `/functional-test-catalog`, re-present |
| 🚫 Reject | **STOP** — output final catalog files, do not generate Playwright tests |

---

## Step 5 — Playwright Test Suite Generation *(gated — only after approval)*

Invoke `/playwright-test-generation`.

**Primary sources**:
- `docs/functional-catalogs/{module}/feature-{feature}/test-catalog.md` — approved test cases
- `docs/functional-catalogs/{module}/feature-{feature}/smoke-suite.md`
- `docs/functional-catalogs/{module}/feature-{feature}/regression-suite.md`
- `docs/functional-catalogs/{module}/feature-{feature}/e2e-suite.md`
- `docs/module-analysis/{module}/feature-{feature}/ui-analysis.md` — selectors
- Existing test patterns from `tests/playwright/{module}/` — reuse proven patterns

**Produces**:
```
tests/playwright/pages/{module}/feature-{feature}/{Feature}Page.ts
tests/playwright/helpers/{module}/feature-{feature}/{feature}.helpers.ts
tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts
tests/playwright/data/{module}/feature-{feature}/test-data.json
tests/api/{module}/feature-{feature}/{feature}.api.spec.ts
tests/database/{module}/feature-{feature}/verify-records.sql
```

### Step 5.1 — Auto-Update QA Dashboard

After creating or updating test suite files, **automatically update all three dashboard files**
using the same pattern as `/migration-qa-framework` Step 3.1.

#### `dashboard/catalog-manifest.json`

Update (or create) the full feature entry:

```json
"{module}-{feature}": {
  "feature":     "{Module} — {Feature Label}",
  "catalogFile": "docs/functional-catalogs/{module}/feature-{feature}/functional-units.html",
  "version":     "v1",
  "generated":   "{date YYYY-MM-DD}",
  "auditedAs":   "DemoPortal UAT ({featureUrl}, {date})",
  "lastUpdated": "{ISO timestamp}",
  "sections":    {N — count of test sections in spec file},
  "pipeline":    "functional-qa",
  "implementationStatus": {
    "smoke":          { "implemented": true, "lastUpdated": "{ISO timestamp}" },
    "regression":     { "implemented": true, "lastUpdated": "{ISO timestamp}" },
    "e2e":            { "implemented": true,  "lastUpdated": "{ISO timestamp}" },
    "functionalUnit": { "implemented": true, "lastUpdated": "{ISO timestamp}" }
  },
  "specFiles": {
    "smoke":      "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
    "regression": "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
    "e2e":        "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
    "api":        "tests/api/{module}/feature-{feature}/{feature}.api.spec.ts"
  },
  "tests":    { "total": N, "implemented": N, "fixme": N },
  "coverage": {
    "functional": NN.N,
    "validation": NN.N,
    "workflow":   NN.N,
    "database":   NN.N,
    "security":   100
  },
  "gaps":  { "critical": 0, "high": 0, "medium": N, "low": N },
  "lastRun": null
}
```

**Dashboard Update Rules**:
1. Set `lastUpdated` to current ISO timestamp
2. Set `generated` to today's date (YYYY-MM-DD)
3. Set `auditedAs` to `"DemoPortal UAT ({featureUrl}, {date})"` — reflects that UI analysis was run on UAT
4. Mark each tier as `implemented: true` when the corresponding spec file is created/modified
5. Track `functionalUnit` tier separately for unit-level test coverage
6. Update `tests.total` by scanning spec file for `test(` calls
7. Update `tests.fixme` by scanning spec file for `test.fixme(` calls
8. Update `tests.implemented` = `total - fixme`
9. Populate `coverage` percentages from the test catalog business rule counts:
   - `functional` = (BRs with ≥ 1 test) / total BRs × 100
   - `validation` = (validation rules with ≥ 1 test) / total validation rules × 100
   - `workflow` = (transitions with ≥ 1 test) / total transitions × 100
   - `database` = (DB operations with ≥ 1 test) / total DB operations × 100
   - `security` = (security rules with ≥ 1 test) / total security rules × 100
10. Populate `gaps` from test-catalog medium/low scenarios marked as `test.fixme()`
11. Preserve existing `version`, `lastRun`, `testResults`, `testHealth` if already present

#### `dashboard/server.js`

Ensure the feature is in `FEATURE_FOLDERS`:
```javascript
"{module}-{feature}": "tests/playwright/specs/{module}/feature-{feature}",
```

Only add if not already present. Do not modify other entries.

#### `dashboard/index.html`

Ensure the feature checkbox is in the correct module section:
```html
<label class="checkbox-item" data-value="{module}-{feature}">
  <input type="checkbox" value="{module}-{feature}" />
  <span class="cb-label">{Module} — {Feature Label}</span>
  <span class="cb-tag">{module}</span>
</label>
```

Only add if not already present.

**Output to User**:
```
✅ QA Dashboard updated
   catalog-manifest.json — {module}-{feature} entry written
   server.js             — FEATURE_FOLDERS entry confirmed
   dashboard/index.html  — checkbox confirmed
   Total tests: N  (implemented: N, fixme: N)
   Coverage: functional NN% | validation NN% | workflow NN% | database NN% | security 100%
```

---

## Step 6 — Test Suite Verification

**Runs after Step 5 completes successfully.**

### Step 6.1 — TypeScript Compile Check

```powershell
npx tsc --noEmit
```

Fix any TypeScript errors before running tests.

### Step 6.2 — Select Test Tier

Ask the user which tier(s) to run:

```
Which test tier would you like to run for {module}/{feature}?

Options:
  - smoke       → Quick validation (page load, auth, happy path)
  - regression  → Full feature coverage
  - e2e         → End-to-end workflows
  - all         → Run all tiers sequentially
```

### Step 6.3 — Execute Test Suite

```powershell
# Single tier
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts --grep "@{tier}"

# All tiers
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts
```

### Step 6.4 — Update QA Dashboard After Test Execution

After test execution completes, **automatically update the QA Dashboard** to reflect current test status
using the same pattern as `/migration-qa-framework` Step 4.4.

**Update `dashboard/catalog-manifest.json`**:

1. **Test Execution Results**:
```json
{
  "{module}-{feature}": {
    "lastUpdated": "{ISO timestamp}",
    "testResults": {
      "{tier}": {
        "passed":   N,
        "failed":   N,
        "skipped":  N,
        "total":    N,
        "lastRun":  "{ISO timestamp}",
        "duration": "NN.Ns",
        "status":   "passed" | "failed" | "flaky"
      }
    }
  }
}
```

2. **Implementation Status Update**:
   - Mark tier as `verified: true` if all tests passed
   - Set `needsAttention: true` if any tests failed
   - Update `lastVerified` timestamp

3. **Test Health Metrics**:
```json
"testHealth": {
  "{tier}": {
    "stability":       95.5,
    "averageDuration": "14.2s",
    "flakyTests":      [],
    "lastFailures":    []
  }
}
```

4. **Dashboard Refresh + Color Status**:
   - 🟢 Green = All tests passed
   - 🟡 Yellow = Some tests failed or flaky
   - 🔴 Red = Critical failures or > 50% failure rate

**Output to User**:
```
✅ QA Dashboard updated
   View results: http://localhost:3333
   Status: {tier} — {N} passed, {N} failed
   Report: reports/test-results/{module}/feature-{feature}/{tier}-results-{timestamp}.md
```

---

## Step 7 — Final Deliverables Summary

Output a complete summary of everything generated:

```
## ✅ Functional QA Coverage Complete — {Module} / {Feature Label}

Step 1    Repository Analysis        ✅  {N} form fields, {N} business rules, {N} validation rules
Step 2    UI Analysis                ✅  {N} selectors mapped, {N} journeys documented (DemoPortal UAT)
Step 3    Business Rule Discovery    ✅  {N} BRs cataloged
Step 4    Test Catalog               ✅  Approved — {N} total tests (Smoke: N | Regression: N | E2E: N)
Step 5    Playwright Tests           ✅  Generated + Dashboard updated
Step 6    Test Execution             ✅  {tier}: {N} passed, {N} failed
          └─ Dashboard Updated       ✅  http://localhost:3333

### Coverage Summary
| Dimension   | Coverage % |
|---|---|
| Functional  | NN% |
| Validation  | NN% |
| Workflow    | NN% |
| Database    | NN% |
| Security    | 100% |

### Test Results
| Tier        | Total | Passed | Failed | Fixme |
|---|---|---|---|---|
| Smoke       | N     | N      | N      | N     |
| Regression  | N     | N      | N      | N     |
| E2E         | N     | N      | N      | N     |
| **Total**   | **N** | **N**  | **N**  | **N** |

### Test Assets Generated
| Asset | Path |
|---|---|
| Test Catalog | docs/functional-catalogs/{module}/feature-{feature}/test-catalog.md |
| Interactive Catalog | docs/functional-catalogs/{module}/feature-{feature}/functional-units.html |
| Spec File | tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts |
| Page Object | tests/playwright/pages/{module}/feature-{feature}/{Feature}Page.ts |
| Helpers | tests/playwright/helpers/{module}/feature-{feature}/{feature}.helpers.ts |
| Test Data | tests/playwright/data/{module}/feature-{feature}/test-data.json |
| API Tests | tests/api/{module}/feature-{feature}/{feature}.api.spec.ts |
| DB Verification | tests/database/{module}/feature-{feature}/verify-records.sql |

### Notes
- test.fixme() cases: list each with reason
- Manual test gaps: list any coverage gaps requiring manual testing
- Recommended next features to cover
```

---

## Error Recovery

If any step fails:

| Failure | Action |
|---|---|
| Source path not found | Ask user to confirm path; check `config/repos.local.json` |
| App URL not reachable | Check if server is running; try alternative URL |
| Auth state invalid / expired | Re-authenticate and provide fresh `storageState` |
| TypeScript errors in generated tests | Fix type errors before running; check import paths |
| Tests failing after generation | Check test data; verify selectors against live app; check auth setup |
| QA review rejected | Incorporate feedback; re-run `/functional-test-catalog` |
