# SPIFF (Flip to Samsung) - Coverage Report

## Summary

```
Module:          SPIFF (Flip to Samsung) - claim submission
Environment:     UAT - https://samsungportaluat.channel-fusion.com
Execution date:  2026-09-09
Execution type:  Live manual walkthrough via Playwright MCP (browser automation, not the checked-in spiff.spec.ts suite)
Total:           5   (1 claim-submission attempt per supplied user)
Passed:          4
Failed:          1
Skipped:         0
Blocked:         0
```

The 28-test automated `spiff.spec.ts` suite built earlier this session has **not** been executed against the live app - see Automation Gaps. This report covers only the live, manual, cross-role claim-submission walkthrough performed today.

## Coverage

**Screens covered live**: Login, Current SPIFF, Submit a Claim (AddClaim). `SearchClaim` and `ProcessClaims` were not exercised live this session (build-time coverage only).

**Workflows covered live**: Full claim-submission workflow (login -> navigate -> upload 3 documents -> fill header + tonnage -> add line item -> accept terms -> submit -> capture tracking number -> logout), repeated once per role/user.

**Roles covered live**: Dist Admin (x2 accounts), DDA (x1), Spec Rep Dist (x1) - all 4 successful. Company Representative (x1) - login failed, workflow not reached.

**Positive scenarios**: Claim submission with all fields populated, 3 documents uploaded, 1 line item, terms accepted - confirmed working end-to-end for 4 of 5 roles, each producing a distinct tracking number.

**Negative/boundary/permission/integration scenarios**: Not exercised live this session (remain build-time-only coverage in `spiff.spec.ts` - unexecuted, see Automation Gaps).

## Claim Submission Results

| # | User | Role | Login | Claim Submitted | Tracking # |
|---|---|---|---|---|---|
| 1 | kleffew@aeshvacinc.com | Dist Admin | Pass | Pass | 6513764 |
| 2 | ezajdel@aeshvacinc.com | Dist Admin | Pass | Pass | 6513765 |
| 3 | mbevan@aeshvacinc.com | DDA | Pass | Pass | 6513766 |
| 4 | vicki@bplsales.ca | Spec Rep Dist | Pass | Pass | 6513767 |
| 5 | ngrover@channel-fusion.com | Company Representative | **Fail** | Not reached | - |

All test data used clearly-marked synthetic values (e.g. `QAQC-<user>-0001` quote numbers, "QA Automation Test Claim" project names, comments identifying the submission as a Playwright MCP QA test) and a reused sample PDF (`tests/playwright/fixtures/samsung/spiff/*.pdf`) for the 3 required document uploads. The UAT environment displays an explicit banner confirming submissions here are not processed downstream, so no production business data or workflow was affected.

## Failures

### #5 - Company Representative login

- **Test**: Login as `ngrover@channel-fusion.com` on UAT, then submit a claim.
- **Status**: Failed at login step; claim submission not attempted.
- **Failure category**: `UNKNOWN` (insufficient evidence to distinguish `TEST_DATA_DEFECT` from `AUTH_DEFECT`/`ENVIRONMENT_DEFECT`).
- **Root cause**: Login form returned "Please enter valid login details." No further diagnostic detail available from the UI (no distinction between "wrong password" and "account does not exist/is not activated").
- **Recommendation**: Confirm whether this Company Representative account (a) needs self-registration first via `/Rewards/Spiff/Registration` (linked on the login page), (b) has a different password than the one supplied, or (c) is not yet provisioned in the UAT environment. Retried only once to avoid risking an account lockout from repeated failed attempts.

## Automation Gaps

- **Missing stable locator**: Dropzone's per-file upload-preview markup (used to assert "N documents uploaded") was not captured live - `uploadedFileNameLink` in `SpiffPage.ts` does not reliably represent the multi-document state (see `spiff-discovery.md` Section 4).
- **Unclear business rule**: whether the "upload all three required documents" instruction is a hard server/client validation gate or advisory-only text was not determined (BR-013 in `spiff-test-plan.md`).
- **Environment dependency**: the automated `spiff.spec.ts` suite requires real credentials wired into `test-data.json` (intentionally left blank) before it can run against UAT; that wiring was out of scope for this session's live walkthrough, which used the credentials supplied directly in the conversation instead.
- **Missing test API**: no evidence of an API-assisted setup/cleanup path for SPIFF claims was investigated this session - claims created during this walkthrough (tracking #s 6513764-6513767) remain in the UAT system with no cleanup performed (acceptable per the UAT banner's "not processed" behavior, but noted for completeness).
- **Unregistered/unverified role**: Company Representative flow is fully unverified end-to-end (see Failures).

## Application Defects

None identified with sufficient evidence to classify as an application defect. The Company Representative login failure (see Failures) is left as `UNKNOWN` rather than classified as an application defect, since a credential/registration issue on the test-data side is at least as likely as a genuine application bug.

## Follow-ups Recorded Elsewhere

- Page-object corrections made this session (comment/documentation only, no locator changes were needed beyond clarifying accuracy): `tests/playwright/pages/samsung/spiff/feature-spiff/SpiffPage.ts` - `uploadedFileNameLink` and `acceptTerms()` comments updated to reflect live-confirmed behavior.
- Full field/locator confirmation table: `spiff-discovery.md` Section 4.
