# DealerPlatform QA — Claude Code Instructions

@.github/copilot-instructions.md

## Slash Commands

Type `/` in Claude Code to see all available commands.

| Command | Purpose |
|---------|---------|
| `/developer-setup` | First-time environment setup for a new developer |
| `/functional-qa-test-generation` | Full pipeline: repo analysis → test execution |
| `/playwright-test-generation` | Generate Playwright Page Objects and spec files |
| `/engage-ads-test-coverage` | EngageAds-specific comprehensive test coverage |
| `/migration-qa-framework` | Legacy vs modern migration QA pipeline |
| `/repo-analysis` | Codebase discovery (fields, rules, endpoints, DB, security) |
| `/ui-analysis` | Live app Playwright UI analysis (selectors, journeys) |
| `/functional-test-catalog` | Business rule discovery + test catalog generation |
| `/gap-analysis` | Legacy vs modern gap analysis |
| `/migration-comparison` | Side-by-side comparison report of legacy vs modern |
| `/api-verification` | API test generation and validation |
| `/database-verification` | DB state verification SQL scripts |
| `/scaffold` | New module/feature setup |

## Skill Index

### New Developer Setup (run this first)
- `/developer-setup` — Step 0: Complete first-time environment setup. Covers tools, clone, npm install,
  .env files, credentials, auth sessions, smoke test verification, and dashboard check.
  **Run before any other skill.**

### Functional QA Test Generation Pipeline (new — no legacy/modern comparison)
- `/functional-qa-test-generation` — **Orchestrator**: full pipeline from repo analysis to test execution
- `/repo-analysis` — Step 1: Codebase discovery (fields, rules, endpoints, DB, security)
- `/ui-analysis` — Step 2: Live app Playwright analysis (UI structure, selectors, journeys)
- `/functional-test-catalog` — Steps 3–4: Business rule discovery + test catalog generation

### Migration QA Pipeline (legacy vs modern comparison)
- `/migration-qa-framework` — **Orchestrator**: Steps 2→4 for migration QA
- `/functional-unit-discovery` — Steps 1–2: Legacy + modern codebase discovery
- `/gap-analysis` — Step 2.5: Legacy vs modern gap analysis
- `/coverage-signoff` — Step 2.6: Gate before automation
- `/scaffold` — Step 0: New module/feature setup
- `/playwright-test-generation` — Step 3: Generate Playwright test assets

### Shared / Supporting Skills
- `/api-verification` — API test generation and validation
- `/database-verification` — DB state verification SQL scripts
- `/migration-comparison` — Migration comparison utilities
- `/engage-ads-test-coverage` — EngageAds-specific full coverage requirements

## Functional Unit Test Catalogs

- Support both **HTML** (rich interactive) and **Markdown** (simple) formats.
- All catalogs are viewable from QA Dashboard via `/docs/` route.
- Dashboard tracks implementation status per test tier (smoke, regression, e2e, functionalUnit).
