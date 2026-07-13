import { test, expect } from '@playwright/test';

let authToken = '';

test.describe('Ad-Builder Creative Library API', () => {

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

    test('AD_BUILDER-API-001 - returns 401 without token', async ({ request }) => {
      const res = await request.get('/api/ad-builder/adswithassets');
      expect(res.status()).toBe(401);
    });

  });

  // ----------------------------------------------------------
  // Happy Path
  // ----------------------------------------------------------

  test.describe('Happy Path', () => {

    test('AD_BUILDER-API-007 - returns 200 with valid request', async ({ request }) => {
      const res = await request.get('/api/ad-builder/adswithassets', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status()).toBe(200);
    });

  });

  // ----------------------------------------------------------
  // Input Validation
  // ----------------------------------------------------------

  test.describe('Input Validation', () => {

    test('AD_BUILDER-API-011 - missing required fields returns 400', async ({ request }) => {
      const res = await request.post('/api/ad-builder/adswithassets', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {},
      });
      expect(res.status()).toBe(400);
    });

  });

});

