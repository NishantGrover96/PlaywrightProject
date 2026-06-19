---
name: migration-comparison
description: Run test suites against both legacy and modern platforms and produce a side-by-side comparison report of equivalent, differing, and missing behaviors.
---

# Migration Comparison Skill

## Purpose

Run the same test suite against both Legacy and Modern platforms and produce a side-by-side comparison report: which behaviors are equivalent, which differ, and what is missing.

## When to Use

- After Prompt 3 tests are implemented and both platforms are accessible
- User says "compare legacy and modern for…", "run migration comparison for…"

## Inputs

- **Module**: e.g. `coop`
- **Feature**: e.g. `submit-claim`
- **Legacy BASE_URL**: Legacy platform URL
- **Modern BASE_URL**: Modern platform URL

## Steps

```bash
# Run against legacy
cross-env BASE_ENV=legacy npm run test:coop:submit-claim

# Run against modern
cross-env BASE_ENV=modern npm run test:coop:submit-claim
```

Then compare `reports/legacy/results.json` vs `reports/modern/results.json`.

## Comparison Dimensions

| Dimension | What to check |
|---|---|
| UI | Same field labels, same page structure, same conditional behavior |
| Validation | Same required fields, same error messages (exact or documented equivalent) |
| Workflow | Same status transitions, same temp→final ID pattern |
| Data Persistence | Same DB records created (use database verification SQL scripts) |
| Business Rules | Same eligibility, calculations, limits enforced |
| Security | Same auth requirements, same data scoping |

## Report Output

```
reports/comparison/{module}/feature-{feature}/comparison.md
```

### Report Structure

```markdown
## Executive Summary
- Functional Units compared: N
- Equivalent: N (NN%)
- Discrepancies: N
- Legacy-only gaps: N
- Modern-only gaps: N

## Discrepancies
| FU-ID | Behavior | Legacy | Modern | Impact | Action |
|---|---|---|---|---|---|
| COOP-FU-012 | Fund balance error message | "Insufficient funds" | "Balance exceeded" | Low | Document |
```

## Impact Classification

| Level | Meaning |
|---|---|
| Blocker | Test passes on legacy, fails on modern — functional gap |
| High | Different behavior, user-facing impact |
| Medium | Different message text, same semantics |
| Low | Cosmetic, no functional impact |
