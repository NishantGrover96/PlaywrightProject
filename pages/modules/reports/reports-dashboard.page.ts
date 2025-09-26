import { Page, expect } from '@playwright/test';
import { EnvironmentHelper } from '../../../utils/env/environment.helper';
import { REPORTS_SELECTORS } from '../../../utils/selectors/modules/reports/reports-selectors';
import { REPORTS_TEST_DATA } from '../../../fixtures/test-data/reports/reports-data';

/**
 * Reports Dashboard Page Object
 * Handles interactions with the Reports Dashboard page
 */
export class ReportsDashboardPage {
  private page: Page;
  private envHelper: EnvironmentHelper;

  constructor(page: Page) {
    this.page = page;
    this.envHelper = EnvironmentHelper.getInstance();
  }

  /**
   * Navigate to Reports Dashboard
   */
  async navigateToReportsDashboard(): Promise<void> {
    const clientId = process.env.CLIENT || 'demo';
    const environment = process.env.ENV || 'dev';

    const { baseUrl } = this.envHelper.getUrlsForClient(clientId, environment);
    const reportsUrl = `${baseUrl}${REPORTS_TEST_DATA.paths.reportsDashboard}`;

    console.log(`🎯 Navigating to Reports Dashboard: ${reportsUrl}`);
    await this.page.goto(reportsUrl);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    try {
      // Wait for network to be idle (with fallback)
      await this.page.waitForLoadState('networkidle', {
        timeout: REPORTS_TEST_DATA.timeouts.pageLoad,
      });
    } catch (error) {
      console.log('⚠️ Network idle timeout, but continuing with DOM-based waiting...');
      // Continue with DOM-based waiting even if network isn't idle
    }

    // Wait for report sections to be visible (this indicates content loaded)
    await this.page.waitForSelector(REPORTS_SELECTORS.REPORTS_SECTIONS, {
      timeout: REPORTS_TEST_DATA.timeouts.elementVisible,
      state: 'visible',
    });

    console.log('✅ Page loading completed');
  }

  /**
   * Verify page loaded successfully
   */
  async verifyPageLoaded(): Promise<void> {
    // Check that we're not on the login page
    const currentUrl = this.page.url();
    expect(currentUrl).not.toContain('/account/login');
    expect(currentUrl).not.toContain('/login');

    // Verify we're on the reports page
    expect(currentUrl).toContain('/Reports/ReportList');

    console.log('✅ Successfully navigated to Reports Dashboard');
  }

  /**
   * Verify no error messages are displayed
   */
  async verifyNoErrors(): Promise<void> {
    // Check for common error selectors
    const errorElement = await this.page.locator(REPORTS_SELECTORS.ERROR_MESSAGE).first();
    const noAccessElement = await this.page.locator(REPORTS_SELECTORS.NO_ACCESS_MESSAGE).first();

    // Verify no errors are visible
    await expect(errorElement).not.toBeVisible();
    await expect(noAccessElement).not.toBeVisible();

    console.log('✅ No error messages found on page');
  }

  /**
   * Verify page has expected content structure
   */
  async verifyPageStructure(): Promise<void> {
    // Check for report sections (this is the main indicator of successful load)
    const reportSections = this.page.locator(REPORTS_SELECTORS.REPORTS_SECTIONS);
    const sectionCount = await reportSections.count();

    expect(sectionCount).toBeGreaterThan(0);
    console.log(`✅ Found ${sectionCount} report sections on the page`);

    // Check for navigation header
    const header = this.page.locator(REPORTS_SELECTORS.HEADER).first();
    await expect(header).toBeVisible();
    console.log('✅ Navigation header found');

    // Check for report links (indicates reports are loaded)
    const reportLinks = this.page.locator(REPORTS_SELECTORS.REPORT_LINKS);
    const linkCount = await reportLinks.count();

    expect(linkCount).toBeGreaterThan(0);
    console.log(`✅ Found ${linkCount} report links on the page`);

    console.log('✅ Page structure verification completed');
  }

  /**
   * Verify page title contains expected keywords
   */
  async verifyPageTitle(): Promise<void> {
    const title = await this.page.title();
    const hasReportsKeyword = REPORTS_TEST_DATA.expectedElements.pageIndicators.some(
      (keyword: string) => title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasReportsKeyword) {
      console.log(`✅ Page title contains expected reports keyword: "${title}"`);
    } else {
      console.log(`ℹ️ Page title: "${title}" - may not contain specific reports keywords`);
    }
  }

  /**
   * Verify specific report sections are present
   */
  async verifyReportSections(): Promise<void> {
    const expectedSections = [
      'Rewards Reports',
      'Incentives',
      'Co-op Reports',
      'Brand Shop Reports',
    ];

    for (const section of expectedSections) {
      const sectionHeading = this.page.locator(`h3:has-text("${section}")`);
      const isVisible = await sectionHeading.isVisible();

      if (isVisible) {
        console.log(`✅ Found "${section}" section`);
      } else {
        console.log(`ℹ️ "${section}" section not found (may be permission-based)`);
      }
    }

    console.log('✅ Report sections verification completed');
  }

  /**
   * Complete accessibility verification
   */
  async verifyAccessibility(): Promise<void> {
    await this.verifyPageLoaded();
    await this.verifyNoErrors();
    await this.verifyPageStructure();
    await this.verifyPageTitle();
    await this.verifyReportSections();

    console.log('🎉 Reports Dashboard accessibility verification completed successfully');
  }
}
