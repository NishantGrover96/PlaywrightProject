# Functional Unit Discovery — Steps 1 & 2

## Purpose

**Step 1 — Repository Discovery**: Read both Legacy and Modern codebases for a given
module/feature. Map every file, endpoint, service, stored procedure, and UI component
involved. Produce a structured discovery report.

**Step 2 — Functional Unit Discovery**: From the discovery, extract every discrete,
independently testable behavior. Produce a Functional Unit Catalog and Migration Mapping.

## When to Use

- Running Steps 1 and 2 of the migration QA pipeline
- User says "analyze [module] [feature]", "discover functional units for..."
- Always run before `/gap-analysis`

## Inputs

- **Module**: e.g. `coop`
- **Feature**: e.g. `submit-claim`
- **Mode**: `discovery` (Step 1 only) | `catalog` (Step 2 only) | `both` (default)

### Resolving Repo Paths — Auto-Discovery

Read workspace roots from `config/repos.local.json`.
Only two values are required from the user:
- `legacy.root` — workspace root
- `legacy.modules.{module}.features.{feature}.featurePath` — the exact feature folder

**Everything else is auto-discovered** by following references in the source code.
Do NOT ask the user for individual dependency paths. Derive them.

#### Auto-Discovery Algorithm

```
STEP A — Primary read (always)
  Read all files in featurePath:
    *.cshtml      → form fields, UI elements, partial view references
    *.cshtml.cs   → injected service interfaces (IClaimService, IBudgetService, etc.)
                    bound properties, handler methods, validation attributes

STEP B — Service / Business Logic (when FU category = BusinessLogic or Workflow)
  From .cshtml.cs: extract injected interface names (e.g. IClaimService)
  Search: {legacyRoot}\Libraries\BusinessLogic\Services\**\*.cs
    → find implementations of those interfaces
    → read method signatures and logic

STEP C — Data Models / Entities (when FU category = DataPersistence)
  From service files: extract entity/model class names used
  Search: {legacyRoot}\Libraries\CommonEntity\**\*.cs
    → find those model/entity files
    → read property names and data types for DB field mapping

STEP D — Stored Procedures / Database (when FU category = DataPersistence)
  From service/accessor files: extract accessor class calls and SP names
  Search: {legacyRoot}\Libraries\**\*Accessor*.cs  OR  *DAL*.cs
    → find SP names, table names, and query parameters

STEP E — Validation Messages (when FU category = DataEntry or Validation)
  Derive resource path from workspace structure:
    {legacyRoot}\RAL\Resources\{ModuleLabel}\ViewResource.*.resx
    (ModuleLabel = Title-cased module, e.g. Coop, PopShop)
  Read .resx files → extract exact validation message strings
  These are used verbatim in test assertions

STEP F — Client-Side Behavior (when FU category = UI or DataEntry)
  Derive script path:
    {legacyRoot}\{webFolder}\wwwroot\WebScripts\{moduleFolder}\js*.js
  Read matching JS files → AJAX calls, client validation, encrypted params

STEP G — Existing Test Patterns (when generating FUs for Playwright)
  Derive test path:
    {legacyRoot}\tests\playwright\{module}\
  Read existing page objects and helpers → reuse proven selectors

STEP H — Modern equivalent (when mode=both and modern workspace exists)
  From modern.root + modern.webFolder:
    Controllers → {modernRoot}\{modernWebFolder}\**\*Controller.cs
    Services    → {modernRoot}\src\Services\{module}\**\*.cs
    Validators  → {modernRoot}\src\Validators\{module}\**\*.cs
    Repository  → {modernRoot}\src\Data\**\*Repository.cs
  Search for classes/endpoints matching each FU discovered in legacy
```

#### Path Derivation Rules (no manual input needed)

| Dependency | Derived path |
|---|---|
| Services | `{root}\Libraries\BusinessLogic\Services\` |
| Entities | `{root}\Libraries\CommonEntity\` |
| Accessors/DAL | `{root}\Libraries\**\*Accessor*.cs` |
| Resources | `{root}\RAL\Resources\{ModuleTitle}\ViewResource.*.resx` |
| JS scripts | `{root}\{webFolder}\wwwroot\WebScripts\{moduleFolder}\js*.js` |
| Existing tests | `{root}\tests\playwright\{module}\` |
| Modern API | `{modernRoot}\{modernWebFolder}\**\*Controller.cs` |
| Modern services | `{modernRoot}\src\Services\{module}\` |
| Modern validators | `{modernRoot}\src\Validators\{module}\` |

Only stop and ask the user if a derived path doesn't exist on disk.

---

## STEP 1 — Repository Discovery

### What to Read in the Legacy Repo

| Layer | File types | What to extract |
|---|---|---|
| UI | `.cshtml` | Form fields, labels, conditional visibility, partial views |
| Page model | `.cshtml.cs` | Handlers (`OnGet`, `OnPost`), bound properties, service calls |
| Client-side | `js*.js` in `wwwroot` | AJAX calls, validation, UI behaviors, encrypted params |
| Resources | `.resx` files | Validation messages, error text (exact strings) |
| Services | `*Service.cs`, `I*Service.cs` | Business logic method signatures |
| Entities | `CommonEntity/**` | Data models, DTOs, enums |
| DB layer | `*Accessor.cs`, stored proc names | DB table names, SP names called |

### What to Read in the Modern Repo

| Layer | File types | What to extract |
|---|---|---|
| API | `*Controller.cs` | Endpoints, HTTP methods, route paths, auth attributes |
| Services | `*Service.cs` | Business logic, validation logic |
| Validators | `*Validator.cs` | Field rules, error messages |
| DTOs | `*Request.cs`, `*Response.cs` | Required fields, data types |
| DB | Migrations, `*Repository.cs` | Tables, stored procs, queries |
| Auth | `[Authorize]`, policy names | Role-based access rules |

### Discovery Report Format

```markdown
# {Module} {Feature} — Discovery Report

## Legacy Source Files
| File | Purpose |
|---|---|
| path/to/file.cshtml | Submit Claim form UI |

## Modern Source Files
| File | Purpose |
|---|---|

## UI Components (Legacy)
List every form field, button, dropdown, file input, conditional element

## API Endpoints (Modern)
| Method | Route | Auth | Purpose |
|---|---|---|---|

## Services
| Legacy | Modern Equivalent |
|---|---|

## Stored Procedures
| SP Name | Called from | Purpose |

## Data Models
| Entity | Legacy | Modern |
|---|---|---|

## Known Gaps (preliminary)
Items visible in legacy with no obvious modern counterpart
```

### Output
`docs/module-analysis/{module}/feature-{feature}/discovery.md`

---

## STEP 2 — Functional Unit Catalog

### Functional Unit Format

```
{MODULE}-FU-{NNN}  {Title}
Category: UI | DataEntry | BusinessLogic | Workflow | DataPersistence | Security
Risk: Low | Medium | High | Critical
Legacy: file path + method/handler
Modern: endpoint or service method
Status: Implemented | Partial | Missing
```

### Discovery Checklist — extract a FU for every item

**UI Behaviors**
- [ ] Page load and initialisation (auth redirect, data pre-load)
- [ ] Form field rendering and defaults
- [ ] Dropdown/select population (from API or DB)
- [ ] Conditional field show/hide rules
- [ ] Multi-step wizard navigation (if applicable)
- [ ] Read-only vs editable state

**Data Entry**
- [ ] Required field validation — one FU per required field
- [ ] Field format validation (date format, currency, length, regex)
- [ ] File upload — type restriction, size limit, count limit
- [ ] Lookup / autocomplete / search
- [ ] Auto-population from related data

**Business Logic**
- [ ] Eligibility checks (program enrollment, dealer status)
- [ ] Balance/limit calculations (fund balance, per-claim max)
- [ ] Date range validation (fiscal year, program period)
- [ ] Duplicate detection
- [ ] Amount validation rules

**Workflow**
- [ ] Draft save → temp identifier assigned
- [ ] Submit → final identifier assigned
- [ ] Every status transition (Draft→Submitted→Received→Approved/Denied)
- [ ] Email/notification trigger per transition
- [ ] Resubmit flow (if applicable)

**Data Persistence**
- [ ] Header record created (table name, key fields)
- [ ] Detail/line-item records
- [ ] Attachment/file record
- [ ] Workflow step record
- [ ] Audit record (action, old/new status, user, timestamp)

**Security**
- [ ] Unauthenticated access → redirect to login
- [ ] Role-based access (dealer vs admin vs CSR)
- [ ] Data scoping (dealer sees only own records)
- [ ] Encrypted/obfuscated parameters in requests
- [ ] File type restriction enforcement server-side

### Migration Mapping Format

For each FU, map:
- Legacy implementation (file + method + logic summary)
- Modern implementation (endpoint/service + logic summary)
- Equivalence: `Equivalent` | `Partial` | `Different` | `Missing in Modern` | `New in Modern`
- Notes on behavioral differences

### Outputs

```
docs/functional-catalogs/{module}/feature-{feature}/functional-units.md
docs/migration-reports/{module}/feature-{feature}/mapping.md
```

---

## Quality Gate

Step 2 is complete when:
- Every form field has ≥ 1 FU
- Every business rule has ≥ 1 FU
- Every status transition has ≥ 1 FU
- Every security requirement has ≥ 1 FU
- Migration mapping covers every FU
- Total FU count documented with breakdown by category and risk
