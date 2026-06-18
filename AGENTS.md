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
- `.github/skills/api-verification/SKILL.md`
- `.github/skills/coverage-signoff/SKILL.md`
- `.github/skills/database-verification/SKILL.md`
- `.github/skills/functional-unit-discovery/SKILL.md`
- `.github/skills/gap-analysis/SKILL.md`
- `.github/skills/migration-comparison/SKILL.md`
- `.github/skills/migration-qa-framework/SKILL.md`
- `.github/skills/playwright-test-generation/SKILL.md`
- `.github/skills/scaffold/SKILL.md`

## Baseline Rules
- Make minimal, focused changes.
- Do not modify unrelated files.
- Avoid hardcoded secrets; use environment variables.
- Validate with the smallest relevant test/lint command first.
