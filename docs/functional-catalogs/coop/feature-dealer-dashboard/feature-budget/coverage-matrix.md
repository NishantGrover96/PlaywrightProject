# Coverage Matrix — Coop Dealer Dashboard: Budget Tab

**Module**: `coop` | **Feature**: `budget` | **Generated**: 2026-06-18

---

## FU Coverage Matrix

| FU ID | Title | Category | Risk | Legacy ✓ | Modern ✓ | Test Required | Test ID |
|---|---|---|---|---|---|---|---|
| COOP-FU-BDG-001 | Budget Summary KPI Header Display | UI | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-001 |
| COOP-FU-BDG-002 | Fiscal Year Dropdown Population | UI | Medium | ✅ | ✅ | Regression | COOP-BDG-T-002 |
| COOP-FU-BDG-003 | Program Budget Type Dropdown (Dynamic) | UI | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-003 |
| COOP-FU-BDG-004 | Fiscal Date Range Display | UI | Low | ✅ | ✅ | Regression | COOP-BDG-T-004 |
| COOP-FU-BDG-005 | Spent/Committed Breakdown Pie Chart | UI | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-005 |
| COOP-FU-BDG-006 | Budget Utilization Column Chart (2-Year) | UI | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-006 |
| COOP-FU-BDG-007 | Spend by Media Group Column Chart | UI | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-007 |
| COOP-FU-BDG-008 | More Detail Report Links | UI | Low | ✅ | ✅ | Regression | COOP-BDG-T-008 |
| COOP-FU-BDG-009 | Fiscal Year Selection & Dashboard Refresh | DataEntry | Medium | ✅ | ✅ | Regression | COOP-BDG-T-009 |
| COOP-FU-BDG-010 | Program Budget Type Selection & Refresh | DataEntry | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-010 |
| COOP-FU-BDG-011 | Budget Summary Calculation | BusinessLogic | Critical | ✅ | ✅ | Smoke + Regression + API | COOP-BDG-T-011 |
| COOP-FU-BDG-012 | Multi-Source Spent/Committed Calculation | BusinessLogic | Critical | ✅ | ✅ | Regression + API | COOP-BDG-T-012 |
| COOP-FU-BDG-013 | Budget Utilization % Calc (2-Year) | BusinessLogic | High | ✅ | ✅ | Regression + API | COOP-BDG-T-013 |
| COOP-FU-BDG-014 | Spend by Media Reimbursement % | BusinessLogic | High | ✅ | ⚠️ Gap | Regression + API | COOP-BDG-T-014 |
| COOP-FU-BDG-015 | Excluded Category Filter | BusinessLogic | High | ✅ | ✅ | Regression | COOP-BDG-T-015 |
| COOP-FU-BDG-016 | Default Fiscal Year Determination | BusinessLogic | Medium | ✅ | ✅ | Regression | COOP-BDG-T-016 |
| COOP-FU-BDG-017 | Division-Filtered Fiscal Year List | BusinessLogic | Medium | ✅ | ✅ | Regression | COOP-BDG-T-017 |
| COOP-FU-BDG-018 | Dealer Number Resolution from Seq | BusinessLogic | High | ✅ | ⚠️ Gap | Regression + API | COOP-BDG-T-018 |
| COOP-FU-BDG-019 | Page Load: Dealer Validation & Binding | Workflow | High | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-019 |
| COOP-FU-BDG-020 | On-Load Dashboard Init Sequence | Workflow | High | ✅ | ✅ | Smoke | COOP-BDG-T-020 |
| COOP-FU-BDG-021 | Fiscal Year Change → Full Refresh | Workflow | Medium | ✅ | ✅ | Regression | COOP-BDG-T-021 |
| COOP-FU-BDG-022 | Program Type Change → Budget & Charts | Workflow | High | ✅ | ✅ | Regression | COOP-BDG-T-022 |
| COOP-FU-BDG-023 | Report Link URL Update on Change | Workflow | Low | ✅ | ✅ | Regression | COOP-BDG-T-023 |
| COOP-FU-BDG-024 | Encrypted Dealer IDs in Hidden Fields | DataPersistence | High | ✅ | ✅ | Regression | COOP-BDG-T-024 |
| COOP-FU-BDG-025 | Report Base URLs in Hidden Fields | DataPersistence | Low | ✅ | ✅ | Regression | COOP-BDG-T-025 |
| COOP-FU-BDG-026 | URL Parameter Decryption on All Handlers | Security | Critical | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-026 |
| COOP-FU-BDG-027 | IsDealer Self-Access Enforcement | Security | Critical | ✅ | ✅ | Smoke + Regression | COOP-BDG-T-027 |
| COOP-FU-BDG-028 | ViewOnly Permission Enforcement | Security | High | ✅ | ✅ | Regression | COOP-BDG-T-028 |
| COOP-FU-BDG-029 | Missing Dealer Seq Redirect Guard | Security | Medium | ✅ | ✅ | Regression | COOP-BDG-T-029 |

---

## Coverage by Test Tier

| Tier | Tests Planned | FUs Covered | Coverage % |
|---|---|---|---|
| Smoke | 7 | 7 (Critical + selected High) | 100% of Critical |
| Regression | 29 | 29 | 100% |
| E2E | 2 | Cross-tab dealer budget workflow | N/A |
| API | 8 | Business logic handlers | 100% of API handlers |

---

## Coverage by Risk Level

| Risk | FU Count | Fully Covered | Gap | Coverage % |
|---|---|---|---|---|
| Critical | 4 | 4 | 0 | 100% |
| High | 13 | 11 | 2 (medium gaps) | 85% |
| Medium | 7 | 7 | 0 | 100% |
| Low | 5 | 5 | 0 | 100% |

---

## Coverage by Category

| Category | FU Count | Test Coverage | Notes |
|---|---|---|---|
| UI | 8 | 100% | Identical legacy/modern markup |
| DataEntry | 2 | 100% | Shared JS file |
| BusinessLogic | 8 | 88% | 2 medium gaps (GAP-BDG-001, GAP-BDG-002) |
| Workflow | 5 | 100% | Identical flow |
| DataPersistence | 2 | 100% | Hidden fields verified |
| Security | 4 | 100% | Encryption + permissions |
