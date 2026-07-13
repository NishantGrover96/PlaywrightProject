import { test, expect } from '@playwright/test';
import testData from '../../../../playwright/data/samsung-Module/incentive/feature-incentive-dashboard/test-data.json';

let authToken = '';

test.describe('Incentive Incentive Dashboard API', () => {

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/token', {
      data: {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
      },
    });
    if (res.ok()) {
      const body = await res.json();
      authToken = body.token ?? body.access_token ?? '';
    }
  });

  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  test.describe('Authentication', () => {

    test('INCENTIVE-API-001 - returns 401 without token', async ({ request }) => {
      const res = await request.get('/api/incentive/incentive-dashboard');
      expect(res.status()).toBe(401);
    });

  });

  // ----------------------------------------------------------
  // Happy Path
  // ----------------------------------------------------------

  test.describe('Happy Path', () => {

    test('INCENTIVE-API-007 - returns 200 with valid request', async ({ request }) => {
      const res = await request.get('/api/incentive/incentive-dashboard', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status()).toBe(200);
    });

  });

  // ----------------------------------------------------------
  // Input Validation
  // ----------------------------------------------------------

  test.describe('Input Validation', () => {

    test('INCENTIVE-API-011 - missing required fields returns 400', async ({ request }) => {
      const res = await request.post('/api/incentive/incentive-dashboard', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {},
      });
      expect(res.status()).toBe(400);
    });

  });

});

