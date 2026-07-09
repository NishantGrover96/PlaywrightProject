import { Page, expect } from '@playwright/test';
import { AssetUploadPage } from '../../../../pages/deereadbuilder/ad-builder/feature-asset-upload/AssetUploadPage';
import testData from '../../../../data/deereadbuilder/ad-builder/feature-asset-upload/test-data.json';

/**
 * Asset Upload Helpers — Reusable multi-step flows
 */

/**
 * Setup helper: Navigate to Asset Upload page for authenticated user
 */
export async function navigateToAssetUpload(page: Page): Promise<AssetUploadPage> {
  const assetPage = new AssetUploadPage(page);
  await assetPage.navigate();
  await expect(assetPage.uploadDropzone).toBeVisible();
  return assetPage;
}

/**
 * Happy path: Upload image, fill metadata, save as new asset
 */
export async function uploadAssetHappyPath(
  page: Page,
  filePath: string,
  options?: {
    displayName?: string;
    locale?: string[];
    divisions?: string[];
    status?: string;
    trackingNo?: string;
    color?: string;
    setting?: string;
  }
): Promise<AssetUploadPage> {
  const assetPage = await navigateToAssetUpload(page);

  // Upload file
  await assetPage.uploadFile(filePath);
  await expect(assetPage.uploadedThumbnail).toBeVisible();

  // Fill metadata
  const displayName = options?.displayName || testData.valid.displayName;
  await assetPage.fillDisplayName(displayName);

  const locale = options?.locale || testData.valid.locale;
  await assetPage.selectLocales(locale);

  const divisions = options?.divisions || testData.valid.divisions;
  await assetPage.selectDivisions(divisions);

  const status = options?.status || testData.valid.status;
  await assetPage.selectStatus(status);

  // Region 1 specific fields
  if (testData.region === 1) {
    const trackingNo = options?.trackingNo || testData.valid.trackingNumber;
    if (trackingNo) await assetPage.fillTrackingNumber(trackingNo);

    const color = options?.color || testData.valid.color;
    if (color) await assetPage.selectColor(color);

    const setting = options?.setting || testData.valid.setting;
    if (setting) await assetPage.selectSetting(setting);
  }

  // Select folder
  const folder = testData.valid.folder;
  await assetPage.selectFolder(folder);

  // Save
  await assetPage.save();
  await assetPage.expectSuccessMessage('Saved successfully');

  return assetPage;
}

/**
 * Edit existing asset: Load by ID, modify metadata, save changes
 */
export async function editAssetMetadata(
  page: Page,
  assetId: string,
  updates: {
    displayName?: string;
    divisions?: string[];
    status?: string;
  }
): Promise<AssetUploadPage> {
  const assetPage = new AssetUploadPage(page);
  await assetPage.navigate(assetId);

  // Verify edit mode
  await expect(assetPage.updateButton).toBeVisible();

  if (updates.displayName) {
    await assetPage.fillDisplayName(updates.displayName);
  }

  if (updates.divisions) {
    await assetPage.selectDivisions(updates.divisions);
  }

  if (updates.status) {
    await assetPage.selectStatus(updates.status);
  }

  await assetPage.update();
  await assetPage.expectSuccessMessage();

  return assetPage;
}

/**
 * Verify validation error displayed for required field
 */
export async function verifyValidationError(
  page: Page,
  fieldName: string,
  errorMessage: string
): Promise<void> {
  const assetPage = new AssetUploadPage(page);
  const error = page.locator(`text="${errorMessage}"`);
  await expect(error).toBeVisible();
}

/**
 * Fill complete form with all fields (for comprehensive testing)
 */
export async function fillCompleteAssetForm(
  page: Page,
  filePath: string,
  formData: any
): Promise<AssetUploadPage> {
  const assetPage = new AssetUploadPage(page);

  // Upload
  await assetPage.uploadFile(filePath);
  await expect(assetPage.uploadedThumbnail).toBeVisible();

  // Standard fields
  if (formData.displayName) await assetPage.fillDisplayName(formData.displayName);
  if (formData.locale) await assetPage.selectLocales(formData.locale);
  if (formData.divisions) await assetPage.selectDivisions(formData.divisions);
  if (formData.status) await assetPage.selectStatus(formData.status);
  if (formData.folder) await assetPage.selectFolder(formData.folder);

  // Region 1 enhanced fields
  if (testData.region === 1) {
    if (formData.trackingNo) await assetPage.fillTrackingNumber(formData.trackingNo);
    if (formData.color) await assetPage.selectColor(formData.color);
    if (formData.setting) await assetPage.selectSetting(formData.setting);
    if (formData.customerSegment) await assetPage.selectCustomerSegment(formData.customerSegment);
    if (formData.productSegment) await assetPage.selectProductSegment(formData.productSegment);
  }

  // Optional fields
  if (formData.imageIds) await assetPage.fillImageIds(formData.imageIds);
  if (formData.keywords) {
    for (const keyword of formData.keywords) {
      await assetPage.addKeywordTag(keyword);
    }
  }

  // Date range status
  if (formData.status === 'Date Range' || formData.releaseDate) {
    if (formData.releaseDate) await assetPage.fillReleaseDate(formData.releaseDate);
    if (formData.endDate) await assetPage.fillEndDate(formData.endDate);
  }

  // Notification
  if (formData.notifyGroups) {
    await assetPage.checkNotifyGroups();
  }
  if (formData.manualEmails) {
    await assetPage.fillManualEmails(formData.manualEmails);
  }

  // Admin flag
  if (formData.adminOnly) {
    await assetPage.checkAdminOnly();
  }

  return assetPage;
}

/**
 * Verify upload file was rejected (invalid extension)
 */
export async function verifyUploadRejected(
  page: Page,
  filePath: string,
  expectedErrorPattern: RegExp
): Promise<void> {
  const assetPage = new AssetUploadPage(page);
  await assetPage.navigate();

  try {
    await assetPage.uploadFile(filePath);
    throw new Error('Upload should have been rejected');
  } catch (err) {
    if (!expectedErrorPattern.test(err instanceof Error ? err.message : String(err))) {
      throw err;
    }
  }
}

/**
 * Get asset data from form (for verification against DB)
 */
export async function getAssetFormData(page: Page): Promise<any> {
  const assetPage = new AssetUploadPage(page);

  return {
    displayName: await assetPage.getDisplayName(),
    assetType: await assetPage.getAssetType(),
    locales: await assetPage.getSelectedLocales(),
    divisions: await assetPage.getSelectedDivisions(),
    status: await assetPage.getStatus(),
    imageIds: await assetPage.getImageIds(),
    keywords: await assetPage.getAllKeywordTags(),
  };
}

/**
 * Test file paths (from test-data.json or fixtures)
 */
export const testFiles = {
  validJpg: 'tests/playwright/fixtures/test-images/valid-banner.jpg',
  validPng: 'tests/playwright/fixtures/test-images/valid-image.png',
  validMp4: 'tests/playwright/fixtures/test-videos/valid-video.mp4',
  validTiff: 'tests/playwright/fixtures/test-images/valid-image.tiff',
  validEps: 'tests/playwright/fixtures/test-images/valid-logo.eps',
  invalidExe: 'tests/playwright/fixtures/malicious/malware.exe',
  invalidTxt: 'tests/playwright/fixtures/invalid/text-file.txt',
  pathTraversalAttack: '../../../etc/passwd.jpg',
};
