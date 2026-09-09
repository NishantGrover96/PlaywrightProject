# SPIFF - SPIFF (Flip to Samsung) - Smoke Suite
Generated: 2026-09-09
Tests: 5 | Priority: P1-Critical only

---

## Purpose

Smoke tests validate the minimum viable state of the SPIFF (Flip to Samsung) feature.
If any smoke test fails, automation is blocked.

---

## SPIFF-SMOKE-001 - SA logs in and sees SPIFF navigation
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Precondition**: Valid SA credentials
- **Steps**:
  1. Log in with SA credentials at `/account/login`
- **Expected**: "SPIFF" nav link visible on the post-login dashboard
- **Assertions**:
  - `getByRole('link', { name: 'SPIFF', exact: true })` visible
- **Test Data**: SA credentials (`test-data.json` `users.sa`)

---

## SPIFF-SMOKE-002 - invalid credentials show login error
- **Tier**: Smoke
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-012
- **Precondition**: None
- **Steps**:
  1. Submit the login form with a valid username and wrong password
- **Expected**: `#dvloginMessage` error message visible
- **Assertions**:
  - `#dvloginMessage` visible within 45s
- **Test Data**: None (deliberately wrong password)

---

## SPIFF-SMOKE-003 - claim form loads with all required fields
- **Tier**: Smoke
- **Category**: UI
- **Priority**: P1-Critical
- **BR Covered**: BR-002
- **Precondition**: SA logged in; an active SPIFF program exists
- **Steps**:
  1. Navigate to `/Rewards/SPIFF/CurrentSPIFF`
  2. Open the claim form for the active program's "Submit a Claim" action
- **Expected**: Quote Number, Date of Sale, Project Name, document upload zone, and Add line item button all visible
- **Assertions**:
  - `#txtInvoiceNo`, `#txtDateOfSale`, `#txtProjectName`, `#dropzone_fuBGImage`, `#btnAddItem` all visible
- **Test Data**: `test-data.json` `program.activeProgramName`

---

## SPIFF-SMOKE-004 - View Claim History page loads with search filters
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-007
- **Precondition**: SA logged in
- **Steps**:
  1. Navigate to `/Rewards/SPIFF/SearchClaim`
- **Expected**: Claim ID, Quote Number filter inputs and Search button visible
- **Assertions**:
  - `input[name="ClaimID"]`, `input[name="InvoiceNo"]`, `#btnSearch` all visible
- **Test Data**: SA credentials

---

## SPIFF-SMOKE-005 - admin logs in and can open Process Claim search
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-008
- **Precondition**: Valid admin (BMADMIN) credentials
- **Steps**:
  1. Log in as admin
  2. Navigate to `/Rewards/SPIFF/SearchClaim?action=process`
- **Expected**: Claim ID filter visible for the process-mode search
- **Assertions**:
  - `input[name="ClaimID"]` visible
- **Test Data**: `test-data.json` `users.bmadmin`

---

## Automation Notes

```ts
// Playwright fixture - SA smoke
test('SPIFF-SMOKE-001 - SA sees SPIFF nav', async ({ page }) => {
  await loginAsSpiffUser(page, testData.users.sa.email, testData.users.sa.password);
  await expect(page.getByRole('link', { name: 'SPIFF', exact: true }).first()).toBeVisible();
});

// Playwright fixture - invalid login
test('SPIFF-SMOKE-002 - invalid credentials show error', async ({ page }) => {
  await page.goto('/account/login');
  await page.locator('#UserLogin_Username').fill('sa@example.com');
  await page.locator('#UserLogin_Password').fill('WrongPassword@0000');
  await page.locator('#btnLogin').click();
  await expect(page.locator('#dvloginMessage')).toBeVisible({ timeout: 45_000 });
});
```
