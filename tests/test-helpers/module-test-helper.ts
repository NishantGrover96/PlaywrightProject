import { Page } from '@playwright/test';
import { AuthManager } from '../auth-manager';

export class ModuleTestHelper {
  static async validateModuleAccess(auth: AuthManager, moduleName: string): Promise<boolean> {
    try {
      await auth.navigateToModule(moduleName);
      return await auth.verifyModuleAccess(moduleName);
    } catch (error) {
      console.error(`Error validating access to ${moduleName}:`, error);
      return false;
    }
  }

  static async checkModuleHealth(
    page: Page,
    moduleName: string
  ): Promise<{ hasErrors: boolean; loadTime: number }> {
    const startTime = Date.now();

    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    const errorCount = await page.locator('text=/error|404|500/i').count();
    const hasErrors = errorCount > 0;

    console.log(`Module ${moduleName} - Load time: ${loadTime}ms, Errors: ${hasErrors}`);

    return { hasErrors, loadTime };
  }

  static async getModuleMetrics(page: Page): Promise<any> {
    return await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        elements: {
          buttons: document.querySelectorAll('button, [class*="btn"]').length,
          inputs: document.querySelectorAll('input, textarea, select').length,
          tables: document.querySelectorAll('table, [class*="table"]').length,
          forms: document.querySelectorAll('form').length,
        },
      };
    });
  }

  static async validatePageElements(page: Page, expectedElements: string[]): Promise<boolean> {
    let allElementsFound = true;

    for (const elementSelector of expectedElements) {
      const elementCount = await page.locator(elementSelector).count();
      if (elementCount === 0) {
        console.warn(`Expected element not found: ${elementSelector}`);
        allElementsFound = false;
      } else {
        console.log(`✅ Found element: ${elementSelector} (${elementCount} instances)`);
      }
    }

    return allElementsFound;
  }

  static async checkResponsiveness(
    page: Page
  ): Promise<{ mobile: boolean; tablet: boolean; desktop: boolean }> {
    const results = { mobile: true, tablet: true, desktop: true };

    try {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      const mobileContent = await page.locator('body').isVisible();
      results.mobile = mobileContent;

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      const tabletContent = await page.locator('body').isVisible();
      results.tablet = tabletContent;

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);
      const desktopContent = await page.locator('body').isVisible();
      results.desktop = desktopContent;

      console.log('Responsiveness check:', results);
    } catch (error) {
      console.error('Error checking responsiveness:', error);
    }

    return results;
  }

  static async validateAccessibility(
    page: Page
  ): Promise<{ violations: number; warnings: number }> {
    try {
      // Basic accessibility checks
      const missingAlt = await page.locator('img:not([alt])').count();
      const missingLabels = await page
        .locator('input:not([aria-label]):not([aria-labelledby])')
        .count();
      const lowContrast = await page
        .locator('[style*="color: #ccc"], [style*="color: #ddd"]')
        .count();

      const violations = missingAlt + missingLabels;
      const warnings = lowContrast;

      console.log(`Accessibility check - Violations: ${violations}, Warnings: ${warnings}`);

      return { violations, warnings };
    } catch (error) {
      console.error('Error checking accessibility:', error);
      return { violations: 0, warnings: 0 };
    }
  }

  static async performSearchTest(page: Page, searchTerm: string): Promise<boolean> {
    try {
      // Look for common search input patterns
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="search" i]',
        '[class*="search"] input',
        '#search',
        '.search-input',
      ];

      let searchInput = null;
      for (const selector of searchSelectors) {
        const input = page.locator(selector);
        if ((await input.count()) > 0) {
          searchInput = input.first();
          break;
        }
      }

      if (!searchInput) {
        console.log('No search input found');
        return false;
      }

      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');

      console.log(`✅ Search test completed for term: ${searchTerm}`);
      return true;
    } catch (error) {
      console.error('Error performing search test:', error);
      return false;
    }
  }

  static async validateTableFunctionality(page: Page): Promise<{
    hasTable: boolean;
    rowCount: number;
    hasSorting: boolean;
    hasPagination: boolean;
  }> {
    try {
      const tableExists = (await page.locator('table, [class*="table"]').count()) > 0;

      if (!tableExists) {
        return { hasTable: false, rowCount: 0, hasSorting: false, hasPagination: false };
      }

      const rowCount = await page
        .locator('tbody tr, [class*="row"]:not([class*="header"])')
        .count();
      const hasSorting = (await page.locator('th[class*="sort"], [class*="sortable"]').count()) > 0;
      const hasPagination =
        (await page.locator('[class*="pagination"], [class*="pager"]').count()) > 0;

      console.log(
        `Table validation - Rows: ${rowCount}, Sorting: ${hasSorting}, Pagination: ${hasPagination}`
      );

      return { hasTable: true, rowCount, hasSorting, hasPagination };
    } catch (error) {
      console.error('Error validating table functionality:', error);
      return { hasTable: false, rowCount: 0, hasSorting: false, hasPagination: false };
    }
  }

  static async validateFormFunctionality(page: Page): Promise<{
    hasForm: boolean;
    inputCount: number;
    hasValidation: boolean;
    hasSubmit: boolean;
  }> {
    try {
      const formExists = (await page.locator('form, [class*="form"]').count()) > 0;

      if (!formExists) {
        return { hasForm: false, inputCount: 0, hasValidation: false, hasSubmit: false };
      }

      const inputCount = await page.locator('input, textarea, select').count();
      const hasValidation = (await page.locator('[class*="required"], [required]').count()) > 0;
      const hasSubmit =
        (await page.locator('button[type="submit"], input[type="submit"]').count()) > 0;

      console.log(
        `Form validation - Inputs: ${inputCount}, Validation: ${hasValidation}, Submit: ${hasSubmit}`
      );

      return { hasForm: true, inputCount, hasValidation, hasSubmit };
    } catch (error) {
      console.error('Error validating form functionality:', error);
      return { hasForm: false, inputCount: 0, hasValidation: false, hasSubmit: false };
    }
  }

  static async measurePerformance(page: Page): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    networkRequests: number;
  }> {
    try {
      const performanceMetrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

        return {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstContentfulPaint: fcp ? fcp.startTime : 0,
          networkRequests: performance.getEntriesByType('resource').length,
        };
      });

      console.log('Performance metrics:', performanceMetrics);
      return performanceMetrics;
    } catch (error) {
      console.error('Error measuring performance:', error);
      return { loadTime: 0, domContentLoaded: 0, firstContentfulPaint: 0, networkRequests: 0 };
    }
  }
}
