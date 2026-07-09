# DealerPlatform QA — Developer Onboarding Guide

> **Last updated:** 2026-07-09
> **Maintained by:** QA Team
> **Repo:** DealerPlatform.QA (this repo)
> **Source repo:** `D:\Leads\DemoPortalV2`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Complete Head-to-Toe Setup Flow](#2-complete-head-to-toe-setup-flow)
3. [Phase A — Environment Setup (one-time, manual)](#3-phase-a--environment-setup-one-time-manual)
4. [Phase B — Client Setup (once per new client)](#4-phase-b--client-setup-once-per-new-client)
5. [Phase C — Feature Setup (once per new feature)](#5-phase-c--feature-setup-once-per-new-feature)
6. [Phase D — Auth & Verification](#6-phase-d--auth--verification)
7. [Which Skill Do I Need?](#7-which-skill-do-i-need)
8. [Key Files Reference](#8-key-files-reference)
9. [Folder Conventions](#9-folder-conventions)
10. [Quick Command Reference](#10-quick-command-reference)
11. [Updating This Guide](#11-updating-this-guide)

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

- [ ] Read access to the source repo on your local machine
- [ ] Dealer role credentials for the client UAT environment
- [ ] Admin role credentials (if applicable)
- [ ] GitHub Copilot organisation seat (required for AI skills in Copilot Chat)

---

## 2. Complete Head-to-Toe Setup Flow

Use this as your checklist. Every step is detailed in the sections below.

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE A — Environment Setup  (one-time, manual)                │
│                                                                  │
│  A1. Install Node.js 20, Git, VS Code, VS Code extensions       │
│  A2. git clone <qa-repo-url> d:\Leads\PlayWright                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  PHASE B — Client Setup  (once per new client)                  │
│                                                                  │
│  B1. Run: .\scripts\new-client.ps1   ← full interactive wizard  │
│      Handles automatically:                                      │
│        npm install + Playwright Chromium                         │
│        config/clients/{clientId}.json                            │
│        config/users/{clientId}/users.json  (+ credentials)      │
│        .env.{clientId} environment file stub                     │
│        dashboard/catalogs/{clientId}-manifest.json               │
│        docs/functional-catalogs/{clientId}/ folder               │
│        tests/playwright/ folder structure                        │
│        dashboard/index.html  (client added to dropdown)          │
│        Dashboard API health check + auto-fix                     │
│      Prints the exact Copilot Chat commands to run next          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  PHASE C — Feature Setup  (repeat for EACH feature to automate) │
│                                                                  │
│  C1. Scaffold the feature:                                       │
│      .\scripts\new-module.ps1 \                                  │
│          -Client {clientId} -Module {module} \                   │
│          -Feature {feature} -Label "{Feature Label}"             │
│      Creates: spec / page object / helpers / test-data /         │
│               api spec / sql / catalog HTML placeholder          │
│                                                                  │
│  C2. Copilot Chat: /repo-analysis                                │
│      Reads source code → extracts business rules, fields,        │
│      validation, endpoints, DB queries                           │
│                                                                  │
│  C3. Copilot Chat: /functional-test-catalog                      │
│      Generates HTML catalog + test-catalog.md                    │
│      ── GATE: review & approve the catalog before continuing ──  │
│                                                                  │
│  C4. Copilot Chat: /playwright-test-generation                   │
│      Implements Page Object + spec files from the catalog        │
│      Updates dashboard/catalog-manifest.json                     │
│                                                                  │
│  Repeat C1→C4 for each additional feature                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  PHASE D — Auth & Verification  (once per client)               │
│                                                                  │
│  D1. Run auth setup:                                             │
│      npx playwright test --project=setup-{clientId}              │
│                                                                  │
│  D2. Verify on dashboard:                                        │
│      npm run dashboard  →  http://localhost:3333                  │
│      Select client → confirm features appear                     │
│                                                                  │
│  D3. Run smoke tests:                                            │
│      npx playwright test \                                       │
│          --project=chromium-{clientId} --grep @smoke             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase A — Environment Setup (one-time, manual)

### A1. Install System Tools

Install in this order:
1. **Node.js 20 LTS** — https://nodejs.org (npm is bundled)
2. **Git** — https://git-scm.com
3. **VS Code** — https://code.visualstudio.com
4. **VS Code extensions** — install all four listed in [Section 1.2](#12-vs-code-extensions)

### A2. Clone the Repo

```powershell
git clone <qa-repo-url> d:\Leads\PlayWright
cd d:\Leads\PlayWright
```

> `npm install` and Playwright Chromium are handled automatically by `new-client.ps1` in Phase B.
> You do **not** need to run them manually.

---

## 4. Phase B — Client Setup (once per new client)

### B1. Run the Client Wizard

```powershell
.\scripts\new-client.ps1
```

The wizard walks you through every question in two phases:
- **Phase 0** — collects all inputs (client ID, display name, base URL, auth type, modules, credentials)
- **Phase 1** — executes all setup steps and prints a final summary

**What the wizard creates automatically:**

| Artifact | Path |
|---|---|
| npm install | `node_modules/` |
| Playwright Chromium | `~/.ms-playwright/chromium-*/` |
| Client config | `config/clients/{clientId}.json` |
| User credentials | `config/users/{clientId}/users.json` |
| Environment file stub | `.env.{clientId}` |
| Per-client catalog manifest | `dashboard/catalogs/{clientId}-manifest.json` |
| Functional catalog folder | `docs/functional-catalogs/{clientId}/` |
| Playwright folder structure | `tests/playwright/specs|pages|data/{clientId}/` |
| Dashboard dropdown entry | `dashboard/index.html` — `sel-client` option added |
| Dashboard health check | Runs automatically, auto-fixes detectable issues |

**At the end**, the wizard prints the exact Copilot Chat commands to run next (per module/feature).

> **Credentials:** After the wizard, open `.env.{clientId}` and fill in `BASE_URL`.  
> For `username-only` auth: open `config/users/{clientId}/users.json` and replace `REPLACE_WITH_..._USERNAME` with the real value.  
> For `email-password` auth: run `node utils/encrypt-credential.js` to encrypt passwords.

---

## 5. Phase C — Feature Setup (once per new feature)

Repeat these four steps for **each** feature you want to automate.

### C1. Scaffold the Feature — `new-module.ps1`

```powershell
.\scripts\new-module.ps1 `
    -Client deereadbuilder `
    -Module ad-builder `
    -Feature asset-upload `
    -Label "Asset Upload"
```

**What it creates (all tokens pre-substituted, imports correct):**

| File | Purpose |
|---|---|
| `tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts` | Test cases skeleton with `TODO` blocks |
| `tests/playwright/pages/{client}/{module}/feature-{feature}/{Feature}Page.ts` | Page Object Model skeleton |
| `tests/playwright/helpers/{client}/{module}/feature-{feature}/{feature}.helpers.ts` | Shared helper stubs |
| `tests/playwright/data/{client}/{module}/feature-{feature}/test-data.json` | Test data template |
| `tests/api/{client}/{module}/feature-{feature}/{feature}.api.spec.ts` | API test skeleton |
| `tests/database/{client}/{module}/feature-{feature}/verify-records.sql` | DB verification stub |
| `docs/functional-catalogs/{client}/{module}/feature-{feature}/functional-units.html` | Catalog placeholder (proper HTML) |

> Skip C1 only if you are adding a feature to an **existing client** that already has the folder structure and you want Copilot to generate files from scratch via the skill. Otherwise always run `new-module.ps1` first.

### C2. Analyse the Source Code

In Copilot Chat:

```
/repo-analysis

Client: deereadbuilder
Module: ad-builder
Feature: asset-upload
Source folder: D:\Leads\DeerAdBuilder\src
```

Outputs `docs/module-analysis/{client}/{module}/feature-{feature}/repo-analysis.md`.

### C3. Generate the Test Catalog

In Copilot Chat:

```
/functional-test-catalog

Client: deereadbuilder
Module: ad-builder
Feature: asset-upload
Feature Label: Asset Upload
```

Copilot pauses for your **catalog review and approval** before proceeding.  
Outputs `docs/functional-catalogs/{client}/{module}/feature-{feature}/functional-units.html` and `test-catalog.md`.

### C4. Generate the Playwright Tests

In Copilot Chat:

```
/playwright-test-generation

Client: deereadbuilder
Module: ad-builder
Feature: asset-upload
```

Implements the `TODO` blocks in the scaffolded spec and Page Object files.  
Updates `dashboard/catalog-manifest.json` with the new feature entry.

---

## 6. Phase D — Auth & Verification

### D1. Run Auth Setup (once per client)

```powershell
npx playwright test --project=setup-{clientId}
```

Saves session cookies to `tests/playwright/fixtures/.auth/{clientId}/`.  
Re-run any time you get authentication errors.

### D2. Verify on the Dashboard

```powershell
npm run dashboard
```

Open **http://localhost:3333** — select the client from the dropdown.  
Confirm all features appear and "View Catalog" opens the HTML catalog.

### D3. Run Smoke Tests

```powershell
npx playwright test --project=chromium-{clientId} --grep @smoke
```

---

## 7. Which Skill Do I Need?

Before opening Copilot Chat, answer this one question:

```
Are you validating that a feature migrated from Legacy works correctly in Modern?
```

| Answer | Skill to use | When |
|---|---|---|
| **Yes** — comparing Legacy vs Modern | **migration-qa-framework** | After scaffold (C1) |
| **No** — standalone feature QA | **functional-qa-test-generation** | After scaffold (C1) |
| **Neither** — targeted operation | Other skills below | As needed |

### Other Available Skills

| Skill | Copilot Command | When to Use |
|---|---|---|
| **Repo Analysis** | `/repo-analysis` | Step C2 — read source code only |
| **Functional Test Catalog** | `/functional-test-catalog` | Step C3 — generate or update catalog |
| **Playwright Test Generation** | `/playwright-test-generation` | Step C4 — implement tests from approved catalog |
| **Scaffold** | `/scaffold` | Alternative to `new-module.ps1` via Copilot Chat |
| **API Verification** | `/api-verification` | Generate API-level test specs |
| **Database Verification** | `/database-verification` | Generate SQL verification scripts |
| **Gap Analysis** | `/gap-analysis` | Compare Legacy vs Modern code |
| **Coverage Sign-Off** | `/coverage-signoff` | Gate before automation (migration flow) |
| **Migration Comparison** | `/migration-comparison` | Diff test results between Legacy and Modern |

> Full skill documentation: `.github/skills/{skill-name}/SKILL.md`

---

## 8. Key Files Reference

| File | Purpose | Edit when… |
|---|---|---|
| `playwright.config.ts` | Projects, timeouts, reporters, auth wiring | Adding a new client project/role |
| `package.json` | All `npm run test:*` shortcuts | Adding a new module npm shortcut |
| `config/clients/{clientId}.json` | Client config (URL, auth type, modules) | Auto-created by `new-client.ps1` |
| `config/users/{clientId}/users.json` | Credentials for the client | Fill placeholders after wizard |
| `dashboard/server.js` | Dashboard backend | Rarely — auto-maintained |
| `dashboard/catalog-manifest.json` | Global feature registry + test health | Auto-updated by skills + health check |
| `dashboard/catalogs/{clientId}-manifest.json` | Per-client feature registry | Auto-updated by skills |
| `dashboard/index.html` | Dashboard UI | Auto-updated by `new-client.ps1` |
| `AGENTS.md` | Skill index | Adding a new skill |
| `ONBOARDING.md` | This file | Onboarding content changes |

---

## 9. Folder Conventions

Every client / module / feature follows this identical layout:

```
tests/playwright/
  specs/{client}/{module}/feature-{name}/     ← .spec.ts test cases
  pages/{client}/{module}/feature-{name}/     ← Page Object Model (.ts)
  helpers/{client}/{module}/feature-{name}/   ← reusable helper functions
  data/{client}/{module}/feature-{name}/      ← test-data.json

tests/api/{client}/{module}/feature-{name}/   ← API spec files
tests/database/{client}/{module}/feature-{name}/ ← SQL verification scripts

docs/functional-catalogs/{client}/{module}/feature-{name}/
  functional-units.html                       ← interactive catalog (view at /docs/ on dashboard)
  test-catalog.md
  smoke-suite.md
  regression-suite.md
  e2e-suite.md

docs/module-analysis/{client}/{module}/feature-{name}/
  repo-analysis.md
  ui-analysis.md
  business-rules.md

reports/readiness/{client}/{module}/feature-{name}/
reports/test-results/{client}/{module}/feature-{name}/
```

**Current clients:** `demoportal` | `deer-australia` | `deereadbuilder`

---

## 10. Quick Command Reference

```powershell
# ── Phase B — Client setup ─────────────────────────────────
.\scripts\new-client.ps1

# ── Phase C1 — Feature scaffold ───────────────────────────
.\scripts\new-module.ps1 -Client {clientId} -Module {module} -Feature {feature} -Label "{Label}"

# ── Phase D1 — Auth setup ──────────────────────────────────
npx playwright test --project=setup-{clientId}

# ── Phase D2 — Dashboard ───────────────────────────────────
npm run dashboard                        # → http://localhost:3333

# ── Phase D3 — Smoke tests ─────────────────────────────────
npx playwright test --project=chromium-{clientId} --grep @smoke

# ── Run by tier ────────────────────────────────────────────
npm run test:smoke
npm run test:regression
npm run test:e2e

# ── Run by environment ─────────────────────────────────────
npm run test:uat
npm run test:prod

# ── TypeScript check (no emit) ─────────────────────────────
npx tsc --noEmit

# ── HTML report ────────────────────────────────────────────
npm run report
```

---

## 11. Updating This Guide

This file is divided into numbered phases so any section can be updated without touching others.

| Change needed | Section to update |
|---|---|
| New system tool required | `1.1` |
| New VS Code extension | `1.2` |
| Changes to client wizard | `4` (Phase B) |
| Changes to feature scaffold | `5` (Phase C) |
| New skill added | `7` (skill table) + `AGENTS.md` |
| New key file | `8` |
| New client or module | `9` (current clients list) |
| New npm script | `10` |

**Update the `Last updated` date at the top of this file when making any changes.**

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
