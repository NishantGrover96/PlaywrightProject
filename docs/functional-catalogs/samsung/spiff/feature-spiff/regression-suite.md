# SPIFF - SPIFF (Flip to Samsung) - Regression Suite
Generated: 2026-09-09
Tests: 21 | Priorities: P1-Critical, P2-High, P3-Medium, P4-Low

---

## Purpose

Regression tests cover all functional paths: authentication, role-based access scoping,
claim submission form validation, claim history search scoping, and admin claim processing.

---

### SPIFF-TC-001 - valid SA credentials load the dashboard
- **Tier**: Regression | **Category**: Authentication | **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Precondition**: Valid SA credentials
- **Steps**: 1. Log in with valid SA credentials.
- **Expected**: SPIFF nav link visible
- **Assertions**: `getByRole('link', { name: 'SPIFF', exact: true })` visible

---

### SPIFF-TC-002 - valid admin credentials load the admin dashboard
- **Tier**: Regression | **Category**: Authentication | **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Precondition**: Valid admin credentials
- **Steps**: 1. Log in with valid admin credentials.
- **Expected**: SPIFF nav link visible
- **Assertions**: SPIFF nav visible

---

### SPIFF-TC-003 - admin invalid credentials show login error
- **Tier**: Regression | **Category**: Security | **Priority**: P2-High
- **BR Covered**: BR-012
- **Precondition**: None
- **Steps**: 1. Submit admin login with wrong password.
- **Expected**: `#dvloginMessage` visible
- **Assertions**: Error message visible within 45s

---

### SPIFF-TC-004 - existing SPEC REP user accesses SPIFF without duplicate registration
- **Tier**: Regression | **Category**: Authorization | **Priority**: P1-Critical
- **BR Covered**: BR-010
- **Precondition**: Existing portal user with role `SPR`
- **Steps**: 1. Log in as SPEC REP user. 2. Inspect SPIFF nav and current URL.
- **Expected**: SPIFF nav visible; no redirect to `/Rewards/SPIFF/Registration`
- **Assertions**: Nav visible; URL does not match Registration route
- **Test Data**: Requires a real SPEC REP account (`test-data.json` `users.specRep`)

---

### SPIFF-TC-005 - existing Distributor-family user accesses SPIFF without duplicate registration
- **Tier**: Regression | **Category**: Authorization | **Priority**: P1-Critical
- **BR Covered**: BR-010
- **Precondition**: Existing portal user with a Distributor-family role
- **Steps**: 1. Log in as Distributor-family user. 2. Inspect SPIFF nav and current URL.
- **Expected**: SPIFF nav visible; no redirect to Registration
- **Assertions**: Nav visible; URL does not match Registration route
- **Test Data**: Requires a real Distributor-family account (`test-data.json` `users.distributor`)

---

### SPIFF-TC-006 - non-eligible user does not see the SPIFF navigation entry
- **Tier**: Regression | **Category**: Authorization | **Priority**: P1-Critical
- **BR Covered**: BR-011
- **Precondition**: User with no SPIFF-eligible role
- **Steps**: 1. Log in as non-eligible user. 2. Inspect nav.
- **Expected**: No "SPIFF" nav link present
- **Assertions**: `getByRole('link', { name: 'SPIFF', exact: true })` count = 0
- **Test Data**: Requires a real non-eligible account (`test-data.json` `users.nonEligible`)

---

### SPIFF-TC-007 - claim form fields are all present
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-002
- **Precondition**: SA logged in; claim form open
- **Steps**: 1. Open claim form. 2. Inspect fields.
- **Expected**: Project City/State, Original BOD, Engineering Firm/Contact/Phone/Email inputs all visible
- **Assertions**: All listed fields visible

---

### SPIFF-TC-008 - invalid engineering phone blocks line item addition
- **Tier**: Regression | **Category**: Validation | **Priority**: P1-Critical
- **BR Covered**: BR-003
- **Precondition**: Claim form open
- **Steps**: 1. Fill an invalid (5-digit) phone number. 2. Click "Add line item".
- **Expected**: `#spnPhoneError` visible; no line item added
- **Assertions**: `#spnPhoneError` visible; `#tblClaimLines tbody tr` count = 0

---

### SPIFF-TC-009 - engineering phone auto-formats as XXX-XXX-XXXX
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-003
- **Precondition**: Claim form open
- **Steps**: 1. Type `1234567890` into the phone field.
- **Expected**: Field value formats to `123-456-7890`
- **Assertions**: `#txtEngineeringPhone` value equals `123-456-7890`

---

### SPIFF-TC-010 - invalid engineering email shows validation error on blur
- **Tier**: Regression | **Category**: Validation | **Priority**: P2-High
- **BR Covered**: BR-004
- **Precondition**: Claim form open
- **Steps**: 1. Fill an invalid email. 2. Blur the field.
- **Expected**: `#spnEmailError` visible
- **Assertions**: `#spnEmailError` visible

---

### SPIFF-TC-011 - tonnage fields accept a valid entry
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-002
- **Precondition**: Claim form open
- **Steps**: 1. Fill both tonnage fields with valid numeric values.
- **Expected**: Values persist in each field
- **Assertions**: `#txtQuantityR410A` / `#txtQuantityOther` values match input

---

### SPIFF-TC-012 - submission comments field caps at 100 characters client-side
- **Tier**: Regression | **Category**: Validation | **Priority**: P4-Low
- **BR Covered**: BR-002
- **Precondition**: Claim form open
- **Steps**: 1. Inspect `#txtSubmissionComments` attributes.
- **Expected**: `maxlength="100"`
- **Assertions**: Attribute present with value `100`

---

### SPIFF-TC-013 - accepting terms checkbox is required before submission
- **Tier**: Regression | **Category**: Validation | **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: Claim form open, not yet accepted
- **Steps**: 1. Inspect `#chkAccept` initial state.
- **Expected**: Unchecked by default
- **Assertions**: `#chkAccept` not checked

---

### SPIFF-TC-014 - Terms and Conditions link is present and opens in a new tab
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-005
- **Precondition**: Claim form open
- **Steps**: 1. Locate the "SPIFF Terms and Conditions" link.
- **Expected**: Link visible with `target="_blank"`
- **Assertions**: Link visible; `target` attribute = `_blank`

---

### SPIFF-TC-015 - search by known Claim # returns at least one result
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-007
- **Precondition**: A known claim exists for the SA test account
- **Steps**: 1. Search by Claim #.
- **Expected**: `#tblReport` shows ≥ 1 row
- **Assertions**: Row count > 0
- **Test Data**: `test-data.json` `claimHistory.knownClaimId`

---

### SPIFF-TC-016 - search by known Quote Number returns at least one result
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-007
- **Precondition**: A known quote number exists for the SA test account
- **Steps**: 1. Search by Samsung Quote Number.
- **Expected**: `#tblReport` shows ≥ 1 row
- **Assertions**: Row count > 0
- **Test Data**: `test-data.json` `claimHistory.knownQuoteNumber`

---

### SPIFF-TC-017 - search by non-existent Claim ID shows no results
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: None
- **Steps**: 1. Search by a Claim ID that does not exist.
- **Expected**: No data rows rendered
- **Assertions**: Table absent, or a `dataTables_empty` row, or 0 rows

---

### SPIFF-TC-018 - SA only sees their own claims (no other SA rows)
- **Tier**: Regression | **Category**: Security | **Priority**: P1-Critical
- **BR Covered**: BR-007
- **Precondition**: SA account with historical claims
- **Steps**: 1. Search claim history as SA (no filters).
- **Expected**: Admin-only Business Name/Branch filter absent, evidencing server-side scoping to the SA's own data
- **Assertions**: `#dropdownStoreOwner` count = 0

---

### SPIFF-TC-019 - Process Claim page loads with bulk action buttons
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-009
- **Precondition**: Admin logged in; a processable claim exists
- **Steps**: 1. Search claim in process mode. 2. Open Process action.
- **Expected**: `#btnApprove`, `#btnDeny`, `#btnhold` all visible
- **Assertions**: All three buttons visible

---

### SPIFF-TC-020 - approving first line item and denying the rest processes successfully
- **Tier**: Regression | **Category**: Workflow | **Priority**: P1-Critical
- **BR Covered**: BR-009
- **Precondition**: Admin logged in; a processable claim with ≥ 1 line item exists
- **Steps**: 1. Check all line items. 2. Set line 1 = Approve, remaining = Deny. 3. Select a reason and enter a comment per line. 4. Click Process.
- **Expected**: `.divSuccessMsg` visible
- **Assertions**: Success message visible

---

### SPIFF-TC-021 - admin claim processing requires at least one selected line item
- **Tier**: Regression | **Category**: Validation | **Priority**: P2-High
- **BR Covered**: BR-009
- **Precondition**: Admin logged in; a processable claim exists
- **Steps**: 1. Open Process Claim page. 2. Inspect line item count.
- **Expected**: At least one line item available to select
- **Assertions**: `#tblClaimLines tbody tr` count > 0

---

## Automation Notes

```ts
// Example: invalid phone blocks line item add
test('SPIFF-TC-008 - invalid phone blocks add', async ({ page }) => {
  const claimPage = await openClaimForm(page, testData.program.activeProgramName);
  await claimPage.engineeringPhoneInput.fill('12345');
  await claimPage.addLineItemButton.click();
  await expect(claimPage.engineeringPhoneError).toBeVisible();
  await expect(claimPage.claimLinesRows).toHaveCount(0);
});

// Example: admin approve/deny processing
test('SPIFF-TC-020 - approve first, deny rest', async ({ page }) => {
  const historyPage = await navigateToProcessSearch(page);
  await historyPage.searchByClaimId(testData.claimHistory.knownClaimId);
  await historyPage.clickSearch('process');
  const processPage = await openProcessClaimFromHistory(historyPage, testData.claimHistory.knownClaimId);
  await processClaimApproveFirstDenyRest(processPage);
  await expect(processPage.successMessage).toBeVisible();
});
```
