---
name: migration-qa-framework
description: Orchestrates the migration QA analysis-to-automation pipeline from functional unit discovery through Playwright test generation.
---

# Migration QA Framework — Orchestrator (Steps 2 → 3)

## Purpose

Collect repository and feature details via questions, then orchestrate the full
analysis-to-automation pipeline: Steps 2 → 2.5 → 2.6 → 3.

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

## Pipeline (Steps 2 → 3)

```
Step 2    Functional Unit Discovery        /functional-unit-discovery
            ↓ (reads feature folder directly — no broad scan)
Step 2.5   Legacy vs Modern Gap Analysis   /gap-analysis
            ↓ (reads services/entities on-demand for business rules)
Step 2.6   Coverage Sign-off (Gate)        /coverage-signoff
            ↓  ← GATE: must be "Ready for Automation"
Step 3    Playwright Generation            /playwright-test-generation
           (only if gate = PASSED)
```

---

## Step 2 — Functional Unit Discovery

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

## Final Summary

```
## Pipeline Complete — {Module} / {Feature Label}

Step 2    Functional Unit Discovery   ✅  {N} FUs cataloged
Step 2.5  Gap Analysis                ✅  {N}% functional coverage
Step 2.6  Coverage Sign-off           ✅ / ⚠️ / 🚫
Step 3    Playwright Generation       ✅ (or SKIPPED)

Files generated: [list]
```
