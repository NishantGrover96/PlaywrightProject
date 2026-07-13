import { test, expect, request } from '@playwright/test';
import testData from '../../../playwright/data/admin/feature-feature-list/test-data.json';

/**
 * API Verification Tests - Admin / Feature List
 *
 * Tests all JSON endpoints for the FeatureList and ModuleList pages.
 * Verifies response shapes are consistent between legacy and modern.
 */

test.describe('Admin Feature List - API Verification', () => {

    // -- GET /Admin/Feature/FeatureList?handler=FeatureProgram ----------
    test('@api ADMIN-API-FL-001: FeatureProgram returns array with module and feature fields', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=FeatureProgram&moduleValue=${testData.modules.first}`
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        const list = body.data ?? body;
        expect(Array.isArray(list)).toBe(true);
        if (list.length > 0) {
            const item = list[0];
            expect(item).toHaveProperty('feature');
            expect(item).toHaveProperty('feature_key');
            expect(item).toHaveProperty('active_flag');
        }
    });

    // -- GET /Admin/Feature/FeatureList?handler=FeatureCounts ----------
    test('@api ADMIN-API-FL-002: FeatureCounts returns per-module totals', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=FeatureCounts&searchText=&statusFilter=`
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        const list = body.data ?? body;
        expect(Array.isArray(list)).toBe(true);
        if (list.length > 0) {
            expect(list[0]).toHaveProperty('module');
            expect(list[0]).toHaveProperty('totalCount');
            expect(list[0]).toHaveProperty('matchedCount');
        }
    });

    test('@api ADMIN-API-FL-003: FeatureCounts with search returns matchedCount <= totalCount', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=FeatureCounts&searchText=${testData.search.partialFeatureName}&statusFilter=`
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        const list = body.data ?? body;
        if (Array.isArray(list)) {
            for (const item of list) {
                expect(item.matchedCount).toBeLessThanOrEqual(item.totalCount);
            }
        }
    });

    // -- GET /Admin/Feature/FeatureList?handler=UserList ----------
    test('@api ADMIN-API-FL-004: UserList returns array for a given masterConfigId', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=UserList&masterConfigId=${testData.api.sampleMasterConfigId}`
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        const list = body.data ?? body;
        expect(Array.isArray(list)).toBe(true);
    });

    // -- GET /Admin/Feature/FeatureList?handler=AllUserGroupListDetail --
    test('@api ADMIN-API-FL-005: AllUserGroupListDetail returns key-value role list including All', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=AllUserGroupListDetail`
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        const list = body.data ?? body;
        expect(Array.isArray(list)).toBe(true);
        const allEntry = list.find((x: any) => x.key === 'All' || x.Key === 'All');
        expect(allEntry).toBeTruthy();
    });

    // -- GET /Admin/Feature/FeatureList?handler=DivisionList ----------
    test('@api ADMIN-API-FL-006: DivisionList returns array with value and label', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=DivisionList`
        );
        expect(response.status()).toBe(200);
        const list = await response.json();
        expect(Array.isArray(list)).toBe(true);
        if (list.length > 0) {
            expect(list[0]).toHaveProperty('value');
            expect(list[0]).toHaveProperty('label');
        }
    });

    // -- GET /Admin/Feature/FeatureList?handler=CountryList ----------
    test('@api ADMIN-API-FL-007: CountryList returns array with value and label', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=CountryList`
        );
        expect(response.status()).toBe(200);
        const list = await response.json();
        expect(Array.isArray(list)).toBe(true);
        if (list.length > 0) {
            expect(list[0]).toHaveProperty('value');
            expect(list[0]).toHaveProperty('label');
        }
    });

    // -- POST ValidateUserPin ------------------------------------------
    test('@api ADMIN-API-FL-008: ValidateUserPin with wrong pin returns status 2', async ({ request }) => {
        const response = await request.post(
            `/Admin/Feature/FeatureList?handler=ValidateUserPin`,
            { form: { pin: '999999' } }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data?.status ?? body.status).toBe(2);
    });

    // -- POST ProgramFeatureActiveFlag (shape check) ------------------
    test.fixme('@api ADMIN-API-FL-009: ToggleFeature returns status 200 and valid seq on success', async ({ request }) => {
        // Requires authenticated session with valid programDataId - mark fixme until test environment confirmed
    });

    // -- POST AddFeature (duplicate key) ------------------------------
    test('@api ADMIN-API-FL-010: AddFeature with duplicate FeatureKey returns status -1', async ({ request }) => {
        const response = await request.post(
            `/Admin/Feature/FeatureList?handler=AddFeature`,
            {
                form: {
                    module: testData.addFeature.existingModule,
                    feature: 'API Test Feature',
                    featureKey: testData.addFeature.existingFeatureKey,
                    activeFlag: 'Y',
                    description: 'API test',
                    propertyName: 'APITestProp' + Date.now(),
                }
            }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.status).toBe(-1);
        expect(body.field).toBe('featureKey');
    });

    // -- Module List: GET ----------------------------------------------
    test('@api ADMIN-API-FL-011: ModuleList UpdateModuleStatus returns success:true on valid toggle', async ({ request }) => {
        const response = await request.post(
            `/Admin/Feature/ModuleList?handler=UpdateModuleStatus`,
            {
                form: {
                    userModuleSeq: testData.moduleList.sampleUserModuleSeq,
                    programUserModuleSeq: testData.moduleList.sampleProgramUserModuleSeq,
                    moduleName: testData.moduleList.sampleModuleName,
                    isActive: 'true',
                }
            }
        );
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
    });

    // -- Legacy vs Modern response shape parity ------------------------
    test('@api ADMIN-API-FL-012: FeatureCounts response shape matches between legacy and modern', async ({ request }) => {
        const response = await request.get(
            `/Admin/Feature/FeatureList?handler=FeatureCounts&searchText=&statusFilter=`
        );
        const body = await response.json();
        const list = body.data ?? body;
        // Both legacy and modern must return array with module, totalCount, matchedCount
        if (Array.isArray(list) && list.length > 0) {
            expect(typeof list[0].module).toBe('string');
            expect(typeof list[0].totalCount).toBe('number');
            expect(typeof list[0].matchedCount).toBe('number');
        }
    });
});
