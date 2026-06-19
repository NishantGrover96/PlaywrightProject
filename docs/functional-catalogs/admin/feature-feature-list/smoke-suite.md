# Smoke Suite — Admin / Feature List

**Tier:** Smoke (9 tests)  
**File:** `tests/playwright/specs/admin/feature-feature-list/feature-list.spec.ts`

| Test ID | Description | Handler Covered |
|---------|-------------|-----------------|
| ADMIN-FU-FL-001 | Feature List page loads and renders module tabs | `OnGet` |
| ADMIN-FU-FL-002 | First module tab is active by default with features loaded | `OnGet` + `GetDefaultFeature` |
| ADMIN-FU-FL-003 | Feature table renders all expected columns | UI |
| ADMIN-FU-FL-004 | AutoPlay toggle opens Security PIN modal | UI |
| ADMIN-FU-FL-005 | Correct PIN enables edit mode and reveals action/status columns | `OnPostValidateUserPin` |
| ADMIN-FU-FL-006 | Toggle feature Off→On returns success | `OnPostProgramFeatureActiveFlag` |
| ADMIN-FU-FL-007 | Module List page loads with paginated modules | `OnGet` (ModuleList) |
| ADMIN-FU-FL-008 | Module status toggle shows confirmation dialog | UI |
| ADMIN-FU-FL-009 | Confirm module status toggle updates and page reloads | `OnPostUpdateModuleStatusAsync` |

**Run Command:**
```bash
npx playwright test tests/playwright/specs/admin/feature-feature-list/feature-list.spec.ts --grep "@smoke"
```
