import { test as setup } from '@playwright/test';
import { GlobalAuth } from '../../tests/global-auth';

/**
 * Dynamic Authentication Setup
 *
 * Only authenticates for the specific CLIENT + ROLE + ENV combination
 * specified via environment variables. This prevents:
 * - Over-authentication for unused clients/roles
 * - Data leakage between different test contexts
 * - Unnecessary session creation
 *
 * Usage Examples:
 * - CLIENT=demo ROLE=admin ENV=dev (creates auth only for demo-admin-dev)
 * - CLIENT=hankook ROLE=dealer ENV=uat (creates auth only for hankook-dealer-uat)
 */

// Get runtime configuration from environment variables
const targetClient = process.env.CLIENT || 'demo';
const targetRole = process.env.ROLE || 'admin';
const targetEnv = process.env.ENV || 'dev';

// Only setup authentication for the specific target combination
setup(`authenticate ${targetClient}-${targetRole}-${targetEnv}`, async ({ page, context }) => {
  try {
    console.log(
      `🔐 Setting up authentication for ${targetClient}-${targetRole} in ${targetEnv} environment`
    );

    // The environment is automatically detected from process.env.ENV by AuthManager
    const authManager = await GlobalAuth.ensureAuthenticated(
      page,
      context,
      targetClient,
      targetRole
    );

    // Save authentication state with environment-specific naming
    const authFileName = `auth-${targetClient}-${targetRole}-${targetEnv}.json`;
    await page.context().storageState({
      path: `fixtures/global-fixtures/${authFileName}`,
    });

    console.log(`✅ Authentication setup complete for ${targetClient}-${targetRole}-${targetEnv}`);
    console.log(`📁 Auth state saved to: ${authFileName}`);
  } catch (error) {
    console.error(
      `❌ Authentication setup failed for ${targetClient}-${targetRole}-${targetEnv}:`,
      error
    );
    throw error;
  }
});
