# Regression Suite - Submit Preapproval (Deer Australia)

**Client:** deer-australia | **Module:** coop | **Feature:** submit-preapproval  
**Tier:** Regression | **Count:** 40 | **Run Order:** Parallel by category

---

## Purpose
Full behavioral coverage - all form fields, business rules, workflow transitions, file handling, and security. Run on every merge to main and on scheduled nightly runs.

---

## Tests by Category

### Validation (15 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-PA-TC-001 | Submit without Advertisement Type -> error | P2-High |
| COOP-PA-TC-002 | Submit without Segment -> error | P2-High |
| COOP-PA-TC-003 | Submit with empty Vendor Name -> error | P2-High |
| COOP-PA-TC-004 | Submit without First Placement Date -> error | P2-High |
| COOP-PA-TC-005 | Submit with empty Preapproval Amount -> error | P2-High |
| COOP-PA-TC-006 | Submit with Preapproval Amount = 0 -> error | P2-High |
| COOP-PA-TC-007 | Preapproval amount exceeds fund balance -> blocked | P1-Critical |
| COOP-PA-TC-008 | Submit with empty email -> error | P2-High |
| COOP-PA-TC-009 | Invalid email format -> error | P2-High |
| COOP-PA-TC-010 | Non-admin submit without document AND link -> error | P1-Critical |
| COOP-PA-TC-011 | Non-admin provides link only -> accepted | P2-High |
| COOP-PA-TC-012 | JDFADMIN without Finance selected -> blocked | P2-High |
| COOP-PA-TC-013 | Sponsorship visible but none checked -> error | P2-High |
| COOP-PA-TC-018 | Add duplicate dealer -> blocked | P3-Medium |
| COOP-PA-TC-039 | First placement date future -> not selectable | P2-High |

### Business Logic (9 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-PA-TC-014 | Zero fund balance shows blocking message | P1-Critical |
| COOP-PA-TC-015 | Email pre-populated from session on load | P2-High |
| COOP-PA-TC-016 | Current dealer auto-included in dealer grid | P2-High |
| COOP-PA-TC-017 | Add additional dealer to grid | P2-High |
| COOP-PA-TC-019 | Remove dealer from grid | P3-Medium |
| COOP-PA-TC-029 | JDFADMIN with JDF Finance -> PENDING REVIEW (not auto-approved) | P2-High |
| COOP-PA-TC-040 | Media category change updates document type dropdown | P2-High |
| COOP-PA-TC-027 | Admin submit button = "Submit and Approve" | P2-High |
| COOP-PA-TC-028 | Dealer submit button = "Submit" | P2-High |

### Workflow (4 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-PA-TC-025 | Dealer submit -> status = PENDING REVIEW | P1-Critical |
| COOP-PA-TC-026 | BMADMIN non-JDF submit -> status = APPROVED | P2-High |
| COOP-PA-TC-036 | BMDLR can access preapproval form | P2-High |
| COOP-PA-TC-037 | BMAGDLR can access preapproval form | P2-High |

### DataPersistence (6 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-PA-TC-030 | Preapproval record created in tblPreapproval | P1-Critical |
| COOP-PA-TC-031 | Dealer linked in tblPreapprovalDealer | P1-Critical |
| COOP-PA-TC-032 | Document record in tblDocumentImage | P2-High |
| COOP-PA-TC-033 | Document filename renamed on upload | P2-High |
| COOP-PA-TC-034 | Comment saved in tblComment | P2-High |
| COOP-PA-TC-035 | Contact saved in tblContact | P2-High |

### Security (6 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-PA-TC-020 | File upload accepted within 100 MB | P2-High |
| COOP-PA-TC-021 | File upload rejected above 100 MB | P2-High |
| COOP-PA-TC-022 | Invalid file type (.exe) rejected | P2-High |
| COOP-PA-TC-023 | Valid file types accepted (PDF/JPG/DOCX) | P2-High |
| COOP-PA-TC-024 | Delete uploaded file removes from grid | P3-Medium |
| COOP-PA-TC-038 | Disabled dealer redirected to DealerDisable | P1-Critical |

---

## Run Command
```bash
npx playwright test --grep "COOP-PA-TC" --project=chromium
```

## Exit Criteria
All 40 tests pass. P1-Critical failures block release. P2-High+ failures require documented exceptions.
