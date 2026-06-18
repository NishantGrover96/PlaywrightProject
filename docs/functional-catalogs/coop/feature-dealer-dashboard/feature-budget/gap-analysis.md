# Gap Analysis — Coop Dealer Dashboard: Budget Tab

**Module**: `coop`  
**Feature**: `dealer-dashboard / budget`  
**Generated**: 2026-06-18 (Updated: 2026-06-18 — API layer deep dive)  
**Legacy Path**: `DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Budget\`  
**Modern Path**: `PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Budget\`  
**Page URL**: `/CoopManagement/Dealer/Budget/List`

---

## Modern Architecture — API Call Chain

```
List.cshtml.cs (Razor Page Handlers)
  └─► IDealerBudgetApiService  (DealerBudgetApiService.cs)
        └─► IBaseApiService.PostAsync<T>(endpoint, body)
              └─► Backend Gateway: {BaseGatewayUrl}coop/api/...
```

All modern API calls are **HTTP POST** with JSON request bodies. ProgramSeq is resolved from **JWT claims** on the backend (`_claimsService`) — not passed in the request body.

### API Endpoints (DealerBudgetApiService → Backend)

| Handler (List.cshtml.cs) | API Client Method | Backend Endpoint | HTTP |
|---|---|---|---|
| `OnGet` | `GetDealerNumberByDealerNumberSeqAsync(seq)` | `coop/api/Dealer/GetDealerByDealerNumberSeq` | POST |
| `BindFiscalYearList` | `GetFiscalYearsByProgramSeqAsync(programSeq, 0)` | `coop/api/FiscalYear/GetFiscalYearsByProgramSeq` | POST |
| `OnGetProgramType` | `GetBudgetRecapByProgramSaasAsync(year, "DEALER", seq, divSeq)` | `coop/api/Budget/budget-recap-by-program-saas` | POST |
| `OnGetBudgetData` | `GetBudgetRecapByProgramSaasAsync(year, "DEALER", seq, divSeq)` | `coop/api/Budget/budget-recap-by-program-saas` | POST |
| `OnGetBudgetUtilization` | `GetBudgetRecapByProgramSaasAsync(...)` × 2 (year, year-1) | `coop/api/Budget/budget-recap-by-program-saas` | POST |
| `OnGetBudgetUtilizationByMedia` | `GetDealerBudgetUtilizationByMediaAsync(year, divSeq, seq, "", budgetType)` | `coop/api/Budget/dealer-utilization-by-media` | POST |
| `OnGetBudgetUtilizationByProductGroup` | `GetDealerBudgetUtilizationByProductGroupAsync(year, divSeq, seq, budgetType)` | `coop/api/Budget/dealer-utilization-by-product-group` | POST |
| `OnGetBudgetSpentByCategory` | `GetDealerBudgetSpentByCategoryAsync(year, budgetType, seq)` | `coop/api/Budget/dealer-spending-by-category` | POST |

### Backend Controller (`Coop.API/Controllers/BudgetController.cs`)

The BudgetController exposes clean-architecture endpoints (`/details`, `/details-with-dealer`, `/combined-details`) using `IBudgetReadService`. The gateway routes the above SAAS/legacy-compat endpoints separately.

---

## Summary

| Dimension | Legacy Coverage | Modern Coverage | Gap Level |
|---|---|---|---|
| UI / Rendering | 100% | 100% | ✅ None |
| Data Entry / Interactions | 100% | 100% | ✅ None |
| Business Logic | 100% | ~82% | ⚠️ Medium |
| Workflow / Navigation | 100% | 100% | ✅ None |
| Data Persistence | 100% | 100% | ✅ None |
| Security | 100% | 100% | ✅ None |

**Overall Functional Coverage**: ~95%  
**Critical Gaps**: 0  
**High Gaps**: 0  
**Medium Gaps**: 5  
**Low Gaps**: 2

---

## Dimension 1 — UI / Rendering

**Source**: `Budget/List.cshtml`, `Budget/_MarketingPlan.cshtml`

| FU ID | Title | Legacy | Modern | Gap |
|---|---|---|---|---|
| COOP-FU-BDG-001 | Budget Summary KPI Header | ✅ Present | ✅ Identical markup | None |
| COOP-FU-BDG-002 | Fiscal Year Dropdown | ✅ Present | ✅ Identical markup | None |
| COOP-FU-BDG-003 | Program Budget Type Dropdown | ✅ Present | ✅ Identical markup | None |
| COOP-FU-BDG-004 | Fiscal Date Range Display | ✅ Present | ✅ Identical | None |
| COOP-FU-BDG-005 | Spend Breakdown Pie Chart | ✅ Present | ✅ Identical | None |
| COOP-FU-BDG-006 | Budget Utilization Column Chart | ✅ Present | ✅ Identical | None |
| COOP-FU-BDG-007 | Spend by Media Column Chart | ✅ Present | ✅ Identical | None |
| COOP-FU-BDG-008 | More Detail Report Links | ✅ Present | ✅ Identical | None |

**Assessment**: UI layer is identical. Same `.cshtml` files with no divergence between legacy and modern.

---

## Dimension 2 — Data Entry / Client-Side Interactions

**Source**: `Budget/jsDealerBudgetTab.js` (shared between legacy and modern)

| FU ID | Title | Legacy | Modern | Gap |
|---|---|---|---|---|
| COOP-FU-BDG-009 | Fiscal Year Change → Refresh | ✅ Present | ✅ Same JS | None |
| COOP-FU-BDG-010 | Program Type Change → Refresh | ✅ Present | ✅ Same JS | None |

**Assessment**: Client-side interaction logic is identical. The JS file is shared.

---

## Dimension 3 — Business Logic

**Source**: `Budget/List.cshtml.cs` (both), `DealerBudgetApiService.cs` (modern), `Libraries/BusinessLogic/Services/` (legacy)

| FU ID | Title | Legacy | Modern | Gap |
|---|---|---|---|---|
| COOP-FU-BDG-011 | Budget Summary Calculation | ✅ `IReportingService.GetBudgetRecapByProgramSaas` (direct DB) | ✅ `POST coop/api/Budget/budget-recap-by-program-saas` | None — logic identical |
| COOP-FU-BDG-012 | Multi-Source Spent Calculation | ✅ 6 fields summed (snake_case) | ✅ Same 6 fields (PascalCase via JToken mapping) | None |
| COOP-FU-BDG-013 | Budget Utilization % (2-Year) | ✅ `IReportingService` × 2 calls | ✅ `GetBudgetRecapByProgramSaasAsync` × 2 calls (year, year-1) | None |
| COOP-FU-BDG-014 | Spend by Media % | ✅ `IBudgetService.GetBudgetUtilizationByMedia` — per-item `media_spent` | ⚠️ `POST dealer-utilization-by-media` — `media_spent` = `TotalMediaSpent` (shared) | **Medium** |
| COOP-FU-BDG-015 | Excluded Category Filter | ✅ Client-side JS filter | ✅ Same JS | None |
| COOP-FU-BDG-016 | Default Fiscal Year | ✅ `_webHelper.GetFiscalYearDates()` | ✅ Same helper | None |
| COOP-FU-BDG-017 | Division-Filtered Fiscal Year List | ✅ `IFiscalService.GetFiscalYearsByProgramSeq` with division in DB query; falls back to all years | ⚠️ `GetFiscalYearsByProgramSeqAsync(programSeq, 0)` — always passes `divisionSeq=0`; LINQ `.Where(p=>p.division_seq==activeDivisionSeq)` with **no fallback** if empty | **Medium** |
| COOP-FU-BDG-018 | Dealer Number Resolution | ✅ `IDealerService.GetDealerByDealerNumberSeq` — checks `.Any()` | ✅ `POST coop/api/Dealer/GetDealerByDealerNumberSeq` → `string.IsNullOrEmpty` check | None — equivalent |

### Gap Detail — COOP-FU-BDG-014 (Medium) — `media_spent` Projection Difference

- **Legacy**: `IBudgetService.GetBudgetUtilizationByMedia()` returns per-item `media_spent` values (each media type has its own individual spend).
- **Modern**: `GetDealerBudgetUtilizationByMediaAsync()` returns `BudgetUtilizationByMediaApiModel { TotalMediaSpent, Items[] }`. In `OnGetBudgetUtilizationByMedia`, each item is projected as:
  ```csharp
  { "media_spent", result.TotalMediaSpent.ToString() }  // same value for ALL items
  ```
- **Impact**: JS calculates `amount_reimbursed / media_spent * 100`. In modern, all items divide by the **same total** instead of their own spend → percentage values will differ from legacy.
- **Needs**: Verification test comparing legacy vs modern percentage output per media type.

### Gap Detail — COOP-FU-BDG-017 (Medium) — FiscalYearList Fallback Missing

- **Legacy**: When `divisionSeq` is set, filters in SQL. Falls back to `allFiscalYears.ToList()` when filtered result is empty.
- **Modern**: Always calls API with `divisionSeq=0` (gets all years back), then LINQ filters by `p.division_seq == activeDivisionSeq`. **No fallback** when LINQ result is empty — `FiscalYearList` will be empty.
- **Impact**: If `division_seq` property is null or unmatched in API response, dealer sees no fiscal years.

### Gap Detail — COOP-FU-BDG-NEW1 (Medium) — BudgetSpentByCategory Zero-Value Filter Difference

- **Legacy** (`OnGetBudgetSpentByCategory`): Skips if `string.IsNullOrEmpty(r.Value) || r.Value == "0" || r.Value == "0.00"`
- **Modern** (`OnGetBudgetSpentByCategory`): Skips only if `string.IsNullOrWhiteSpace(item.Value)` — `"0"` and `"0.00"` values **pass through**.
- **Impact**: Modern may include zero-value categories in the pie chart that legacy hides. JS does filter `value > 0` in `renderBudgetSpendByCategoryGraph`, but the server response shapes differ and the `flag` variable behavior changes.

---

## Dimension 4 — Workflow / Navigation

| FU ID | Title | Legacy | Modern | Gap |
|---|---|---|---|---|
| COOP-FU-BDG-019 | Page Load Sequence | ✅ Same OnGet logic | ✅ Identical | None |
| COOP-FU-BDG-020 | JS Dashboard Init Sequence | ✅ document.ready | ✅ Same | None |
| COOP-FU-BDG-021 | Fiscal Year Change Cascade | ✅ | ✅ | None |
| COOP-FU-BDG-022 | Program Type Change Cascade | ✅ | ✅ | None |
| COOP-FU-BDG-023 | Report Link URL Update | ✅ | ✅ | None |

---

## Dimension 5 — Data Persistence

| FU ID | Title | Legacy | Modern | Gap |
|---|---|---|---|---|
| COOP-FU-BDG-024 | Encrypted Dealer IDs in Hidden Fields | ✅ | ✅ Same | None |
| COOP-FU-BDG-025 | Report Base URLs in Hidden Fields | ✅ | ✅ Same | None |

---

## Dimension 6 — Security

| FU ID | Title | Legacy | Modern | Gap |
|---|---|---|---|---|
| COOP-FU-BDG-026 | URL Parameter Decryption | ✅ `IEncryptDecrypt.Decrypt()` | ✅ Same service | None |
| COOP-FU-BDG-027 | IsDealer Self-Access | ✅ `_webHelper.IsDealer()` | ✅ Same | None |
| COOP-FU-BDG-028 | ViewOnly Permission Enforcement | ✅ `GetModuleAccess + ViewOnlyRoleDisable` | ✅ Same pattern | None |
| COOP-FU-BDG-029 | Missing Dealer Seq Guard | ✅ Redirect to AdminIndex | ✅ Same | None |

---

## Legacy-Only Features

| Feature | Legacy | Modern | Action |
|---|---|---|---|
| Marketing Plan modal (`_MarketingPlan.cshtml`) | ✅ Present (commented out in page) | ✅ Present (commented out) | No action — intentionally disabled |
| `OnGetBudgetUtilizationByProductGroup` | ✅ Handler exists | ✅ Handler exists | Chart disabled in JS (`spendByProductGroup` commented out) — no regression |

---

## Gap Summary

| # | Gap ID | FU | Severity | Description |
|---|---|---|---|---|
| 1 | GAP-BDG-001 | COOP-FU-BDG-014 | Medium | `media_spent` in modern = `TotalMediaSpent` (shared), not per-item — changes % calculation in chart |
| 2 | GAP-BDG-002 | COOP-FU-BDG-017 | Medium | `BindFiscalYearList` modern passes `divisionSeq=0`; LINQ filter has no fallback → empty list risk |
| 3 | GAP-BDG-003 | COOP-FU-BDG-015 | Medium | `OnGetBudgetSpentByCategory`: modern sends `"0"` values to client (JS filters them); legacy filters server-side |
| 4 | GAP-BDG-004 | COOP-FU-BDG-013 | Medium | Utilization % uses different budget denominator: summary handler (original_budget) vs utilization handler (original + adjustments) |
| 5 | GAP-BDG-005 | COOP-FU-BDG-002 | Low | Fiscal year list falls back to unfiltered list in legacy — no test covers division-active vs. no-division-active branch |
| 6 | GAP-BDG-006 | COOP-FU-BDG-011 | Low | Zero-budget scenario (no matching program_budget_seq) returns zeroed model — needs regression test |
