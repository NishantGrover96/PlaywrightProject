# DealerPlatform.QA

Migration Validation and QA Automation Repository

## Objective

> **Prove:** `Legacy Functionality == Modern Functionality` for every module and feature.

This repository provides structured automation, analysis, and validation tooling to validate the migration from the Legacy Dealer Platform to the Modernized Dealer Platform.

---

## Platform Comparison

| Aspect | Legacy | Modern |
|---|---|---|
| UI | Razor Pages | Razor Pages |
| Business Logic | DLL Libraries | REST APIs |
| Data Access | DAL DLLs | Repository Pattern via APIs |
| Stored Procedures | SQL Server SPs | SQL Server SPs (refactored) |

---

## Folder Structure

Everything is organized **module-first**, then **feature-first**, consistently across all layers.

```
{root-folder}/
└-- {sub-type}/
    └-- {module}/
        └-- feature-{feature-name}/
            └-- files
```

**Example:** `reports/comparison/coop/feature-submit-claim/coop-submit-claim-comparison.md`

```
DealerPlatform.QA/
├-- scripts/
│   └-- new-module.ps1               # Scaffold script for new modules/features
├-- templates/                       # Source templates used by new-module.ps1
│   ├-- feature-spec.ts
│   ├-- FeaturePage.ts
│   ├-- feature-api.spec.ts
│   ├-- test-data.json
│   └-- verify-records.sql
├-- docs/
│   ├-- functional-catalogs/
│   │   └-- {module}/
│   │       └-- feature-{feature}/   # Test catalog, smoke/regression/e2e suites
│   ├-- migration-reports/
│   │   └-- {module}/
│   │       └-- feature-{feature}/   # Legacy-to-Modern component mappings
│   └-- module-analysis/
│       └-- {module}/
│           └-- feature-{feature}/   # Discovery documents
├-- dashboard/
│   └-- server.js                        # QA Dashboard (npm run dashboard -> localhost:3333)
├-- tests/
│   ├-- playwright/
│   │   ├-- specs/
│   │   │   └-- {module}/
│   │   │       └-- feature-{feature}/  # UI spec files
│   │   ├-- pages/
│   │   │   └-- {module}/
│   │   │       └-- feature-{feature}/  # Page Object Models
│   │   ├-- helpers/
│   │   │   └-- {module}/
│   │   │       └-- feature-{feature}/  # Reusable action helpers
│   │   ├-- data/
│   │   │   └-- {module}/
│   │   │       └-- feature-{feature}/  # Test data JSON
│   │   └-- fixtures/
│   │       ├-- {module}/               # Environment-aware module fixtures
│   │       └-- .auth/                  # Stored auth state
│   ├-- api/
│   │   └-- {module}/
│   │       └-- feature-{feature}/      # API spec files
│   └-- database/
│       └-- {module}/
│           └-- feature-{feature}/      # SQL verification scripts
├-- reports/
│   ├-- smoke/
│   │   └-- {module}/feature-{feature}/
│   ├-- regression/
│   │   └-- {module}/feature-{feature}/
│   ├-- e2e/
│   │   └-- {module}/feature-{feature}/
│   ├-- comparison/
│   │   └-- {module}/feature-{feature}/
│   └-- readiness/
│       └-- {module}/feature-{feature}/
└-- baseline/
    ├-- legacy/
    └-- modern/
```

---

## Modules

### Co-op (`coop`)

| Feature | Folder | Status |
|---|---|---|
| Submit Claim | `feature-submit-claim` | In Progress |
| Submit Preapproval | `feature-submit-preapproval` | Planned |
| Admin Reports | `feature-admin-reports` | Planned |
| Dealer Dashboard - Dealer Info Tab | `feature-dealer-dashboard/feature-dealer-info-tab` | Planned |
| Dealer Dashboard - Budget | `feature-dealer-dashboard/feature-budget` | Planned |
| Dealer Dashboard - My Todo | `feature-dealer-dashboard/feature-my-todo` | Planned |
| Dealer Dashboard - Claim Activity | `feature-dealer-dashboard/feature-coop-activity/feature-claim-activity` | Planned |
| Dealer Dashboard - Preapproval Activity | `feature-dealer-dashboard/feature-coop-activity/feature-preapproval-activity` | Planned |
| Dealer Dashboard - Reports Tab | `feature-dealer-dashboard/feature-reports-tab` | Planned |

### PopShop (`popshop`)

| Feature | Folder | Status |
|---|---|---|
| New Order | `feature-new-order` | Scaffolded |

### Samsung - SPIFF (`spiff`)

| Feature | Folder | Status |
|---|---|---|
| SPIFF (Flip to Samsung) | `feature-spiff` | In Progress |

### Planned Modules
- Rebate
- Rewards
- Administration
- Dealer Management

---

## Adding a New Module or Feature

Use the scaffold script to create the complete folder structure and starter files in one step:

```powershell
.\scripts\new-module.ps1 -Module <module> -Feature <feature> -Label "<Human Label>"
```

**Examples:**

```powershell
# New feature in an existing module
.\scripts\new-module.ps1 -Module coop -Feature submit-preapproval -Label "Submit Preapproval"

# New module entirely
.\scripts\new-module.ps1 -Module rebate -Feature submit-rebate -Label "Submit Rebate"
```

The script creates:

| File | Location |
|---|---|
| Playwright spec | `tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts` |
| Page Object | `tests/playwright/pages/{module}/feature-{feature}/{Feature}Page.ts` |
| Test data | `tests/playwright/data/{module}/feature-{feature}/test-data.json` |
| API spec | `tests/api/{module}/feature-{feature}/{feature}.api.spec.ts` |
| DB script | `tests/database/{module}/feature-{feature}/verify-records.sql` |
| Docs folders | `docs/functional-catalogs`, `docs/migration-reports`, `docs/module-analysis` |
| Report folders | `reports/smoke`, `reports/regression`, `reports/e2e`, `reports/comparison`, `reports/readiness` |

After scaffolding:
1. Fill in `test-data.json` with real values
2. Replace locators in `{Feature}Page.ts`
3. Implement `TODO` blocks in the spec file
4. Add docs to `docs/functional-catalogs/{module}/feature-{feature}/`

---

## QA Dashboard

A built-in on-demand test runner with real-time output streaming and automated test result tracking.

```bash
npm run dashboard
# Open http://localhost:3333
```

### Features

- **Interactive Test Runner**: Select module -> feature -> tier -> platform -> environment, then click **Run Tests**
- **Live Streaming**: Results stream in real-time via Server-Sent Events
- **Test History**: Last 20 run summaries retained with pass/fail metrics
- **Auto-Updated Status**: Step 4 automatically updates dashboard after test execution with:
  - Test results per tier (smoke/regression/e2e)
  - Pass/fail/skip counts and duration
  - Test health metrics (stability %, flaky tests)
  - Links to test reports and artifacts
  - Color-coded status indicators (🟢 Pass / 🟡 Flaky / 🔴 Failed)
- **Implementation Tracking**: View test coverage across all features and tiers
- **Catalog Viewer**: Browse functional unit catalogs and test documentation

### Dashboard Data Source

The dashboard reads from `dashboard/catalog-manifest.json`, which is automatically maintained by the migration QA framework during:
- Step 0 (Scaffold) - Initial feature entry creation
- Step 3 (Test Generation) - Implementation status updates
- Step 4 (Test Execution) - Test results and health metrics

---

## Quick Start

### Prerequisites

#### Required Software
- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 3+
- **Git** 2.30+
- **Playwright** (will be installed with project dependencies)

#### Development Environment
- **VS Code** (recommended) with extensions:
  - Playwright Test for VSCode
  - GitHub Copilot (for using agent skills)
- **PowerShell** 7+ (Windows) or **Bash** (Linux/Mac)

#### Access Requirements
- Access to Legacy Dealer Platform codebase repository
- Access to Modern Dealer Platform codebase repository
- Test environment credentials:
  - Legacy platform base URL and login credentials
  - Modern platform base URL and login credentials
  - Database connection strings (read-only access minimum)

#### Recommended System Specs
- **RAM:** 16GB minimum (32GB recommended for running multiple environments)
- **Storage:** 20GB free space for repositories and test artifacts
- **OS:** Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+)

### Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Verify Playwright installation
npx playwright --version
```

### Repo Path Configuration (one-time per developer)

Each team member has source repos in a different physical location.
Copy the template and fill in your own paths:

```powershell
Copy-Item config\repos.json config\repos.local.json
```

Then edit `config/repos.local.json` - replace every `{{placeholder}}` with your actual paths:

```json
{
  "legacy": {
    "root": "D:\\YourPath\\DealerPlatform.Legacy",
    ...
  },
  "modern": {
    "root": "D:\\YourPath\\DealerPlatform.Modern",
    ...
  }
}
```

`repos.local.json` is gitignored - your paths never get committed.

### Environment Configuration

```bash
cp .env.example .env.legacy
cp .env.example .env.modern
```

Edit each file with the appropriate base URLs and credentials.

### Running Tests

```bash
# Run all tests against modern platform
npm test

# Run against legacy platform
npm run test:legacy

# Run against modern platform
npm run test:modern

# Smoke tests only
npm run test:smoke

# Regression suite
npm run test:regression

# E2E suite
npm run test:e2e

# View last report
npm run report
```

---

## Migration Analysis Workflow

Each feature follows this comprehensive analysis and validation process:

| Phase | Output |
|---|---|
| 1 - Repository Analysis | `docs/module-analysis/{module}/feature-{feature}/` |
| 2 - Functional Unit Discovery | `docs/functional-catalogs/{module}/feature-{feature}/functional-units.md` |
| 2.5 - Gap Analysis | `docs/functional-catalogs/{module}/feature-{feature}/gap-analysis.md` |
| 2.6 - Coverage Sign-off (Gate) | `docs/functional-catalogs/{module}/feature-{feature}/signoff.md` |
| 3 - Playwright Test Generation | `tests/playwright/specs/{module}/feature-{feature}/` |
| 4 - Test Execution & Dashboard Update | `reports/test-results/{module}/feature-{feature}/` |
| 5 - Migration Mapping | `docs/migration-reports/{module}/feature-{feature}/mapping.md` |
| 6 - Functional Test Catalog | `docs/functional-catalogs/{module}/feature-{feature}/test-catalog.md` |
| 7 - Smoke Suite | `docs/functional-catalogs/{module}/feature-{feature}/smoke-suite.md` |
| 8 - Regression Suite | `docs/functional-catalogs/{module}/feature-{feature}/regression-suite.md` |
| 9 - E2E Suite | `docs/functional-catalogs/{module}/feature-{feature}/e2e-suite.md` |
| 10 - API Validation | `tests/api/{module}/feature-{feature}/` |
| 11 - Database Verification | `tests/database/{module}/feature-{feature}/` |
| 12 - Migration Comparison | `reports/comparison/{module}/feature-{feature}/` |
| 13 - Readiness Report | `reports/readiness/{module}/feature-{feature}/` |

---

## Migration QA Pipeline (Steps 0 -> 4)

Every feature follows this sequence. **Steps run in order. Step 2.6 is a gate, Step 3 only runs if gate passes.**

```
Step 0     /scaffold                        One-time setup - creates folder structure
             v
Step 2     /functional-unit-discovery       Catalog functional units from source
             v
Step 2.5   /gap-analysis                    Legacy vs Modern gap analysis (8 dimensions)
             v
Step 2.6   /coverage-signoff                GATE - Ready / Remediate / Blocked
             v  (only if PASSED)
Step 3     /playwright-test-generation      Generate specs, POMs, helpers, test data
             v
Step 4     Run Playwright Test Suite        Execute tests (smoke/regression/e2e)
             └- Update QA Dashboard          Reflect test results and health metrics
```

**Orchestrator**: Use `/migration-qa-framework` to run the complete Steps 2 -> 4 pipeline automatically.

### Step 4 - Test Execution

After test generation (Step 3), run the Playwright test suite:

```powershell
# Run specific test tier
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts --grep "@smoke"
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts --grep "@regression"
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts --grep "@e2e"

# Run all tiers for a feature
npx playwright test tests/playwright/specs/{module}/feature-{feature}/{feature}.spec.ts
```

Results are automatically updated in the QA Dashboard with:
- Pass/fail counts per tier
- Test execution duration
- Test health metrics (stability, flaky tests)
- Links to test reports and artifacts
           v
Step 2.5  Legacy vs Modern Gap Analysis
           v
Step 2.6  Functional Coverage Sign-off
           v  <- GATE: "Ready for Automation" required
Step 3   Playwright Test Generation

/migration-qa-framework runs Steps 1 -> 2 -> 2.5 -> 2.6 -> 3 in one go (also asks questions first)
```

### Step 1 - Repository Discovery
> "Analyze Co-op Submit Claim - legacy and modern repos"

Invokes `/functional-unit-discovery` (mode=discovery). Reads both codebases, maps
all files, endpoints, services, and stored procedures.
-> `docs/module-analysis/{module}/feature-{feature}/discovery.md`

### Step 2 - Functional Unit Discovery
> "Generate Functional Unit Catalog and Migration Mapping"

Invokes `/functional-unit-discovery` (mode=catalog). Extracts every discrete
testable behavior. Maps each to legacy + modern implementation.
-> `docs/functional-catalogs/{module}/feature-{feature}/functional-units.md`
-> `docs/migration-reports/{module}/feature-{feature}/mapping.md`

### Step 2.5 - Gap Analysis
> "Run gap analysis for coop submit-claim"

Invokes `/gap-analysis`. Compares all 8 dimensions: Functional Units, UI Elements,
Validation Rules, Business Rules, Workflow Transitions, Database Operations,
Stored Procedures, Security Rules.
-> `docs/functional-catalogs/{module}/feature-{feature}/gap-analysis.md`
-> `docs/functional-catalogs/{module}/feature-{feature}/coverage-matrix.md`

### Step 2.6 - Coverage Sign-off (Gate)
> "Sign off coverage for coop submit-claim"

Invokes `/coverage-signoff`. Issues one of three decisions:

| Decision | Condition | Action |
|---|---|---|
| ✅ Ready for Automation | 0 Critical, 0 High gaps, all coverage thresholds met | Proceed to Step 3 |
| [!]️ Needs Remediation | High gaps present, coverage 80-89% | Fix gaps, re-run Step 2.5 |
| 🚫 Blocked | Critical gaps or security FUs missing | No automation until fixed |

-> `docs/functional-catalogs/{module}/feature-{feature}/signoff.md`

### Step 3 - Playwright Generation *(gated)*
> "Generate Playwright tests for coop submit-claim"

**Only runs after Step 2.6 returns ✅ Ready for Automation.**
Invokes `/playwright-test-generation`. Generates:
- Smoke Suite, Regression Suite, E2E Suite (spec files)
- Page Object Models + Helpers
- API spec files
- Database verification SQL scripts

---

## Claude Code Skills

| Skill | Step | Purpose |
|---|---|---|
| `/scaffold` | 0 - One-time setup | Interactive questions -> creates all folders, updates dashboard, README, config |
| `/migration-qa-framework` | Orchestrator | Interactive questions -> runs full Steps 2 -> 2.5 -> 2.6 -> 3 -> 4 pipeline |
| `/functional-unit-discovery` | 2 | Repository discovery -> Functional Unit Catalog |
| `/gap-analysis` | 2.5 | Legacy vs Modern gap analysis across 8 dimensions |
| `/coverage-signoff` | 2.6 | Gate decision - Ready / Remediate / Blocked |
| `/playwright-test-generation` | 3 | Generate POMs, specs, helpers, API tests, DB scripts |
| **Test Execution** | **4** | **Run Playwright tests (smoke/regression/e2e) -> Update QA Dashboard** |
| `/migration-comparison` | Post-execution | Run legacy vs modern side-by-side, produce diff report |
| `/api-verification` | Post-execution | Validate REST API contracts |
| `/database-verification` | Post-execution | SQL data integrity verification scripts |

---

## Coverage Targets

| Category | Target |
|---|---|
| Functional Unit Coverage | ≥ 95% |
| Automation Coverage | ≥ 80% |
| API Coverage | ≥ 90% |
| Database Coverage | ≥ 85% |
| Migration Confidence | ≥ 90% |
