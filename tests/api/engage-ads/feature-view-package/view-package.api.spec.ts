/**
 * EngageAds - View Package - API Spec
 * Module: engage-ads | Feature: view-package
 * Generated: 2026-06-18 | Pipeline: Step 3 (Playwright Test Generation)
 *
 * Catalog reference:
 *   docs/functional-catalogs/engage-ads/feature-view-package/test-catalog.md
 */
import { test, expect, type APIRequestContext } from '@playwright/test';
import { existsSync } from 'fs';
import * as path from 'path';
import testData from '../../../playwright/data/engage-ads/feature-view-package/test-data.json';

interface BusinessGoal {
  LookupValueCode?: string;
  LookupValueLabel?: string;
  lookupValueCode?: string;
  lookupValueLabel?: string;
}

interface StateDto {
  StateSeq?: number;
  stateSeq?: number;
  Name?: string;
  name?: string;
}

interface HandlerResponse {
  success?: boolean;
  redirectUrl?: string;
  message?: string;
  inquiryNumber?: string;
}

const BASE_PAGE = testData.featureUrl;
const BASE_URL = process.env.BASE_URL ?? '';
const IS_PROD = (process.env.TEST_ENV ?? 'production') === 'production';
const DEALER_AUTH_FILE = path.resolve(__dirname, '../../../playwright/fixtures/.auth/user.json');
const DEALER_AUTH_MISSING = !existsSync(DEALER_AUTH_FILE);

function extractPackageSeq(markup: string): string {
  const attributeMatch = markup.match(/class="[^"]*selectPackage[^"]*"[^>]*packageSeq="([^"]+)"/i);
  if (attributeMatch?.[1]) {
    return attributeMatch[1];
  }

  const hrefMatch = markup.match(/\/EngageAds\/Detail\?packageSeq=([^"&]+)/i);
  return hrefMatch?.[1] ?? '';
}

test.describe('EngageAds - View Package - API Handlers', () => {
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

  test('ENGAGEADS-API-001 @smoke - GET /EngageAds/BundledAdPackages returns 200 for authenticated dealer', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state is required for authenticated API assertions.');
    const response = await dealerRequest.get(BASE_PAGE);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Bundled Ad Packages');
  });

  test('ENGAGEADS-API-002 @smoke - GET /EngageAds/BundledAdPackages returns 302 redirect for unauthenticated', async ({ request }) => {
    const response = await request.get(BASE_PAGE, { maxRedirects: 0 });
    expect([302, 401, 403]).toContain(response.status());
    if (response.status() === 302) {
      expect(response.headers()['location'] ?? '').toContain(testData.redirects.login);
    }
  });

  test('ENGAGEADS-API-003 @regression - POST ?handler=LoadPackageData with valid packageSeq returns package JSON', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state is required for authenticated API assertions.');
    const pageResponse = await dealerRequest.get(BASE_PAGE, { headers: { Accept: 'text/html' } });
    const packageSeq = extractPackageSeq(await pageResponse.text());
    expect(packageSeq.length).toBeGreaterThan(0);

    const response = await dealerRequest.post(`${BASE_PAGE}?handler=LoadPackageData`, {
      form: { packageSeq },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('PackageName');
  });

  test('ENGAGEADS-API-004 @regression - GET ?handler=BusinessGoals returns array of business goal objects', async () => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state is required for authenticated API assertions.');
    const response = await dealerRequest.get(`${BASE_PAGE}?handler=BusinessGoals`);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as BusinessGoal[];
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    const firstItem = body[0];
    expect(firstItem.LookupValueCode ?? firstItem.lookupValueCode ?? '').not.toBe('');
  });

  test('ENGAGEADS-API-005 @regression @mutation - POST ?handler=SubmitInquiry with valid payload returns success', async () => {
    test.skip(IS_PROD, 'Mutation test - skip on production.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state is required for authenticated API assertions.');

    const pageResponse = await dealerRequest.get(BASE_PAGE, { headers: { Accept: 'text/html' } });
    const packageSeq = extractPackageSeq(await pageResponse.text());
    expect(packageSeq.length).toBeGreaterThan(0);

    const businessGoalsResponse = await dealerRequest.get(`${BASE_PAGE}?handler=BusinessGoals`);
    const businessGoals = (await businessGoalsResponse.json()) as BusinessGoal[];
    const goalCode = businessGoals[0]?.LookupValueCode ?? businessGoals[0]?.lookupValueCode ?? '';
    expect(goalCode).not.toBe('');

    const statesResponse = await dealerRequest.get(`${BASE_PAGE}?handler=LoadStates`);
    const states = (await statesResponse.json()) as StateDto[];
    const stateSeq = String(states[0]?.StateSeq ?? states[0]?.stateSeq ?? '');
    expect(stateSeq).not.toBe('');

    const response = await dealerRequest.post(`${BASE_PAGE}?handler=SubmitInquiry`, {
      form: {
        packageSeq,
        businessGoal: goalCode,
        stateSeq,
        monthlyBudget: testData.expertForm.valid.monthlyBudget,
        additionalNotes: testData.expertForm.valid.additionalNotes,
        city: testData.expertForm.valid.city,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as HandlerResponse;
    expect(body.success).toBeTruthy();
  });

  test('ENGAGEADS-API-006 @regression @mutation - POST ?handler=CreateStripeSession with valid payload returns redirectUrl', async () => {
    test.skip(IS_PROD, 'Mutation test - skip on production.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state is required for authenticated API assertions.');

    const pageResponse = await dealerRequest.get(BASE_PAGE, { headers: { Accept: 'text/html' } });
    const packageSeq = extractPackageSeq(await pageResponse.text());
    expect(packageSeq.length).toBeGreaterThan(0);

    const response = await dealerRequest.post(`${BASE_PAGE}?handler=CreateStripeSession`, {
      form: {
        packageSeq,
        cardAmount: '2961.17',
        coopAmount: '0',
        totalAmount: '2961.17',
        transactionFee: '86.17',
        baseCardAmount: '2875',
        budgetAllocations: '[]',
        email: '',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as HandlerResponse;
    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.payment);
  });

  test('ENGAGEADS-API-007 @regression @mutation - POST ?handler=CreatePayment with valid COOP-only payload returns order confirmation redirect', async () => {
    test.skip(IS_PROD, 'Mutation test - skip on production.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth state is required for authenticated API assertions.');

    const pageResponse = await dealerRequest.get(BASE_PAGE, { headers: { Accept: 'text/html' } });
    const packageSeq = extractPackageSeq(await pageResponse.text());
    expect(packageSeq.length).toBeGreaterThan(0);

    const response = await dealerRequest.post(`${BASE_PAGE}?handler=CreatePayment`, {
      form: {
        packageSeq,
        TotalAmount: '2875',
        CardAmount: '0',
        CoopAmount: '2875',
        BudgetAllocations: '[]',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as HandlerResponse;
    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.orderConfirmation);
  });
});
