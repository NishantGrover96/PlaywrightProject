import { chromium, FullConfig } from '@playwright/test';
import { GlobalAuth } from '../../tests/global-auth';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Global setup starting...');

  // Get current test context
  const currentClient = process.env.CLIENT || 'demo';
  const currentRole = process.env.ROLE || 'admin';
  const currentEnv = process.env.ENV || 'dev';
  const currentContext = `${currentClient}-${currentRole}-${currentEnv}`;

  // Check if we need to clear cache due to context change
  const contextFile = path.join('fixtures', 'global-fixtures', '.last-context');
  let shouldClearCache = false;

  try {
    if (fs.existsSync(contextFile)) {
      const lastContext = fs.readFileSync(contextFile, 'utf8').trim();
      if (lastContext !== currentContext) {
        console.log(`🔄 Context changed from ${lastContext} to ${currentContext}`);
        shouldClearCache = true;
      } else {
        console.log(`♻️ Same context: ${currentContext} - preserving auth cache`);
      }
    } else {
      console.log(`📝 First run or context file missing - creating context tracking`);
      shouldClearCache = true;
    }

    // Save current context for next run
    fs.writeFileSync(contextFile, currentContext);
  } catch (error) {
    console.log(`⚠️ Could not check context - clearing cache as precaution`);
    shouldClearCache = true;
  }

  // Only clear cache when necessary
  if (shouldClearCache) {
    console.log(`🧹 Clearing auth cache due to context change`);
    await GlobalAuth.clearAuthCache();
  }

  // PERFORM GLOBAL AUTHENTICATION HERE - This is critical!
  console.log(`🔐 Performing global authentication for ${currentContext}...`);

  try {
    const currentEnvironment = process.env.ENV || 'dev';

    // Check if we already have a valid session
    const hasValidSession = await GlobalAuth.hasValidGlobalSession(
      currentClient,
      currentRole,
      currentEnvironment
    );

    if (hasValidSession) {
      console.log(`✅ Valid global session found - skipping authentication for ${currentContext}`);
    } else {
      console.log(`🔐 No valid session found - performing authentication for ${currentContext}`);

      // Launch browser for authentication
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      // Use GlobalAuth to ensure authentication (this caches the auth manager)
      const authManager = await GlobalAuth.ensureAuthenticated(
        page,
        context,
        currentClient,
        currentRole
      );
      console.log(`✅ Global authentication successful for ${currentContext}`);

      // Close browser - session is now cached in GlobalAuth
      await browser.close();
    }
  } catch (error) {
    console.error(`❌ Global authentication failed for ${currentContext}:`, error);
    throw error; // Fail the test run if global auth fails
  }

  console.log(`✅ Global setup complete for context: ${currentContext}`);
}

export default globalSetup;
