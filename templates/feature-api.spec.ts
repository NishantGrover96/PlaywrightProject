import { test, expect } from '@playwright/test';
import testData from '../../../../playwright/data/{{CLIENT}}/{{MODULE}}/feature-{{FEATURE}}/test-data.json';

let authToken = '';

test.describe('{{MODULE_LABEL}} {{FEATURE_LABEL}} API', () => {

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

  // ──────────────────────────────────────────────────────────
  // Authentication
  // ──────────────────────────────────────────────────────────

  test.describe('Authentication', () => {

    test('{{MODULE_UPPER}}-API-001 - returns 401 without token', async ({ request }) => {
      const res = await request.get('/api/{{MODULE}}/{{FEATURE}}');
      expect(res.status()).toBe(401);
    });

  });

  // ──────────────────────────────────────────────────────────
  // Happy Path
  // ──────────────────────────────────────────────────────────

  test.describe('Happy Path', () => {

    test('{{MODULE_UPPER}}-API-007 - returns 200 with valid request', async ({ request }) => {
      const res = await request.get('/api/{{MODULE}}/{{FEATURE}}', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status()).toBe(200);
    });

  });

  // ──────────────────────────────────────────────────────────
  // Input Validation
  // ──────────────────────────────────────────────────────────

  test.describe('Input Validation', () => {

    test('{{MODULE_UPPER}}-API-011 - missing required fields returns 400', async ({ request }) => {
      const res = await request.post('/api/{{MODULE}}/{{FEATURE}}', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {},
      });
      expect(res.status()).toBe(400);
    });

  });

});
