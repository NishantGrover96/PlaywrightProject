---
name: developer-setup
description: Complete first-time environment setup for a new developer joining the DealerPlatform QA project. Walks through prerequisites, repo clone, dependencies, environment files, credential setup, auth sessions, dashboard verification, and first test run. Run this skill before any other skill.
applyTo: '**'
---

# Developer Setup — Complete First-Time Environment Setup

## Purpose

Guide a brand-new developer from zero to a fully working local QA environment in one session.
Covers every step: tools → repo → config → credentials → auth → first test run → dashboard.

## When to Use

- User says "set me up", "first time setup", "onboard me", "I'm a new developer", "how do I get started"
- User has just cloned the repo and doesn't know what to do next
- User's environment is broken and needs a full reset

---

## Step 1 — Ask Clarifying Questions

Ask the user these questions **before doing anything**. All are required.

```
Q1. What is your operating system?
    Options: Windows (recommended) | macOS | Linux

Q2. Do you already have Node.js 20.x LTS installed?
    Options: Yes | No — I'll install it now

Q3. Which client are you setting up for?
    Options: demoportal | certainteed | samsung | (other — I'll specify)
    (determines which .env file and credential set you need)

Q4. Which environment will you test against first?
    Options: UAT (recommended for new devs) | Production | Testing | Dev

Q5. Do you have access to the source/application repo on your local machine?
    (e.g. D:\Leads\DemoPortalV2)
    Options: Yes — I have the path | No — I only have the QA repo
```

---

## Step 2 — Verify / Install Prerequisites

### 2.1 Node.js

Check if Node.js 20.x LTS is installed:

```powershell
node --version   # must be v20.x.x
npm --version    # must be 10.x or higher
```

If not installed: direct user to https://nodejs.org/en/download (LTS version).

### 2.2 VS Code Extensions

Run in VS Code terminal or paste into Extensions search (`Ctrl+Shift+X`):

| Extension | ID | Required |
|---|---|---|
| Playwright Test | `ms-playwright.playwright` | ✅ Yes |
| GitHub Copilot | `GitHub.copilot` | ✅ Yes |
| GitHub Copilot Chat | `GitHub.copilot-chat` | ✅ Yes |
| ESLint | `dbaeumer.vscode-eslint` | Recommended |

Install all at once from the terminal:

```powershell
code --install-extension ms-playwright.playwright
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension dbaeumer.vscode-eslint
```

### 2.3 PowerShell

Confirm version is 5.1 or higher (Windows default):

```powershell
$PSVersionTable.PSVersion
```

---

## Step 3 — Clone & Install Dependencies

```powershell
# Clone the QA repo (skip if already cloned)
git clone <repo-url> d:\Leads\PlayWright
cd d:\Leads\PlayWright

# Install all npm dependencies
npm install

# Install Playwright browser binaries
npx playwright install chromium
```

**Expected output:** No errors. `node_modules/` folder is created.

---

## Step 4 — Create Environment Files

Create `.env.{environment}` in the repo root. These files are **gitignored — never commit them**.

### Template (fill in real values from your team lead)

```env
# .env.uat  (copy to .env.production / .env.testing / .env.dev as needed)
BASE_URL=https://demoportaluat.channel-fusion.com
API_BASE_URL=https://demoportaluat.channel-fusion.com
TEST_USER_EMAIL=your-dealer@email.com
TEST_USER_PASSWORD=yourpassword
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=youradminpassword
```

For **production**, copy the file to `.env.production` and update the `BASE_URL` and credentials.

Confirm the files exist:

```powershell
Test-Path .env.uat        # should return True
Test-Path .env.production # should return True (if testing prod)
```

---

## Step 5 — Configure Encrypted Credentials (new-client setup)

If the client is **not yet configured** in `config/clients/{clientId}.json`, run the new-client wizard:

```powershell
.\scripts\new-client.ps1
```

This interactive script will:
1. Prompt for the client name, modules (coop / engage-ads / popshop / rebate / admin)
2. Collect dealer + admin email and password
3. **Encrypt the credentials automatically** — plaintext is never stored
4. Write `config/clients/{clientId}.json`
5. Create `docs/functional-catalogs/{clientId}/` folder structure
6. Create `dashboard/catalogs/{clientId}-manifest.json`

> If the client already exists in `config/clients/`, skip this step.

---

## Step 6 — Configure Local Repo Paths

Create `config/repos.local.json` — **gitignored, your machine only**.
Use `config/repos.json` as the template.

```powershell
Copy-Item config\repos.json config\repos.local.json
```

Then edit `config/repos.local.json` with your actual local paths:

```json
{
  "legacy": {
    "root": "D:\\Leads\\DemoPortalV2",
    "webFolder": "Presentation\\Web"
  }
}
```

If you don't have the source repo locally, set `"root": ""` and leave `webFolder` empty.
You can still run existing tests — only the analysis skills need the source path.

---

## Step 7 — Run Auth Setup (saves browser session)

This creates saved login sessions so tests don't need to log in every run.

```powershell
# Dealer session
npx playwright test tests/playwright/specs/auth.setup.ts --project=setup

# Admin session (optional — only needed if running admin tests)
npx playwright test tests/playwright/specs/auth.setup.admin.ts --project=setup-admin
```

**Expected output:** Session files created at:
- `tests/playwright/fixtures/.auth/user.json`
- `tests/playwright/fixtures/.auth/admin.json`

> **Re-run this step any time you see authentication errors during a test run.**

---

## Step 8 — Verify the Setup with Smoke Tests

Run the fastest available smoke test to confirm everything works end to end:

```powershell
# Run all smoke tests
npm run test:smoke

# Or run a single known-good feature
npx playwright test tests/playwright/specs/engage-ads/feature-view-package/ --project=chromium
```

**Expected output:** At least one test passes. If everything fails with a `net::ERR_` error, the `BASE_URL` in your `.env` file is wrong or the app is unreachable.

---

## Step 9 — Start the QA Dashboard

```powershell
npm run dashboard
```

Open **http://localhost:3333** in your browser.

### Verify the dashboard shows:
- [ ] Client dropdown lists at least one client (e.g. CertainTeed, DemoPortal, Samsung HVAC)
- [ ] Selecting a client populates the Module dropdown
- [ ] Module dropdown includes the modules configured for that client
- [ ] Command Preview updates when you change client / module / environment
- [ ] Catalog Coverage dropdown shows features (for DemoPortal)

If any item above is missing, run:

```powershell
# Restart the dashboard (stop with Ctrl+C first)
npm run dashboard
```

---

## Step 10 — Scaffold a New Module or Feature (optional)

Only run this if you are **adding a brand-new feature** that doesn't exist in the repo yet.

```powershell
.\scripts\new-module.ps1 `
  -Client   demoportal `
  -Module   coop `
  -Feature  submit-claim `
  -Label    "Submit Claim"
```

This creates:
- Playwright spec, Page Object, helpers, test-data stubs
- `docs/functional-catalogs/{client}/{module}/feature-{feature}/functional-units.html` — placeholder catalog page
- API spec and database script stubs

> If the feature already exists, skip this step — running it again will overwrite stubs.

---

## Step 11 — Next Step After Setup

Once your environment is working, choose your path:

| Goal | Skill to run |
|---|---|
| Full QA coverage for a new feature (no legacy comparison) | `functional-qa-test-generation` |
| Prove a migrated feature matches Legacy behaviour | `migration-qa-framework` |
| Generate a test catalog only (no automation yet) | `functional-test-catalog` |
| Generate Playwright tests from an existing approved catalog | `playwright-test-generation` |
| Add API-level tests | `api-verification` |
| Add DB verification scripts | `database-verification` |

Open Copilot Chat and type the skill name to begin.

---

## Troubleshooting

### "Cannot find module" on `npm install`

```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install
```

### Auth setup fails / login times out

- Confirm `BASE_URL`, `TEST_USER_EMAIL`, and `TEST_USER_PASSWORD` in your `.env` file are correct
- Check the app is accessible in a browser at the `BASE_URL`
- Verify the login selector in `playwright.config.ts` matches the current login page HTML

### Dashboard shows no modules / "All Modules" only

- Confirm the client config exists: `config/clients/{clientId}.json`
- Confirm `"modules": [...]` is populated in that JSON
- Restart the dashboard server

### Tests fail with `net::ERR_CONNECTION_REFUSED`

The `BASE_URL` environment variable isn't resolving. Run:

```powershell
# Check which .env file Playwright is loading
node -e "require('dotenv').config({ path: '.env.production' }); console.log(process.env.BASE_URL)"
```

---

## Checklist — Setup Complete When All Items Are Checked

```
[ ] node --version returns v20.x.x
[ ] npm install completed with no errors
[ ] npx playwright install chromium completed
[ ] .env.{environment} file exists with real credentials
[ ] config/repos.local.json exists
[ ] Auth setup ran — .auth/user.json exists
[ ] npm run test:smoke — at least one test passes
[ ] npm run dashboard — http://localhost:3333 loads with client list
[ ] Module dropdown populates on client select
```
