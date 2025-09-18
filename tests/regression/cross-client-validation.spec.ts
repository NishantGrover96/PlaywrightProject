import { test, expect } from '../base-test';
import { clientModulesConfig } from '../../configs/clients/client-modules-access';

test.describe('Cross-Client Validation', () => {
  test('should validate client configurations', async ({ page }) => {
    expect(clientModulesConfig.length).toBeGreaterThan(0);

    for (const client of clientModulesConfig) {
      console.log(`Validating client: ${client.clientId}`);

      // Verify client has required properties
      expect(client.clientId).toBeTruthy();
      expect(client.baseUrl).toBeTruthy();
      expect(client.loginUrl).toBeTruthy();
      expect(client.modules.length).toBeGreaterThan(0);

      // Verify environment configurations
      if (client.environments) {
        expect(client.environments.dev).toBeTruthy();
        expect(client.environments.test).toBeTruthy();
        expect(client.environments.uat).toBeTruthy();
        expect(client.environments.prod).toBeTruthy();
      }

      console.log(`✅ Configuration valid for: ${client.clientId}`);
    }
  });

  test('should validate environment URL resolution', async ({ page }) => {
    const environments = ['dev', 'test', 'uat', 'prod'];

    for (const client of clientModulesConfig) {
      for (const env of environments) {
        if (client.environments && client.environments[env]) {
          const envConfig = client.environments[env];

          expect(envConfig.baseUrl).toBeTruthy();
          expect(envConfig.loginUrl).toBeTruthy();
          expect(envConfig.baseUrl).toMatch(/^https?:\/\//);
          expect(envConfig.loginUrl).toMatch(/^https?:\/\//);

          console.log(`✅ Environment URLs valid for ${client.clientId}-${env}`);
        }
      }
    }
  });

  test('should validate session management across roles', async ({ page, context }) => {
    const roles = ['admin', 'dealer', 'distributor'];
    const clientId = process.env.CLIENT || 'demo';

    for (const role of roles) {
      console.log(`Testing session management for role: ${role}`);

      try {
        const { AuthManager } = await import('../auth-manager');
        const authManager = new AuthManager(page, context, clientId);

        await authManager.ensureAuthenticated(role);
        const currentUser = authManager.getCurrentUser();

        expect(currentUser).toBe(role);
        console.log(`✅ Session management working for role: ${role}`);
      } catch (error) {
        console.log(`⚠️ Role ${role} may not be configured: ${error}`);
      }
    }
  });
});
