---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in Page Object Model patterns and utility frameworks. This is Step 4 of 6 for creating a comprehensive multi-client SaaS testing framework.
---

## 📌 **STEP 4: PAGE OBJECT MODEL & UTILS FRAMEWORK**

### 🎯 **OBJECTIVE**

Create a comprehensive Page Object Model structure with common and module-specific pages, utility frameworks for selectors, helpers, assertions, and reusable components that support multi-client testing.

### 📋 **PREREQUISITES**

- ✅ Step 1 (Project Foundation) completed
- ✅ Step 2 (Environment Configuration) completed
- ✅ Step 3 (Authentication Framework) completed
- ✅ AuthManager and base-test available

## 🚀 **IMPLEMENTATION STEPS**

### **4.1 Base Page Class**

Create **pages/common/base.page.ts**:

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { EnvironmentHelper } from '../../utils/env/environment.helper';

export class BasePage {
  protected page: Page;
  protected envHelper: EnvironmentHelper;
  protected clientId: string;

  constructor(page: Page, clientId?: string) {
    this.page = page;
    this.envHelper = EnvironmentHelper.getInstance();
    this.clientId = clientId || process.env.CLIENT || 'demo';
  }

  // Common navigation methods
  async goto(path: string = ''): Promise<void> {
    const urls = this.envHelper.getUrlsForClient(this.clientId);
    const fullUrl = `${urls.baseUrl}${path}`;

    console.log(`🎯 Navigating to: ${fullUrl}`);
    await this.page.goto(fullUrl);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('body');
  }

  // Common element interactions
  async clickElement(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async fillInput(selector: string, text: string): Promise<void> {
    await this.page.locator(selector).fill(text);
  }

  async selectDropdown(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  // Common verifications
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async verifyElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async verifyElementText(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expectedText);
  }

  // Wait for element
  async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
    return await this.page.locator(selector).waitFor({ timeout });
  }

  // Screenshot helper
  async takeScreenshot(name?: string): Promise<void> {
    const screenshotName = name || `${this.constructor.name}_${Date.now()}`;
    await this.page.screenshot({ path: `test-results/${screenshotName}.png` });
  }

  // Get page URL
  getCurrentUrl(): string {
    return this.page.url();
  }

  // Check for error messages
  async checkForErrors(): Promise<boolean> {
    const errorSelectors = [
      'text=/error/i',
      'text=/404/i',
      'text=/500/i',
      'text=/access denied/i',
      '[class*="error"]',
      '[class*="alert-danger"]',
    ];

    for (const selector of errorSelectors) {
      const errorCount = await this.page.locator(selector).count();
      if (errorCount > 0) {
        console.log(`⚠️ Error found with selector: ${selector}`);
        return true;
      }
    }
    return false;
  }
}
```

### **4.2 Login Page**

Create **pages/common/login.page.ts**:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Selectors
  private readonly usernameInput =
    'input[name="email"], input[name="username"], input[type="email"]';
  private readonly passwordInput = 'input[name="password"], input[type="password"]';
  private readonly loginButton =
    'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")';
  private readonly errorMessage = '[class*="error"], [class*="alert"], .error-message';
  private readonly loadingSpinner = '[class*="loading"], [class*="spinner"], .loading';

  constructor(page: Page, clientId?: string) {
    super(page, clientId);
  }

  async navigateToLogin(): Promise<void> {
    const urls = this.envHelper.getUrlsForClient(this.clientId);
    await this.page.goto(urls.loginUrl);
    await this.waitForPageLoad();
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
  }

  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);

    // Wait for either redirect or error
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      console.log('Login navigation timeout - continuing...');
    }
  }

  async performLogin(username: string, password: string): Promise<void> {
    await this.navigateToLogin();
    await this.fillCredentials(username, password);
    await this.clickLogin();

    // Verify no loading spinners
    await this.page
      .waitForSelector(this.loadingSpinner, { state: 'detached', timeout: 5000 })
      .catch(() => {});
  }

  async verifyLoginError(): Promise<boolean> {
    const errorCount = await this.page.locator(this.errorMessage).count();
    return errorCount > 0;
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = this.page.locator(this.errorMessage).first();
    return (await errorElement.textContent()) || '';
  }

  async verifyLoginSuccess(): Promise<boolean> {
    // Check if we're no longer on login page
    const currentUrl = this.getCurrentUrl();
    const urls = this.envHelper.getUrlsForClient(this.clientId);

    return (
      !currentUrl.includes('login') &&
      currentUrl.includes(urls.baseUrl.replace('https://', '').replace('http://', ''))
    );
  }
}
```

### **4.3 Dashboard Page**

Create **pages/common/dashboard.page.ts**:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // Common dashboard selectors
  private readonly sidebarMenu = 'nav, [class*="sidebar"], [class*="menu"]';
  private readonly menuItems = 'a[href], [class*="menu-item"], [class*="nav-item"]';
  private readonly userProfile = '[class*="user"], [class*="profile"], [data-testid="user-menu"]';
  private readonly logoutButton = 'text=/logout/i, [class*="logout"]';
  private readonly mainContent = 'main, [class*="content"], [class*="dashboard"]';
  private readonly breadcrumbs = '[class*="breadcrumb"], nav[aria-label="breadcrumb"]';

  constructor(page: Page, clientId?: string) {
    super(page, clientId);
  }

  async navigateToDashboard(): Promise<void> {
    await this.goto('/dashboard');
  }

  async waitForDashboard(): Promise<void> {
    await this.waitForElement(this.mainContent);
    await this.verifyElementVisible(this.sidebarMenu);
  }

  async getMenuItems(): Promise<string[]> {
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

  async clickMenuItem(menuText: string): Promise<void> {
    const menuItem = this.page
      .locator(`${this.sidebarMenu} ${this.menuItems}`)
      .filter({ hasText: menuText });
    await menuItem.click();
    await this.waitForPageLoad();
  }

  async navigateToModule(modulePath: string): Promise<void> {
    await this.goto(modulePath);
  }

  async verifyUserLoggedIn(): Promise<boolean> {
    const userProfileCount = await this.page.locator(this.userProfile).count();
    return userProfileCount > 0;
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
}
```

### **4.4 Module Page Base Class**

Create **pages/modules/module-base.page.ts**:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../common/base.page';

export class ModuleBasePage extends BasePage {
  protected moduleName: string;
  protected modulePath: string;

  // Common module selectors
  protected readonly moduleHeader = 'h1, [class*="header"], [class*="title"]';
  protected readonly actionButtons = 'button, [class*="btn"], [role="button"]';
  protected readonly dataTable = 'table, [class*="table"], [class*="grid"]';
  protected readonly searchInput =
    'input[type="search"], [placeholder*="search" i], [class*="search"] input';
  protected readonly filterDropdown = 'select, [class*="filter"], [class*="dropdown"]';
  protected readonly addButton =
    'button:has-text("Add"), button:has-text("Create"), button:has-text("New")';
  protected readonly editButton = 'button:has-text("Edit"), [class*="edit"]';
  protected readonly deleteButton = 'button:has-text("Delete"), [class*="delete"]';
  protected readonly saveButton = 'button:has-text("Save"), button[type="submit"]';
  protected readonly cancelButton = 'button:has-text("Cancel"), button:has-text("Close")';

  constructor(page: Page, moduleName: string, modulePath: string, clientId?: string) {
    super(page, clientId);
    this.moduleName = moduleName;
    this.modulePath = modulePath;
  }

  async navigateToModule(): Promise<void> {
    await this.goto(this.modulePath);
    await this.waitForModuleLoad();
  }

  async waitForModuleLoad(): Promise<void> {
    await this.waitForPageLoad();
    await this.waitForElement(this.moduleHeader);
  }

  async verifyModuleTitle(expectedTitle?: string): Promise<void> {
    const title = expectedTitle || this.moduleName;
    await this.verifyElementText(this.moduleHeader, title);
  }

  // Common module actions
  async clickAddButton(): Promise<void> {
    await this.clickElement(this.addButton);
  }

  async searchFor(searchTerm: string): Promise<void> {
    await this.fillInput(this.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  async getTableRowCount(): Promise<number> {
    return await this.page.locator(`${this.dataTable} tbody tr, ${this.dataTable} tr`).count();
  }

  async clickTableRow(rowIndex: number): Promise<void> {
    const row = this.page.locator(`${this.dataTable} tbody tr, ${this.dataTable} tr`).nth(rowIndex);
    await row.click();
  }

  async getTableData(rowIndex: number, columnIndex: number): Promise<string> {
    const cell = this.page
      .locator(`${this.dataTable} tbody tr, ${this.dataTable} tr`)
      .nth(rowIndex)
      .locator('td, th')
      .nth(columnIndex);
    return (await cell.textContent()) || '';
  }
}
```

### **4.5 Common Selectors Utility**

Create **utils/selectors/common/common-selectors.ts**:

```typescript
export const CommonSelectors = {
  // Authentication
  login: {
    usernameInput: 'input[name="email"], input[name="username"], input[type="email"]',
    passwordInput: 'input[name="password"], input[type="password"]',
    loginButton:
      'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
    errorMessage: '[class*="error"], [class*="alert"], .error-message',
    forgotPassword: 'a:has-text("Forgot"), a:has-text("Reset")',
  },

  // Navigation
  navigation: {
    sidebar: 'nav, [class*="sidebar"], [class*="menu"]',
    menuItem: 'a[href], [class*="menu-item"], [class*="nav-item"]',
    breadcrumbs: '[class*="breadcrumb"], nav[aria-label="breadcrumb"]',
    userProfile: '[class*="user"], [class*="profile"], [data-testid="user-menu"]',
    logoutButton: 'text=/logout/i, [class*="logout"]',
  },

  // Common UI Elements
  ui: {
    button: 'button, [class*="btn"], [role="button"]',
    input: 'input, textarea',
    dropdown: 'select, [class*="dropdown"], [role="combobox"]',
    checkbox: 'input[type="checkbox"], [role="checkbox"]',
    radioButton: 'input[type="radio"], [role="radio"]',
    table: 'table, [class*="table"], [class*="grid"]',
    modal: '[class*="modal"], [role="dialog"]',
    tab: '[role="tab"], [class*="tab"]',
    tooltip: '[class*="tooltip"], [role="tooltip"]',
  },

  // Data Table
  table: {
    header: 'thead th, [class*="header"] th, th',
    row: 'tbody tr, [class*="row"]',
    cell: 'td, [class*="cell"]',
    sortButton: '[class*="sort"], th button',
    pagination: '[class*="pagination"], [class*="pager"]',
  },

  // Forms
  form: {
    container: 'form, [class*="form"]',
    field: '[class*="field"], [class*="form-group"]',
    label: 'label, [class*="label"]',
    required: '[required], [class*="required"]',
    error: '[class*="error"], [class*="invalid"]',
    submit: 'button[type="submit"], input[type="submit"]',
    cancel: 'button[type="button"]:has-text("Cancel"), button:has-text("Cancel")',
  },

  // Loading and Status
  status: {
    loading: '[class*="loading"], [class*="spinner"], .loading',
    success: '[class*="success"], [class*="alert-success"]',
    error: '[class*="error"], [class*="alert-error"], [class*="alert-danger"]',
    warning: '[class*="warning"], [class*="alert-warning"]',
    info: '[class*="info"], [class*="alert-info"]',
  },

  // Common Actions
  actions: {
    add: 'button:has-text("Add"), button:has-text("Create"), button:has-text("New")',
    edit: 'button:has-text("Edit"), [class*="edit"], [title*="edit" i]',
    delete: 'button:has-text("Delete"), [class*="delete"], [title*="delete" i]',
    save: 'button:has-text("Save"), button[type="submit"]',
    cancel: 'button:has-text("Cancel"), button:has-text("Close")',
    search: 'input[type="search"], [placeholder*="search" i], [class*="search"] input',
    filter: '[class*="filter"], [class*="dropdown"]',
  },
};
```

### **4.6 Helper Utilities**

Create **utils/helpers/element-helper.ts**:

```typescript
import { Page, Locator } from '@playwright/test';

export class ElementHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Wait for element with custom conditions
  async waitForElementWithText(
    selector: string,
    text: string,
    timeout: number = 10000
  ): Promise<Locator> {
    return await this.page.locator(selector).filter({ hasText: text }).waitFor({ timeout });
  }

  // Check if element exists without waiting
  async isElementPresent(selector: string): Promise<boolean> {
    const count = await this.page.locator(selector).count();
    return count > 0;
  }

  // Get all text content from elements
  async getAllTexts(selector: string): Promise<string[]> {
    const elements = await this.page.locator(selector).all();
    const texts: string[] = [];

    for (const element of elements) {
      const text = await element.textContent();
      if (text) texts.push(text.trim());
    }

    return texts;
  }

  // Scroll to element
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  // Click with retry mechanism
  async clickWithRetry(selector: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.locator(selector).click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.log(`Click retry ${i + 1} for selector: ${selector}`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  // Fill input with clear first
  async fillWithClear(selector: string, text: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.clear();
    await element.fill(text);
  }

  // Select dropdown by text
  async selectByText(selector: string, text: string): Promise<void> {
    await this.page.locator(selector).selectOption({ label: text });
  }

  // Upload file
  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.page.locator(selector).setInputFiles(filePath);
  }

  // Wait for element to be hidden
  async waitForHidden(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }
}
```

Create **utils/helpers/date-helper.ts**:

```typescript
export class DateHelper {
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  static getFormattedDate(date: Date = new Date(), format: string = 'MM/DD/YYYY'): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  }

  static getFutureDate(days: number): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.getFormattedDate(futureDate);
  }

  static getPastDate(days: number): string {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    return this.getFormattedDate(pastDate);
  }
}
```

### **4.7 Custom Assertions**

Create **utils/assertions/custom-assertions.ts**:

```typescript
import { expect, Locator, Page } from '@playwright/test';

export class CustomAssertions {
  static async assertElementVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  static async assertElementHidden(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeHidden();
  }

  static async assertElementText(
    locator: Locator,
    expectedText: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveText(expectedText);
  }

  static async assertElementContainsText(
    locator: Locator,
    expectedText: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toContainText(expectedText);
  }

  static async assertElementCount(
    locator: Locator,
    expectedCount: number,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveCount(expectedCount);
  }

  static async assertPageTitle(page: Page, expectedTitle: string, message?: string): Promise<void> {
    await expect(page, message).toHaveTitle(expectedTitle);
  }

  static async assertPageUrl(
    page: Page,
    expectedUrl: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(page, message).toHaveURL(expectedUrl);
  }

  static async assertNoErrors(page: Page): Promise<void> {
    const errorSelectors = [
      'text=/error/i',
      'text=/404/i',
      'text=/500/i',
      '[class*="error"]',
      '[class*="alert-danger"]',
    ];

    for (const selector of errorSelectors) {
      const errorCount = await page.locator(selector).count();
      expect(errorCount, `Found error elements with selector: ${selector}`).toBe(0);
    }
  }

  static async assertTableRowCount(
    table: Locator,
    expectedCount: number,
    message?: string
  ): Promise<void> {
    const rows = table.locator('tbody tr, tr');
    await expect(rows, message).toHaveCount(expectedCount);
  }

  static async assertFormFieldRequired(field: Locator, message?: string): Promise<void> {
    await expect(field, message).toHaveAttribute('required');
  }

  static async assertElementDisabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeDisabled();
  }

  static async assertElementEnabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeEnabled();
  }
}
```

### **4.8 Data Generator Utility**

Create **utils/data-generators/data-generator.ts**:

```typescript
export class DataGenerator {
  // Generate random string
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate random email
  static randomEmail(): string {
    return `test_${this.randomString(8)}@example.com`;
  }

  // Generate random number
  static randomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate random phone number
  static randomPhone(): string {
    const areaCode = this.randomNumber(200, 999);
    const exchange = this.randomNumber(200, 999);
    const number = this.randomNumber(1000, 9999);
    return `${areaCode}-${exchange}-${number}`;
  }

  // Generate test user data
  static generateUserData() {
    return {
      firstName: `FirstName_${this.randomString(5)}`,
      lastName: `LastName_${this.randomString(5)}`,
      email: this.randomEmail(),
      phone: this.randomPhone(),
      username: `user_${this.randomString(8)}`,
      company: `Company_${this.randomString(6)}`,
    };
  }

  // Generate test product data
  static generateProductData() {
    return {
      name: `Product_${this.randomString(6)}`,
      description: `Test product description ${this.randomString(10)}`,
      price: this.randomNumber(10, 1000),
      sku: `SKU_${this.randomString(8).toUpperCase()}`,
      category: `Category_${this.randomString(5)}`,
    };
  }
}
```

## 🎯 **VALIDATION CHECKLIST**

After completing this step, verify:

- [ ] Base page class provides common functionality
- [ ] Login and Dashboard pages implemented
- [ ] Module base page class available for specific modules
- [ ] Common selectors utility created
- [ ] Helper utilities (element, date) functional
- [ ] Custom assertions working
- [ ] Data generator utility available
- [ ] Page objects can be instantiated and used

## 📋 **TESTING THE PAGE OBJECTS**

Create **tests/page-objects-validation.spec.ts**:

```typescript
import { test, expect } from './base-test';
import { LoginPage } from '../pages/common/login.page';
import { DashboardPage } from '../pages/common/dashboard.page';
import { DataGenerator } from '../utils/data-generators/data-generator';

test.describe('Page Objects Validation', () => {
  test('Login page should work correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigateToLogin();
    await expect(page.locator('body')).toBeVisible();

    // Verify login page elements are present
    await loginPage.verifyElementVisible(
      'input[name="email"], input[name="username"], input[type="email"]'
    );
  });

  test('Dashboard page should work correctly', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);

    await dashboardPage.navigateToDashboard();
    await dashboardPage.waitForDashboard();

    const isLoggedIn = await dashboardPage.verifyUserLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('Data generator should create valid data', async ({ page }) => {
    const userData = DataGenerator.generateUserData();

    expect(userData.firstName).toContain('FirstName_');
    expect(userData.email).toContain('@example.com');
    expect(userData.phone).toMatch(/\d{3}-\d{3}-\d{4}/);

    console.log('Generated user data:', userData);
  });
});
```

## 🔍 **SUCCESS CRITERIA**

- ✅ Base page class with common functionality implemented
- ✅ Login and Dashboard page objects created
- ✅ Module base page pattern established
- ✅ Common selectors utility available
- ✅ Helper utilities (element, date) functional
- ✅ Custom assertions framework created
- ✅ Data generator utility working
- ✅ Page objects can be used in tests
- ✅ Validation tests pass

## 📋 **NEXT STEPS**

- **Step 5**: Test Organization & Structure (smoke, regression, e2e tests)
- **Step 6**: Advanced Features & Complete Scripts

**Note**: This is Step 4 of 6. Complete this step fully before proceeding to Step 5 (Test Organization & Structure).
