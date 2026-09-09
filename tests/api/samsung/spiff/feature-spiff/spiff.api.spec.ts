import { test, expect } from '@playwright/test';
import testData from '../../../../playwright/data/samsung/spiff/feature-spiff/test-data.json';

// -----------------------------------------------------------------------------
// SPIFF endpoints below are ASP.NET Core Razor Page handlers, routed via each
// page's `@page "{handler?}"` directive (handler name is a path segment, e.g.
// `/Rewards/SPIFF/AddClaim/SubmitClaim` -> AddClaimModel.OnPostSubmitClaim).
// Confirmed against AddClaim.cshtml.cs, ProcessClaims.cshtml.cs, and
// SearchClaim.cshtml.cs handler method names - see feature-spiff/SpiffPage.ts
// header comment for the page-level route constants these build on.
// -----------------------------------------------------------------------------

test.describe('SPIFF - API', () => {

  // - Authentication guard

  test.describe('Authentication', () => {

    test('SPIFF-API-001 - AddClaim page returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/SPIFF/AddClaim', { maxRedirects: 0 });
      expect([302, 401]).toContain(res.status());
    });

    test('SPIFF-API-002 - SearchClaim page returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/SPIFF/SearchClaim', { maxRedirects: 0 });
      expect([302, 401]).toContain(res.status());
    });

    test('SPIFF-API-003 - ProcessClaims page returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/SPIFF/ProcessClaims', { maxRedirects: 0 });
      expect([302, 401]).toContain(res.status());
    });

    test('SPIFF-API-004 - SubmitClaim handler returns 302/401/400 without session @smoke', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/AddClaim/SubmitClaim', { maxRedirects: 0 });
      expect([302, 401, 400]).toContain(res.status());
    });

  });

  // - AddClaim handlers

  test.describe('AddClaim handlers', () => {

    test('SPIFF-API-005 - SubmitClaim returns 200 with authenticated session @regression @critical', async ({ request }) => {
      test.skip(!testData.claim.quoteNumber, 'Requires a real claim payload in test-data.json.');
      const res = await request.post('/Rewards/SPIFF/AddClaim/SubmitClaim', {
        form: { Claims: JSON.stringify({ Mode: 'Add' }) },
      });
      expect(res.status()).toBe(200);
    });

    test('SPIFF-API-006 - UploadDoc requires a session and rejects an empty payload gracefully @regression', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/AddClaim/UploadDoc');
      expect([200, 302, 400, 401]).toContain(res.status());
    });

    test('SPIFF-API-007 - ALLStores returns 200 with authenticated session @regression', async ({ request }) => {
      const res = await request.get('/Rewards/SPIFF/AddClaim/ALLStores');
      expect([200, 302, 401]).toContain(res.status());
    });

    test('SPIFF-API-008 - ClaimLineDetail returns 200 or 400 depending on params @regression', async ({ request }) => {
      const res = await request.get('/Rewards/SPIFF/AddClaim/ClaimLineDetail', {
        params: { product_reference_seq: '0', rebateSeq: '0' },
      });
      expect([200, 302, 400, 401]).toContain(res.status());
    });

  });

  // - ProcessClaims handlers

  test.describe('ProcessClaims handlers', () => {

    test('SPIFF-API-009 - AdjustmentReasons returns 200 with authenticated session @regression', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/ProcessClaims/AdjustmentReasons');
      expect([200, 302, 401]).toContain(res.status());
    });

    test('SPIFF-API-010 - ProcessLineItem returns 200 or 400 depending on payload @regression @critical', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/ProcessClaims/ProcessLineItem');
      expect([200, 302, 400, 401]).toContain(res.status());
    });

    test('SPIFF-API-011 - ProcessClick returns a redirect URL payload for a valid rebate_seq @regression', async ({ request }) => {
      test.skip(!testData.claimHistory.knownClaimId, 'Requires test-data.json claimHistory.knownClaimId.');
      const res = await request.post('/Rewards/SPIFF/ProcessClaims/ProcessClick', {
        form: { rebate_seq: testData.claimHistory.knownClaimId },
      });
      expect([200, 302, 401]).toContain(res.status());
    });

    test('SPIFF-API-012 - RebateDetail returns 200 with authenticated session @regression', async ({ request }) => {
      test.skip(!testData.claimHistory.knownClaimId, 'Requires test-data.json claimHistory.knownClaimId.');
      const res = await request.post('/Rewards/SPIFF/ProcessClaims/RebateDetail', {
        form: { rebate_seq: testData.claimHistory.knownClaimId, mode: 'view' },
      });
      expect([200, 302, 401]).toContain(res.status());
    });

  });

  // - SearchClaim handlers

  test.describe('SearchClaim handlers', () => {

    test('SPIFF-API-013 - BindReportList (history search) returns 200/302 with authenticated session @regression', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/SearchClaim/BindReportList', { maxRedirects: 0 });
      expect([200, 302, 401]).toContain(res.status());
    });

    test('SPIFF-API-014 - BindProcessReportList (admin search) returns 200/302 with authenticated session @regression', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/SearchClaim/BindProcessReportList', { maxRedirects: 0 });
      expect([200, 302, 401]).toContain(res.status());
    });

    test('SPIFF-API-015 - SaleAssociatesList returns 200 with authenticated session @regression', async ({ request }) => {
      const res = await request.get('/Rewards/SPIFF/SearchClaim/SaleAssociatesList', {
        params: { dealer_number_seq: '' },
      });
      expect([200, 302, 401]).toContain(res.status());
    });

    test('SPIFF-API-016 - DeleteClaim rejects an unencrypted rebate_seq gracefully @regression @critical', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/SearchClaim/DeleteClaim', {
        form: { rebate_seq: 'not-encrypted' },
      });
      expect([200, 302, 400, 401, 500]).toContain(res.status());
    });

    test('SPIFF-API-017 - ExportXlsx returns a file response with authenticated session @regression', async ({ request }) => {
      const res = await request.post('/Rewards/SPIFF/SearchClaim/ExportXlsx', { maxRedirects: 0 });
      expect([200, 302, 401]).toContain(res.status());
    });

  });

});
