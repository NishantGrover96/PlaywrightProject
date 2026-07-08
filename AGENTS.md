# Agent Instructions

This repository contains reusable skill documents under `.github/skills/`.

## How To Use Skills
- Treat each file in `.github/skills/` as an instruction module.
- When a request matches a skill topic, read that skill file first, then execute the task.
- Prefer existing repo conventions over introducing new patterns.

## Functional Unit Test Catalogs
- Support both **HTML** (rich interactive) and **Markdown** (simple) formats.
- HTML catalogs follow the pattern in legacy test docs (e.g., `CoopModule_SubmitClaim_TestCases_DemoClient.html`).
- All catalogs are viewable from QA Dashboard via `/docs/` route.
- Dashboard tracks implementation status per test tier (smoke, regression, e2e, functionalUnit).

## Skill Index

### New Developer Setup (run this first)
- `.github/skills/developer-setup/SKILL.md` — **Step 0**: Complete first-time environment setup for a new developer. Covers tools, clone, npm install, .env files, credentials, auth sessions, smoke test verification, and dashboard check. **Run before any other skill.**

### Functional QA Test Generation Pipeline (new — no legacy/modern comparison)
- `.github/skills/functional-qa-test-generation/SKILL.md` — **Orchestrator**: full pipeline from repo analysis to test execution
- `.github/skills/repo-analysis/SKILL.md` — Step 1: Codebase discovery (fields, rules, endpoints, DB, security)
- `.github/skills/ui-analysis/SKILL.md` — Step 2: Live app Playwright analysis (UI structure, selectors, journeys)
- `.github/skills/functional-test-catalog/SKILL.md` — Steps 3–4: Business rule discovery + test catalog generation

### Migration QA Pipeline (legacy vs modern comparison)
- `.github/skills/migration-qa-framework/SKILL.md` — **Orchestrator**: Steps 2→4 for migration QA
- `.github/skills/functional-unit-discovery/SKILL.md` — Steps 1–2: Legacy + modern codebase discovery
- `.github/skills/gap-analysis/SKILL.md` — Step 2.5: Legacy vs modern gap analysis
- `.github/skills/coverage-signoff/SKILL.md` — Step 2.6: Gate before automation
- `.github/skills/scaffold/SKILL.md` — Step 0: New module/feature setup
- `.github/skills/playwright-test-generation/SKILL.md` — Step 3: Generate Playwright test assets

### Shared / Supporting Skills
- `.github/skills/api-verification/SKILL.md` — API test generation and validation
- `.github/skills/database-verification/SKILL.md` — DB state verification SQL scripts
- `.github/skills/migration-comparison/SKILL.md` — Migration comparison utilities
- `.github/skills/engage-ads-test-coverage/SKILL.md` — **EngageAds-specific**: full coverage requirements (positive, negative, boundary, edge case, role-based, dynamic UI) for all EngageAds feature specs

## Baseline Rules
- Make minimal, focused changes.
- Do not modify unrelated files.
- Avoid hardcoded secrets; use environment variables.
- Validate with the smallest relevant test/lint command first.
