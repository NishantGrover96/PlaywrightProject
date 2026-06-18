# Migration QA Framework — Orchestrator (Steps 2 → 4)

## Purpose

Collect repository and feature details via questions, then orchestrate the full
analysis-to-automation pipeline: Steps 2 → 2.5 → 2.6 → 3 → 4.

> Step 0 (Scaffold) is a separate one-time setup via `/scaffold`.
> This orchestrator assumes folders already exist and jumps straight to analysis.

---

## Step 0 — Collect Inputs via AskUserQuestion (ALWAYS first)

Ask in **two rounds** (max 4 questions per call).

### Round 1 — Workspace Roots + Feature Location

```
Q1. Legacy Workspace Folder
    Root of the legacy codebase on your machine.
    e.g. D:\NareshCF\Workspace4\Git\ConnectedPlatformWorkspace\DemoPortalV2
    (check config/repos.local.json legacy.root — if already set, confirm or override)

Q2. Modern Workspace Folder
    Root of the modern codebase on your machine.
    e.g. D:\NareshCF\Workspace4\Git\PlatformToAPIWorkspace\DemoPortalV2
    (enter "none" if modern repo is not yet available)

Q3. Legacy Feature Folder  [relative path from workspace root]
    The exact folder containing .cshtml and .cshtml.cs for this feature.
    e.g. Presentation\Web\Pages\CoopManagement\Claims\Submit
    (check config/repos.local.json for existing features — may already be set)

Q4. Modern Feature Folder  [relative path from modern workspace root, or "same" / "none"]
    The modern equivalent folder (controller, handler, or page).
    e.g. Presentation\Web\Pages\CoopManagement\Claims\Submit  OR  src\API\Controllers\Coop\Claims
```

### Round 2 — Feature Identity

```
Q5. Module name  [kebab-case]
    e.g. coop

Q6. Feature name  [kebab-case]
    e.g. submit-claim

Q7. Feature page URL path
    The URL route for this feature in the app.
    e.g. /CoopManagement/Claims/Submit/SubmitClaim
```

---

## Step 0.5 — Auto-Resolve All Dependency Paths

Given the workspace roots and feature folders, **auto-discover all dependencies**
by reading what the feature files actually reference — no manual path entry needed.

```
LEGACY (auto-derived from {legacyRoot})
  Feature files:   {legacyRoot}\{legacyFeatureFolder}\        ← user-provided
  Services:        {legacyRoot}\Libraries\BusinessLogic\Services\   ← auto
  Entities:        {legacyRoot}\Libraries\CommonEntity\              ← auto
  Accessors/DAL:   {legacyRoot}\Libraries\**\*Accessor*.cs           ← auto
  Resources:       {legacyRoot}\RAL\Resources\{ModuleTitle}\         ← auto
  Client scripts:  {legacyRoot}\Presentation\Web\wwwroot\WebScripts\ ← auto
  Existing tests:  {legacyRoot}\tests\playwright\{module}\           ← auto

MODERN (auto-derived from {modernRoot})
  Feature files:   {modernRoot}\{modernFeatureFolder}\         ← user-provided
  Services:        {modernRoot}\src\Services\{module}\               ← auto
  Validators:      {modernRoot}\src\Validators\{module}\             ← auto
  Entities:        {modernRoot}\src\Models\{module}\                 ← auto
  Database:        {modernRoot}\src\Data\**\*Repository*.cs          ← auto
```

Write / update `config/repos.local.json`.
Only ask the user to clarify if a derived path does not exist on disk.

---

## Pipeline (Steps 2 → 4)

```
Step 2    Functional Unit Discovery        /functional-unit-discovery
            ↓ (reads feature folder directly — no broad scan)
Step 2.5   Legacy vs Modern Gap Analysis   /gap-analysis
            ↓ (reads services/entities on-demand for business rules)
Step 2.6   Coverage Sign-off (Gate)        /coverage-signoff
            ↓  ← GATE: must be "Ready for Automation"
Step 3    Playwright Generation            /playwright-test-generation
           (only if gate = PASSED)
            ↓
Step 4    Run Playwright Test Suite        /run-tests
           (smoke, regression, or e2e tier)
```

---

## Step 2 — Functional Unit Discovery

### Step 2.0 — Feature Folder Structure Validation (Pre-check)

**Before invoking functional-unit-discovery**, verify that the feature module folder structure exists in the QA repository. Create only what's missing.

**Check hierarchy**:
```
1. Module level:   docs/functional-catalogs/{module}/
                   tests/playwright/specs/{module}/
                   tests/playwright/pages/{module}/
                   tests/playwright/helpers/{module}/
                   tests/playwright/data/{module}/

2. Feature level:  {module}/feature-{feature}/
```

**Decision Logic**:

| Module Exists? | Feature Exists? | Action |
|---|---|---|
| ✅ Yes | ✅ Yes | **SKIP** — proceed to Step 2.1 |
| ✅ Yes | ❌ No | **CREATE FEATURE ONLY** — add feature-{feature}/ under existing module folders |
| ❌ No | ❌ No | **CREATE MODULE + FEATURE** — scaffold complete structure |

---

#### Case 1: Module Exists, Feature Does NOT Exist

**Create feature folder structure only**:
```
docs/functional-catalogs/{module}/
  └─ feature-{feature}/          ← CREATE
       ├─ functional-units.html
       ├─ gap-analysis.md
       ├─ coverage-matrix.md
       ├─ signoff.md
       ├─ smoke-suite.md
       ├─ regression-suite.md
       └─ e2e-suite.md

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

reports/readiness/{module}/
  └─ feature-{feature}/          ← CREATE
       └─ readiness.md
```

**Report**:
```
ℹ️  Module '{module}' exists
✅ Created feature structure: feature-{feature}/
```

---

#### Case 2: Module Does NOT Exist

**Create complete module + feature structure**:
```
docs/
  ├─ functional-catalogs/{module}/          ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         ├─ functional-units.html
  │         ├─ gap-analysis.md
  │         ├─ coverage-matrix.md
  │         ├─ signoff.md
  │         ├─ smoke-suite.md
  │         ├─ regression-suite.md
  │         └─ e2e-suite.md
  ├─ module-analysis/{module}/              ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         └─ discovery.md
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
  └─ api/{module}/                          ← CREATE MODULE
       └─ feature-{feature}/                ← CREATE FEATURE
            └─ {feature}.api.spec.ts

reports/
  ├─ readiness/{module}/                    ← CREATE MODULE
  │    └─ feature-{feature}/                ← CREATE FEATURE
  │         └─ readiness.md
  └─ test-results/{module}/                 ← CREATE MODULE
       └─ feature-{feature}/                ← CREATE FEATURE
            └─ .gitkeep
```

**Report**:
```
ℹ️  Module '{module}' does not exist
✅ Created module structure: {module}/
✅ Created feature structure: feature-{feature}/
```

---

#### Case 3: Both Module and Feature Exist

**Skip creation entirely**:
```
✅ Feature folder structure exists: {module}/feature-{feature}/
   Proceeding to Step 2.1 — Functional Unit Discovery
```

---

### Initialize Dashboard Manifest Entry (Only for New Features)

**When creating a new feature** (Cases 1 or 2), add to `dashboard/catalog-manifest.json`:
```json
{
  "{module}-{feature}": {
    "feature": "{Module} — {Feature Label}",
    "catalogFile": "docs/functional-catalogs/{module}/feature-{feature}/functional-units.html",
    "created": "2026-06-18T10:00:00Z",
    "lastUpdated": "2026-06-18T10:00:00Z",
    "status": "in-progress",
    "implementationStatus": {
      "smoke": { "implemented": false, "lastUpdated": null },
      "regression": { "implemented": false, "lastUpdated": null },
      "e2e": { "implemented": false, "lastUpdated": null },
      "functionalUnit": { "implemented": false, "lastUpdated": null }
    },
    "tests": { "total": 0, "implemented": 0, "fixme": 0 }
  }
}
```

**If feature already exists** (Case 3):
- Skip manifest modification
- Preserve existing `created`, `status`, and implementation tracking data

---

### Placeholder File Templates

**For all newly created files**, use these templates:

**`functional-units.html`** or **`functional-units.md`**:
```markdown
# Functional Units — {Module} / {Feature}

<!-- Generated by functional-unit-discovery -->
<!-- Placeholder - will be populated by Step 2.1 -->
```

**`test-data.json`**:
```json
{}
```

**`{Feature}Page.ts`**:
```typescript
// Page Object Model for {Module} — {Feature}
// Generated by playwright-test-generation
```

**`.gitkeep`**:
```
(empty file)
```

---

### Step 2.1 — Invoke Functional Unit Discovery

Invoke `/functional-unit-discovery` with `mode=both`.

**Primary read path** (always):
```
{legacyRoot}\{legacyWeb}\Pages\{moduleFolder}\{featureFolder}\
  *.cshtml          — form fields, UI elements, conditional visibility
  *.cshtml.cs       — page handlers, bound properties, service calls
```

**On-demand dependency reads** (only when needed for that FU category):
```
Services/Business rules  → {legacyRoot}\Libraries\BusinessLogic\Services\
Validation messages      → {legacyRoot}\RAL\Resources\{module}\ViewResource.*.resx
Client-side behavior     → {legacyRoot}\{legacyWeb}\wwwroot\WebScripts\{moduleFolder}\
Data models              → {legacyRoot}\Libraries\CommonEntity\
Existing test patterns   → {legacyRoot}\tests\playwright\{module}\
```

For Modern (if available):
```
Primary   → {modernRoot}\{modernWeb}\Controllers\{moduleFolder}\
Services  → {modernRoot}\src\Services\{module}\  (on-demand)
Validators→ {modernRoot}\src\Validators\{module}\ (on-demand)
Database  → {modernRoot}\src\Data\  (on-demand)
```

Produces:
```
docs/module-analysis/{module}/feature-{feature}/discovery.md
docs/functional-catalogs/{module}/feature-{feature}/functional-units.html  (or .md)
docs/migration-reports/{module}/feature-{feature}/mapping.md
```

**Catalog Format**: Prefer HTML for rich interactive catalogs (see example), fallback to Markdown if simpler.

**Gate**: Do not proceed until functional-units catalog has at least one entry.

---

## Step 2.5 — Gap Analysis

Invoke `/gap-analysis`.

Reads FU catalog + mapping, then reads source files **on-demand per dimension**:
- UI dimension → feature folder `.cshtml` files
- Validation → `.resx` resource files
- Business rules → Services/DLL files
- Database → Accessor/Repository files
- Security → Auth attributes + JS encryption patterns

Produces:
```
docs/functional-catalogs/{module}/feature-{feature}/gap-analysis.md
docs/functional-catalogs/{module}/feature-{feature}/coverage-matrix.md
```

---

## Step 2.6 — Coverage Sign-off (Gate)

Invoke `/coverage-signoff`.

Produces:
```
docs/functional-catalogs/{module}/feature-{feature}/signoff.md
reports/readiness/{module}/feature-{feature}/readiness.md
```

### GATE CHECK — final line of `signoff.md`

| Token | Action |
|---|---|
| `✅ GATE PASSED — Proceed to Step 3` | Continue |
| `⚠️ GATE: NEEDS REMEDIATION` | **STOP** — report High gaps |
| `🚫 GATE BLOCKED` | **STOP** — report Critical gaps |

---

## Step 3 — Playwright Test Suite Implementation *(gated)*

**Only runs if gate = PASSED.**

Invoke `/playwright-test-generation`.

Primary source:
- Feature folder `.cshtml` → locators for Page Object
- Existing test patterns from `{legacyRoot}\tests\playwright\{module}\` → reuse selectors

Produces:
```
tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts
tests/playwright/pages/{module}/feature-{feature}/{Feature}Page.ts
tests/playwright/helpers/{module}/feature-{feature}/{feature}.helpers.ts
tests/playwright/data/{module}/feature-{feature}/test-data.json
tests/api/{module}/feature-{feature}/{feature}.api.spec.ts
tests/database/{module}/feature-{feature}/verify-records.sql
tests/database/{module}/feature-{feature}/compare-legacy-vs-modern.sql
docs/functional-catalogs/{module}/feature-{feature}/smoke-suite.md
docs/functional-catalogs/{module}/feature-{feature}/regression-suite.md
docs/functional-catalogs/{module}/feature-{feature}/e2e-suite.md
```

### Step 3.1 — Auto-Update QA Dashboard

After creating or updating test suite files, **automatically update**:

**File**: `dashboard/catalog-manifest.json`

```json
{
  "{module}-{feature}": {
    "feature": "{Module} — {Feature Label}",
    "catalogFile": "docs/functional-catalogs/{module}/feature-{feature}/functional-units.html",
    "lastUpdated": "2026-06-18T10:30:00Z",
    "implementationStatus": {
      "smoke": { "implemented": true, "lastUpdated": "2026-06-18T10:30:00Z" },
      "regression": { "implemented": true, "lastUpdated": "2026-06-18T10:25:00Z" },
      "e2e": { "implemented": false, "lastUpdated": null },
      "functionalUnit": { "implemented": true, "lastUpdated": "2026-06-18T10:30:00Z" }
    },
    "specFiles": {
      "smoke": "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
      "regression": "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts",
      "e2e": "tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts"
    },
    "tests": { "total": N, "implemented": N, "fixme": N }
  }
}
```

**Dashboard Update Rules**:
1. Set `lastUpdated` to current ISO timestamp
2. Mark tier as `implemented: true` when corresponding spec file is created/modified
3. Track `functionalUnit` tier separately for unit-level test coverage
4. Update test counts by scanning spec files for `test()` and `test.fixme()` calls
5. Preserve existing `version`, `generated`, `auditedAs` metadata

This ensures the QA Dashboard reflects real-time automation coverage and tier implementation status.

---

## Step 4 — Run Playwright Test Suite *(post-generation)*

**Runs after Step 3 completes successfully.**

Execute the generated Playwright test suite for the feature against the specified test tier.

### Step 4.1 — Select Test Tier

Ask the user which test tier(s) to run:

```
Which test tier would you like to run for {module}/{feature}?

Options:
  - smoke       → Quick validation of critical paths only
  - regression  → Full feature test coverage
  - e2e         → End-to-end workflows including cross-feature scenarios
  - all         → Run all tiers sequentially
```

### Step 4.2 — Execute Test Suite

Run Playwright tests using the appropriate command for the selected tier(s):

**Command Pattern**:
```powershell
# Single tier
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts --grep "@{tier}"

# All tiers
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts
```

**Environment Setup** (if needed):
- Ensure `.env` or `playwright.config.ts` has correct base URLs
- Verify test data files exist: `tests/playwright/data/{module}/feature-{feature}/test-data.json`
- Check authentication setup if feature requires login

### Step 4.3 — Report Test Results

After test execution completes:

1. **Console Summary**:
   - Total tests: X
   - Passed: X
   - Failed: X
   - Skipped: X
   - Duration: X seconds

2. **Update Test Status**:
   Update `dashboard/catalog-manifest.json`:
   ```json
   "testResults": {
     "smoke": { "passed": N, "failed": N, "lastRun": "2026-06-18T10:35:00Z" },
     "regression": { "passed": N, "failed": N, "lastRun": "2026-06-18T10:40:00Z" },
     "e2e": { "passed": N, "failed": N, "lastRun": null }
   }
   ```

3. **Generate Test Report**:
   Create or update:
   ```
   reports/test-results/{module}/feature-{feature}/
     ├── {tier}-results-{timestamp}.md
     ├── playwright-report/index.html  (if HTML reporter enabled)
     └── test-results/                  (artifacts: screenshots, traces)
   ```

4. **Failure Analysis** (if any tests failed):
   - List failed test names
   - Extract error messages from test output
   - Link to trace files or screenshots
   - Suggest remediation steps:
     - Check if test data is valid
     - Verify selectors match current UI
     - Review API/database verification queries
     - Check for environment-specific issues

### Step 4.4 — Update QA Dashboard

After test execution completes, **automatically update the QA Dashboard** to reflect current test status.

**Update `dashboard/catalog-manifest.json`**:

1. **Test Execution Results**:
   ```json
   {
     "{module}-{feature}": {
       "testResults": {
         "{tier}": {
           "passed": N,
           "failed": N,
           "skipped": N,
           "total": N,
           "lastRun": "2026-06-18T10:35:00Z",
           "duration": "15.3s",
           "status": "passed" | "failed" | "flaky"
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
       "stability": 95.5,  // % pass rate over last 5 runs
       "averageDuration": "14.2s",
       "flakyTests": ["test-name-1"],  // tests that intermittently fail
       "lastFailures": []
     }
   }
   ```

4. **Dashboard Refresh Trigger**:
   - Update `lastUpdated` timestamp in manifest
   - If dashboard is running, it will auto-refresh to show new results
   - Display color-coded status:
     - 🟢 Green = All tests passed
     - 🟡 Yellow = Some tests failed or flaky
     - 🔴 Red = Critical failures or > 50% failure rate

**Output to User**:
```
✅ QA Dashboard updated
   View results: http://localhost:3000/dashboard/{module}/{feature}
   Status: {tier} — {N} passed, {N} failed
   Report: reports/test-results/{module}/feature-{feature}/{tier}-results-{timestamp}.md
```

---

## Final Summary

```
## Pipeline Complete — {Module} / {Feature Label}

Step 2    Functional Unit Discovery   ✅  {N} FUs cataloged
Step 2.5  Gap Analysis                ✅  {N}% functional coverage
Step 2.6  Coverage Sign-off           ✅ / ⚠️ / 🚫
Step 3    Playwright Generation       ✅ (or SKIPPED)
Step 4    Test Execution              ✅  {tier}: {N} passed, {N} failed
          └─ Dashboard Updated        ✅  http://localhost:3000/dashboard/{module}/{feature}

Files generated: [list]
Test results: reports/test-results/{module}/feature-{feature}/{tier}-results-{timestamp}.md
Dashboard: Updated with test execution metrics and health status
```

---

## Usage Examples

### Example 1: Run Smoke Tests After Generation
```
User: "Run the migration QA framework for coop/submit-claim"
Agent: [Executes Steps 2 → 2.5 → 2.6 → 3]
Agent: "Step 3 complete. Which test tier would you like to run?"
User: "smoke"
Agent: [Executes Step 4 with tier=smoke, updates dashboard]
```

### Example 2: Run All Test Tiers
```
User: "Run all test tiers for the dealer enrollment feature"
Agent: [After Step 3 completion]
Agent: [Executes smoke → regression → e2e sequentially]
Agent: [Updates dashboard with results from all three tiers]
```

### Example 3: Re-run Tests After Fixes
```
User: "Re-run regression tests for coop/submit-claim"
Agent: [Skips Steps 2-3, goes directly to Step 4]
Agent: [Runs regression tier, compares with previous results, updates dashboard]
```
