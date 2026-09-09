# SPIFF (Flip to Samsung) - Coverage Report

## Summary

```
Module:          SPIFF (Flip to Samsung) - claim submission
Environment:     UAT - https://samsungportaluat.channel-fusion.com
Execution date:  2026-09-09
Execution type:  Automated - `npx playwright test spiff.spec.ts --project=chromium`
                 (plus a separate live manual walkthrough, see "Manual Walkthrough Results" below)
Total (automated, 5 of 29 executed - SPIFF-SMOKE-001..004 + SPIFF-E2E-001; SPIFF-SMOKE-005
       and the 23 remaining regression/e2e tests need a confirmed BMADMIN account, not
       available this session):
                 5
Passed:          5
Failed:          0 (5 real bugs found and fixed across these runs - see Automated Run Findings
                    and Code Review Findings)
Skipped:         1  (SPIFF-SMOKE-005)
Blocked:         0
```

**The automated suite has now actually been executed and is confirmed working**, including a full real claim submission (`SPIFF-E2E-001`) producing a genuine tracking number. Earlier attempts to run it from this agent session were refused by a Claude Code "Auto Mode" safety classifier; that was resolved once browser binaries were installed (`npx playwright install chromium`) and a `.claude/settings.json` Bash allow-rule was added by the user - see Automation Gaps for the full history. `SPIFF-SMOKE-005` and the 23 `@regression`/`@e2e` tests beyond `SPIFF-E2E-001` still haven't been run - they need a confirmed BMADMIN account.

## Automated Run Findings

Two runs, credentials temporarily set in `test-data.json`/shell env and reverted immediately after each run (never committed):

**Run 1** - `SPIFF-SMOKE-001` through `SPIFF-SMOKE-004`, `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` and `testData.users.sa` both set to `kleffew@aeshvacinc.com`:
- `[setup] authenticate dealer user` - **passed** (22.8s)
- `SPIFF-SMOKE-001` (SA login, SPIFF nav visible) - **passed** (18.8s)
- `SPIFF-SMOKE-002` (invalid credentials show login error) - **passed** (20.3s)
- `SPIFF-SMOKE-003` (claim form loads with all required fields) - **failed** (46.9s): `TimeoutError` at `SpiffPage.ts:199` inside `SpiffClaimPage.openClaimFormForProgram()` - the row-matching locator (`tr, .card, li, div[class*="row"]` filtered by `hasText: programName`) never found a "Submit a Claim" link to click.
- `SPIFF-SMOKE-004` (Claim History page loads) - **passed** (19.0s)

**Root cause**: `test-data.json`'s `program.activeProgramName` was an empty string (`""`), left blank by the original build since the live program name hadn't been confirmed yet. An empty `hasText` filter matches every element the broad selector finds across the whole page, so `.first()` resolved to something outside the actual CurrentSPIFF campaign table (rather than throwing immediately) and timed out looking for its "Submit a Claim" action.

**Fix applied**: set `activeProgramName` to `"2026 Flip to Samsung"` (the real, confirmed campaign name from this session's earlier live walkthrough - not a secret, safe to commit).

**Run 2** - `SPIFF-SMOKE-003` only, same credentials, after the fix:
- `[setup] authenticate dealer user` - **passed** (18.2s)
- `SPIFF-SMOKE-003` - **passed** (21.6s)

`SPIFF-SMOKE-005` (admin login + Process Claim search) was not run - it needs `testData.users.bmadmin`, and no confirmed BMADMIN-role account was available this session (only Dist Admin/DDA/Spec Rep Dist/Company Representative credentials were supplied, none of which are labeled BMADMIN). The 24 remaining `@regression`/`@e2e` tests in `spiff.spec.ts` were not run either - this session validated the smoke tier only.

## Code Review Findings (this session)

A code review of `spiff.spec.ts` (against copilot-instructions.md, the real `.cshtml` source, and this session's own live findings) surfaced 7 issues; 6 were fixed directly, 1 (multi-file upload support) was explicitly ruled out of scope - the user confirmed the real workflow allows a single-document upload, so `uploadInvoiceDocument` was left single-file and only its broken fixture path was corrected.

Fixed:
1. **`test-data.json` `documents.invoiceFixturePath`** pointed at a file that never existed (`tests/playwright/fixtures/spiff/sample-invoice.pdf`). Fixed to the real fixture (`tests/playwright/fixtures/samsung/spiff/claim-document-sample.pdf`).
2. **`SpiffPage.ts` `openClaimFormForProgram()`'s row locator** (`tr, .card, li, div[class*="row"]`) was a page-wide, Bootstrap-class-based union - the root cause of the `SPIFF-SMOKE-003` failure above. Rescoped to the confirmed `#tblReport` table.
3. **`acceptTerms()`'s `{force: true}`** was unnecessary (confirmed live: `#chkAccept` is a normal visible checkbox) and risked masking a real future regression. Removed.
4. **Duplicated raw login-failure locators** in `SPIFF-SMOKE-002`/`SPIFF-TC-003` (violating "tests call page-object/helper methods only") - extracted to a new `attemptLoginExpectFailure()` helper.
5. **Dead `.catch(() => false)`** around `isVisible()` calls in `expectNoResults()` - `isVisible()` never rejects, so the catches were unreachable. Removed.
6. **`SPIFF-TC-008`'s phone-validation test** didn't fill any other required field first, so a pass couldn't be attributed specifically to the invalid phone. `expectInvalidPhoneBlocksLineItem()` now fills valid synthetic values for every other required field before setting the invalid phone.

Explicitly not changed: `uploadInvoiceDocument`/`ClaimHeaderInput` remain single-file - confirmed by the user that the real workflow supports submitting a claim with just one uploaded document.

## SPIFF-E2E-001 Regression Run (post-fix)

After the review fixes above, `SPIFF-E2E-001` (full claim submission, `kleffew@aeshvacinc.com`) was run for real - and immediately surfaced two more genuine bugs, neither of which were about the fix list above:

1. **`uploadInvoiceDocument()` never waited for Dropzone's upload to actually finish** before `addLineItem()` was called, and its click target (`#dropzone_fuBGImage`) turned out not to be what Dropzone's click handler is actually bound to (confirmed live via network capture and a side-by-side manual-vs-automated comparison - `.uploadBlock`, the outer wrapper, is the real click target). Fixed: `dropzoneUpload` now points at `.uploadBlock`; `uploadInvoiceDocument()` waits for the page to go network-idle before clicking (the click intermittently missed Dropzone's handler entirely when clicked too soon after navigation, while background AJAX calls were still in flight), and then waits for the real `POST .../AddClaim/UploadDoc` response before returning.
2. **`addLineItem()` didn't wait for its own async round-trip to finish** before the caller checked the row count, occasionally reading a stale zero-row state. Fixed: now waits directly for the first claim-line row to appear.
3. **The test's own synthetic `submissionComments` value exceeded the field's 100-char limit** (a limit `SPIFF-TC-012` itself correctly asserts exists) - a self-inflicted test-data bug, not a product defect. Shortened.

After all three fixes, `SPIFF-E2E-001` passed cleanly (37.3s) and produced a real claim tracking number. Also confirmed directly, live: **a single uploaded document is sufficient to submit a claim** - the "upload all three required documents" panel is advisory only, not enforced (resolves the BR-013 "unclear business rule" gap below - now confirmed, not a gap).

## Coverage

**Screens covered live**: Login, Current SPIFF, Submit a Claim (AddClaim). `SearchClaim` and `ProcessClaims` were not exercised live this session (build-time coverage only).

**Workflows covered live**: Full claim-submission workflow (login -> navigate -> upload 3 documents -> fill header + tonnage -> add line item -> accept terms -> submit -> capture tracking number -> logout), repeated once per role/user.

**Roles covered live**: Dist Admin (x2 accounts), DDA (x1), Spec Rep Dist (x1) - all 4 successful. Company Representative (x1) - login failed, workflow not reached.

**Positive scenarios**: Claim submission with all fields populated, 3 documents uploaded, 1 line item, terms accepted - confirmed working end-to-end for 4 of 5 roles, each producing a distinct tracking number.

**Negative/boundary/permission/integration scenarios**: Not exercised live this session (remain build-time-only coverage in `spiff.spec.ts` - unexecuted, see Automation Gaps).

## Manual Walkthrough Results

Separate from the automated run above: a live, manual, cross-role claim-submission walkthrough via Playwright MCP browser automation, performed earlier in this session (2026-09-09) before the automated suite could be executed.

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
- ~~Unclear business rule: whether "upload all three required documents" is enforced~~ **Resolved**: confirmed live via `SPIFF-E2E-001` - a single document is sufficient; the panel is advisory only (BR-013 in `spiff-test-plan.md` updated accordingly).
- **Remaining tiers unexecuted**: `SPIFF-SMOKE-001..004` and `SPIFF-E2E-001` have been run against UAT and pass. `SPIFF-SMOKE-005` and the other 23 `@regression`/`@e2e` tests still need a run - all of them need a confirmed BMADMIN account.
- **Credentials are not persisted anywhere**: `test-data.json`'s `users.*.email`/`.password` fields remain intentionally blank in git. Every automated run in this session required temporarily filling them (and the shell-only `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` env vars for the shared `setup` project), then reverting before any commit. There is currently no gitignored env file or secret store wired up for SPIFF-specific credentials, so this manual fill-and-revert step is required every time until one is set up.
- **Missing test API**: no evidence of an API-assisted setup/cleanup path for SPIFF claims was investigated this session - claims created during the manual walkthrough (tracking #s 6513764-6513767) remain in the UAT system with no cleanup performed (acceptable per the UAT banner's "not processed" behavior, but noted for completeness).
- **Unregistered/unverified role**: Company Representative flow is fully unverified end-to-end (see Failures).

### Resolved this session: `npx playwright test` execution from the agent session

Earlier in this session, two attempts to run `npx playwright test` (a bare `--list`, and a scoped `--grep` smoke run) were refused by the Claude Code "Auto Mode" safety classifier, and a `.claude/settings.json` `Bash(npx playwright test:*)` allow-rule did not change that outcome. A later retry succeeded once Chromium's browser binary was installed (`npx playwright install chromium` - it had never been installed in this environment) - it's unclear whether the missing browser binary, the settings rule, or something else in the environment was the actual deciding factor, since the classifier gave no diagnostic detail on why it refused. Recorded here in case the block recurs for a future run.

## Application Defects

None identified with sufficient evidence to classify as an application defect. The Company Representative login failure (see Failures) is left as `UNKNOWN` rather than classified as an application defect, since a credential/registration issue on the test-data side is at least as likely as a genuine application bug.

## Follow-ups Recorded Elsewhere

- Page-object corrections made this session (comment/documentation only, no locator changes were needed beyond clarifying accuracy): `tests/playwright/pages/samsung/spiff/feature-spiff/SpiffPage.ts` - `uploadedFileNameLink` and `acceptTerms()` comments updated to reflect live-confirmed behavior.
- **Data fix (committed, not a defect fix)**: `tests/playwright/data/samsung/spiff/feature-spiff/test-data.json` - `program.activeProgramName` set to `"2026 Flip to Samsung"` (was blank), found by the automated `SPIFF-SMOKE-003` failure in this session's run.
- Full field/locator confirmation table: `spiff-discovery.md` Section 4.
