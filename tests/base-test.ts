import { test as baseTest, Page } from '@playwright/test';
import { AuthManager } from './auth-manager';
import { GlobalAuth } from './global-auth';

// Extend base test with authentication
export const test = baseTest.extend<{
  auth: AuthManager;
  authenticatedPage: Page;
}>({
  auth: async ({ page, context }, use, testInfo) => {
    // Use CLIENT environment variable, fallback to project metadata or default
    const clientId = process.env.CLIENT || testInfo.project.metadata?.clientId || testInfo.project.name || 'demo';
    const role = process.env.ROLE || 'admin';

    try {
      const environment = process.env.ENV || 'dev';
      
      // Get or create the auth manager (cached globally)
      const authManager = await GlobalAuth.getAuthManager(page, context, clientId, role);
      
      // Simple logic: If a session file exists and is not expired, use it. 
      // Global setup already validated it, so no need to re-validate.
      console.log(`♻️ Using session for ${clientId}-${role} (trusting global setup validation)`);
      
      // Load the existing session (skip validation since global setup already checked)
      await authManager.loadSession(role, true);
      
      // Update page reference for the cached auth manager
      authManager.updatePage(page);
      
      // Mark as authenticated since we trust global setup
      authManager.setAuthenticationState(true);
      
      await use(authManager);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Page has been closed') || errorMessage.includes('Browser context has been closed')) {
        console.log('⚠️ Page/context closed, creating new page for authentication...');
        const newPage = await context.newPage();
        const authManager = await GlobalAuth.ensureAuthenticated(newPage, context, clientId, role);
        await use(authManager);
      } else {
        throw error;
      }
    }
  },

  authenticatedPage: async ({ page, auth }, use) => {
    // Page is already authenticated through auth fixture
    await use(page);
  },
});

export { expect } from '@playwright/test';
