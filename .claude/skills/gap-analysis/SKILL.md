# Gap Analysis — Step 2.5: Legacy vs Modern

## Purpose

Compare every Functional Unit from the Legacy catalog against the Modern implementation.
Produce a Functional Coverage Matrix that classifies every gap as Critical / High / Medium / Low.
This is the mandatory gate before any Playwright test generation.

## When to Use

- After `/functional-unit-discovery` is complete
- User says "run gap analysis for...", "compare legacy vs modern for..."
- Always runs BEFORE `/coverage-signoff`

## Inputs

- **Functional Unit Catalog**: `docs/functional-catalogs/{module}/feature-{feature}/functional-units.md`
- **Migration Mapping**: `docs/migration-reports/{module}/feature-{feature}/mapping.md`

### Resolving Repo Paths — Auto-Discovery

Read workspace roots from `config/repos.local.json`.
All dependency paths are auto-derived from the workspace root — same algorithm
as `/functional-unit-discovery`. Do NOT ask the user for individual paths.

For each gap dimension, read only the files relevant to that dimension:
- UI / Validation → feature `.cshtml` + `.resx` resources
- Business Rules → `Libraries\BusinessLogic\Services\`
- Database → `Libraries\**\*Accessor*.cs` + SP names
- Security → auth attributes in `.cshtml.cs` + JS encryption patterns
- Modern equivalent → same pattern applied to `modern.root`

---

## Analysis Dimensions

### 1. Functional Units
For every FU in the catalog:
- Does the Modern implementation cover this behavior?
- Is coverage: `Full` | `Partial` | `Missing` | `Different`
- If Different — document the exact behavioral difference

### 2. UI Elements
Compare legacy `.cshtml` form fields against modern UI:
- Field labels (exact text matters for validation messages)
- Required vs optional designation
- Field order and grouping
- Conditional visibility rules
- Read-only state handling
- Wizard step structure (if multi-step)

### 3. Validation Rules
Compare every validation in legacy (client-side JS + server-side model + resx messages):
- Required field rules
- Format rules (date, currency, length, regex)
- Business rule validations (amount limits, date ranges)
- Error message text (exact match or documented equivalent)
- Server-side vs client-side parity

### 4. Business Rules
Compare logic in legacy services/DLLs against modern services/APIs:
- Eligibility checks
- Calculation formulas
- Limit enforcement (fund balance, per-claim cap)
- Date/period validation logic
- Program/enrollment checks

### 5. Workflow Transitions
Map every status transition:
- All statuses present in modern (no missing states)
- Transition triggers identical
- Email/notification on same transitions
- Resubmit paths covered

### 6. Database Operations
For each DB write in legacy:
- Modern creates equivalent record (same tables or documented equivalents)
- Header record: same key fields populated
- Detail records: same line item structure
- Attachment record: file reference stored
- Workflow record: step tracking
- Audit record: action + old/new status + user + timestamp

### 7. Stored Procedures
For each SP called in legacy:
- Modern equivalent identified (same SP refactored, or replaced by API logic)
- Same input/output contract
- Same business logic result
- Documented if SP was intentionally removed/replaced

### 8. Security Rules
- Unauthenticated access protection equivalent
- Role enforcement (dealer / admin / CSR) identical
- Data scoping (no cross-dealer access) enforced in modern
- Request parameter security (encryption, signed IDs)

---

## Gap Classification

| Level | Definition |
|---|---|
| **Critical** | Feature cannot function without this — blocks go-live |
| **High** | Core user workflow affected — must fix before automation |
| **Medium** | Edge case or secondary behavior — should fix, warn in tests |
| **Low** | Cosmetic, message wording, minor UI difference — document only |

---

## Output Format

### Functional Coverage Matrix (`coverage-matrix.md`)

```markdown
## Functional Coverage Matrix

| FU ID | Title | Category | Legacy | Modern | Status | Gap Level |
|---|---|---|---|---|---|---|
| COOP-FU-001 | Page load | UI | SubmitClaim.cshtml | GET /api/coop/submit | Full | — |
| COOP-FU-012 | Fund balance check | BusinessLogic | BudgetService | BudgetService.cs | Partial | High |

## Coverage Summary
| Category | Total FUs | Full | Partial | Missing | Coverage % |
|---|---|---|---|---|---|
| UI | 12 | 11 | 1 | 0 | 91.7% |
| DataEntry | 18 | 16 | 2 | 0 | 88.9% |
| BusinessLogic | 14 | 12 | 1 | 1 | 85.7% |
| Workflow | 8 | 7 | 0 | 1 | 87.5% |
| DataPersistence | 10 | 9 | 1 | 0 | 90.0% |
| Security | 6 | 6 | 0 | 0 | 100.0% |
| **TOTAL** | **68** | **61** | **5** | **2** | **89.7%** |
```

### Gap Analysis Report (`gap-analysis.md`)

```markdown
## Missing Functional Units
| FU ID | Title | Risk | Impact | Recommendation |

## Missing Validations
| Field | Legacy Rule | Modern Status | Gap Level |

## Missing Workflow Steps
| Step | Legacy Trigger | Modern Status | Gap Level |

## Missing Database Operations
| Operation | Legacy Table/SP | Modern Status | Gap Level |

## Missing Security Rules
| Rule | Legacy Enforcement | Modern Status | Gap Level |

## Metrics
- Functional Coverage: NN%
- Validation Coverage: NN%
- Workflow Coverage: NN%
- Database Coverage: NN%
- Security Coverage: NN%
- Critical gaps: N
- High gaps: N
- Medium gaps: N
- Low gaps: N
```

## Outputs

```
docs/functional-catalogs/{module}/feature-{feature}/gap-analysis.md
docs/functional-catalogs/{module}/feature-{feature}/coverage-matrix.md
```

## Passing Criteria (consumed by Step 2.6)

Gap analysis is ready for sign-off review when:
- All 8 dimensions analyzed
- Every FU in catalog has a coverage status
- Every gap has a classification level
- Coverage percentages calculated
- No unclassified items remain
