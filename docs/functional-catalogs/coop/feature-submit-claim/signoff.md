# Coop Submit Claim — Coverage Sign-off

> Date: 2026-06-17
> Reviewer: automated pipeline (Step 2.6)
> Module: `coop` | Feature: `submit-claim`

---

## Decision: 🚫 GATE BLOCKED

**Reason:** 1 Critical gap found. Step 3 (Playwright generation) is not permitted until the Critical gap is resolved and gap analysis is re-run.

---

## Coverage Scorecard

| Dimension | Coverage % | Threshold | Status |
|---|---|---|---|
| Functional | 94.3% | ≥ 90% | ✅ PASS |
| Validation | 87.5% | ≥ 85% | ✅ PASS |
| Workflow | 100.0% | ≥ 95% | ✅ PASS |
| Database | 88.9% | ≥ 85% | ✅ PASS |
| Security | 100.0% | = 100% | ✅ PASS |

> All coverage thresholds are met. The block is triggered by the Critical gap rule, not by coverage percentages.

---

## Gap Summary

| Level | Count | Decision Impact |
|---|---|---|
| Critical | 1 | **Blocks automation** |
| High | 3 | Would require remediation |
| Medium | 1 | Warn in tests |
| Low | 1 | Document only |

---

## Blocking Item

### COOP-FU-046 — Activity Date Records [Critical]

**What is broken:** The modern `UpdateTempActivities` method in `SubmitClaim.cshtml.cs` contains zero activity date persistence code. In the legacy implementation, after saving each activity, it calls:

```csharp
// Legacy (SubmitClaim.cshtml.cs ~line 1813)
_activityService.DeleteOnlineActivityDate("ONLINE_ACTIVITY_TEMP", ActivitySeqOut);
foreach (var ad in a.activityDates) {
    _activityService.UpdateOnlineActivityDate(0, "ONLINE_ACTIVITY_TEMP", ActivitySeqOut, parsedDate.Date);
}
```

The modern version processes `activityDates` in the JSON payload (it's collected client-side, sent on save, and read back when resuming a draft) — **but never writes it to the database**.

**Impact:**
- `ONLINE_ACTIVITY_DATE` rows are never created for modern-submitted claims
- When `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS` promotes temp→CLAIM, activity dates will not transfer to `ACTIVITY_DATE`
- Any downstream report, approval rule, or compliance check that relies on activity dates will see empty results for all modern-submitted claims
- Resume-incomplete-claim flow reads dates back from DB — will always show empty dates even if the user entered them

**What must be fixed:**

In `SubmitClaim.cshtml.cs` → `UpdateTempActivities`, after the product lines block (around line 1866), add:

```csharp
// 1. Expose an API endpoint: POST coop/api/SubmitClaim/UpdateOnlineActivityDate
//    (mirrors legacy USP_ONLINE_ACTIVITY_DATE_U01)
// 2. Add delete call:
_coopApiService.DeleteOnlineActivityDateAsync("ONLINE_ACTIVITY_TEMP", ActivitySeqOut).GetAwaiter().GetResult();
// 3. Add insert loop:
if (a.activityDates != null && a.activityDates.Count > 0) {
    foreach (var ad in a.activityDates) {
        if (string.IsNullOrWhiteSpace(ad)) continue;
        if (!DateTime.TryParse(ad, out var parsedDate)) continue;
        if (parsedDate.Date > DateTime.Today) continue;
        _coopApiService.UpdateOnlineActivityDateAsync(0, "ONLINE_ACTIVITY_TEMP", ActivitySeqOut, parsedDate.Date)
                        .GetAwaiter().GetResult();
    }
}
```

**Acceptance criteria before re-running gate:**
- After draft save, `ONLINE_ACTIVITY_DATE` rows exist for each entered date (owner = `ONLINE_ACTIVITY_TEMP`, owner_seq = activity_seq)
- After final submit, `ACTIVITY_DATE` rows exist on the promoted claim activities
- Resume-incomplete-claim correctly re-populates the activity dates UI
- Future dates are silently skipped (matching legacy `UpdateTempActivities` behavior)

---

## High Gaps — Approved for Later Remediation

These do not block the gate today but must be fixed before production release. Once the Critical gap is resolved and the gate re-runs, these will be evaluated for test exclusion or `test.fixme` tagging.

### COOP-FU-018 — Server-Side Activity Date Validation [High]
Modern `OnPostSaveClaim` removed the HTTP 400 error responses for future dates and duplicate dates. Client-side JS still validates, but the server-side defense layer is gone.
- **Risk:** A manipulated or direct API call can bypass client validation and save bad dates.
- **Fix:** Reinstate the date-loop validation block in `OnPostSaveClaim` before `UpdateTempActivities` is called.

### COOP-FU-024 — Vendor Information Read [High]
`OnGetVendorList` and `OnGetVendorInformation` still call `_addressService.GetCoopVendorContact` directly (legacy `IAddressService`).
- **Risk:** In a fully decoupled deployment where legacy services are removed, the vendor dropdown will fail to load and vendor auto-fill won't work.
- **Fix:** Add `GET coop/api/SubmitClaim/GetCoopVendorContact` and `GetCoopVendorContactList` endpoints; update both handlers to use `_coopApiService`.

### COOP-FU-045 — Product Line Delete Inconsistency [High]
`_activityService.DeleteOnlineActivityProduct` (legacy `IActivityService`) is called immediately before `_coopApiService.UpdateOnlineActivityProductAsync` (API).
- **Risk:** If legacy and API services target different database contexts or have different transaction scopes, old product lines may not be cleaned, causing duplicates.
- **Fix:** Add `DELETE` endpoint to `coop/api/SubmitClaim/DeleteOnlineActivityProduct` and route the delete call through `_coopApiService` for consistency.

---

## Medium Gap — Acknowledged

### COOP-FU-041 — Post-Submit Confirmation Email [Medium]
`SendClaimEmailToUser` in `SubmitClaim.cshtml.Email.cs` still uses `_emailService.SendEmailAsync` (legacy `IEmailService`).
- **Risk:** Low while both apps share the same email service instance. Breaks only in a fully decoupled modern-only deployment.
- **Accepted for now:** Email functionality is currently working. Tag affected tests with `test.fixme` when email assertions are added.

---

## Automation Scope (Post-Remediation)

Once COOP-FU-046 is fixed and the gate re-runs with PASSED status, the following automation scope is planned:

### Smoke Suite (8 FUs — happy-path coverage)
| FU | Test Description |
|---|---|
| FU-001 | Page loads for authenticated dealer user |
| FU-003 | Select "No Pre-approval" claim type |
| FU-005 | Media type grid renders with icons |
| FU-016 | Invoice amount accepted |
| FU-017 | Invoice number accepted |
| FU-014 | Invoice file upload succeeds |
| FU-037 | Save and Submit Later returns temp claim number |
| FU-038 | Submit returns claim process number |

### Regression Suite (38 FUs — full functional coverage)
All Full-status FUs across UI, DataEntry, BusinessLogic, Workflow, DataPersistence, and Security dimensions.

### E2E Suite (3 flows)
1. **New claim → No pre-approval → submit** (dealer user)
2. **New claim → Pre-approval → submit** (with approved PA number)
3. **Draft save → resume → submit** (incomplete claim flow)

### Excluded from automation (pending remediation)
| FU | Reason |
|---|---|
| COOP-FU-046 | Activity dates not persisted — test would fail on DB assertion |
| COOP-FU-018 | Server-side date validation removed — server error response tests invalid |
| COOP-FU-024 | Vendor lookup still legacy — tests would pass only if legacy service deployed |
| COOP-FU-045 | Product line delete inconsistency — duplicate records risk |

---

## Next Steps

1. **Fix COOP-FU-046** — implement `UpdateOnlineActivityDate` + `DeleteOnlineActivityDate` API endpoints in `Coop.API` and wire them into modern `UpdateTempActivities`
2. **Fix COOP-FU-018** — reinstate server-side activity date validation in `OnPostSaveClaim`
3. **Fix COOP-FU-045** — route product line delete through `_coopApiService`
4. **Fix COOP-FU-024** — migrate vendor contact read endpoints to API
5. Re-run `/gap-analysis` after fixes are deployed
6. Re-run `/coverage-signoff` to verify gate passes
7. Proceed to `/playwright-test-generation` once gate = PASSED

---

⚠️  GATE: USER OVERRIDE — Critical gap (FU-046) acknowledged. Step 3 approved to proceed with FU-046 excluded from automation scope. Fix must be applied before production execution.
