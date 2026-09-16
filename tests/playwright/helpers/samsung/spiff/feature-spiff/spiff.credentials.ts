import testData from '../../../../data/samsung/spiff/feature-spiff/test-data.json';

/**
 * Credentials
 *
 * Local execution:
 *   Uses credentials from test-data.json unless environment variables
 *   are explicitly provided.
 *
 * GitHub Actions / CI:
 *   Requires credentials to be supplied through GitHub Secrets.
 *
 * GitHub Secrets expected:
 *   SAMSUNG_DEALER_EMAIL
 *   SAMSUNG_DEALER_PASSWORD
 *   SAMSUNG_ADMIN_EMAIL
 *   SAMSUNG_ADMIN_PASSWORD
 *
 * Shared by every SPIFF spec file (claim submission, claim processing,
 * manage SPIFF) so the resolution logic lives in exactly one place.
 */

const isCI = process.env.CI === 'true';

function getCredential(envName: string, fallback: string | undefined): string {
  const value = process.env[envName];

  if (value) {
    return value;
  }

  if (isCI) {
    throw new Error(
      `Missing required CI environment variable: ${envName}. ` +
      `Add it as a GitHub Actions repository secret.`
    );
  }

  if (!fallback) {
    throw new Error(
      `Missing credential: ${envName}. ` +
      `Set the environment variable or configure the credential in test-data.json.`
    );
  }

  return fallback;
}

// Samsung Dealer / SA credentials
export const saEmail = getCredential('SAMSUNG_DEALER_EMAIL', testData.users.sa.email);
export const saPassword = getCredential('SAMSUNG_DEALER_PASSWORD', testData.users.sa.password);

// Samsung Admin / BMADMIN credentials
export const adminEmail = getCredential('SAMSUNG_ADMIN_EMAIL', testData.users.bmadmin.email);
export const adminPassword = getCredential('SAMSUNG_ADMIN_PASSWORD', testData.users.bmadmin.password);
