import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // Dashboard selectors based on MCP exploration
  private readonly sidebarMenu = 'nav, [class*="sidebar"], [class*="menu"], list';
  private readonly menuItems = 'a[href], [class*="menu-item"], [class*="nav-item"], listitem';
  private readonly userProfile = 'button:has-text("David Lenzen Corporate Admin"), [class*="user"], [class*="profile"]';
  private readonly logoutButton = 'text=/logout/i, [class*="logout"]';
  private readonly mainContent = 'div.customScroll.scroll-content';
  private readonly breadcrumbs = '[class*="breadcrumb"], nav[aria-label="breadcrumb"]';
  private readonly moduleGrid = 'list'; // The main module grid
  private readonly moduleCards = 'listitem';
  private readonly recentActivities = 'text="Recent Activities / Notification(s)"';

  constructor(page: Page, clientId?: string) {
    super(page, clientId);
  }

  async navigateToDashboard(): Promise<void> {
    await this.goto('/Index'); // Demo portal uses /Index for dashboard
  }

  async waitForDashboard(): Promise<void> {
    // Wait for page load instead of conflicting elements
    await this.page.waitForLoadState('domcontentloaded', { timeout: 90000 });
    // Check for module grid as indicator of successful load
    try {
      await this.page.waitForSelector(this.moduleGrid, { timeout: 10000 });
    } catch {
      // If module grid not found, at least verify we're not on login page
      const url = this.page.url();
      if (url.includes('login')) {
        throw new Error('Dashboard not loaded - still on login page');
      }
    }
  }

  async getMenuItems(): Promise<string[]> {
    // Get sidebar navigation menu items
    const menuItems = await this.page.locator(`${this.sidebarMenu} ${this.menuItems}`).all();
    const menuTexts: string[] = [];

    for (const item of menuItems) {
      const text = await item.textContent();
      if (text && text.trim()) {
        menuTexts.push(text.trim());
      }
    }

    return menuTexts;
  }

  async getModuleCards(): Promise<string[]> {
    // Get main dashboard module cards
    const moduleCards = await this.page.locator(`${this.moduleGrid} ${this.moduleCards} link`).all();
    const moduleTexts: string[] = [];

    for (const card of moduleCards) {
      const text = await card.textContent();
      if (text && text.trim()) {
        moduleTexts.push(text.trim());
      }
    }

    return moduleTexts;
  }

  async clickMenuItem(menuText: string): Promise<void> {
    const menuItem = this.page
      .locator(`${this.sidebarMenu} ${this.menuItems}`)
      .filter({ hasText: menuText });
    await menuItem.click();
    await this.waitForPageLoad();
  }

  async clickModuleCard(moduleName: string): Promise<void> {
    // Click on module card by name
    const moduleCard = this.page
      .locator(`${this.moduleGrid} ${this.moduleCards}`)
      .filter({ hasText: moduleName })
      .locator('link')
      .first();
    
    await moduleCard.click();
    await this.waitForPageLoad();
  }

  async navigateToModule(modulePath: string): Promise<void> {
    await this.goto(modulePath);
  }

  async verifyUserLoggedIn(): Promise<boolean> {
    // Check for user profile or any authenticated elements
    const userProfileCount = await this.page.locator(this.userProfile).count();
    const corporateAdminText = await this.page.locator('text="Corporate Admin"').count();
    
    return userProfileCount > 0 || corporateAdminText > 0;
  }

  async getUserDisplayName(): Promise<string> {
    try {
      const userElement = this.page.locator('text="David Lenzen"').first();
      return (await userElement.textContent()) || '';
    } catch {
      return '';
    }
  }

  async logout(): Promise<void> {
    // Try to access user profile menu first
    try {
      await this.clickElement(this.userProfile);
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('No user profile menu found, looking for direct logout button');
    }

    await this.clickElement(this.logoutButton);
    await this.waitForPageLoad();
  }

  async getBreadcrumbs(): Promise<string[]> {
    const breadcrumbElements = await this.page
      .locator(`${this.breadcrumbs} a, ${this.breadcrumbs} span`)
      .all();
    const breadcrumbs: string[] = [];

    for (const element of breadcrumbElements) {
      const text = await element.textContent();
      if (text && text.trim()) {
        breadcrumbs.push(text.trim());
      }
    }

    return breadcrumbs;
  }

  async verifyRecentActivities(): Promise<boolean> {
    const activitiesCount = await this.page.locator(this.recentActivities).count();
    return activitiesCount > 0;
  }

  async getRecentActivitiesCount(): Promise<number> {
    // Count notification items in recent activities
    const activitiesList = this.page.locator('list').filter({ hasText: 'Now processing' });
    return await activitiesList.locator('listitem').count();
  }

  async verifyDashboardElements(): Promise<void> {
    // Verify key dashboard elements are present
    await this.verifyElementVisible(this.mainContent);
    
    // Verify user is logged in
    const isLoggedIn = await this.verifyUserLoggedIn();
    if (!isLoggedIn) {
      throw new Error('User authentication verification failed on dashboard');
    }
  }
}
