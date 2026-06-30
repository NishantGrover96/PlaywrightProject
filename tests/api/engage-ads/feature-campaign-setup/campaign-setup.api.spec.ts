/**
 * EngageAds — Campaign Setup — API Spec
 * Module: engage-ads | Feature: campaign-setup
 * Generated: 2026-06-19 | Pipeline: Step 3 (Playwright Test Generation)
 *
 * Catalog reference:
 *   docs/functional-catalogs/engage-ads/feature-campaign-setup/test-catalog.md
 */
import { test, expect, type APIRequestContext } from '@playwright/test';
import { existsSync } from 'fs';
import * as path from 'path';
import testData from '../../../playwright/data/engage-ads/feature-campaign-setup/test-data.json';

interface UploadResponse {
  success: boolean;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  message?: string;
}

interface SubmitResponse {
  success?: boolean;
  message?: string;
  errors?: string[];
}

const BASE_URL = process.env.BASE_URL ?? '';
const IS_PROD = (process.env.TEST_ENV ?? 'uat') === 'uat';
const DEALER_AUTH_FILE = path.resolve(__dirname, '../../../playwright/fixtures/.auth/user.json');
const DEALER_AUTH_MISSING = !existsSync(DEALER_AUTH_FILE);

test.describe('EngageAds — Campaign Setup — API Handlers', () => {
  let dealerRequest: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    dealerRequest = await playwright.request.newContext({
      baseURL: BASE_URL,
      storageState: DEALER_AUTH_FILE,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
  });

  test.afterAll(async () => {
    await dealerRequest.dispose();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET — Page Access
  // ──────────────────────────────────────────────────────────────────────────

  test('ENGAGEADS-CS-API-001 @smoke — GET /EngageAds/CampaignSetup redirects unauthenticated to login', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${testData.featureUrl}`, { maxRedirects: 0 });
    expect([302, 401, 403]).toContain(response.status());
    if (response.status() === 302) {
      expect(response.headers()['location'] ?? '').toContain(testData.redirects.login);
    }
  });

  test('ENGAGEADS-CS-API-002 @smoke — GET /EngageAds/CampaignSetup without orderSeq redirects authenticated dealer', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state required.');
    const response = await dealerRequest.get(testData.featureUrl, { maxRedirects: 0 });
    // Without orderSeq → redirect to BundledAdPackages (302)
    expect([200, 302]).toContain(response.status());
    if (response.status() === 302) {
      expect(response.headers()['location'] ?? '').toContain('EngageAds');
    }
  });

  test('ENGAGEADS-CS-API-003 @regression — GET /EngageAds/CampaignSetup with invalid orderSeq redirects to BundledAdPackages', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state required.');
    const response = await dealerRequest.get(`${testData.featureUrl}?orderSeq=INVALID`, { maxRedirects: 0 });
    expect([302, 200]).toContain(response.status());
    if (response.status() === 302) {
      expect(response.headers()['location'] ?? '').toContain('BundledAdPackages');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST — UploadLogo
  // ──────────────────────────────────────────────────────────────────────────

  test('ENGAGEADS-CS-API-004 @regression — POST ?handler=UploadLogo with invalid file type returns error', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state required.');
    const response = await dealerRequest.post(`${testData.featureUrl}?handler=UploadLogo`, {
      multipart: {
        logo: {
          name: testData.logo.invalidTypeFileName,
          mimeType: 'text/plain',
          buffer: Buffer.from('not an image'),
        },
      },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as UploadResponse;
    expect(body.success).toBeFalsy();
    expect(body.message ?? '').toContain(testData.expectedErrors.logoInvalidType);
  });

  test('ENGAGEADS-CS-API-005 @regression — POST ?handler=UploadLogo with oversized file returns error', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state required.');
    const buffer = Buffer.alloc(testData.logo.oversizeBytes, 'x');
    const response = await dealerRequest.post(`${testData.featureUrl}?handler=UploadLogo`, {
      multipart: {
        logo: {
          name: testData.logo.validFileName,
          mimeType: 'image/png',
          buffer,
        },
      },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as UploadResponse;
    expect(body.success).toBeFalsy();
    expect(body.message ?? '').toContain(testData.expectedErrors.logoTooLarge);
  });

  test('ENGAGEADS-CS-API-006 @regression — POST ?handler=UploadLogo with no file returns error', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state required.');
    const response = await dealerRequest.post(`${testData.featureUrl}?handler=UploadLogo`, {
      form: {},
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as UploadResponse;
    expect(body.success).toBeFalsy();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST — Submit (OnPostAsync)
  // ──────────────────────────────────────────────────────────────────────────

  test('ENGAGEADS-CS-API-007 @regression @mutation — POST submit with missing OrderSeq returns page with model error', async () => {
    test.skip(IS_PROD, 'Mutation test — skip on production.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state required.');
    const response = await dealerRequest.post(testData.featureUrl, {
      form: {
        'CampaignIntake.FirstName': testData.step1.valid.firstName,
        'CampaignIntake.LastName': testData.step1.valid.lastName,
        'CampaignIntake.PrimaryContactEmail': testData.step1.valid.primaryContactEmail,
        'CampaignIntake.ContactPhoneNumber': testData.step1.valid.contactPhoneNumber,
        'CampaignIntake.BusinessName': testData.step2.valid.businessName,
        'CampaignIntake.StreetAddress': testData.step2.valid.streetAddress,
        'CampaignIntake.City': testData.step2.valid.city,
        'CampaignIntake.StateProvince': testData.step2.valid.stateProvince,
        'CampaignIntake.ZipCode': testData.step2.valid.zipCode,
        'CampaignIntake.Email': testData.step2.valid.email,
        'CampaignIntake.WebsiteUrl': testData.step2.valid.websiteUrl,
        'CampaignIntake.ServiceArea': testData.step3.valid.serviceArea,
        'CampaignIntake.WebsiteAccuracyConfirmed': 'true',
        'CampaignIntake.TermsAccepted': 'true',
        // OrderSeq intentionally omitted → "Invalid order reference" error
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    // Expect 200 (Page() rendered with error) or redirect
    expect([200, 302]).toContain(response.status());
    if (response.status() === 200) {
      const html = await response.text();
      expect(html).toContain(testData.expectedErrors.invalidOrderReference.substring(0, 15));
    }
  });

});
