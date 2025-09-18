import { test, expect } from '../../base-test';
import { LoginPage } from '../../../pages/common/login.page';
import { DashboardPage } from '../../../pages/common/dashboard.page';
import { DataGenerator } from '../../../utils/data-generators/data-generator';

test.describe('Complete User Journey', () => {
  test('should complete full user workflow', async ({ page, context }) => {
    // Step 1: Manual login (testing login page object)
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    const clientId = process.env.CLIENT || 'demo';
    const { EnvironmentHelper } = await import('../../../utils/env/environment.helper');
    const envHelper = EnvironmentHelper.getInstance();
    const clientConfig = envHelper.getClientConfig(clientId);

    expect(clientConfig).toBeTruthy();

    await loginPage.performLogin(
      clientConfig!.credentials.username,
      clientConfig!.credentials.password
    );

    const loginSuccess = await loginPage.verifyLoginSuccess();
    expect(loginSuccess).toBe(true);

    // Step 2: Dashboard navigation
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForDashboard();

    const menuItems = await dashboardPage.getMenuItems();
    expect(menuItems.length).toBeGreaterThan(0);
    console.log('Available menu items:', menuItems);

    // Step 3: Module navigation and interaction
    const clientModules = envHelper.getClientModules(clientId);

    for (const module of clientModules.slice(0, 2)) {
      // Test first 2 modules
      console.log(`Testing workflow in module: ${module.name}`);

      await dashboardPage.navigateToModule(module.path);
      await page.waitForLoadState('networkidle');

      // Basic module interaction
      await page.waitForSelector('body');

      // Check for common elements (search, tables, buttons)
      const hasSearch =
        (await page.locator('input[type="search"], [class*="search"] input').count()) > 0;
      const hasTable = (await page.locator('table, [class*="table"]').count()) > 0;
      const hasButtons = (await page.locator('button, [class*="btn"]').count()) > 0;

      console.log(
        `Module ${module.name} elements - Search: ${hasSearch}, Table: ${hasTable}, Buttons: ${hasButtons}`
      );

      // Verify no errors
      const hasErrors = await page.locator('text=/error|404|500/i').count();
      expect(hasErrors, `No errors expected in ${module.name}`).toBe(0);
    }

    // Step 4: User profile/settings access
    const userProfileVisible = await dashboardPage.verifyUserLoggedIn();
    expect(userProfileVisible).toBe(true);

    console.log('✅ Complete user journey test passed');
  });

  test('should handle data entry workflows', async ({ authenticatedPage }) => {
    const testData = DataGenerator.randomUser();
    console.log('Generated test data:', testData);

    // Navigate to dashboard
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.navigateToDashboard();

    // Look for forms or data entry points
    const forms = await authenticatedPage.locator('form, [class*="form"]').count();
    const inputs = await authenticatedPage.locator('input, textarea').count();

    console.log(`Found ${forms} forms and ${inputs} input fields`);

    // If forms are available, test data entry
    if (inputs > 0) {
      const firstInput = authenticatedPage.locator('input, textarea').first();
      const isVisible = await firstInput.isVisible();

      if (isVisible) {
        await firstInput.fill(testData.firstName);
        console.log('✅ Data entry test completed');
      }
    }
  });
});
