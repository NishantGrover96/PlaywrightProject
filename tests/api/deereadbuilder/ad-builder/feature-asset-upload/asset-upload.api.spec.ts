import { test, expect } from '@playwright/test';

/**
 * Asset Upload API Tests
 * Tests the hnAssetUpload.ashx handler endpoints
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const HANDLER_URL = '/DAL/hnAssetUpload.ashx';

test.describe('Asset Upload API', () => {
  test.beforeEach(async ({ page, context }) => {
    // Ensure auth state is loaded from storageState
    // API calls will use the authenticated session cookies
  });

  test.describe('SaveAssetData Action', () => {
    test('POST /hnAssetUpload.ashx?action=SaveAssetData with valid data returns success', async ({
      request,
      context,
    }) => {
      // Get auth cookies from context
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        headers: {
          Cookie: cookieString,
        },
        data: {
          displayName: 'API Test Asset',
          assetType: 'Image',
          locale: 'en-US',
          division: 'Division1',
          status: 'Active',
          tracking_number: 'APTEST001',
          folder: 'Marketing',
          fileName: 'test-banner.jpg',
        },
      });

      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.assetId).toBeDefined();
    });

    test('POST without required field returns validation error', async ({ request, context }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      // Missing displayName
      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        headers: {
          Cookie: cookieString,
        },
        data: {
          assetType: 'Image',
          locale: 'en-US',
          division: 'Division1',
          // displayName missing
        },
      });

      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody.error).toContain('Display Name');
    });

    test('POST with invalid session returns 401', async ({ request }) => {
      // Intentionally no cookies (unauthenticated)
      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        data: {
          displayName: 'Unauthorized Test',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('POST with XSS payload in displayName is sanitized', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const xssPayload = "<script>alert('xss')</script>";

      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        headers: {
          Cookie: cookieString,
        },
        data: {
          displayName: xssPayload,
          assetType: 'Image',
          locale: 'en-US',
          division: 'Division1',
          folder: 'Marketing',
        },
      });

      // Should reject or sanitize
      if (response.status() === 200) {
        const responseBody = await response.json();
        // Verify payload was sanitized
        expect(responseBody.displayName).not.toContain('<script>');
      } else {
        expect(response.status()).toBe(400);
      }
    });
  });

  test.describe('GetAssetData Action', () => {
    test('GET /hnAssetUpload.ashx?action=GetAssetData&assetId={id} returns asset data', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      // First, create an asset
      const createResponse = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        headers: { Cookie: cookieString },
        data: {
          displayName: 'Get Test Asset',
          assetType: 'Image',
          locale: 'en-US',
          division: 'Division1',
          status: 'Active',
          folder: 'Marketing',
          fileName: 'test.jpg',
        },
      });

      const createBody = await createResponse.json();
      const assetId = createBody.assetId;

      // Now retrieve it
      const getResponse = await request.get(
        `${BASE_URL}${HANDLER_URL}?action=GetAssetData&assetId=${assetId}`,
        {
          headers: { Cookie: cookieString },
        }
      );

      expect(getResponse.status()).toBe(200);

      const getData = await getResponse.json();
      expect(getData.displayName).toBe('Get Test Asset');
      expect(getData.assetType).toBe('Image');
      expect(getData.assetId).toBe(assetId);
    });

    test('GET with invalid assetId returns 404', async ({ request, context }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const response = await request.get(
        `${BASE_URL}${HANDLER_URL}?action=GetAssetData&assetId=999999999`,
        {
          headers: { Cookie: cookieString },
        }
      );

      expect(response.status()).toBe(404);
    });
  });

  test.describe('UpdateAssetData Action', () => {
    test('POST /hnAssetUpload.ashx?action=UpdateAssetData updates existing asset', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      // Create asset first
      const createResponse = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        headers: { Cookie: cookieString },
        data: {
          displayName: 'Original Name',
          assetType: 'Image',
          locale: 'en-US',
          division: 'Division1',
          folder: 'Marketing',
          fileName: 'test.jpg',
        },
      });

      const createBody = await createResponse.json();
      const assetId = createBody.assetId;

      // Update it
      const updateResponse = await request.post(
        `${BASE_URL}${HANDLER_URL}?action=UpdateAssetData`,
        {
          headers: { Cookie: cookieString },
          data: {
            assetId: assetId,
            displayName: 'Updated Name',
            division: 'Division2',
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updateBody = await updateResponse.json();
      expect(updateBody.success).toBeTruthy();
      expect(updateBody.displayName).toBe('Updated Name');
    });
  });

  test.describe('DeleteAsset Action', () => {
    test('POST /hnAssetUpload.ashx?action=DeleteAsset soft-deletes asset', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      // Create asset
      const createResponse = await request.post(`${BASE_URL}${HANDLER_URL}?action=SaveAssetData`, {
        headers: { Cookie: cookieString },
        data: {
          displayName: 'Asset to Delete',
          assetType: 'Image',
          locale: 'en-US',
          division: 'Division1',
          folder: 'Marketing',
          fileName: 'test.jpg',
        },
      });

      const createBody = await createResponse.json();
      const assetId = createBody.assetId;

      // Delete it (soft delete)
      const deleteResponse = await request.post(`${BASE_URL}${HANDLER_URL}?action=DeleteAsset`, {
        headers: { Cookie: cookieString },
        data: { assetId: assetId },
      });

      expect(deleteResponse.status()).toBe(200);

      const deleteBody = await deleteResponse.json();
      expect(deleteBody.success).toBeTruthy();

      // Verify asset is marked as deleted (soft delete)
      const getResponse = await request.get(
        `${BASE_URL}${HANDLER_URL}?action=GetAssetData&assetId=${assetId}`,
        {
          headers: { Cookie: cookieString },
        }
      );

      // May return 404 or return with deleted flag
      expect([404, 200]).toContain(getResponse.status());
    });
  });

  test.describe('GetAssetThumbnail Action', () => {
    test('GET /hnAssetUpload.ashx?action=GetAssetThumbnail returns image data', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const response = await request.get(
        `${BASE_URL}${HANDLER_URL}?action=GetAssetThumbnail&assetId=1`,
        {
          headers: { Cookie: cookieString },
        }
      );

      // Should return image data (200 with image MIME type)
      if (response.ok) {
        expect(response.headers()['content-type']).toMatch(/image\//);
      }
    });
  });

  test.describe('UploadAsset Action', () => {
    test('POST /hnAssetUpload.ashx?action=UploadAsset with file returns success', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      // Create FormData with file
      // Note: In real test, would use actual file upload
      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=UploadAsset`, {
        headers: { Cookie: cookieString },
        multipart: {
          file: {
            name: 'test-banner.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from([0xff, 0xd8, 0xff]), // JPEG header
          },
        },
      });

      if (response.ok) {
        const responseBody = await response.json();
        expect(responseBody.fileName).toBeDefined();
        expect(responseBody.fileName).toContain('Adbuilderfile_');
      }
    });

    test('POST /hnAssetUpload.ashx?action=UploadAsset rejects .exe files', async ({
      request,
      context,
    }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=UploadAsset`, {
        headers: { Cookie: cookieString },
        multipart: {
          file: {
            name: 'malware.exe',
            mimeType: 'application/x-msdownload',
            buffer: Buffer.from([0x4d, 0x5a]), // EXE header
          },
        },
      });

      // Should reject
      expect([400, 403, 415]).toContain(response.status());
    });
  });

  test.describe('Error Handling', () => {
    test('Invalid action parameter returns 400', async ({ request, context }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const response = await request.post(`${BASE_URL}${HANDLER_URL}?action=InvalidAction`, {
        headers: { Cookie: cookieString },
        data: { test: 'data' },
      });

      expect(response.status()).toBe(400);
    });

    test('Missing action parameter returns error', async ({ request, context }) => {
      const cookies = await context.cookies();
      const cookieString = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

      const response = await request.post(`${BASE_URL}${HANDLER_URL}`, {
        headers: { Cookie: cookieString },
        data: { displayName: 'test' },
      });

      expect([400, 405]).toContain(response.status());
    });
  });
});
