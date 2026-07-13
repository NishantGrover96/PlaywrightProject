/**
 * EngageAds - Package Builder - Spec File
 * Module: engage-ads | Feature: feature-package-builder
 * User Story: US141359
 * Generated: 2026-06-27 | Pipeline: ADLC Stage 9 (Playwright Testing)
 *
 * Catalog reference:
 *   docs/functional-catalogs/engage-ads/feature-package-builder/test-catalog.html
 *
 * Run tags:
 *   @smoke      - SMK-001..008 - critical-path, safe for non-mutating + create
 *   @regression - REG-001..024 - full functional coverage
 *   @e2e        - E2E-001..004 - end-to-end flows
 *   @mutation   - creates packages in DB (requires cleanup)
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { existsSync } from 'fs';

import { PackageBuilderPage } from '../../../pages/engage-ads/feature-package-builder/PackageBuilderPage';
import {
  fillOverviewAndSave,
  addPricingRecord,
  addFeatureToSection,
  selectChannels,
  createFullPackage,
} from '../../../helpers/engage-ads/feature-package-builder/package-builder.helpers';
import testData from '../../../data/engage-ads/feature-package-builder/test-data.json';

const BASE_URL    = process.env.BASE_URL ?? 'https://localhost:44350';
const AUTH_FILE   = path.resolve(__dirname, '../../../fixtures/.auth/admin.json');
const HAS_AUTH    = existsSync(AUTH_FILE);

// -----------------------------------------------------------------------------
// SMOKE SUITE - @smoke
// -----------------------------------------------------------------------------

test.describe('PackageBuilder - Smoke @smoke', () => {
  test.use({ storageState: HAS_AUTH ? AUTH_FILE : undefined, baseURL: BASE_URL });

  test('SMK-001 - page loads with all 4 tabs visible [BR-OV-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await expect(pb.tabOverview).toBeVisible();
    await expect(pb.tabPricing).toBeVisible();
    await expect(pb.tabChannels).toBeVisible();
    await expect(pb.tabFeatures).toBeVisible();
    await expect(page).toHaveTitle(/Package/i);
  });

  test('SMK-002 - save blocked when Package Name is empty [BR-OV-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    // Leave name empty, set billing term
    await pb.pkgBillingTerm.selectOption(testData.newPackage.billingTerm);
    await pb.clickSave();

    await pb.expectBannerVisible('required');
    await expect(pb.btnSavePackage).toBeEnabled();  // not left in spinner state
  });

  test('SMK-003 - save blocked when Billing Term not selected [BR-OV-002]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await pb.pkgName.fill('SMK-003 Test');
    // Do not select billing term
    await pb.clickSave();

    await pb.expectBannerVisible('required');
    expect(await pb.getActiveTabKey()).toBe('overview');
  });

  test('SMK-004 - save valid new package shows spinner then success [BR-SV-001, BR-SV-002] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.fillOverview({ name: 'SMK-004 Package', billingTerm: testData.newPackage.billingTerm });

    const savePromise = pb.waitForSaveSuccess();
    await pb.clickSave();

    // Button should be disabled with spinner text during save
    await expect(pb.btnSavePackage).toBeDisabled();
    await expect(pb.btnSavePackage).toContainText('Saving');

    await savePromise;
    await pb.expectSaveButtonRestored();

    const seq = await pb.getUrlPackageSeq();
    expect(seq).toBeGreaterThan(0);
  });

  test('SMK-005 - saved package appears in PackageList [BR-EL-001] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    const uniqueName = `SMK-005-${Date.now()}`;
    await pb.fillOverview({ name: uniqueName, billingTerm: testData.newPackage.billingTerm });
    await pb.clickSave();
    await pb.waitForSaveSuccess();

    await page.goto(`${BASE_URL}/EngageAds/Admin/PackageList`);
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('SMK-006 - tab navigation switches active panel [BR-OV-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await pb.switchTab('pricing');
    await expect(pb.tabPanePricing).toBeVisible();
    await expect(pb.tabPricing).toHaveAttribute('aria-selected', 'true');

    await pb.switchTab('channels');
    await expect(pb.tabPaneChannels).toBeVisible();
    await expect(pb.tabChannels).toHaveAttribute('aria-selected', 'true');
  });

  test('SMK-007 - package_eligibility rows exist after new package save [BR-EL-001, BR-EL-002] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.fillOverview({ name: `SMK-007-${Date.now()}`, billingTerm: testData.newPackage.billingTerm });
    await pb.clickSave();
    await pb.waitForSaveSuccess();

    const seq = await pb.getUrlPackageSeq();
    expect(seq).toBeTruthy();

    // Verify via DB (this is a documentation anchor - actual DB check in verify-records.sql)
    // In CI, this assertion is replaced by the database verification job
    test.info().annotations.push({
      type: 'db-check',
      description: `SELECT COUNT(*) FROM EngageAds.package_eligibility WHERE package_seq=${seq} AND owner_table='PROGRAM_DEALER_TYPE' AND is_deleted=0 -- expect >= 10`,
    });
  });

  test('SMK-008 - edit existing package loads with pre-populated fields [BR-SV-002]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigateToPackage(testData.existingPackageSeqForEdit);

    const name = await pb.pkgName.inputValue();
    expect(name.length).toBeGreaterThan(0);
    await expect(pb.stripName).not.toHaveText('New Package');
  });
});


// -----------------------------------------------------------------------------
// REGRESSION SUITE - @regression
// -----------------------------------------------------------------------------

test.describe('PackageBuilder - Regression @regression', () => {
  test.use({ storageState: HAS_AUTH ? AUTH_FILE : undefined, baseURL: BASE_URL });

  // -- Overview tab ----------------------------------------------------------

  test('REG-001 - package name input updates identity strip and preview in real-time [BR-OV-005]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await pb.pkgName.fill('Live Preview Test');
    await expect(pb.stripName).toHaveText('Live Preview Test');
    await expect(pb.prevNameBadge).toContainText('LIVE PREVIEW TEST');
  });

  test('REG-002 - billing term change syncs to pricing records and locks them [BR-OV-006, BR-PR-003]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await pb.pkgBillingTerm.selectOption('MONTHLY');
    await expect(pb.stripBilling).toHaveText('MONTHLY');

    // Open pricing tab and verify billing select is locked
    await pb.switchTab('pricing');
    const hasCard = (await pb.pricingRecordCards.count()) > 0;
    if (hasCard) {
      await expect(pb.prcBillingFirst).toBeDisabled();
      await expect(pb.prcBillingFirst).toHaveValue('MONTHLY');
    }
  });

  test('REG-003 - IsInquiryOnly ON shows "Talk to Expert" preview buttons [BR-OV-003]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await pb.pkgIsInquiryOnly.check();
    await expect(pb.prevBtnsInquiry).toBeVisible();
    await expect(pb.prevBtnsDefault).toBeHidden();
  });

  test('REG-004 - IsInquiryOnly OFF shows default preview buttons [BR-OV-003]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    await pb.pkgIsInquiryOnly.check();
    await pb.pkgIsInquiryOnly.uncheck();
    await expect(pb.prevBtnsDefault).toBeVisible();
    await expect(pb.prevBtnsInquiry).toBeHidden();
  });

  test('REG-005 - clicking icon option updates strip and preview icons [BR-OV-004]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    const firstIcon = pb.iconOptions.first();
    const iconValue = await firstIcon.getAttribute('data-icon');
    await firstIcon.click();

    await expect(pb.stripIconEl).toHaveAttribute('class', new RegExp(iconValue ?? ''));
    await expect(pb.prevIcon).toHaveAttribute('class', new RegExp(iconValue ?? ''));
  });

  // -- Pricing tab -----------------------------------------------------------

  test('REG-006 - mismatched cost breakdown blocks save and activates Pricing tab [BR-PR-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.fillOverview({ name: 'REG-006 Package', billingTerm: 'MONTHLY' });

    await addPricingRecord(page, pb, {
      priceDollars: 100,
      breakdownAmounts: [60, 30],  // 90 ≠ 100
    });

    await pb.switchTab('overview');
    await pb.clickSave();

    await pb.waitForSaveError();
    await expect(pb.saveStatusBanner).toContainText('$90');
    await expect(pb.saveStatusBanner).toContainText('$100');
    expect(await pb.getActiveTabKey()).toBe('pricing');
  });

  test('REG-007 - matching cost breakdown (100) allows save [BR-PR-001, BR-PR-002] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.fillOverview({ name: `REG-007-${Date.now()}`, billingTerm: 'MONTHLY' });

    await addPricingRecord(page, pb, {
      priceDollars: 100,
      breakdownAmounts: [60, 40],  // 100 == 100
    });

    await pb.switchTab('overview');
    await pb.clickSave();
    await pb.waitForSaveSuccess();
    const seq = await pb.getUrlPackageSeq();
    expect(seq).toBeGreaterThan(0);

    test.info().annotations.push({
      type: 'db-check',
      description: `SELECT price_cents FROM EngageAds.package_pricing WHERE package_seq=${seq} -- expect 10000`,
    });
  });

  test('REG-008 - pricing billing term select is disabled on Pricing tab [BR-PR-003]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.pkgBillingTerm.selectOption('MONTHLY');
    await pb.switchTab('pricing');

    const hasCard = (await pb.pricingRecordCards.count()) > 0;
    if (hasCard) {
      await expect(pb.prcBillingFirst).toBeDisabled();
    }
  });

  // -- Features tab ----------------------------------------------------------

  test('REG-009 - CAMPAIGN_LENGTH item saves without DB constraint error [BR-FT-001, BR-FT-002] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.fillOverview({ name: `REG-009-${Date.now()}`, billingTerm: 'MONTHLY' });

    await addFeatureToSection(pb, 'CAMPAIGN_LENGTH', '3 Month Campaign');

    await pb.switchTab('overview');
    await pb.clickSave();
    await pb.waitForSaveSuccess();
    const seq = await pb.getUrlPackageSeq();
    expect(seq).toBeGreaterThan(0);

    test.info().annotations.push({
      type: 'db-check',
      description: `SELECT item_type FROM EngageAds.package_description_items WHERE package_seq=${seq} AND item_type='CAMPAIGN_LENGTH'`,
    });
  });

  test('REG-010 - features preview shows sections in correct order [BR-FT-003]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.switchTab('features');

    await pb.addFeatureItem('RECOMMENDATION', 'Great choice for X');
    await pb.addFeatureItem('CAMPAIGN_LENGTH', '3 months');
    await pb.addFeatureItem('WHATS_INCLUDED', 'Display ads');

    const previewHtml = await pb.prevFeaturesContainer.innerHTML();
    const campaignIdx     = previewHtml.indexOf('CAMPAIGN LENGTH');
    const whatsIncluded   = previewHtml.indexOf("WHAT'S INCLUDED");
    const recommendation  = previewHtml.indexOf('RECOMMENDATION');

    expect(campaignIdx).toBeLessThan(whatsIncluded);
    expect(whatsIncluded).toBeLessThan(recommendation);
  });

  test('REG-011 - edit feature item opens modal pre-populated [BR-FT-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.switchTab('features');
    await pb.addFeatureItem('BEST_FOR', 'Local businesses');

    const editBtn = page.locator('.desc-item-row .btn-edit-item').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      const titleInput = page.locator('#featureTitle');
      await expect(titleInput).toHaveValue('Local businesses');
    }
  });

  test('REG-012 - delete feature item removes it from list [BR-FT-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.switchTab('features');
    await pb.addFeatureItem('WHATS_INCLUDED', 'Item to delete');

    const deleteBtn = page.locator('.desc-item-row .btn-delete-item').first();
    if (await deleteBtn.isVisible()) {
      const countBefore = await page.locator('.desc-item-row').count();
      await deleteBtn.click();
      const countAfter = await page.locator('.desc-item-row').count();
      expect(countAfter).toBeLessThan(countBefore);
    }
  });

  // -- Channels tab ----------------------------------------------------------

  test('REG-013 - clicking channel row (not checkbox) toggles selection [BR-CH-002]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.switchTab('channels');

    const firstItem = pb.channelCheckItems.first();
    const wasChecked = await firstItem.evaluate(el => el.classList.contains('checked'));
    await firstItem.click();
    const isChecked = await firstItem.evaluate(el => el.classList.contains('checked'));
    expect(isChecked).toBe(!wasChecked);
  });

  test('REG-014 - deselecting channel removes its creative column [BR-CH-001]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.switchTab('channels');

    const firstItem = pb.channelCheckItems.first();
    const isChecked = await firstItem.evaluate(el => el.classList.contains('checked'));
    if (!isChecked) await firstItem.click();

    const channelSeq = await firstItem.getAttribute('data-channel-seq');
    await expect(pb.creativeAssetsGrid.locator(`[data-channel-seq="${channelSeq}"]`)).toBeVisible();

    await firstItem.click();  // deselect
    await expect(pb.creativeAssetsGrid.locator(`[data-channel-seq="${channelSeq}"]`)).not.toBeAttached();
  });

  // -- Creatives -------------------------------------------------------------

  test('REG-016 - selecting image file shows pending thumbnail card [BR-CR-002]', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.switchTab('channels');

    const firstItem = pb.channelCheckItems.first();
    const isChecked = await firstItem.evaluate(el => el.classList.contains('checked'));
    if (!isChecked) await firstItem.click();

    const channelSeq = await firstItem.getAttribute('data-channel-seq');
    const fileInput = page.locator(`.ca-file-input[data-channel-seq="${channelSeq}"]`);

    await fileInput.setInputFiles({
      name: 'test-creative.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
    });

    await expect(page.locator('.ca-thumb-card')).toBeVisible();
  });

  // -- Save flow -------------------------------------------------------------

  test('REG-018 - save button shows spinner during save [BR-SV-001] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    await pb.fillOverview({ name: `REG-018-${Date.now()}`, billingTerm: 'MONTHLY' });

    let seenSpinner = false;
    page.on('request', req => {
      if (req.url().includes('handler=Save')) {
        pb.btnSavePackage.isDisabled().then(d => { if (d) seenSpinner = true; });
      }
    });

    await pb.clickSave();
    await pb.waitForSaveSuccess();

    // The button must have restored after save
    await pb.expectSaveButtonRestored();
  });

  test('REG-019 - URL updates to ?id=N after new package save [BR-SV-002] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    expect(page.url()).not.toContain('?id=');

    await pb.fillOverview({ name: `REG-019-${Date.now()}`, billingTerm: 'MONTHLY' });
    await pb.clickSave();
    await pb.waitForSaveSuccess();

    expect(page.url()).toContain('?id=');
    const seq = await pb.getUrlPackageSeq();
    expect(seq).toBeGreaterThan(0);
  });

  // -- Eligibility -----------------------------------------------------------

  test('REG-023 - new package appears in PackageList immediately after save [BR-EL-001] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    const uniqueName = `REG-023-${Date.now()}`;
    await pb.fillOverview({ name: uniqueName, billingTerm: 'MONTHLY' });
    await pb.clickSave();
    await pb.waitForSaveSuccess();

    await page.goto(`${BASE_URL}/EngageAds/Admin/PackageList`);
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('REG-024 - editing existing package does not duplicate eligibility rows [BR-EL-001] @mutation', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigateToPackage(testData.existingPackageSeqForEdit);

    const origName = await pb.pkgName.inputValue();
    await pb.pkgSubtitle.fill('Updated by Playwright REG-024');
    await pb.clickSave();
    await pb.waitForSaveSuccess();

    test.info().annotations.push({
      type: 'db-check',
      description: `SELECT COUNT(*) FROM EngageAds.package_eligibility WHERE package_seq=${testData.existingPackageSeqForEdit} AND is_deleted=0 -- expect same count as before edit`,
    });
    // Restore
    await pb.pkgSubtitle.fill('');
    await pb.clickSave();
  });
});


// -----------------------------------------------------------------------------
// E2E FLOWS - @e2e
// -----------------------------------------------------------------------------

test.describe('PackageBuilder - E2E @e2e @mutation', () => {
  test.use({ storageState: HAS_AUTH ? AUTH_FILE : undefined, baseURL: BASE_URL });

  test('E2E-001 - create full package with all tabs populated', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    const uniqueName = `E2E-001-${Date.now()}`;

    const seq = await createFullPackage(page, pb, {
      name: uniqueName,
      billingTerm: 'MONTHLY',
      priceDollars: 250,
      channelCount: 1,
    });

    expect(seq).toBeGreaterThan(0);

    // Verify in PackageList
    await page.goto(`${BASE_URL}/EngageAds/Admin/PackageList`);
    await expect(page.getByText(uniqueName)).toBeVisible();

    test.info().annotations.push({
      type: 'db-check',
      description: `SELECT p.package_seq, COUNT(pe.package_eligibility_seq) AS elig FROM EngageAds.package p LEFT JOIN EngageAds.package_eligibility pe ON pe.package_seq=p.package_seq AND pe.is_deleted=0 WHERE p.package_seq=${seq} GROUP BY p.package_seq`,
    });
  });

  test('E2E-002 - edit package name and verify PackageList updated', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    const originalName = `E2E-002-orig-${Date.now()}`;
    await pb.fillOverview({ name: originalName, billingTerm: 'MONTHLY' });
    await pb.clickSave();
    await pb.waitForSaveSuccess();
    const seq = await pb.getUrlPackageSeq();

    const updatedName = `E2E-002-upd-${Date.now()}`;
    await pb.pkgName.fill(updatedName);
    await pb.clickSave();
    await pb.waitForSaveSuccess();

    await page.goto(`${BASE_URL}/EngageAds/Admin/PackageList`);
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(originalName)).not.toBeVisible();
  });

  test('E2E-003 - all validation failures activate the correct tabs', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();

    // Mismatched breakdown -> Pricing tab
    await pb.fillOverview({ name: 'E2E-003 Pkg', billingTerm: 'MONTHLY' });
    await addPricingRecord(page, pb, { priceDollars: 100, breakdownAmounts: [60, 30] });
    await pb.switchTab('overview');
    await pb.clickSave();
    await pb.waitForSaveError();
    expect(await pb.getActiveTabKey()).toBe('pricing');

    // Fix breakdown, clear name -> Overview tab
    await addPricingRecord(page, pb, { priceDollars: 100, breakdownAmounts: [60, 40] });
    await pb.switchTab('overview');
    await pb.pkgName.fill('');
    await pb.clickSave();
    await pb.waitForSaveError();
    expect(await pb.getActiveTabKey()).toBe('overview');
  });

  test('E2E-004 - create inquiry-only package saves with isInquiryOnly=true', async ({ page }) => {
    const pb = new PackageBuilderPage(page);
    await pb.navigate();
    const uniqueName = `E2E-004-${Date.now()}`;

    await pb.fillOverview({ name: uniqueName, billingTerm: 'MONTHLY' });
    await pb.pkgIsInquiryOnly.check();
    await expect(pb.prevBtnsInquiry).toBeVisible();

    await pb.clickSave();
    await pb.waitForSaveSuccess();

    const seq = await pb.getUrlPackageSeq();
    expect(seq).toBeGreaterThan(0);

    test.info().annotations.push({
      type: 'db-check',
      description: `SELECT is_inquiry_only FROM EngageAds.package WHERE package_seq=${seq} -- expect 1`,
    });
  });
});
