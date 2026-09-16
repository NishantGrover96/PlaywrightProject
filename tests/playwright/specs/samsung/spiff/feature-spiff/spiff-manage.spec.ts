import { test } from '@playwright/test';

/**
 * Admin-facing "Manage SPIFF" flow: creating a SPIFF program (name, dates,
 * grace period, reference document) and its payment rules (rule name,
 * minimum tonnage, dollar amount per ton, refrigerant/product category),
 * per the "Samsung SPIFF – Coverage Update & End-to-End Claim Validation"
 * requirements.
 *
 * PENDING: locators/page objects for this flow are not yet written.
 * Per this project's locator rules (copilot-instructions.md #1/#2), every
 * locator must be confirmed against real HTML/live DOM before being
 * written - none has been captured for "Manage SPIFF" / "Add SPIFF" /
 * the Payment Rule tab yet. Do not add tests here with guessed selectors.
 *
 * Next step: confirm live (or against source) whether this admin UI
 * exists at all in the current Samsung Portal build, then add a
 * SpiffManagePage (or similar) to SpiffPage.ts using only confirmed
 * locators, mirroring the pattern in SpiffClaimPage/SpiffAdminProcessPage.
 */
test.describe.skip('Samsung - SPIFF (Flip to Samsung) - Manage SPIFF', () => {

  // SPIFF-MANAGE-001 - Admin creates a new SPIFF (name, dates, grace period, reference document)
  // SPIFF-MANAGE-002 - Payment Rule 1 (R410A-DVM, min tonnage 20, $15/ton) saves and shows confirmation
  // SPIFF-MANAGE-003 - Payment Rule 2 (ALL OTHER SAMSUNG PRODUCTS, min tonnage 20, $10/ton) saves and shows confirmation
  // SPIFF-MANAGE-004 - Both payment rules appear under the same SPIFF in the listing
  // SPIFF-MANAGE-005 - Newly created SPIFF is visible to an eligible user on Submit Claim

});
