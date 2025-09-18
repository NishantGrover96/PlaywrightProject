import { Page, BrowserContext } from '@playwright/test';
import { AuthManager } from './auth-manager';

export class GlobalAuth {
  private static authInstances: Map<string, AuthManager> = new Map();
  private static globalSessionCache: Map<string, {isValid: boolean, timestamp: number}> = new Map();
  private static readonly CACHE_DURATION = 90000; // 30 seconds

  static async getAuthManager(
    page: Page,
    context: BrowserContext,
    clientId?: string,
    role: string = 'admin'
  ): Promise<AuthManager> {
    const actualClientId = clientId || process.env.CLIENT || 'demo';
    const actualEnvironment = process.env.ENV || 'dev';
    
    // Include environment in the cache key to prevent conflicts between environments
    const key = `${actualClientId}-${role}-${actualEnvironment}`;

    if (!this.authInstances.has(key)) {
      const authManager = new AuthManager(page, context, actualClientId);
      this.authInstances.set(key, authManager);
    }

    return this.authInstances.get(key)!;
  }

  static async ensureAuthenticated(
    page: Page,
    context: BrowserContext,
    clientId?: string,
    role: string = 'admin'
  ): Promise<AuthManager> {
    const authManager = await this.getAuthManager(page, context, clientId, role);
    
    // Update page reference in case it changed
    authManager.updatePage(page);
    
    await authManager.ensureAuthenticated(role);
    return authManager;
  }

  static async clearAuthCache(): Promise<void> {
    this.authInstances.clear();
    this.globalSessionCache.clear();
    console.log('🧹 Auth cache cleared');
  }

  /**
   * Check if there's a valid global session without creating AuthManager instances
   * This prevents multiple simultaneous session validations
   */
  static async hasValidGlobalSession(
    clientId: string = 'demo',
    role: string = 'admin',
    environment: string = 'dev'
  ): Promise<boolean> {
    const sessionKey = `${clientId}-${role}-${environment}`;
    const cacheKey = `global_session_${sessionKey}`;
    
    // Check cache first (prevents multiple file reads)
    const cached = this.globalSessionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`📋 Using cached session status for ${sessionKey}: ${cached.isValid ? 'Valid' : 'Invalid'}`);
      return cached.isValid;
    }

    // Perform actual session validation
    try {
      const fs = require('fs');
      const path = require('path');
      const sessionPath = path.join('fixtures', 'global-fixtures', `auth-${sessionKey}.json`);

      if (!fs.existsSync(sessionPath)) {
        console.log(`📂 Global session file not found for ${sessionKey}`);
        this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
        return false;
      }

      // Check session age (20 minute expiry)
      const stats = fs.statSync(sessionPath);
      const sessionAge = Date.now() - stats.mtime.getTime();
      const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds

      if (sessionAge > twentyMinutes) {
        console.log(`⏰ Global session expired for ${sessionKey} (${Math.round(sessionAge / 1000 / 60)} minutes old)`);
        this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
        return false;
      }

      // Load and validate session data with better error handling
      let sessionData;
      try {
        const fileContent = fs.readFileSync(sessionPath, 'utf8');
        sessionData = JSON.parse(fileContent);
      } catch (parseError) {
        console.log(`❌ Failed to parse session data for ${sessionKey}:`, parseError);
        this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
        return false;
      }

      // More robust validation - cookies are required, localStorage is optional
      const hasValidCookies = sessionData.cookies && Array.isArray(sessionData.cookies) && sessionData.cookies.length > 0;
      const isValid = hasValidCookies; // Only require cookies, localStorage is optional

      if (isValid) {
        console.log(`✅ Global session valid for ${sessionKey} (${Math.round(sessionAge / 1000 / 60)} minutes old)`);
      } else {
        console.log(`❌ Invalid global session data for ${sessionKey} - cookies: ${hasValidCookies}`);
      }

      // Cache the result
      this.globalSessionCache.set(cacheKey, { isValid, timestamp: Date.now() });
      return isValid;

    } catch (error) {
      console.error(`Error checking global session for ${sessionKey}:`, error);
      this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
      return false;
    }
  }


}
