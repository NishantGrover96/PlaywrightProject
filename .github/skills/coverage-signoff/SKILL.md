# Coverage Sign-off — Step 2.6: Gate Before Automation

## Purpose

Review the Gap Analysis results and issue a formal sign-off decision.
This is the **hard gate** — Step 3 (Playwright generation) MUST NOT run until
this skill returns `Ready for Automation`.

## When to Use

- After `/gap-analysis` is complete
- User says "sign off coverage for...", "review readiness for..."
- Always the last step before `/playwright-test-generation`

## Inputs

- **Gap Analysis**: `docs/functional-catalogs/{module}/feature-{feature}/gap-analysis.md`
- **Coverage Matrix**: `docs/functional-catalogs/{module}/feature-{feature}/coverage-matrix.md`

---

## Decision Rules

### BLOCKED — Stop immediately, do not proceed to Step 3

Conditions (ANY of):
- ≥ 1 Critical gap exists
- Functional Coverage < 80%
- Any security FU is Missing
- Core workflow transition is Missing (claim cannot be submitted/saved)

### NEEDS REMEDIATION — Fix gaps before proceeding to Step 3

Conditions (ANY of, no Critical):
- ≥ 1 High gap exists
- Functional Coverage 80%–89%
- Any validation rule is Missing
- Any DB persistence operation is Missing

### READY FOR AUTOMATION — Proceed to Step 3

Conditions (ALL of):
- Zero Critical gaps
- Zero High gaps (or all High gaps have documented workarounds approved)
- Functional Coverage ≥ 90%
- Validation Coverage ≥ 85%
- Workflow Coverage ≥ 95%
- Database Coverage ≥ 85%
- Security Coverage = 100%

---

## Sign-off Report Format

```markdown
# {Module} {Feature} — Coverage Sign-off

## Decision: READY FOR AUTOMATION | NEEDS REMEDIATION | BLOCKED

## Coverage Scorecard
| Dimension | Coverage % | Threshold | Status |
|---|---|---|---|
| Functional | NN% | ≥ 90% | ✅ PASS / ❌ FAIL |
| Validation | NN% | ≥ 85% | ✅ PASS / ❌ FAIL |
| Workflow | NN% | ≥ 95% | ✅ PASS / ❌ FAIL |
| Database | NN% | ≥ 85% | ✅ PASS / ❌ FAIL |
| Security | 100% | = 100% | ✅ PASS / ❌ FAIL |

## Gap Summary
| Level | Count | Decision Impact |
|---|---|---|
| Critical | N | Blocks automation |
| High | N | Requires remediation |
| Medium | N | Warn in tests |
| Low | N | Document only |

## Blocking Items (if any)
List each Critical or High gap that is preventing sign-off.
For each: FU ID, description, what must be fixed/implemented in Modern.

## Approved Exceptions (if any)
High or Medium gaps that are documented and accepted.
Each exception must be logged in the relevant test as:
  test.fixme('COOP-FU-NNN gap — {reason}')

## Automation Scope
What IS included in Step 3 automation:
- Smoke suite: N tests covering N FUs
- Regression suite: N tests covering N FUs
- E2E suite: N flows

What is EXCLUDED from automation (pending remediation):
- List of FU IDs and reason

## Next Steps
If READY:     Proceed to /playwright-test-generation
If REMEDIATE: List of tickets/tasks needed, re-run /gap-analysis after fixes
If BLOCKED:   Critical issues that must be resolved in Modern before any QA work
```

## Outputs

```
docs/functional-catalogs/{module}/feature-{feature}/signoff.md
reports/readiness/{module}/feature-{feature}/readiness.md
```

---

## GATE ENFORCEMENT

After generating the sign-off report, the final line of the response MUST be one of:

```
✅ GATE PASSED — Proceed to Step 3: /playwright-test-generation
⚠️  GATE: NEEDS REMEDIATION — Fix N High gaps before Step 3
🚫 GATE BLOCKED — N Critical gaps. Step 3 is not permitted.
```

This line is read by the orchestrator (`/migration-qa-framework`) to decide
whether to invoke `/playwright-test-generation`.
