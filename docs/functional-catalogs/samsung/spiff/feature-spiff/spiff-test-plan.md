# SPIFF (Flip to Samsung) - Test Plan

Generated: 2026-09-09
Companion docs: [spiff-discovery.md](./spiff-discovery.md), [test-catalog.md](./test-catalog.md), [spiff-coverage-report.md](./spiff-coverage-report.md)

## 1. Module Overview

Sales-associate-facing claim submission for the Samsung "Flip to Samsung" SPIFF program, plus the admin/SCF-facing search and approve/deny/hold workflow. See `spiff-discovery.md` for the full screen inventory and confirmed field/locator map.

## 2. Scope

- Claim submission (`AddClaim`): header fields, tonnage, document upload, multi-line-item claims, terms acceptance, submission, tracking-number confirmation.
- Claim history / admin search (`SearchClaim`): SA-scoped history search, admin cross-claim search with extended filters.
- Admin claim processing (`ProcessClaims`): per-line approve/deny/hold with reason and comment.
- Role-based access to the SPIFF module (nav visibility / route authorization).

## 3. Out of Scope

- Company Representative self-registration (`Registration.cshtml`) and W9/tax-gating (`SaveW9TaxInformation.cshtml`) - deferred pending a live-app pass to confirm field IDs (address-validation-heavy form, not yet explored).
- SPIFF program creation (`CreateSpiff.cshtml`, admin-side).
- Payment/reconciliation processing after admin approval (downstream of this UI).
- Email notification content/delivery.

## 4. Environment

- UAT: `https://samsungportaluat.channel-fusion.com` (confirmed live 2026-09-09 - displays an explicit "test site, not processed" banner on `AddClaim`).
- Production equivalent referenced by the UAT banner: `https://portal.samsunghvac.com` (not used for automation).

## 5. Roles

| Role | Confirmed access to SPIFF (this session) |
|---|---|
| Dist Admin | Yes - 2 accounts tested, both submitted claims successfully |
| DDA | Yes - 1 account tested, submitted claim successfully |
| Spec Rep Dist | Yes - 1 account tested, submitted claim successfully |
| Company Representative | **Unconfirmed** - supplied test account failed login |
| Admin/SCF (claim processing) | Not tested live this session (build-time only, via `SpiffAdminProcessPage`) |

Verify behavior rather than relying on role names (per skill guidance) - only the 4 roles above were actually exercised against the live app; `test-data.json`'s remaining role entries (BMDM/BMRM/BMMGT/BMNM/FAST/OAM/SA/etc., inherited from the incentive-dashboard template) are unconfirmed for SPIFF specifically.

## 6. Screens

See `spiff-discovery.md` Section 2 for the full route table.

## 7. Workflows

1. **Claim submission**: CurrentSpiff -> AddClaim -> fill header + tonnage -> upload at least 1 document (up to 3 recommended by the UI, not enforced - see BR-013) -> Add line item (repeatable for multiple lines) -> accept terms -> Submit your claim -> tracking number.
2. **Claim history (SA)**: SearchClaim -> filter by Claim ID / Quote Number -> view own claims only.
3. **Claim search + processing (admin)**: SearchClaim `?action=process` -> locate claim -> ProcessClaims -> select line(s) -> set status (approve/deny + reason/comment) -> Process -> success message.

## 8. Business Rules

See `test-catalog.md`'s BR-001..BR-012 table - carried forward unchanged from the prior build, cross-checked against this session's live findings with no contradictions found, plus one addition below.

- **BR-013 (confirmed)**: The "upload all three required documents" panel (Project-Specification, Mechanical Schedule w/ Competitor's Product, Stamped Mechanical Schedule w/ Samsung Products) is advisory only, not enforced - confirmed live via `SPIFF-E2E-001`, which successfully submitted a claim with a single uploaded document.

## 9. Validation Matrix

| Field | Required | Confirmed live |
|---|---|---|
| Upload Documents | At least 1 (UI suggests 3, not enforced) | Confirmed live via `SPIFF-E2E-001` - single-document submission succeeds (BR-013) |
| Samsung Quote Number | Yes | Format not probed (free text accepted) |
| Date of Sale | Yes | Must be set via datepicker widget, not typed |
| Project Name/City/State | Yes | Free text, no format constraint observed |
| Original BOD | Yes | Free text |
| Engineering Firm/Contact/Phone/Email | Yes | Phone auto-format and email blur-validation asserted only in the (unexecuted) automated suite - not manually re-verified live this session |
| Submission Comments | No | maxlength=100 per prior build, not re-verified live |
| Tonnage (R410A, Other) | Yes ("or 0") | Accepts numeric text; both fields were filled with non-zero/zero values successfully live |
| Accept Terms | Yes | Confirmed required for submission to succeed (checked on every live submission) |

## 10. Positive Scenarios

- Submit a claim with all fields populated + 3 documents uploaded + 1 line item -> success (confirmed live x4).
- Multiple line items on one claim (build-time coverage only, not exercised live).
- SA views own claim history (build-time coverage only).
- Admin approves/denies claim lines (build-time coverage only).

## 11. Negative Scenarios

- Invalid engineering phone/email (build-time coverage only - `SPIFF-TC-008`, `SPIFF-TC-010`).
- Non-existent Claim ID search (build-time coverage only - `SPIFF-TC-017`).
- Invalid login credentials (build-time coverage: `SPIFF-SMOKE-002`/`SPIFF-TC-003`; **live-confirmed** this session for the Company Representative account, though that occurrence was an unplanned real failure, not a deliberate negative test).

## 12. Boundary/Edge Scenarios

- Submission Comments at/over 100 characters (build-time only).
- Zero-tonnage submission on both product categories simultaneously (not exercised - all live claims set a non-zero R410A tonnage).
- Fewer than 3 uploaded documents (not exercised - see BR-013 gap).

## 13. Permission Scenarios

- Non-eligible role should not see SPIFF nav (build-time only, `SPIFF-TC-006`).
- SA should not see other SAs' claims (build-time only, `SPIFF-TC-018`).
- Cross-role field/menu differences beyond the 4 roles tested live - unconfirmed (see Discovery Section 6).

## 14. Integration Scenarios

- Document upload persistence (`/Documents/Samsung/Rewards/SPIFF/ClaimDocuments/...` - confirmed live, files render as downloadable links post-upload).
- Claim tracking number generation and display (confirmed live x4: 6513764-6513767, sequential).

## 15. Smoke Candidates

`SPIFF-SMOKE-001` through `SPIFF-SMOKE-004`: automated and **passing** against UAT as of 2026-09-09 (see `spiff-coverage-report.md`). `SPIFF-SMOKE-005` (admin): not yet run - needs a confirmed BMADMIN account.

## 16. Regression Candidates

`test-catalog.md`'s existing 21 regression tests (`SPIFF-TC-001..021`) - not yet executed against the live app, except indirectly via the code-review fixes verified through `SPIFF-E2E-001` (see below).

## 16a. E2E Candidates

`SPIFF-E2E-001` (SA submits a full claim end-to-end): automated and **passing** against UAT as of 2026-09-09, after fixing 3 real synchronization/data bugs found during this run (see `spiff-coverage-report.md`'s "SPIFF-E2E-001 Regression Run" section). `SPIFF-E2E-002` (admin processing): not yet run - needs a confirmed BMADMIN account and an existing processable claim.

## 17. Automation Risks / Gaps

1. **Most of the suite has been executed.** `SPIFF-SMOKE-001..004` and `SPIFF-E2E-001` pass against UAT (confirmed 2026-09-09). The 21 regression tests, `SPIFF-E2E-002`, and `SPIFF-SMOKE-005` still need a run - all need a confirmed BMADMIN account. Run them from a local terminal (the `npx playwright test` Auto-Mode execution block encountered earlier in this session's history was eventually worked around - see `spiff-coverage-report.md`'s "Resolved this session" note - but the exact fix is unconfirmed, so budget for it recurring):
   ```
   CLIENT_ID=samsung TEST_ENV=uat BASE_URL=https://samsungportaluat.channel-fusion.com TEST_USER_EMAIL="<user>" TEST_USER_PASSWORD="<pass>" npx playwright test tests/playwright/specs/samsung/spiff/feature-spiff/spiff.spec.ts --project=chromium --reporter=list
   ```
   (temporarily fill the relevant `testData.users.*.email`/`.password` fields to match the credentials used for `TEST_USER_EMAIL`/`PASSWORD` above, run, then blank them again before committing - never commit real credentials into `test-data.json`). `SPIFF-SMOKE-005` and any `bmadmin`-role test additionally need a confirmed admin account, which this session did not have.
2. Registration/tax-gating/program-creation flows remain unautomated (see Scope).
3. Document-upload-count assertion helper is missing (`uploadedFileNameLink` locator does not reliably reflect the multi-file state - see Discovery Section 4). Not currently needed since single-document upload is the confirmed-sufficient path (BR-013), but would matter if multi-document assertions are added later.
4. Company Representative role is unverified end-to-end - the one live credential set provided failed login.
5. Role-specific UI differences beyond the 4 tested roles are unconfirmed.
6. No gitignored env file or secret store is wired up for SPIFF credentials yet - every run this session required a manual fill-and-revert of `test-data.json`/shell env vars, which is error-prone as a recurring workflow.
7. `test-data.json`'s `expectedEndpoints` block appears to have a systematic naming mismatch - values like `"OnPostUploadDoc"` don't match the real URLs (confirmed live: the actual endpoint is `.../AddClaim/UploadDoc`, no "OnPost" prefix). Not currently used by any test, so not fixed this session - flagged for whoever wires it up next.
