import { FullConfig } from '@playwright/test';
import { GlobalAuth } from '../../tests/global-auth';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Global teardown starting...');

  // Get current test context for logging
  const currentClient = process.env.CLIENT || 'demo';
  const currentRole = process.env.ROLE || 'admin';
  const currentEnv = process.env.ENV || 'dev';
  const currentContext = `${currentClient}-${currentRole}-${currentEnv}`;

  // Clear in-memory auth cache (session files are preserved for reuse)
  await GlobalAuth.clearAuthCache();

  console.log(`✅ Global teardown complete for context: ${currentContext}`);
  console.log(`📁 Auth session files preserved for reuse`);
}

export default globalTeardown;
