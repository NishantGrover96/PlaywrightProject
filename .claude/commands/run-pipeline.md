---
description: >
  One-command orchestrator for the full feature pipeline: repo analysis, scaffold, functional
  test catalog, Playwright test generation, auth setup, dashboard verification, and smoke tests
  — chained end-to-end for a single client/module/feature instead of run as separate slash
  commands. Steps 2/5/6/7 execute directly via the shell; Steps 1/3/4 are performed inline using
  the repo-analysis, functional-test-catalog, and playwright-test-generation skills.
  Keywords: full pipeline, run pipeline, onboard feature, end to end, one command.
argument-hint: client={client} module={module} feature={feature} label="{Label}" [repoPath={path}]
---

# Full Feature Pipeline — Steps 1–7 in One Command

Parse `$ARGUMENTS` for `client`, `module`, `feature`, `label` (all required), and optional
`repoPath` (default: read `repo.localPath` from `config/clients/{client}.json`).

If `client`, `module`, `feature`, or `label` is missing, stop and ask for it — do not guess.

Run the steps below **in order**. Each step's output feeds the next; do not skip ahead. Stop
and surface the problem to the user if a step fails or a required file is missing, rather than
continuing with partial data.

---

## Step 1 — Repo Analysis

@.github/skills/repo-analysis/SKILL.md

Analyze the source at `repoPath` for `module`/`feature` per the algorithm above and write
`docs/module-analysis/{client}/{module}/feature-{feature}/repo-analysis.md`.

---

## Step 2 — Scaffold Feature Files

**First, check what already exists — do not overwrite blindly.**

1. Module reuse needs no prompt. Check `config/clients/{client}.json` -> `modules[]`; if
   `{module}` is already there, that's normal — continue silently.
2. Feature collision DOES need a prompt. Check whether
   `docs/functional-catalogs/{client}/{module}/feature-{feature}/` (or
   `tests/playwright/specs/{client}/{module}/feature-{feature}/{feature}.spec.ts`) already exists.
   - **If it does NOT exist** — proceed to the scaffold command below as normal.
   - **If it DOES exist** — stop and ask the user (do not guess or default):
     - **Add new test cases** — leave existing spec/page/helpers files untouched; skip the
       scaffold command entirely; run Step 3 in append/prepend mode (new cases added, existing
       catalog rows preserved) and Step 4 in append mode (regenerate spec with new cases folded
       in, don't discard existing implemented tests).
     - **Regenerate everything** — an intentional full rebuild: still skip re-running
       `new-module.ps1` (it would stomp any hand-written locators/logic with the raw template
       again); instead let Step 3 replace the catalog outright and Step 4 rewrite the spec/page
       object/helpers from scratch.
     - **Abort** — stop here; tell the user to re-run with a different `feature` value, or to
       explicitly confirm overwrite if that's really what they want.
   - Re-running `new-module.ps1` on an existing feature (discarding all hand-written test code)
     is only appropriate if the user explicitly asks to force a raw re-scaffold. Confirm first.

If this is a genuinely new feature, run directly (no confirmation needed — local file creation
only, nothing exists yet to clobber):

```powershell
.\scripts\new-module.ps1 -Client {client} -Module {module} -Feature {feature} -Label "{label}"
```

This creates the spec/page-object/helpers/test-data/api-spec/database-script stubs and a
placeholder functional-catalog HTML page under client-scoped paths. If it fails, report the
PowerShell error and stop — Steps 3–4 depend on these files existing.

---

## Step 3 — Functional Test Catalog

@.github/skills/functional-test-catalog/SKILL.md

Using the Step 1 repo-analysis report (and a UI analysis report if one already exists at
`docs/module-analysis/{client}/{module}/feature-{feature}/ui-analysis.md` — otherwise proceed
from repo-analysis alone and note the gap), produce the test catalog under
`docs/functional-catalogs/{client}/{module}/feature-{feature}/`, replacing the Step 2 placeholder.

**QA gate: stop here and show the user the generated catalog for review/approval before
continuing to Step 4.** Do not proceed automatically.

---

## Step 4 — Playwright Test Generation

@.github/skills/playwright-test-generation/SKILL.md

Once the user approves the Step 3 catalog, implement the real spec file, page object, helpers,
API spec, and database verification script — replacing the Step 2 scaffolds — following the
locator preference order, Page Object Model, and assertion rules in
`.github/copilot-instructions.md`. Include the required Locator Validation Report in your output.

---

## Step 5 — Auth Setup

This logs into the client's real environment and writes a storage-state file. **Confirm with
the user before running** (which environment, and that credentials in
`config/users/{client}/users.json` are filled in — no `REPLACE_WITH_` placeholders). Then run:

```powershell
$env:TEST_ENV='uat'; npx playwright test --project=setup-{client}
```

If it fails on a credential or selector error, report it — do not retry blindly.

---

## Step 6 — Verify on Dashboard

Run in the background: `npm run dashboard`. Tell the user to open http://localhost:3333, select
client `{client}`, and confirm the feature/catalog appear correctly.

---

## Step 7 — Run Smoke Tests

This runs real tests against the client's UAT app. **Confirm with the user before running.** Then:

```powershell
$env:TEST_ENV='uat'; npx playwright test --project=chromium-{client} --grep @smoke
```

Report pass/fail. `fixme`/`skip` results are expected for not-yet-implemented cases; timeouts,
login redirects, or 401s indicate a real problem to fix before handoff.

---

## Final Summary

After all steps, print a short status table: which steps completed, which were skipped/blocked,
and what remains (e.g. "Step 5 blocked — credentials still have REPLACE_WITH_ placeholders").
