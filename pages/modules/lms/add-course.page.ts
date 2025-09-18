import { Page, expect } from '@playwright/test';
import { ADD_COURSE_SELECTORS } from '../../../utils/selectors/modules/lms/add-course-selectors';
import { BasePage } from '../../common/base.page';

/**
 * Add Course Page Object - LMS Module
 * Handles interactions with the Add Course feature
 */
export class AddCoursePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Add Course page
   * @param baseUrl - The base URL for the environment
   */
  async navigateToAddCourse(baseUrl: string): Promise<void> {
    const addCourseUrl = `${baseUrl}/Lms/Core/Course/Submit/SubmitCourse`;
    await this.page.goto(addCourseUrl);
  }

  /**
   * Verify page is accessible and loaded
   */
  async verifyPageAccessibility(): Promise<void> {
    // Wait for the page to load (either the course form or login redirect)
    await this.page.waitForLoadState('networkidle');
    
    // Verify we're not on an error page
    const currentUrl = this.page.url();
    expect(currentUrl).not.toContain('error');
    expect(currentUrl).not.toContain('404');
    expect(currentUrl).not.toContain('500');
  }

  /**
   * Verify if user is redirected to login (for unauthenticated access)
   */
  async verifyLoginRedirect(): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes('/account/login') || currentUrl.includes('/login');
  }

  /**
   * Verify page title and content area are present (for authenticated access)
   */
  async verifyPageContent(): Promise<void> {
    // Check if we have main content area
    const contentArea = this.page.locator(ADD_COURSE_SELECTORS.CONTENT_AREA);
    await expect(contentArea).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if page has proper navigation elements
   */
  async verifyNavigationElements(): Promise<void> {
    // Verify breadcrumb or navigation is present
    const hasNavigation = await this.page.locator(ADD_COURSE_SELECTORS.NAVIGATION_MENU).isVisible() ||
                          await this.page.locator(ADD_COURSE_SELECTORS.BREADCRUMB).isVisible();
    
    expect(hasNavigation).toBeTruthy();
  }

  /**
   * Verify no error messages are displayed
   */
  async verifyNoErrors(): Promise<void> {
    const errorMessage = this.page.locator(ADD_COURSE_SELECTORS.ERROR_MESSAGE);
    await expect(errorMessage).not.toBeVisible();
  }
}
