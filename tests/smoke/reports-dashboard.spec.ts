import { test } from '../base-test';
import { ReportsDashboardPage } from '../../pages/modules/reports/reports-dashboard.page';

/**
 * Reports Module - Smoke Tests
 *
 * Tests basic accessibility and functionality of the Reports Dashboard
 * Verifies that the Reports URL can be accessed successfully by authorized roles
 */

test.describe('Reports Module - URL Accessibility Smoke Tests', () => {
  let reportsDashboardPage: ReportsDashboardPage;

  test.beforeEach(async ({ page, auth }) => {
    reportsDashboardPage = new ReportsDashboardPage(page);
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should successfully access Reports Dashboard URL for Admin role', async ({ page }) => {
    // Set role context for this test
    process.env.ROLE = 'admin';

    console.log('🎯 Testing Reports Dashboard accessibility for Admin role');

    // Navigate to Reports Dashboard
    await reportsDashboardPage.navigateToReportsDashboard();

    // Wait for page to load
    await reportsDashboardPage.waitForPageLoad();

    // Perform comprehensive accessibility verification
    await reportsDashboardPage.verifyAccessibility();

    console.log('🎉 Admin role can successfully access Reports Dashboard');
  });

  test('should successfully access Reports Dashboard URL for Dealer role', async ({ page }) => {
    // Set role context for this test
    process.env.ROLE = 'dealer';

    console.log('🎯 Testing Reports Dashboard accessibility for Dealer role');

    // Navigate to Reports Dashboard
    await reportsDashboardPage.navigateToReportsDashboard();

    // Wait for page to load
    await reportsDashboardPage.waitForPageLoad();

    // Perform comprehensive accessibility verification
    await reportsDashboardPage.verifyAccessibility();

    console.log('🎉 Dealer role can successfully access Reports Dashboard');
  });

  test('should verify Reports Dashboard loads without errors', async ({ page }) => {
    console.log('🎯 Testing Reports Dashboard for error-free loading');

    // Navigate to Reports Dashboard
    await reportsDashboardPage.navigateToReportsDashboard();

    // Wait for page to load
    await reportsDashboardPage.waitForPageLoad();

    // Verify page loaded successfully
    await reportsDashboardPage.verifyPageLoaded();

    // Verify no error messages
    await reportsDashboardPage.verifyNoErrors();

    // Verify basic page structure
    await reportsDashboardPage.verifyPageStructure();

    console.log('🎉 Reports Dashboard loads without errors');
  });

  test('should verify Reports Dashboard has expected page structure', async ({ page }) => {
    console.log('🎯 Testing Reports Dashboard page structure');

    // Navigate to Reports Dashboard
    await reportsDashboardPage.navigateToReportsDashboard();

    // Wait for page to load
    await reportsDashboardPage.waitForPageLoad();

    // Verify page structure
    await reportsDashboardPage.verifyPageStructure();

    // Verify page title
    await reportsDashboardPage.verifyPageTitle();

    console.log('🎉 Reports Dashboard has expected page structure');
  });
});
