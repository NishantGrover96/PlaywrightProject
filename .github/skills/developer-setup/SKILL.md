---
name: developer-setup
description: Complete first-time environment setup for a new developer joining the DealerPlatform QA project. Walks through prerequisites, repo clone, dependencies, environment files, credential setup, auth sessions, dashboard verification, and first test run. Run this skill before any other skill.
applyTo: '**'
---

# Developer Setup — 9-Phase Self-Healing Orchestrator

## Purpose

Take a brand-new developer from zero to a verified, running local QA environment in **one session**,
with no manual intervention. Every phase validates its own output and self-heals common failures
before moving to the next phase.

## When to Use

- User says "set me up", "first time setup", "onboard me", "I'm a new developer", "how do I get started"
- User has just cloned the repo and doesn't know what to do next
- User's environment is broken and needs a full reset

---

## Phase 0 — Collect All Inputs Once

Ask ALL of the following questions before doing anything else.
Do not revisit these questions. Store answers as variables used throughout all phases.

```
Q1. What is the client ID you are onboarding? (e.g. acmecorp — lowercase, letters/hyphens only)

Q2. What is the client's display name? (e.g. "Acme Corporation")

Q3. Which environment are you testing? (dev / testing / uat / production)

Q4. What is the base URL for that environment? (e.g. https://acmecorp-uat.example.com)

Q5. Does a local source repo exist for this client? If yes, provide the local folder path.
    (Used for repo-analysis. Press Enter to skip if unknown.)

Q6. Which modules exist in this client? (comma-separated, e.g. coop,engage-ads,inventory)
    If you don't know yet, type "unknown" — we will discover them via repo-analysis.
```

Store answers as:
- `CLIENT_ID` — lowercase, letters/hyphens only
- `DISPLAY_NAME`
- `TARGET_ENV`
- `BASE_URL`
- `REPO_PATH` (may be empty)
- `MODULES` (list, may be ["unknown"])

---

## Phase 1 — Prerequisites

### 1.1 PowerShell Execution Policy

Check that scripts can run. Run in terminal:

```powershell
Get-ExecutionPolicy -Scope CurrentUser
```

If result is `Restricted` or `Undefined`, self-heal automatically:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
Write-Host "Execution policy set to RemoteSigned"
```

### 1.2 Node.js Version

```powershell
node --version
```

- Required: `v20.x` or higher.
- If missing or older: tell the user to install Node.js 20 LTS from https://nodejs.org and re-run this skill.

### 1.3 npm Install

```powershell
cd "d:\Leads\PlayWright"
npm install
```

- If install fails due to network/proxy errors, run: `npm install --prefer-offline`
- Verify: `node_modules` folder exists after install.

### 1.4 Playwright Browsers

```powershell
npx playwright install chromium
```

- Only chromium is required for smoke tests.
- If disk-space warning appears, confirm with the user before proceeding.

### Phase 1 Validation Gate

```powershell
$nodeVer = (node --version) -replace '^v',''
$major   = [int]($nodeVer.Split('.')[0])
if ($major -lt 20) { Write-Error "Node.js 20+ required. Found: v$nodeVer" }
if (-not (Test-Path "node_modules")) { Write-Error "npm install may have failed — node_modules missing" }
Write-Host "[Phase 1] Prerequisites OK"
```

---

## Phase 2 — Environment Files

Create `.env.{TARGET_ENV}` with the client's base URL.

```powershell
$envFile = ".env.$TARGET_ENV"
if (-not (Test-Path $envFile)) {
    Set-Content -Path $envFile -Encoding UTF8 -Value "BASE_URL=$BASE_URL"
    Write-Host "Created $envFile"
} else {
    Write-Host "$envFile already exists — not overwritten"
}
```

Also verify `.env.production` exists with `MASTER_KEY` set (needed for encryption):

```powershell
$prodEnvFile = ".env.production"
if (Test-Path $prodEnvFile) {
    $content = Get-Content $prodEnvFile -Raw
    if ($content -match 'MASTER_KEY=') {
        Write-Host "[Phase 2] MASTER_KEY found in .env.production"
    } else {
        Write-Warn "[Phase 2] MASTER_KEY missing from .env.production — passwords won't encrypt"
    }
} else {
    Write-Warn "[Phase 2] .env.production not found — credentials won't encrypt until created"
}
```

---

## Phase 3 — Client Configuration (new-client.ps1)

### 3.1 Check if Client Already Configured

```powershell
$configFile = "config/clients/$CLIENT_ID.json"
if (Test-Path $configFile) {
    Write-Host "[Phase 3] Client '$CLIENT_ID' already configured — skipping wizard"
} else {
    Write-Host "[Phase 3] Running new-client.ps1 for '$CLIENT_ID'..."
    powershell -File "scripts/new-client.ps1"
}
```

### 3.2 Validate All 5 Required Artifacts

After the wizard completes (or if config already existed), validate every artifact:

| Artifact | Expected Path | Action if Missing |
|---|---|---|
| Client config | `config/clients/{CLIENT_ID}.json` | Re-run `new-client.ps1` |
| User config | `config/users/{CLIENT_ID}/users.json` | Re-run `new-client.ps1` |
| Catalog manifest | `dashboard/catalogs/{CLIENT_ID}-manifest.json` | Re-run `new-client.ps1` |
| Repo registry | `config/repos.local.json` | Re-run `new-client.ps1` |
| Functional catalog dir | `docs/functional-catalogs/{CLIENT_ID}/` | `New-Item -ItemType Directory` |

```powershell
$artifacts = @(
    "config/clients/$CLIENT_ID.json",
    "config/users/$CLIENT_ID/users.json",
    "dashboard/catalogs/$CLIENT_ID-manifest.json",
    "config/repos.local.json",
    "docs/functional-catalogs/$CLIENT_ID"
)
$errors = 0
foreach ($a in $artifacts) {
    if (Test-Path $a) { Write-Host "  [OK] $a" }
    else { Write-Error "  [MISSING] $a"; $errors++ }
}
if ($errors -gt 0) {
    Write-Error "[Phase 3] $errors artifact(s) missing. Re-run scripts/new-client.ps1."
}
```

### 3.3 Validate clientId Field (no typo)

```powershell
$cfg = Get-Content "config/clients/$CLIENT_ID.json" -Raw | ConvertFrom-Json
if ($cfg.clientId -ne $CLIENT_ID) {
    Write-Error "[Phase 3] clientId mismatch: file has '$($cfg.clientId)', expected '$CLIENT_ID'"
    Write-Host "  Fix: edit config/clients/$CLIENT_ID.json and set `"clientId`": `"$CLIENT_ID`""
} else {
    Write-Host "[Phase 3] clientId field verified: $CLIENT_ID"
}
```

### 3.4 Validate users.json Credentials — Auth-Type Aware

Read the client's `authType` from `config/clients/{CLIENT_ID}.json` first, then apply the
correct validation rules. **Rules differ by auth type — never treat all clients the same.**

| authType | Fields required | Password | What a placeholder looks like |
|---|---|---|---|
| `email-password` | `email`, `password` | AES-256-GCM encrypted (`enc:…`) | `REPLACE_WITH_*_EMAIL` or `REPLACE_WITH_ENCRYPTED_PASSWORD` |
| `username-password` | `username`, `password` | AES-256-GCM encrypted (`enc:…`) | `REPLACE_WITH_*_USERNAME` or `REPLACE_WITH_ENCRYPTED_PASSWORD` |
| `username-only` | `username` **and** `email` (same value), `password = ""` | **Empty string** — no encryption needed | `REPLACE_WITH_*_USERNAME` or `REPLACE_WITH_*_EMAIL` |
| `forms` / `azure-ad` / `oauth` / `sso` | varies | varies | any `REPLACE_WITH_…` string |
| `none` | — | — | skip validation |

```powershell
$clientCfg = Get-Content "config/clients/$CLIENT_ID.json" -Raw | ConvertFrom-Json
$authType  = $clientCfg.authentication.authType ?? $clientCfg.authentication.type ?? $clientCfg.authType ?? "forms"

$usersJson = Get-Content "config/users/$CLIENT_ID/users.json" -Raw | ConvertFrom-Json
$placeholderPattern = '^REPLACE_WITH_'

$usersJson.PSObject.Properties | ForEach-Object {
    $roleName = $_.Name
    $roleVal  = $_.Value

    if ($authType -eq 'username-only') {
        # username-only: must have username (or email) set; password must be empty string
        $loginVal = $roleVal.username ?? $roleVal.email
        if (-not $loginVal -or $loginVal -match $placeholderPattern) {
            Write-Warn "Role '$roleName': 'username'/'email' is still a placeholder."
            Write-Warn "  Fix: edit config/users/$CLIENT_ID/users.json — set 'username' and 'email' to the actual login value (e.g. dealer code X1A0449)."
        } else {
            Write-Host "  [OK] $roleName username: $loginVal"
        }
        if ($roleVal.password -ne '') {
            Write-Warn "Role '$roleName': password must be empty string for username-only auth. Found: '$($roleVal.password)'"
            Write-Warn "  Fix: set ""password"": """" in config/users/$CLIENT_ID/users.json"
        }
    } else {
        # password-based auth: email/username must not be placeholder, password must be enc:...
        $loginField = if ($roleVal.email) { 'email' } else { 'username' }
        $loginVal   = $roleVal.$loginField
        if (-not $loginVal -or $loginVal -match $placeholderPattern) {
            Write-Warn "Role '$roleName': '$loginField' is still a placeholder."
            Write-Warn "  Fix: edit config/users/$CLIENT_ID/users.json and set the real $loginField."
        } else {
            Write-Host "  [OK] $roleName $loginField: $loginVal"
        }
        if ($roleVal.password -eq 'REPLACE_WITH_ENCRYPTED_PASSWORD' -or (-not $roleVal.password)) {
            Write-Warn "Role '$roleName': password is missing or placeholder."
            Write-Warn "  Fix: node utils/encrypt-credential.js ""your-password"" then paste the enc:... value into users.json"
        } elseif ($roleVal.password -notmatch '^enc:') {
            Write-Warn "Role '$roleName': password does not start with 'enc:' — it may be stored in plain text."
            Write-Warn "  Fix: node utils/encrypt-credential.js ""your-password"" and replace with the enc:... value."
        } else {
            Write-Host "  [OK] $roleName password: encrypted"
        }
    }
}
```

**Self-healing — if any placeholder is found:**
1. For `username-only`: ask the user for the login username/dealer code for each role, then update `users.json` directly — no encryption step needed.
2. For password-based: ask the user for the plain-text password, run `node utils/encrypt-credential.js "password"`, paste the `enc:…` output into `users.json`.
3. Re-run validation after every fix until all roles show `[OK]`.

---

## Phase 4 — Repository Analysis (if REPO_PATH provided)

If the user provided a local repo path in Phase 0, run the repo-analysis skill inline.

```
If REPO_PATH is not empty:
  → Read and follow: .github/skills/repo-analysis/SKILL.md
  → Pass in: clientId = CLIENT_ID, repoPath = REPO_PATH
  → Store discovered modules, endpoints, and field definitions for Phase 5

If REPO_PATH is empty:
  → Skip Phase 4
  → Use MODULE list from Phase 0 inputs
  → If MODULES = ["unknown"], prompt: "Provide at least one module name to proceed with catalog generation."
```

---

## Phase 5 — Functional Test Catalog Generation

Run the functional-test-catalog skill for each module.

```
For each MODULE in MODULES:
  → Read and follow: .github/skills/functional-test-catalog/SKILL.md
  → Pass in: clientId = CLIENT_ID, moduleId = MODULE, repoAnalysis = (Phase 4 output or empty)
  → Write generated tests into: docs/functional-catalogs/{CLIENT_ID}/{MODULE}/
  → Update dashboard/catalogs/{CLIENT_ID}-manifest.json with all feature entries
```

### Manifest Entry Template

Each feature entry in `dashboard/catalogs/{CLIENT_ID}-manifest.json` must follow this format:

```json
{
  "clientId": "{CLIENT_ID}",
  "moduleId": "{MODULE}",
  "featureId": "{CLIENT_ID}-{MODULE}-{feature-name}",
  "featureName": "{Human Readable Feature Name}",
  "tier": "smoke|regression|e2e",
  "status": "not-started",
  "file": "docs/functional-catalogs/{CLIENT_ID}/{MODULE}/functional-units.html"
}
```

If `MODULES = ["unknown"]`, skip Phase 5 and tell the user:
> "Provide module names so catalog generation can proceed. Re-run this skill with the module list."

---

## Phase 6 — Auth Setup

Playwright requires authenticated state files before tests can run.

### 6.1 Identify the Correct Setup Project Name

- Legacy clients (demoportal, certainteed, samsung): use `setup` / `setup-admin`
- New clients: automatically get `setup-{CLIENT_ID}` via auth-resolver.ts

Verify the project name exists in `playwright.config.ts`:

```powershell
$configContent = Get-Content playwright.config.ts -Raw
if ($configContent -match "setup-$CLIENT_ID") {
    Write-Host "[Phase 6] Playwright project 'setup-$CLIENT_ID' found"
} else {
    Write-Warn "[Phase 6] No setup project for '$CLIENT_ID' in playwright.config.ts"
    Write-Host "  This is auto-generated by auth-resolver.ts when CLIENT env var is set."
}
```

### 6.2 Run Auth Setup

```powershell
$env:CLIENT = $CLIENT_ID
npx playwright test --project="setup-$CLIENT_ID"
```

### 6.3 Verify Auth State Files Exist

```powershell
$authFiles = Get-ChildItem "tests/playwright/.auth/$CLIENT_ID" -Filter "*.json" -ErrorAction SilentlyContinue
if ($authFiles.Count -gt 0) {
    Write-Host "[Phase 6] Auth state files: $($authFiles.Count) found"
} else {
    Write-Warn "[Phase 6] No auth state files in tests/playwright/.auth/$CLIENT_ID"
    Write-Host "  Possible causes: wrong BASE_URL, wrong credentials in users.json, login page changed"
    Write-Host "  Debug: npx playwright test --project=setup-$CLIENT_ID --debug"
}
```

---

## Phase 7 — Dashboard Verification

### 7.1 Start Dashboard if Not Running

```powershell
$response = try { Invoke-WebRequest -Uri "http://localhost:3333/api/clients" -UseBasicParsing } catch { $null }
if (-not $response) {
    Write-Host "[Phase 7] Dashboard not running — starting..."
    Start-Process -FilePath "node" -ArgumentList "dashboard/server.js" -NoNewWindow
    Start-Sleep -Seconds 3
    $response = try { Invoke-WebRequest -Uri "http://localhost:3333/api/clients" -UseBasicParsing } catch { $null }
    if (-not $response) { Write-Error "[Phase 7] Dashboard failed to start. Check for port conflicts." }
}
```

### 7.2 Reload Cache After New Client

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3333/api/admin/reload"
Write-Host "[Phase 7] Dashboard cache reloaded"
```

### 7.3 Verify Client Appears in Dashboard

```powershell
$clients = Invoke-RestMethod -Uri "http://localhost:3333/api/clients" | ConvertTo-Json | ConvertFrom-Json
$found = $clients | Where-Object { $_.clientId -eq $CLIENT_ID }
if ($found) {
    Write-Host "[Phase 7] Client '$CLIENT_ID' visible in dashboard API"
} else {
    Write-Error "[Phase 7] Client '$CLIENT_ID' NOT found in /api/clients"
    Write-Host "  Check: config/clients/$CLIENT_ID.json has correct clientId field"
}
```

### 7.4 Verify Modules Appear

```powershell
$modules = Invoke-RestMethod -Uri "http://localhost:3333/api/modules?clientId=$CLIENT_ID"
Write-Host "[Phase 7] Modules returned: $($modules.modules.Count)"
if ($modules.modules.Count -eq 0) {
    Write-Warn "[Phase 7] No modules found. Check dashboard/catalogs/$CLIENT_ID-manifest.json is populated."
}
```

---

## Phase 8 — Smoke Test

Run the first available smoke test to confirm end-to-end connectivity.

```powershell
$env:CLIENT = $CLIENT_ID
npx playwright test --project="chromium-$CLIENT_ID" --grep "@smoke" --reporter=list
```

Expected outcome: at least 1 test passes.

If no `@smoke` tests exist yet:
> "No smoke tests found for '$CLIENT_ID'. This is expected for a brand-new client.
>  Run the playwright-test-generation skill to create the first tests."

If tests fail due to auth:
> "Auth state may be expired. Re-run Phase 6 (auth setup) and try again."

---

## Phase 9 — Final Checklist

Print a final status summary:

```
[ ] Phase 1 — Prerequisites: Node 20+, npm install, Playwright browsers
[ ] Phase 2 — .env.{TARGET_ENV} created with BASE_URL
[ ] Phase 3 — config/clients/{CLIENT_ID}.json with correct clientId field
[ ] Phase 3 — config/users/{CLIENT_ID}/users.json validated for authType
             email-password / username-password: email/username set, password is enc:...
             username-only: username AND email set to real login value, password = ""
[ ] Phase 3 — dashboard/catalogs/{CLIENT_ID}-manifest.json exists
[ ] Phase 4 — Repo analysis complete (or skipped — no repo path)
[ ] Phase 5 — Functional catalog generated (or skipped — no modules known)
[ ] Phase 6 — Auth state files present in tests/playwright/.auth/{CLIENT_ID}/
[ ] Phase 7 — Dashboard running, client visible, modules loaded
[ ] Phase 8 — Smoke test passes (or skipped — no tests yet)
```

Mark each item [OK] / [WARN] / [FAIL] based on verification results.

---

## Self-Healing Rules

| Symptom | Root Cause | Auto-Fix |
|---|---|---------|
| `cannot be loaded because running scripts is disabled` | PowerShell execution policy | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `MASTER_KEY not set` | Missing environment variable | Prompt user to generate + save to `.env.production` |
| Dashboard shows wrong client data | Duplicate featureId key in catalog cache | `POST /api/admin/reload` — fixed in catalog-service.js |
| Client not in dashboard after wizard | `clientId` field typo or casing mismatch | Verify `clientId` field in `config/clients/{id}.json` |
| Auth state file missing | Setup project not run | `npx playwright test --project=setup-{CLIENT_ID}` |
| `enc:` prefix missing in users.json | Encryption skipped (MASTER_KEY absent) | Set MASTER_KEY, re-run `node utils/encrypt-credential.js` |
| users.json has `REPLACE_WITH_*_EMAIL` or `REPLACE_WITH_*_USERNAME` | Client created before fix, or wizard skipped credential entry | Fill in the real value; for `username-only` set both `username` and `email` fields to the dealer code — no encryption needed |
| users.json password is `"REPLACE_WITH_ENCRYPTED_PASSWORD"` for `username-only` client | authType mismatch | Set `"password": ""` (empty string) — `username-only` never uses a password |
| Catalog entries showing for wrong client | Duplicate plain featureId key (old bug) | Already fixed in catalog-service.js |
| `npm install` fails offline | No network / proxy | `npm install --prefer-offline` |
| No modules in dashboard | Catalog manifest is empty `{}` | Run functional-test-catalog skill, then `POST /api/admin/reload` |

---

## Execution Order

```
Phase 0  →  Collect all inputs ONCE
Phase 1  →  Prerequisites (Node, npm, Playwright)
Phase 2  →  .env files
Phase 3  →  new-client.ps1 + artifact validation + clientId check + credential check
Phase 4  →  Repo analysis (conditional: only if REPO_PATH provided)
Phase 5  →  Functional test catalog (conditional: only if modules known)
Phase 6  →  Auth setup (Playwright setup project)
Phase 7  →  Dashboard start + cache reload + API verification
Phase 8  →  Smoke test
Phase 9  →  Final checklist
```

Each phase must fully succeed (or be deliberately skipped) before the next phase begins.
On failure, apply self-healing rule, retry once, then report the failure clearly without proceeding.

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
