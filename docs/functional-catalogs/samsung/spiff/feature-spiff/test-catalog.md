# SPIFF - SPIFF (Flip to Samsung) - Functional Test Catalog
Generated: 2026-09-09
Total Test Cases: 28 (Smoke: 5 | Regression: 21 | E2E: 2)

---

## Business Rules Covered: 12 (BR-001 - BR-012)

| BR | Rule |
|---|---|
| BR-001 | Full approval required for payment: `access_flag`, `taxation_flag`, `store_owner_approval_flag`, `admin_approval_flag` must all = `Y` before a payment can be released |
| BR-002 | Claim submission requires Quote Number, Date of Sale, Project fields, Engineering fields, and tonnage for at least one product category |
| BR-003 | Engineering phone must be a valid 10-digit number (auto-formatted `XXX-XXX-XXXX`); an invalid number blocks "Add line item" and shows `#spnPhoneError` |
| BR-004 | Engineering email is validated on blur; an invalid address shows `#spnEmailError` |
| BR-005 | Terms & Conditions acceptance (`#chkAccept`) is required before a claim can be submitted |
| BR-006 | A successful submission generates and displays a claim tracking number (`.spnClaimNumber`) |
| BR-007 | SA claim history search is scoped to the authenticated SA's own claims only (no cross-SA visibility) |
| BR-008 | Admin/SCF roles can search across all claims with extended filters (Business Number, SPIFF, Store, Sales Associate, date range) |
| BR-009 | Admin claim processing: each claim line is individually approved (status 4) or denied (status 5) with a denial/approval reason and comment |
| BR-010 | Existing `SPEC REP` / Distributor-family (`BMDIST`/`DIST`/`GDIST`/`RDIST`) users access SPIFF without being routed through duplicate self-registration |
| BR-011 | Non-SPIFF-eligible roles do not see the SPIFF navigation entry (server-side authorization, not just hidden UI) |
| BR-012 | Unauthenticated access to any SPIFF page redirects to `/Account/Login` |

---

## Test Cases

### Smoke Suite (5 tests)

#### SPIFF-SMOKE-001 - SA logs in and sees SPIFF navigation
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Precondition**: Valid SA credentials
- **Steps**: 1. Log in with SA credentials.
- **Expected**: "SPIFF" nav link visible on the dashboard
- **Assertions**: `getByRole('link', { name: 'SPIFF', exact: true })` visible

#### SPIFF-SMOKE-002 - invalid credentials show login error
- **Tier**: Smoke
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Precondition**: None
- **Steps**: 1. Submit login form with a wrong password.
- **Expected**: `#dvloginMessage` error visible
- **Assertions**: `#dvloginMessage` visible within 45s

#### SPIFF-SMOKE-003 - claim form loads with all required fields
- **Tier**: Smoke
- **Category**: UI
- **Priority**: P1-Critical
- **BR Covered**: BR-002
- **Precondition**: SA logged in; an active SPIFF program exists
- **Steps**: 1. Navigate to CurrentSPIFF. 2. Open claim form for the active program.
- **Expected**: Quote Number, Date of Sale, Project Name, upload zone, and Add line item button all visible
- **Assertions**: `#txtInvoiceNo`, `#txtDateOfSale`, `#txtProjectName`, `#dropzone_fuBGImage`, `#btnAddItem` all visible

#### SPIFF-SMOKE-004 - View Claim History page loads with search filters
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-007
- **Precondition**: SA logged in
- **Steps**: 1. Navigate to `/Rewards/SPIFF/SearchClaim`.
- **Expected**: Claim ID, Quote Number inputs and Search button visible
- **Assertions**: `input[name="ClaimID"]`, `input[name="InvoiceNo"]`, `#btnSearch` all visible

#### SPIFF-SMOKE-005 - admin logs in and can open Process Claim search
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-008
- **Precondition**: Valid admin (BMADMIN) credentials
- **Steps**: 1. Log in as admin. 2. Navigate to `/Rewards/SPIFF/SearchClaim?action=process`.
- **Expected**: Claim ID filter visible
- **Assertions**: `input[name="ClaimID"]` visible

---

### Regression Suite (21 tests)

#### SPIFF-TC-001 - valid SA credentials load the dashboard
- **Tier**: Regression | **Category**: Authentication | **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Steps**: Log in with valid SA credentials.
- **Expected**: SPIFF nav visible.

#### SPIFF-TC-002 - valid admin credentials load the admin dashboard
- **Tier**: Regression | **Category**: Authentication | **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Steps**: Log in with valid admin credentials.
- **Expected**: SPIFF nav visible.

#### SPIFF-TC-003 - admin invalid credentials show login error
- **Tier**: Regression | **Category**: Security | **Priority**: P2-High
- **BR Covered**: BR-012
- **Steps**: Submit admin login with wrong password.
- **Expected**: `#dvloginMessage` visible.

#### SPIFF-TC-004 - existing SPEC REP user accesses SPIFF without duplicate registration
- **Tier**: Regression | **Category**: Authorization | **Priority**: P1-Critical
- **BR Covered**: BR-010
- **Steps**: Log in as an existing SPR-role user; check SPIFF nav.
- **Expected**: SPIFF nav visible; user is not redirected to `/Rewards/SPIFF/Registration`.

#### SPIFF-TC-005 - existing Distributor-family user accesses SPIFF without duplicate registration
- **Tier**: Regression | **Category**: Authorization | **Priority**: P1-Critical
- **BR Covered**: BR-010
- **Steps**: Log in as an existing Distributor-family user; check SPIFF nav.
- **Expected**: SPIFF nav visible; no redirect to Registration.

#### SPIFF-TC-006 - non-eligible user does not see the SPIFF navigation entry
- **Tier**: Regression | **Category**: Authorization | **Priority**: P1-Critical
- **BR Covered**: BR-011
- **Steps**: Log in as a non-eligible role; inspect nav.
- **Expected**: No "SPIFF" nav link present.

#### SPIFF-TC-007 - claim form fields are all present
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-002
- **Expected**: Project City/State, Original BOD, Engineering Firm/Contact/Phone/Email inputs all visible.

#### SPIFF-TC-008 - invalid engineering phone blocks line item addition
- **Tier**: Regression | **Category**: Validation | **Priority**: P1-Critical
- **BR Covered**: BR-003
- **Expected**: `#spnPhoneError` visible; `#tblClaimLines` has 0 rows.

#### SPIFF-TC-009 - engineering phone auto-formats as XXX-XXX-XXXX
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-003
- **Expected**: `#txtEngineeringPhone` value formats to `123-456-7890` from `1234567890`.

#### SPIFF-TC-010 - invalid engineering email shows validation error on blur
- **Tier**: Regression | **Category**: Validation | **Priority**: P2-High
- **BR Covered**: BR-004
- **Expected**: `#spnEmailError` visible after blur on an invalid address.

#### SPIFF-TC-011 - tonnage fields accept a valid entry
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-002
- **Expected**: `#txtQuantityR410A` / `#txtQuantityOther` hold the entered values.

#### SPIFF-TC-012 - submission comments field caps at 100 characters client-side
- **Tier**: Regression | **Category**: Validation | **Priority**: P4-Low
- **BR Covered**: BR-002
- **Expected**: `#txtSubmissionComments` has `maxlength="100"`.

#### SPIFF-TC-013 - accepting terms checkbox is required before submission
- **Tier**: Regression | **Category**: Validation | **Priority**: P2-High
- **BR Covered**: BR-005
- **Expected**: `#chkAccept` unchecked by default.

#### SPIFF-TC-014 - Terms and Conditions link is present and opens in a new tab
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-005
- **Expected**: Terms link visible with `target="_blank"`.

#### SPIFF-TC-015 - search by known Claim # returns at least one result
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-007
- **Expected**: `#tblReport` shows ≥ 1 row.

#### SPIFF-TC-016 - search by known Quote Number returns at least one result
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-007
- **Expected**: `#tblReport` shows ≥ 1 row.

#### SPIFF-TC-017 - search by non-existent Claim ID shows no results
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Expected**: No data rows rendered (table absent, or a `dataTables_empty` row, or 0 rows).

#### SPIFF-TC-018 - SA only sees their own claims (no other SA rows)
- **Tier**: Regression | **Category**: Security | **Priority**: P1-Critical
- **BR Covered**: BR-007
- **Expected**: The admin-only Business Name/Branch filter (`#dropdownStoreOwner`) is absent for the SA role, evidencing server-side scoping.

#### SPIFF-TC-019 - Process Claim page loads with bulk action buttons
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-009
- **Expected**: `#btnApprove`, `#btnDeny`, `#btnhold` all visible.

#### SPIFF-TC-020 - approving first line item and denying the rest processes successfully
- **Tier**: Regression | **Category**: Workflow | **Priority**: P1-Critical
- **BR Covered**: BR-009
- **Expected**: `.divSuccessMsg` visible after `#btnProcess` click.

#### SPIFF-TC-021 - admin claim processing requires at least one selected line item
- **Tier**: Regression | **Category**: Validation | **Priority**: P2-High
- **BR Covered**: BR-009
- **Expected**: `#tblClaimLines` has ≥ 1 row available to select.

---

### E2E Suite (2 tests)

#### SPIFF-E2E-001 - SA submits a full claim end-to-end and receives a tracking number
- **Tier**: E2E | **Category**: WorkflowE2E | **Priority**: P1-Critical
- **BR Covered**: BR-002, BR-003, BR-004, BR-005, BR-006
- **Steps**: Login -> open claim form -> fill header fields -> tonnage -> upload invoice -> add line item -> accept terms -> submit -> capture claim number -> logout.
- **Expected**: Non-empty claim number captured; session cleanly logged out.

#### SPIFF-E2E-002 - admin finds a submitted claim via search and processes it end-to-end
- **Tier**: E2E | **Category**: WorkflowE2E | **Priority**: P1-Critical
- **BR Covered**: BR-008, BR-009
- **Steps**: Login as admin -> process search by Claim # -> open Process action -> approve line 1 / deny rest with reason + comment -> submit -> logout.
- **Expected**: `.divSuccessMsg` visible; session cleanly logged out.

---

## Notes

All tests derived from:
- `D:\VS Workspace\Samsung\Portal\playwright-tests\tests\flip-claim-submission.spec.js`
- `D:\VS Workspace\Samsung\Portal\playwright-tests\tests\flip-program-test-suite.spec.js`
- `D:\VS Workspace\Samsung\Portal\docs\modules\SPIFF.instructions.md`
- `D:\VS Workspace\Samsung\Portal\docs\scenarios\spiff-scenarios.md`
- `AddClaim.cshtml` / `.cs`, `ProcessClaims.cshtml` / `.cs`, `SearchClaim.cshtml` / `.cs`

Registration, tax-gating (SPIFF-04/05), and SPIFF program creation (SPIFF-08) scenarios from `spiff-scenarios.md`
are **not yet covered** by generated Playwright specs - `Registration.cshtml`'s address-validation-heavy form and
`SaveW9TaxInformation.cshtml` need a live-app UI pass to confirm field IDs before locators can be written
(see the Locator Validation Report in the build report for what was and wasn't confirmed).
