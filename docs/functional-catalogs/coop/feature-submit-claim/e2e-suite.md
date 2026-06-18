# Coop — Submit Claim — E2E Suite

Generated: 2026-06-17 | Pipeline: Step 3  
Module: `coop` | Feature: `submit-claim`  
Run: `npm run test:coop:e2e` (or specific: `playwright test --grep @e2e`)

E2E tests exercise complete end-to-end user flows. All are mutating and should only run on
dev, testing, or UAT environments. They require a valid `sample-invoice.pdf` in the test data folder.

---

## Flows: 3 tests

### COOP-SC-E2E-001 — New claim: No pre-approval, dealer role, Direct tile, final submit

**FUs exercised:** FU-001, FU-003, FU-005, FU-015, FU-016, FU-017, FU-019, FU-043, FU-044

**Steps:**
1. Navigate to Submit Claim page
2. Assert wizard loads and default radio is No
3. Advance from Step 1 (No-PA path)
4. Assert 13 media tiles; Campaign absent
5. Select `Direct` tile
6. Advance to activity form
7. Fill: Media Name, Invoice Number, Invoice Amount
8. Upload invoice file
9. Add optional submission comment
10. Click Submit
11. Assert `#dvClaimSubmit` panel visible
12. Assert claim confirmation number matches `/^\d{4}$/`

**Expected:** Claim record created, 4-digit process number returned, success panel visible.

---

### COOP-SC-E2E-002 — Draft save → Activity page → Resume incomplete → Final submit

**FUs exercised:** FU-043, FU-045, FU-044

**Steps:**
1. Navigate to Submit Claim, fill activity, upload invoice
2. Click Save and Submit Later
3. Assert `#dvClaimSubmitLater` panel; temp number is 6 digits
4. Navigate to Activity List (`/CoopManagement/dealer/Activity/list?tab=claim`)
5. Assert table loads
6. Find resume link containing `temp_seq` param; click it
7. Assert wizard loads at Step 4 (activity form visible)
8. Assert `#btnAddToClaim` visible (incomplete claim pre-filled)

**Expected:** Resume flow navigates back to claim at Step 4.  
**Note:** Activity dates will NOT be pre-filled (accepted exception E-02 / FU-020).

---

### COOP-SC-E2E-003 — New claim with vendor info + product lines, final submit

**FUs exercised:** FU-008, FU-009, FU-023, FU-025, FU-044, FU-060, FU-064

**Steps:**
1. Navigate to Submit Claim
2. Advance to media type step; select Direct tile
3. Advance to activity form
4. If vendor section visible: check vendor info fields present
5. Fill Invoice Number and Invoice Amount
6. If product line block visible: add 100% measurement
7. Upload invoice
8. Click Submit
9. Assert success panel and 4-digit claim number

**Expected:** Claim submitted with product lines (if program config enabled).  
**Note:** Product line DB assertion (`FU-064`) requires manual DB verification post-run (see `verify-claim-records.sql`).

---

## Prerequisites

| Requirement | Details |
|---|---|
| Environment | dev, testing, or UAT only — production blocked |
| Sample invoice | `tests/playwright/data/coop/feature-submit-claim/sample-invoice.pdf` (any valid PDF, ≤10 MB) |
| Auth | Dealer session loaded via `tests/playwright/fixtures/.auth/user.json` |
| DB access | Optional — for manual DB verification after E2E runs |

## Create sample invoice (if missing)
```powershell
# Windows: creates a 1 MB placeholder PDF
fsutil file createnew tests/playwright/data/coop/feature-submit-claim/sample-invoice.pdf 1048576
```

## Post-run DB verification
After E2E-001 or E2E-003, run:
```
tests/database/coop/feature-submit-claim/verify-claim-records.sql
```
Set `@ClaimSeq` from the 4-digit process number → look up `claim_seq` in `dbo.claim`.
