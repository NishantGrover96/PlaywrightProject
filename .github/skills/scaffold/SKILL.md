---
name: scaffold
description: One-time interactive setup for a new module or feature, creating all folders, starter files, and updating config and dashboard.
---

# Scaffold - Step 0: New Module / Feature Setup

## Purpose

One-time interactive setup for a new module or feature.
Collects inputs via questions, creates all folders and starter files, and
updates `config/repos.local.json`, `README.md`, and the dashboard.

## When to Use

- First time setting up any module or feature
- User says "scaffold new module", "set up new feature", "add feature", "new module setup"

---

## Step 0 - Collect Inputs via AskUserQuestion (ALWAYS first)

Ask in **two rounds** (max 4 questions per call).

### Round 1 - Client / Module / Feature Identity

```
Q1. Client ID  [kebab-case]
    The client this feature belongs to.
    e.g. demoportal | certainteed | samsung
    (must match a config/clients/{clientId}.json file)

Q2. Module name  [kebab-case]
    e.g. coop | rebate | engage-ads | popshop | rewards | administration | dealer-management

Q3. Feature name  [kebab-case]
    e.g. submit-claim | submit-preapproval | dealer-dashboard | admin-reports

Q4. Feature label  [human-readable]
    e.g. "Submit Claim" | "Submit Preapproval" | "Dealer Dashboard"

Q5. Feature page URL path
    The URL route for this feature in the app.
    e.g. /CoopManagement/Claims/Submit/SubmitClaim
    (used in Playwright tests - can be updated later)
```

### Round 2 - Legacy Repository Paths

```
Q6. Legacy Workspace Folder
    Root of the legacy codebase on your machine.
    e.g. D:\NareshCF\Workspace4\Git\ConnectedPlatformWorkspace\DemoPortalV2

Q7. Legacy Web Folder
    The web project folder relative to the workspace root.
    e.g. Presentation\Web

Q8. Legacy Module Folder
    Module folder relative to web Pages directory.
    e.g. CoopManagement
    (resolves to: {workspace}\{webFolder}\Pages\{moduleFolder}\)

Q9. Legacy Feature Folder
    Feature folder relative to the module folder.
    e.g. Claims\Submit
    (resolves to: {workspace}\{webFolder}\Pages\{moduleFolder}\{featureFolder}\)
```

---

## Step 0.5 - Resolve and Confirm Paths

Compute resolved paths and show to user before creating anything:

```
Feature files (primary):
  {legacyWorkspace}\{legacyWeb}\Pages\{moduleFolder}\{featureFolder}\

On-demand dependencies:
  Services:   {legacyWorkspace}\Libraries\BusinessLogic\Services\
  Entities:   {legacyWorkspace}\Libraries\CommonEntity\
  Resources:  {legacyWorkspace}\RAL\Resources\{Module}\
  Scripts:    {legacyWorkspace}\{legacyWeb}\wwwroot\WebScripts\{moduleFolder}\
  Tests:      {legacyWorkspace}\tests\playwright\{module}\
```

---

## Step 1 - Run Scaffold Script

```powershell
.\scripts\new-module.ps1 -Client {client} -Module {module} -Feature {feature} -Label "{label}"
```

Creates all folders and starter files across `tests/`, `docs/`, `reports/`.
All paths are client-scoped: `tests/playwright/specs/{client}/{module}/feature-{feature}/` etc.

---

## Step 2 - Update config/repos.local.json

Read `config/repos.local.json`. Add or update the module entry:

```json
"legacy": {
  "root":      "{legacyWorkspace}",
  "webFolder": "{legacyWeb}",
  "modules": {
    "{module}": {
      "featurePath": "{legacyWorkspace}\\{legacyWeb}\\Pages\\{moduleFolder}\\{featureFolder}",
      "moduleFolder": "{legacyWorkspace}\\{legacyWeb}\\Pages\\{moduleFolder}",
      "services":    "{legacyWorkspace}\\Libraries\\BusinessLogic\\Services",
      "entities":    "{legacyWorkspace}\\Libraries\\CommonEntity",
      "resources":   "{legacyWorkspace}\\RAL\\Resources\\{Module}",
      "scripts":     "{legacyWorkspace}\\{legacyWeb}\\wwwroot\\WebScripts\\{moduleFolder}",
      "tests":       "{legacyWorkspace}\\tests\\playwright\\{module}"
    }
  }
}
```

---

## Step 3 - Update README.md

Find the module section or create one. Add row to feature table:

```markdown
| {Feature Label} | `feature-{feature}` | Scaffolded |
```

---

## Step 4 - Update Dashboard

**`dashboard/catalog-manifest.json`** - add entry:
```json
"{module}-{feature}": {
  "feature":     "{Module} - {Feature Label}",
  "catalogFile": "functional-catalogs/{client}/{module}/feature-{feature}/functional-units.html",
  "version":     "v1",
  "generated":   "",
  "auditedAs":   "",
  "client":      "{client}",
  "pipeline":    "functional-qa",
  "sections":    0,
  "implementationStatus": {
    "smoke":         { "implemented": false, "lastUpdated": null },
    "regression":    { "implemented": false, "lastUpdated": null },
    "e2e":           { "implemented": false, "lastUpdated": null },
    "functionalUnit":{ "implemented": false, "lastUpdated": null }
  },
  "specFiles": {
    "smoke":      "tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts",
    "regression": "tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts",
    "e2e":        "tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts"
  },
  "tests": { "total": 0, "implemented": 0, "fixme": 0 },
  "lastRun": null
}
```

**`dashboard/server.js`** - add to `FEATURE_FOLDERS` if used for test execution:
```javascript
"{module}-{feature}": "tests/playwright/specs/{client}/{module}/feature-{feature}",
```

> **Note - `index.html` is fully dynamic.** The module dropdown and feature checkboxes are rebuilt
> automatically from `/api/catalog?clientId=X` every time the client changes. You do NOT need to
> edit `index.html` to add a new module or feature; the new catalog-manifest.json entry above is
> sufficient for the feature to appear in the dashboard.

---

## Step 5 - Confirm Summary

```
## Scaffold Complete - {Module} / {Feature Label}

Resolved paths:
  Feature folder:  {legacyWorkspace}\{legacyWeb}\Pages\{moduleFolder}\{featureFolder}\
  Services:        {legacyWorkspace}\Libraries\BusinessLogic\Services\
  Resources:       {legacyWorkspace}\RAL\Resources\{Module}\

Created:
  tests/playwright/specs/{client}/{module}/feature-{feature}/    ✅
  tests/playwright/pages/{client}/{module}/feature-{feature}/    ✅
  tests/playwright/helpers/{client}/{module}/feature-{feature}/  ✅
  tests/playwright/data/{client}/{module}/feature-{feature}/     ✅
  tests/api/{client}/{module}/feature-{feature}/                 ✅
  tests/database/{client}/{module}/feature-{feature}/            ✅
  docs/*/{client}/{module}/feature-{feature}/            ✅
  reports/*/{client}/{module}/feature-{feature}/         ✅

Updated:
  config/repos.local.json                               ✅
  README.md                                             ✅
  dashboard/catalog-manifest.json                       ✅
  dashboard/server.js                                   ✅
  dashboard/index.html                                  ✅

## Next Step
Run /migration-qa-framework to start the analysis pipeline.
```
