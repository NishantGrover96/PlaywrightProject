import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Selectors - Updated with MCP-discovered selectors
  private readonly usernameInput = 'textbox[name="Username"]';
  private readonly passwordInput = 'textbox[name="Password"]';
  private readonly loginButton = 'button:has-text("Sign In")';
  private readonly errorMessage = '[class*="error"], [class*="alert"], .error-message';
  private readonly loadingSpinner = '[class*="loading"], [class*="spinner"], .loading';
  private readonly loginHeading = 'heading:has-text("Sign Into Your Account")';
  private readonly needHelpLink = 'link:has-text("Need Help?")';
  private readonly forgotPasswordLink = 'link:has-text("Forgot Password?")';

  constructor(page: Page, clientId?: string) {
    super(page, clientId);
  }

  async navigateToLogin(): Promise<void> {
    const urls = this.envHelper.getUrlsForClient(this.clientId);
    await this.page.goto(urls.loginUrl);
    await this.waitForPageLoad();
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    // Use MCP-discovered role-based selectors
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
  }

  async clickLogin(): Promise<void> {
    // Use MCP-discovered button selector
    await this.page.getByRole('button', { name: 'Sign In' }).click();

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

    // Look for /Index path (demo portal post-login)
    const isAtDashboard = currentUrl.includes('/Index');
    const isAtCorrectDomain = currentUrl.includes(
      urls.baseUrl.replace('https://', '').replace('http://', '')
    );

    return isAtDashboard && isAtCorrectDomain;
  }

  async verifyLoginPageElements(): Promise<void> {
    // Verify key login page elements are present
    await this.verifyElementVisible(this.loginHeading);
    await this.verifyElementVisible(this.usernameInput);
    await this.verifyElementVisible(this.passwordInput);
    await this.verifyElementVisible(this.loginButton);
  }

  async clickNeedHelp(): Promise<void> {
    await this.clickElement(this.needHelpLink);
  }

  async clickForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
  }
}
