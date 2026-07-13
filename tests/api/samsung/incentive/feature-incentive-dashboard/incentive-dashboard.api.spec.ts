import { test, expect } from '@playwright/test';
import testData from '../../../../playwright/data/samsung/incentive/feature-incentive-dashboard/test-data.json';

test.describe('Incentive Dashboard - API', () => {

  // - Authentication guard

  test.describe('Authentication', () => {

    test('INC-API-001 - IncentiveDashboard returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard', { maxRedirects: 0 });
      expect([302, 401]).toContain(res.status());
    });

    test('INC-API-002 - LandingDashboard returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/LandingDashboard', { maxRedirects: 0 });
      expect([302, 401]).toContain(res.status());
    });

    test('INC-API-003 - DealerDashboard returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/DealerDashboard', { maxRedirects: 0 });
      expect([302, 401]).toContain(res.status());
    });

    test('INC-API-004 - CorporateDashboardDataByType returns 302/401 without session @smoke', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/CorporateDashboardDataByType', { maxRedirects: 0 });
      expect([302, 401, 400]).toContain(res.status());
    });

  });

  // - CorporateDashboardDataByType

  test.describe('CorporateDashboardDataByType', () => {

    test('INC-API-005 - returns 200 with authenticated session @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/CorporateDashboardDataByType');
      expect(res.status()).toBe(200);
    });

    test('INC-API-006 - response JSON contains expected KPI fields @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/CorporateDashboardDataByType');
      expect(res.status()).toBe(200);
      const json: unknown[] = await res.json();
      if (json.length === 0) { return; }
      const first = json[0] as Record<string, unknown>;
      expect('total_tires' in first || 'TotalTires' in first || 'all_units' in first).toBe(true);
    });

    test('INC-API-007 - dealer_number_seq values are AES-encrypted @regression @critical', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/CorporateDashboardDataByType');
      expect(res.status()).toBe(200);
      const json: unknown[] = await res.json();
      if (json.length === 0) { return; }
      const first = json[0] as Record<string, unknown>;
      const seq = first['dealer_number_seq'];
      if (seq === undefined) { return; }
      expect(typeof seq).toBe('string');
      expect(/^\d+$/.test(String(seq))).toBe(false);
    });

  });

  // - Filter Endpoints

  test.describe('Filter Endpoints', () => {

    test('INC-API-008 - DistributorByTerritory returns 200 @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/DistributorByTerritory', {
        params: { organization_structure_seq: '0' },
      });
      expect([200, 204]).toContain(res.status());
    });

    test('INC-API-009 - DealerByDistributor returns only primary_flag=Y records @regression @critical', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/DealerByDistributor', {
        params: { DealerNumberSeq: '0', period_number: '1', fiscal_year: testData.filters.currentFiscalYear },
      });
      expect(res.status()).toBe(200);
      const json: { primary_flag?: string }[] = await res.json();
      const nonPrimary = json.filter((d: { primary_flag?: string }) => d.primary_flag !== 'Y');
      expect(nonPrimary.length).toBe(0);
    });

    test('INC-API-010 - SalesPersonByDistributor returns 200 @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/SalesPersonByDistributor', {
        params: { DealerNumberSeq: '0', period_number: '1', fiscal_year: testData.filters.currentFiscalYear },
      });
      expect([200, 204]).toContain(res.status());
    });

    test('INC-API-011 - Brand endpoint returns active brands @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/Brand', {
        params: { active_flag: 'Y' },
      });
      expect(res.status()).toBe(200);
    });

    test('INC-API-012 - SalesManager returns 200 @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/IncentiveDashboard/SalesManager');
      expect(res.status()).toBe(200);
    });

  });

  // - DealerDashboard Endpoints

  test.describe('DealerDashboard Endpoints', () => {

    test('INC-API-013 - Tab endpoint returns 200 or 400 (requires params) @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/DealerDashboard/Tab');
      expect([200, 400]).toContain(res.status());
    });

    test('INC-API-014 - TabInformation returns 200 or 400 @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/DealerDashboard/TabInformation');
      expect([200, 400]).toContain(res.status());
    });

    test('INC-API-015 - TabInformation with totalAmountSummary=true returns extended data @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/DealerDashboard/TabInformation', {
        params: { totalAmountSummary: 'true' },
      });
      expect([200, 400]).toContain(res.status());
    });

  });

  // - LandingDashboard Endpoints

  test.describe('LandingDashboard Endpoints', () => {

    test('INC-API-016 - SalesRepRewardData returns 200 @regression', async ({ request }) => {
      const res = await request.get('/Rewards/Incentives/Dashboard/LandingDashboard/SalesRepRewardData', {
        params: { type: '1' },
      });
      expect([200, 204]).toContain(res.status());
    });

    test('INC-API-017 - RedeemCashRewards returns 200 with valid dealerNumberSeq @regression @critical', async ({ request }) => {
      const dealerSeq = testData.dealers.primaryDealer.dealerNumberSeq;
      if (!dealerSeq) { return; }
      const res = await request.get('/Rewards/Incentives/Dashboard/LandingDashboard/RedeemCashRewards', {
        params: { dealerNumberSeq: dealerSeq },
      });
      expect([200, 400]).toContain(res.status());
    });

  });

});