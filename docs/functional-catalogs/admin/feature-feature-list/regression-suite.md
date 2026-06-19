# Regression Suite — Admin / Feature List

**Tier:** Regression (26 tests + 2 fixme)  
**File:** `tests/playwright/specs/admin/feature-feature-list/feature-list.spec.ts`

| Test ID | Description | FU Ref |
|---------|-------------|--------|
| ADMIN-FU-FL-010 | Module tab click loads features for that module | FU-1.3 |
| ADMIN-FU-FL-011 | Tab count badges show numeric counts after load | FU-1.4 |
| ADMIN-FU-FL-012 | URL `?module=` param pre-selects correct tab | FU-1.5 |
| ADMIN-FU-FL-013 | Search text filters feature rows | FU-2.2 |
| ADMIN-FU-FL-014 | Status filter "On" shows only active features | FU-2.3 |
| ADMIN-FU-FL-015 | Status filter "Off" shows only inactive features | FU-2.3 |
| ADMIN-FU-FL-016 | Combined search + status filter updates tab counts | FU-2.4 |
| ADMIN-FU-FL-017 | Wrong PIN shows Invalid PIN error, no edit mode | FU-3.3 |
| ADMIN-FU-FL-018 | Empty PIN shows required validation, modal stays open | FU-3.4 |
| ADMIN-FU-FL-019 | Disabling edit mode hides action/status columns | FU-3.5, 3.6 |
| ADMIN-FU-FL-020 | Feature toggle blocked without edit mode | FU-4.3 |
| ADMIN-FU-FL-021 | Empty description shows required validation | FU-7.3 |
| ADMIN-FU-FL-022 | Add Feature modal opens in edit mode | FU-8.1 |
| ADMIN-FU-FL-023 | Add Feature required field validation shows errors | FU-8.5 |
| ADMIN-FU-FL-024 | Duplicate Feature Key rejected with field error | FU-8.3 |
| ADMIN-FU-FL-025 | Duplicate Property Name rejected with field error | FU-8.4 |
| ADMIN-FU-FL-026 | Download Excel initiates file download | FU-9.1 |
| ADMIN-FU-FL-027 | Import rejects empty file | FU-9.4 |
| ADMIN-FU-FL-028 | Import rejects non-xlsx file | FU-9.3 |
| ADMIN-FU-FL-029 | Module list search by name filters results | FU-10.2 |
| ADMIN-FU-FL-030 | Module list filter by Status Yes shows only active | FU-10.3 |
| ADMIN-FU-FL-031 | Cancel module toggle reverts checkbox, no API call | FU-10.6 |
| ADMIN-FU-FL-032 | User Role modal loads with roles/division/country sections | FU-5.1, 5.2 |
| ADMIN-FU-FL-033 _(fixme)_ | All checkbox checks all role options | FU-5.3 |
| ADMIN-FU-FL-034 _(fixme)_ | Scope modal loads division and country checkboxes | FU-6.1 |
| ADMIN-FU-FL-035 | Download/Upload/AddFeature buttons hidden without edit mode | FU-9.9 |

**Run Command:**
```bash
npx playwright test tests/playwright/specs/admin/feature-feature-list/feature-list.spec.ts --grep "@regression"
```

**API Tests:**
```bash
npx playwright test tests/api/admin/feature-feature-list/feature-list.api.spec.ts --grep "@api"
```
