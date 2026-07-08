# DealerPlatform QA — Developer Onboarding Guide

> **Last updated:** 2026-06-19
> **Maintained by:** QA Team
> **Repo:** DealerPlatform.QA (this repo)
> **Source repo:** `D:\Leads\DemoPortalV2`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Which Skill Do I Need?](#3-which-skill-do-i-need)
4. [Skill 1 — Migration QA Framework (Legacy → Modern)](#4-skill-1--migration-qa-framework-legacy--modern)
5. [Skill 2 — Functional QA Test Generation (Independent Module)](#5-skill-2--functional-qa-test-generation-independent-module)
6. [Other Available Skills](#6-other-available-skills)
7. [Key Files Reference](#7-key-files-reference)
8. [Folder Conventions](#8-folder-conventions)
9. [Quick Command Reference](#9-quick-command-reference)
10. [Updating This Guide](#10-updating-this-guide)

---

## 1. Prerequisites

### 1.1 System Tools

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 20.x LTS | https://nodejs.org |
| **npm** | bundled with Node | — |
| **Git** | any recent | https://git-scm.com |
| **VS Code** | latest stable | https://code.visualstudio.com |
| **PowerShell** | 5.1+ (Windows default) | — |

### 1.2 VS Code Extensions

Install these before opening the repo:

| Extension | ID |
|---|---|
| Playwright Test for VS Code | `ms-playwright.playwright` |
| GitHub Copilot | `GitHub.copilot` |
| GitHub Copilot Chat | `GitHub.copilot-chat` |
| ESLint | `dbaeumer.vscode-eslint` |

> TypeScript support is built into VS Code — no extension needed.

### 1.3 Access Required

Request the following from your team lead before starting:

- [ ] Read access to **DemoPortalV2** source repo on your local machine
- [ ] **Dealer role** credentials for DemoPortal UAT
- [ ] **Admin role** credentials for DemoPortal UAT
- [ ] GitHub Copilot organisation seat (required for AI skills in Copilot Chat)

---

## 2. Project Setup

### 2.1 Clone & Install

```powershell
git clone <repo-url> d:\Leads\PlayWright
cd d:\Leads\PlayWright
npm install
```

Installs: `@playwright/test@1.48.2`, `typescript@^5.4`, `cross-env`, `dotenv`.

### 2.2 Install Playwright Browsers

```powershell
npx playwright install chromium
```

### 2.3 Create Environment File

Create `.env.production` in the repo root. **Never commit this file — it is gitignored.**

```env
BASE_URL=https://demoportaluat.channel-fusion.com
API_BASE_URL=https://demoportaluat.channel-fusion.com
TEST_USER_EMAIL=your-dealer@email.com
TEST_USER_PASSWORD=yourpassword
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=youradminpassword
```

For UAT, copy to `.env.uat` and update values.
For local dev, copy to `.env.dev` and update values.

### 2.4 Configure Local Repo Paths

Create `config/repos.local.json` — **gitignored, your local copy only**.
Use `config/repos.json` as the reference template.

```json
{
  "legacy": {
    "root": "D:\\Leads\\DemoPortalV2",
    "webFolder": "Presentation\\Web",
    "modules": {
      "engage-ads": {
        "features": {
          "view-package": {
            "featureUrl": "https://demoportaluat.channel-fusion.com/EngageAds/BundledAdPackages",
            "featurePath": "D:\\Leads\\DemoPortalV2\\Presentation\\Web\\Pages\\EngageAds",
            "authState": ""
          }
        }
      }
    }
  }
}
```

> **When adding a new feature:** add its entry here before running any skill.

### 2.5 Run Auth Setup (once per environment)

```powershell
# Dealer role
npx playwright test tests/playwright/specs/auth.setup.ts --project=setup

# Admin role
npx playwright test tests/playwright/specs/auth.setup.admin.ts --project=setup-admin
```

Saves session cookies to:
- `tests/playwright/fixtures/.auth/user.json`
- `tests/playwright/fixtures/.auth/admin.json`

> Re-run this any time you get authentication errors during test runs.

### 2.6 Verify Everything Works

```powershell
# Smoke tests only (fastest check)
npm run test:smoke

# Single feature
npx playwright test tests/playwright/specs/engage-ads/feature-view-package/ --project=chromium
```

### 2.7 Start the On-Demand QA Dashboard

```powershell
npm run dashboard
```

Open in browser: **http://localhost:3333**

Select module, feature, tier (smoke / regression / e2e), and role (dealer / admin) — results stream in real time without using the command line.

---

## 3. Which Skill Do I Need?

Before opening Copilot Chat, answer this one question:

```
Are you validating that a feature migrated from Legacy works correctly in Modern?
```

| Answer | Skill to use | Go to |
|---|---|---|
| **Yes** — I have both a Legacy codebase and a Modern codebase and I need to compare them | **migration-qa-framework** | [Section 4](#4-skill-1--migration-qa-framework-legacy--modern) |
| **No** — I just need full QA coverage for a standalone module/feature | **functional-qa-test-generation** | [Section 5](#5-skill-2--functional-qa-test-generation-independent-module) |
| **Neither** — I need something else (scaffold, API tests, DB checks, gap analysis…) | Other skills | [Section 6](#6-other-available-skills) |

---

## 4. Skill 1 — Migration QA Framework (Legacy → Modern)

**Use this when:** You have a feature in the Legacy platform (DemoPortalV2 Razor Pages + DLL libraries) and you need to prove the Modern implementation behaves identically.

### What It Does

```
Step 1   Scaffold (one-time)      creates folder structure for module/feature
Step 2   Legacy Analysis          reads Legacy source — fields, rules, validation, DB
Step 2.5 Gap Analysis             compares Legacy vs Modern code side by side
Step 2.6 Coverage Sign-Off Gate   you review gaps before automation starts
Step 3   Playwright Test Gen      generates test files for both Legacy + Modern
Step 4   Test Execution           runs tests, diffs results, updates dashboard
```

### Inputs Required Before Starting

Update `config/repos.local.json` with:
- `legacy.root` — path to Legacy DemoPortalV2 on your machine
- `legacy.webFolder` — e.g. `Presentation\Web`
- Feature entry with `featurePath` and `featureUrl`
- `modern.root` — path to Modern repo (or `"none"` if not yet available)

### How to Start in Copilot Chat

```
/migration-qa-framework

Module: coop
Feature: submit-claim
Feature Label: Submit Claim
Legacy Workspace: D:\Leads\DemoPortalV2
Legacy Feature Folder: Presentation\Web\Pages\CoopManagement\Claims\Submit
Modern Workspace: D:\Leads\ModernPlatform
Modern Feature Folder: src\API\Controllers\Coop\Claims
Feature URL: /CoopManagement/Claims/Submit/SubmitClaim
```

Copilot will pause at **Step 2.6** for your gap review and sign-off before any test code is written.

### Key Outputs

| Output | Path |
|---|---|
| Gap analysis | `docs/migration-reports/{module}/feature-{name}/mapping.md` |
| Playwright spec | `tests/playwright/specs/{module}/feature-{name}/{name}.spec.ts` |
| Page Object | `tests/playwright/pages/{module}/feature-{name}/{Name}Page.ts` |
| Dashboard entry | `dashboard/catalog-manifest.json` |

---

## 5. Skill 2 — Functional QA Test Generation (Independent Module)

**Use this when:** You need full QA coverage for a standalone feature — no Legacy/Modern comparison needed. The feature exists in one codebase (e.g. EngageAds in DemoPortalV2) and you want comprehensive automated tests for it.

### What It Does

```
Step 1   Repo Analysis       reads source code — fields, business rules, validation
Step 2   UI Analysis         runs Playwright against live UAT URL, maps selectors
Step 3   Business Rules      correlates code + UI to extract every testable rule
Step 4   Test Catalog        generates HTML + Markdown catalog (smoke/regression/e2e)
         ↓ [GATE — you review & approve the catalog before automation starts]
Step 5   Test Generation     creates .spec.ts, Page Object, helpers, test-data.json
Step 6   Verification        TypeScript compile check, runs tests
Step 7   Dashboard update    updates catalog-manifest.json + server.js + index.html
```

### Inputs Required Before Starting

Update `config/repos.local.json` with the feature entry:

```json
"{module}": {
  "features": {
    "{feature}": {
      "featureUrl": "https://demoportaluat.channel-fusion.com/...",
      "featurePath": "D:\\Leads\\DemoPortalV2\\Presentation\\Web\\Pages\\...",
      "authState": ""
    }
  }
}
```

### How to Start in Copilot Chat

```
/functional-qa-test-generation

Module: engage-ads
Feature: campaign-setup
Feature Label: Campaign Setup
Feature URL: https://demoportaluat.channel-fusion.com/EngageAds/CampaignSetup
Source Root: D:\Leads\DemoPortalV2
Web Folder: Presentation\Web
Feature Folder: Pages\EngageAds
```

Copilot pauses at **Step 4** for your catalog review and approval before generating any test code.

### Key Outputs

| Output | Path |
|---|---|
| Interactive catalog | `docs/functional-catalogs/{module}/feature-{name}/functional-units.html` |
| Playwright spec | `tests/playwright/specs/{module}/feature-{name}/{name}.spec.ts` |
| Page Object | `tests/playwright/pages/{module}/feature-{name}/{Name}Page.ts` |
| Helpers | `tests/playwright/helpers/{module}/feature-{name}/{name}.helpers.ts` |
| Test data | `tests/playwright/data/{module}/feature-{name}/test-data.json` |
| API spec | `tests/api/{module}/feature-{name}/{name}.api.spec.ts` |
| DB script | `tests/database/{module}/feature-{name}/verify-records.sql` |
| Dashboard entry | `dashboard/catalog-manifest.json` |

---

## 6. Other Available Skills

Use these in Copilot Chat when you need a targeted operation rather than the full pipeline.

| Skill | Copilot Command | When to Use |
|---|---|---|
| **Scaffold** | `/scaffold` | Create folder structure for a brand-new module/feature (run before migration-qa-framework) |
| **Repo Analysis** | `/repo-analysis` | Read and document source code only — no tests generated |
| **UI Analysis** | `/ui-analysis` | Inspect live app and map selectors only |
| **Functional Test Catalog** | `/functional-test-catalog` | Generate or update test catalog only |
| **Playwright Test Generation** | `/playwright-test-generation` | Generate tests from an existing approved catalog |
| **API Verification** | `/api-verification` | Generate API-level test specs |
| **Database Verification** | `/database-verification` | Generate SQL verification scripts |
| **Gap Analysis** | `/gap-analysis` | Compare Legacy vs Modern code side by side |
| **Coverage Sign-Off** | `/coverage-signoff` | Gate check before automation — use after gap analysis |
| **Migration Comparison** | `/migration-comparison` | Compare test results between Legacy and Modern runs |

> Full skill documentation: `.github/skills/{skill-name}/SKILL.md`
> Skill index overview: `AGENTS.md`

---

## 7. Key Files Reference

| File | Purpose | Edit when… |
|---|---|---|
| `playwright.config.ts` | Projects, timeouts, reporters, auth wiring | Adding a new project/role |
| `package.json` | All `npm run test:*` shortcuts | Adding a new module npm shortcut |
| `config/repos.local.json` | **Your local** source + UAT paths (gitignored) | Adding a new feature to the pipeline |
| `config/repos.json` | Template — committed, no real values | Changing the config schema |
| `dashboard/server.js` | Dashboard backend + `FEATURE_FOLDERS` map | Adding a new feature to the dashboard |
| `dashboard/catalog-manifest.json` | Feature registry + test health tracking | Auto-updated by skill pipeline |
| `dashboard/index.html` | Dashboard UI — feature checkboxes | Auto-updated by skill pipeline |
| `AGENTS.md` | Skill index — which skill does what | Adding a new skill |
| `ONBOARDING.md` | This file | Onboarding content changes |

---

## 8. Folder Conventions

Every module and feature follows this identical layout across all layers:

```
tests/playwright/
  specs/{module}/feature-{name}/        ← .spec.ts test cases
  pages/{module}/feature-{name}/        ← Page Object Model (.ts)
  helpers/{module}/feature-{name}/      ← reusable helper functions
  data/{module}/feature-{name}/         ← test-data.json

tests/api/{module}/feature-{name}/      ← API spec files
tests/database/{module}/feature-{name}/ ← SQL verification scripts

docs/functional-catalogs/{module}/feature-{name}/
  functional-units.html                 ← interactive catalog (viewable at /docs/ on dashboard)
  test-catalog.md
  smoke-suite.md
  regression-suite.md
  e2e-suite.md

docs/module-analysis/{module}/feature-{name}/
  repo-analysis.md
  ui-analysis.md
  business-rules.md

docs/migration-reports/{module}/feature-{name}/
  mapping.md                            ← Legacy vs Modern gap map (migration skill only)

reports/readiness/{module}/feature-{name}/
reports/test-results/{module}/feature-{name}/
```

**Current modules:** `coop` | `engage-ads` | `popshop`

---

## 9. Quick Command Reference

```powershell
# ── Install ────────────────────────────────────────────────
npm install
npx playwright install chromium

# ── Auth setup (run once per environment) ─────────────────
npx playwright test tests/playwright/specs/auth.setup.ts --project=setup
npx playwright test tests/playwright/specs/auth.setup.admin.ts --project=setup-admin

# ── Run all tests ──────────────────────────────────────────
npm test

# ── Run by tier ────────────────────────────────────────────
npm run test:smoke
npm run test:regression
npm run test:e2e

# ── Run by environment ─────────────────────────────────────
npm run test:uat
npm run test:prod

# ── Run by module ──────────────────────────────────────────
npm run test:coop
npx playwright test tests/playwright/specs/engage-ads/
npx playwright test tests/playwright/specs/popshop/

# ── Run single feature ─────────────────────────────────────
npx playwright test tests/playwright/specs/engage-ads/feature-view-package/ --project=chromium

# ── Dashboard ──────────────────────────────────────────────
npm run dashboard                       # → http://localhost:3333

# ── HTML report ────────────────────────────────────────────
npm run report

# ── TypeScript check (no emit) ─────────────────────────────
npx tsc --noEmit
```

---

## 10. Updating This Guide

This file is divided into numbered sections so any section can be updated without touching others.

| Change needed | Section to update |
|---|---|
| New system tool required | `1.1` |
| New VS Code extension | `1.2` |
| New environment variable | `2.3` |
| New feature added to repos.local.json | `2.4` |
| New skill added to the pipeline | `3` (decision table) + `6` (skill table) + `AGENTS.md` |
| Changes to migration-qa-framework pipeline | `4` |
| Changes to functional-qa-test-generation pipeline | `5` |
| New key file | `7` |
| New module added | `8` (folder conventions + current modules list) |
| New npm script added | `9` |

**Update the `Last updated` date at the top of this file when making any changes.**
