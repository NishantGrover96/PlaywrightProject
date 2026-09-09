# SPIFF - SPIFF (Flip to Samsung) - E2E Suite
Generated: 2026-09-09
Tests: 2 | Priority: P1-Critical

---

## Purpose

End-to-end workflows validate the full user journey from authentication through
claim submission and admin processing, each exercising multiple business rules
in a single uninterrupted flow - mirroring the two-actor structure of
`flip-claim-submission.spec.js` (SA submits -> Admin processes).

---

## SPIFF-E2E-001 - SA submits a full claim end-to-end and receives a tracking number
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P1-Critical
- **BR Covered**: BR-002, BR-003, BR-004, BR-005, BR-006
- **Precondition**: Valid SA credentials; an active SPIFF program with claim submission open; a real invoice fixture file
- **Steps**:
  1. Log in as SA
  2. Navigate to CurrentSPIFF and open the claim form for the active program
  3. Fill header fields (Quote Number, Date of Sale, Project Name/City/State, Original BOD, Engineering Firm/Contact/Phone/Email)
  4. Fill tonnage for at least one product category
  5. Upload the invoice document via Dropzone
  6. Click "Add line item" and confirm a claim line row was added
  7. Accept Terms & Conditions
  8. Submit the claim
  9. Capture the generated claim tracking number
  10. Log out
- **Expected**: Claim submits successfully; a non-empty tracking number is returned; session logs out cleanly
- **Assertions**:
  - `#tblClaimLines tbody tr` count ≥ 1 after "Add line item"
  - `#chkAccept` checked before submission
  - `.spnClaimNumber` non-empty after submission
  - Redirected back to the login form after logout

---

## SPIFF-E2E-002 - admin finds a submitted claim via search and processes it end-to-end
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P1-Critical
- **BR Covered**: BR-008, BR-009
- **Precondition**: Valid admin credentials; a submitted claim in a processable status exists
- **Steps**:
  1. Log in as admin
  2. Navigate to the process-mode claim search
  3. Search by the known Claim #
  4. Click the "Process" action for the matched row
  5. Check every claim line item
  6. Set line 1 to Approve, remaining lines to Deny
  7. Select a denial/approval reason and enter a comment for each line
  8. Click "Process"
  9. Confirm the success message
  10. Log out
- **Expected**: Claim is processed successfully with mixed approve/deny outcomes; session logs out cleanly
- **Assertions**:
  - `.divSuccessMsg` visible after processing
  - Redirected back to the login form after logout

---

## Automation Notes

```ts
// E2E fixture: SA full claim submission
test('SPIFF-E2E-001 - SA submits claim end-to-end', async ({ page }) => {
  await loginAsSpiffUser(page, testData.users.sa.email, testData.users.sa.password);
  const claimPage = await openClaimForm(page, testData.program.activeProgramName);
  const claimNumber = await submitFullClaim(
    claimPage,
    testData.claim,
    { r410a: testData.claim.tonnageR410A, other: testData.claim.tonnageOther },
    testData.documents.invoiceFixturePath
  );
  expect(claimNumber).toBeTruthy();
  await logoutSpiffUser(page);
});

// E2E fixture: admin processes the claim
test('SPIFF-E2E-002 - admin processes claim', async ({ page }) => {
  await loginAsSpiffUser(page, testData.users.bmadmin.email, testData.users.bmadmin.password);
  const historyPage = await navigateToProcessSearch(page);
  await historyPage.searchByClaimId(testData.claimHistory.knownClaimId);
  await historyPage.clickSearch('process');
  const processPage = await openProcessClaimFromHistory(historyPage, testData.claimHistory.knownClaimId);
  await processClaimApproveFirstDenyRest(processPage);
  await expect(processPage.successMessage).toBeVisible();
  await logoutSpiffUser(page);
});
```

---

## Coverage Summary

| Test ID | Users Covered | Key BRs |
|---|---|---|
| SPIFF-E2E-001 | SA | BR-002, BR-003, BR-004, BR-005, BR-006 |
| SPIFF-E2E-002 | BMADMIN | BR-008, BR-009 |
