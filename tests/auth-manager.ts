import { Page, BrowserContext } from '@playwright/test';
import { ClientConfig, clientModulesConfig } from '../configs/clients/client-modules-access';
import { EnvironmentHelper } from '../utils/env/environment.helper';
const fs = require('fs');
const path = require('path');

export class AuthManager {
  public page: Page;
  private context: BrowserContext;
  private clientConfig: ClientConfig;
  private currentUser: string | null = null;
  private sessionCache: Map<string, any> = new Map();
  private envHelper: EnvironmentHelper;
  private _isAuthenticated: boolean = false;

  constructor(page: Page, context: BrowserContext, clientId: string) {
    this.page = page;
    this.context = context;
    this.envHelper = EnvironmentHelper.getInstance();

    const config = clientModulesConfig.find((c) => c.clientId === clientId);
    if (!config) {
      throw new Error(`Client configuration not found for: ${clientId}`);
    }
    this.clientConfig = config;
  }

  // Update page reference if it gets closed
  updatePage(newPage: Page): void {
    this.page = newPage;
  }

  // Set authentication state (used when we know session is valid from global check)
  setAuthenticationState(isAuthenticated: boolean): void {
    this._isAuthenticated = isAuthenticated;
  }

  // Check if this auth manager instance is already authenticated
  // This should check the actual session validity, not just local flag
  async isAuthenticated(): Promise<boolean> {
    // If we already marked as authenticated (e.g., from global setup), trust it
    if (this._isAuthenticated) {
      return true;
    }

    const environment = process.env.ENV || 'dev';
    const role = process.env.ROLE || 'admin';

    // Only validate if not already marked as authenticated
    const hasValidSession = await this.hasValidSession(role);
    if (hasValidSession) {
      this._isAuthenticated = true;
      return true;
    }

    this._isAuthenticated = false;
    return false;
  }

  // CRITICAL: 20-minute session expiry validation
  async hasValidSession(role: string = 'admin'): Promise<boolean> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;

    try {
      const sessionPath = path.join('fixtures', 'global-fixtures', `auth-${sessionKey}.json`);

      if (!fs.existsSync(sessionPath)) {
        console.log(`📂 Session file not found for ${sessionKey}`);
        return false;
      }

      // Check session age (20 minute expiry)
      const stats = fs.statSync(sessionPath);
      const sessionAge = Date.now() - stats.mtime.getTime();
      const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds

      if (sessionAge > twentyMinutes) {
        console.log(
          `⏰ Session expired for ${sessionKey} (${Math.round(sessionAge / 1000 / 60)} minutes old)`
        );
        return false;
      }

      // Load and validate session
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

      if (
        !sessionData.cookies ||
        !Array.isArray(sessionData.cookies) ||
        sessionData.cookies.length === 0
      ) {
        console.log(`❌ Invalid session data for ${sessionKey}`);
        return false;
      }

      console.log(
        `✅ Valid session found for ${sessionKey} (${Math.round(sessionAge / 1000 / 60)} minutes old)`
      );
      return true;
    } catch (error) {
      console.error(`Error checking session for ${sessionKey}:`, error);
      return false;
    }
  }

  // Load existing session from file
  async loadSession(role: string = 'admin', skipValidation: boolean = false): Promise<boolean> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;

    try {
      // Skip validation if we already checked at global level
      if (!skipValidation && !(await this.hasValidSession(role))) {
        return false;
      }

      const sessionPath = path.join('fixtures', 'global-fixtures', `auth-${sessionKey}.json`);
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

      // Restore cookies
      await this.context.addCookies(sessionData.cookies);

      // Restore localStorage
      await this.page.addInitScript((storage) => {
        if (window.localStorage) {
          Object.entries(storage).forEach(([key, value]) => {
            window.localStorage.setItem(key, value as string);
          });
        }
      }, sessionData.localStorage);

      console.log(`🔄 Session loaded for ${sessionKey}`);
      this.currentUser = role;
      return true;
    } catch (error) {
      console.error(`Error loading session for ${sessionKey}:`, error);
      return false;
    }
  }

  // Perform fresh login and save session
  async performLogin(role: string = 'admin'): Promise<void> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;
    console.log(`🔐 Performing fresh login for ${sessionKey}`);

    try {
      // Check if page/context is still valid
      if (this.page.isClosed() || this.context.pages().length === 0) {
        throw new Error('Browser context has been closed. Cannot perform login.');
      }

      // Get environment-specific URLs
      const env = process.env.ENV || 'dev';
      const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

      // Navigate to login page
      await this.page.goto(urls.loginUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

      // Get credentials (can be role-specific)
      const credentials = this.getCredentialsForRole(role);

      // Perform login using correct Playwright selectors (discovered via MCP)
      await this.page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);

      // Click Sign In button and wait for navigation
      await Promise.all([
        this.page.waitForURL('**/Index', { timeout: 90000 }),
        this.page.getByRole('button', { name: 'Sign In' }).click(),
      ]);

      // Verify we can see authenticated elements (user info or navigation)
      await this.page.waitForSelector('text=/Corporate Admin|Admin/', { timeout: 15000 });

      // Save session
      await this.saveSession(role);
      this.currentUser = role;

      console.log(`✅ Login successful for ${sessionKey}`);
    } catch (error) {
      console.error(`❌ Login failed for ${sessionKey}:`, error);
      throw error;
    }
  }

  // Save current session to file
  private async saveSession(role: string = 'admin'): Promise<void> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;

    try {
      // Get cookies and localStorage
      const cookies = await this.context.cookies();
      const localStorage = await this.page.evaluate(() => {
        const storage: { [key: string]: string } = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            storage[key] = window.localStorage.getItem(key) || '';
          }
        }
        return storage;
      });

      const sessionData = {
        cookies,
        localStorage,
        timestamp: Date.now(),
        clientId: this.clientConfig.clientId,
        role: role,
        environment: environment,
      };

      // Ensure fixtures directory exists
      const fixturesDir = path.join('fixtures', 'global-fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      const sessionPath = path.join(fixturesDir, `auth-${sessionKey}.json`);
      fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));

      console.log(`💾 Session saved for ${sessionKey}`);
    } catch (error) {
      console.error(`Error saving session for ${sessionKey}:`, error);
      throw error;
    }
  }

  // Get credentials for specific role
  private getCredentialsForRole(role: string): { username: string; password: string } {
    // Default to client config credentials
    let credentials = this.clientConfig.credentials;

    // Role-specific credentials can be added here
    switch (role) {
      case 'admin':
        // Use default credentials
        break;
      case 'dealer':
        // Could have different credentials
        credentials = {
          username: process.env.DEALER_USERNAME || credentials.username,
          password: process.env.DEALER_PASSWORD || credentials.password,
        };
        break;
      case 'distributor':
        credentials = {
          username: process.env.DIST_USERNAME || credentials.username,
          password: process.env.DIST_PASSWORD || credentials.password,
        };
        break;
      default:
        console.warn(`Unknown role: ${role}, using default credentials`);
    }

    return credentials;
  }

  // Ensure user is authenticated (main method for tests)
  async ensureAuthenticated(role: string = 'admin'): Promise<void> {
    const environment = process.env.ENV || 'dev';
    const contextKey = `${this.clientConfig.clientId}-${role}-${environment}`;
    console.log(`🔍 Checking authentication for ${contextKey}`);

    // Check if context is still valid first
    try {
      if (this.context.pages().length === 0) {
        console.log('🔧 No pages in context, creating a new page for authentication...');
        this.page = await this.context.newPage();
      }
    } catch (error) {
      throw new Error(
        `Context has been closed or is invalid. Cannot ensure authentication for ${contextKey}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Check if page is still valid
    if (this.page.isClosed()) {
      throw new Error(`Page has been closed. Cannot ensure authentication for ${contextKey}.`);
    }

    // If already authenticated in this instance, skip
    if (this._isAuthenticated) {
      console.log(`♻️ Already authenticated in this instance for ${contextKey}`);
      return;
    }

    // Try to load existing session first
    if (await this.loadSession(role)) {
      // For session loading, we'll trust the session file validation instead of page navigation
      console.log(`✅ Using existing valid session for ${role} in ${environment}`);
      this._isAuthenticated = true;
      return;
    }

    // If no valid session, perform fresh login
    console.log(`🔄 No valid session found, performing fresh login for ${role} in ${environment}`);
    await this.performLogin(role);
    this._isAuthenticated = true;
  }

  // Verify current session is still active
  private async verifySessionIsActive(): Promise<boolean> {
    try {
      // Check if page is still valid
      if (this.page.isClosed()) {
        console.log(`❌ Cannot verify session - page has been closed`);
        return false;
      }

      const env = process.env.ENV || 'dev';
      const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

      // Try to access a protected page (dashboard/main page)
      await this.page.goto(urls.baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

      // Check if we're still logged in by looking for login form elements
      // If we find the "Sign Into Your Account" heading, we're not logged in
      const loginHeading = await this.page
        .locator('heading:has-text("Sign Into Your Account")')
        .count();
      const usernameField = await this.page.locator('input[name="Username"]').count();

      if (loginHeading > 0 || usernameField > 0) {
        console.log(`❌ Session invalid - redirected to login page`);
        return false;
      }

      return true;
    } catch (error) {
      console.log(`❌ Session verification failed:`, error);
      return false;
    }
  }

  // Navigate to specific module (with authentication check)
  async navigateToModule(moduleName: string): Promise<void> {
    const module = this.clientConfig.modules.find((m) =>
      m.name.toLowerCase().includes(moduleName.toLowerCase())
    );

    if (!module) {
      throw new Error(`Module "${moduleName}" not found for client ${this.clientConfig.clientId}`);
    }

    const env = process.env.ENV || 'dev';
    const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

    // Handle external modules with full URLs
    let moduleUrl: string;
    if (module.isExternal && module.path.startsWith('http')) {
      moduleUrl = module.path;
    } else {
      moduleUrl = `${urls.baseUrl}${module.path}`;
    }

    console.log(`🎯 Navigating to ${moduleName}: ${moduleUrl}`);

    try {
      await this.page.goto(moduleUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
    } catch (error) {
      console.log(
        `⚠️ Navigation timeout or error for ${moduleName}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  // Verify module access
  async verifyModuleAccess(moduleName: string): Promise<boolean> {
    try {
      await this.navigateToModule(moduleName);

      // Check for access denied or error messages
      const errorElements = await this.page
        .locator('text=/access denied|unauthorized|403|404|error/i')
        .count();

      if (errorElements > 0) {
        console.log(`❌ Access denied to module: ${moduleName}`);
        return false;
      }

      console.log(`✅ Access verified for module: ${moduleName}`);
      return true;
    } catch (error) {
      console.error(`Error verifying access to ${moduleName}:`, error);
      return false;
    }
  }

  // Get current user role
  getCurrentUser(): string | null {
    return this.currentUser;
  }

  // Logout (cleanup)
  async logout(): Promise<void> {
    try {
      // Clear context
      await this.context.clearCookies();

      // Navigate to logout or clear session
      // Customize based on your application
      const env = process.env.ENV || 'dev';
      const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

      await this.page.goto(`${urls.baseUrl}/logout`);

      this.currentUser = null;
      console.log(`👋 Logged out from ${this.clientConfig.clientId}`);
    } catch (error) {
      console.log(`Logout error (may be expected):`, error);
    }
  }
}
