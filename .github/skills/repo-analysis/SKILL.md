---
name: repo-analysis
description: Scan and analyze source code to extract business logic, workflows, validations, endpoints, data models, and security rules for a given module or feature.
---

# Repository Analysis — Step 1: Codebase Discovery

## Purpose

Scan and analyze the provided source code for a given module/feature.
Extract all business logic, workflows, validations, endpoints, data models, and security rules
implemented in the code — without comparing legacy vs. modern implementations.

This produces a **Repo Analysis Report** that feeds into `/functional-test-catalog`.

## When to Use

- Running Step 1 of the Functional QA Test Generation pipeline
- User says "analyze repo for…", "discover code for…", "read source for…"
- Always run before `/functional-test-catalog`

---

## Inputs

- **Module**: e.g. `coop`
- **Feature**: e.g. `submit-claim`
- **Source Root**: root of the codebase on disk (from `config/repos.local.json` or user-provided)
- **Feature Folder**: the exact folder containing the feature files

### Resolving Paths — Auto-Discovery

Read workspace roots from `config/repos.local.json` when available.
All dependency paths are auto-derived from the workspace and feature folder.
**Do NOT ask the user for individual dependency paths.**

#### Auto-Discovery Algorithm

```
STEP A — Feature Files (always)
  Read all files in featurePath:
    *.cshtml          → form fields, UI elements, partial view references, conditional visibility
    *.cshtml.cs       → injected interfaces, bound properties, handler methods, validation attributes
    *Controller.cs    → HTTP methods, routes, auth attributes, action return types
    *Page.cshtml      → same as *.cshtml

STEP B — Services / Business Logic
  From feature files: extract injected interface names (IClaimService, IBudgetService, etc.)
  or method calls (ClaimService.Submit, etc.)

  Search paths:
    {root}\Libraries\BusinessLogic\Services\**\*.cs   (ASP.NET Razor Pages / DLL pattern)
    {root}\src\Services\{module}\**\*.cs               (modern API pattern)
    {root}\Application\**\*Service.cs                  (clean arch pattern)
  → Read matching service implementations
  → Extract method signatures, business rules, calculations, eligibility checks

STEP C — Validators
  From service/handler files: extract validator class names or FluentValidation usage

  Search paths:
    {root}\src\Validators\{module}\**\*.cs
    {root}\Application\Validators\**\*.cs
  → Read validation rules (required, length, range, regex, custom)
  → Extract exact error messages

STEP D — Data Models / DTOs
  From service files: extract entity/model/DTO class names

  Search paths:
    {root}\Libraries\CommonEntity\**\*.cs
    {root}\src\Models\{module}\**\*.cs
    {root}\src\Domain\**\*.cs
  → Read property names, data types, required attributes
  → Document field-level constraints

STEP E — Database Layer
  From service/handler files: extract stored procedure names, repository calls, DbContext usage

  Search paths:
    {root}\Libraries\**\*Accessor*.cs
    {root}\Libraries\**\*DAL*.cs
    {root}\src\Data\**\*Repository*.cs
    {root}\src\Infrastructure\**\*.cs
  → Extract SP names, table names, query parameters
  → Map writes (INSERT/UPDATE) and reads (SELECT)

STEP F — Validation Messages / Resources
  Derive resource path:
    {root}\RAL\Resources\{ModuleTitle}\ViewResource.*.resx    (legacy pattern)
    {root}\Resources\**\*.resx                                 (general pattern)
  → Extract exact validation message strings for test assertions

STEP G — Client-Side Behavior
  Search:
    {root}\**\wwwroot\WebScripts\{moduleFolder}\js*.js
    {root}\**\wwwroot\js\{module}\*.js
    {root}\**\src\assets\js\{module}\*.js
  → Extract AJAX calls, client validation rules, UI behaviors, encrypted params

STEP H — Security / Auth
  From feature files and controllers: extract
    [Authorize] / [Authorize(Roles="...")] attributes
    Policy names, role names
    Data-scoping patterns (dealer-to-dealer isolation, etc.)
```

#### Path Derivation Rules

| Dependency | Derived path |
|---|---|
| Services | `{root}\Libraries\BusinessLogic\Services\` or `{root}\src\Services\{module}\` |
| Validators | `{root}\src\Validators\{module}\` |
| Entities / DTOs | `{root}\Libraries\CommonEntity\` or `{root}\src\Models\{module}\` |
| Accessors / DAL | `{root}\Libraries\**\*Accessor*.cs` |
| Repository | `{root}\src\Data\**\*Repository*.cs` |
| Resources | `{root}\RAL\Resources\{ModuleTitle}\ViewResource.*.resx` |
| JS scripts | `{root}\{webFolder}\wwwroot\WebScripts\{moduleFolder}\js*.js` |
| Existing tests | `{root}\tests\playwright\{module}\` |

Only stop and ask the user if a derived path does not exist on disk.

---

## What to Extract

### UI / Form Layer
| Source | Extract |
|---|---|
| `.cshtml` / View | Form fields (name, type, label), required markers, conditional visibility, partial views |
| `.cshtml.cs` / Controller | GET handler (data pre-load), POST handler (submission), bound properties |
| JS files | Client-side validation, AJAX calls, dynamic behaviors (show/hide, auto-populate) |

### Business Logic Layer
| Source | Extract |
|---|---|
| Service classes | Method signatures, eligibility checks, calculations, limit enforcement |
| Validators | Every validation rule and error message |
| Business rules | Date range checks, amount caps, duplicate detection, enrollment checks |

### Data Layer
| Source | Extract |
|---|---|
| Entities / DTOs | All fields, data types, required constraints |
| Accessors / Repositories | SP names, table names, CRUD operations |
| Stored procedures (SP) | SP name, parameters, what tables it reads/writes |

### Security Layer
| Source | Extract |
|---|---|
| Auth attributes | `[Authorize]`, role names, policy names |
| Data scoping | Dealer ID checks, ownership validation patterns |
| Parameter security | Encrypted IDs, anti-forgery tokens |

### Workflow Layer
| Source | Extract |
|---|---|
| Status enums | All statuses and their values |
| Transitions | Which handler/method triggers each status change |
| Notifications | Email/notification triggers per workflow step |

---

## Output Format

### Repo Analysis Report

```markdown
# {Module} {Feature} — Repository Analysis Report
Generated: {timestamp}

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| path/to/SubmitClaim.cshtml | UI | Submit Claim form — fields, layout |
| path/to/SubmitClaim.cshtml.cs | Handler | GET (load data), POST (submit claim) |
| path/to/ClaimService.cs | Business Logic | Eligibility, budget checks, submission |

## UI / Form Fields
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| ProgramId | select | Yes | Program | — | Populated from dealer's enrolled programs |

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | OnGetAsync | [Authorize] | Load form with dealer programs |
| POST | OnPostAsync | [Authorize] | Submit or save draft |

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-001 | Fund balance check | BudgetService.ValidateFunds | Claim amount ≤ available fund balance |
| BR-002 | Per-claim max | BudgetService.ValidatePerClaimMax | Amount ≤ per-claim cap for program |

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| ProgramId | Required | "Program is required." | Server |
| ClaimDate | Required | "Claim Date is required." | Both |
| ClaimDate | Date format | "Invalid date format." | Client |
| Amount | Range (> 0) | "Amount must be greater than zero." | Server |

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| — | Draft | Save Draft button | None |
| Draft | Submitted | Submit button | Email to admin |
| Submitted | Received | Auto on submission | Email to dealer |

## Database Operations
| Operation | Table / SP | Trigger | Key Fields |
|---|---|---|---|
| INSERT | dbo.CoopClaims | Submit | ClaimID, DealerID, ProgramID, Status, Amount |
| INSERT | dbo.CoopClaimAudit | Submit | ClaimID, Action='Submit', NewStatus, AuditUser |

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | [Authorize] on page model | Authenticated users only |
| Dealer data scope | DealerId == currentUser.DealerId | Dealer sees own records only |

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| CoopClaim | ClaimID, DealerID, ProgramID, Status, Amount, ClaimDate | Claim header |

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Auto-populate Claim Date | Page load | Set to today if empty |
| Hide attachment section | ProgramId change | Show only when program requires docs |
```

---

## Output File

```
docs/module-analysis/{client}/{module}/feature-{feature}/repo-analysis.md
```

---

## Quality Gate

Repo analysis is complete when:
- Every UI form field is documented
- Every business rule is extracted with its source file
- Every validation rule has error message text
- Every status transition is mapped
- Every database write operation is documented
- Every security constraint is documented
- Total: documented field count, rule count, transition count
