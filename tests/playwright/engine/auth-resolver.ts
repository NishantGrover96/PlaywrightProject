/**
 * Authentication Resolver
 *
 * Resolves the authentication strategy for a given client × role × environment.
 *
 * Responsibilities:
 *   - Read auth type from config/clients/{clientId}.json
 *   - Dispatch to the correct AuthProvider implementation
 *   - Return a ResolvedAuth object consumed by the Execution Engine
 *   - Provide setup project discovery for playwright.config.ts
 *
 * Adding a new auth type: implement AuthProvider, register in AUTH_PROVIDERS.
 * Adding a new client:    add config/clients/{clientId}.json — no code change needed.
 */

import * as fs   from 'fs';
import * as path from 'path';
import type { AuthType, ResolvedAuth } from './execution-plan';

// Workspace root (engine/ → playwright/ → tests/ → workspace)
const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');
const AUTH_DIR       = path.join(__dirname, '..', 'fixtures', '.auth');

// ── Legacy client list ─────────────────────────────────────────────────────
// Clients that share the default setup/setup-admin projects.
// New clients automatically get dedicated setup-{clientId} projects.
const LEGACY_SHARED_CLIENTS = new Set(['demoportal', 'certainteed', 'samsung']);

// ── Auth Provider Interface ────────────────────────────────────────────────

interface AuthProvider {
  readonly type: AuthType;
  resolve(clientId: string, role: string, environment: string): ResolvedAuth;
}

// ── Provider: Forms Authentication ────────────────────────────────────────

class FormsAuthProvider implements AuthProvider {
  readonly type: AuthType = 'forms';

  resolve(clientId: string, role: string, _environment: string): ResolvedAuth {
    const isAdmin = isAdminRole(role);

    // Per-client auth dir exists? Use it. Otherwise fall back to shared .auth/.
    const clientAuthDir    = path.join(AUTH_DIR, clientId);
    const storageFileName  = isAdmin ? 'admin.json' : 'user.json';
    const clientAuthFile   = path.join(clientAuthDir, storageFileName);
    const sharedAuthFile   = path.join(AUTH_DIR, storageFileName);
    const storageStateFile = fs.existsSync(clientAuthDir)
      ? toRelative(clientAuthFile)
      : toRelative(sharedAuthFile);

    return {
      setupProject:     resolveSetupProjectName(clientId, role),
      authType:         'forms',
      loginPath:        getLoginPath(clientId),
      storageStateFile,
      credentialEnvKey: {
        email:    isAdmin ? 'ADMIN_EMAIL'    : 'TEST_USER_EMAIL',
        password: isAdmin ? 'ADMIN_PASSWORD' : 'TEST_USER_PASSWORD',
      },
    };
  }
}

// ── Provider: Azure AD ─────────────────────────────────────────────────────

class AzureADAuthProvider implements AuthProvider {
  readonly type: AuthType = 'azure-ad';

  resolve(clientId: string, role: string, _environment: string): ResolvedAuth {
    const storageDir  = path.join(AUTH_DIR, clientId);
    const storageFile = path.join(storageDir, `${role}.json`);
    return {
      setupProject:     resolveSetupProjectName(clientId, role),
      authType:         'azure-ad',
      loginPath:        '/auth/login',
      storageStateFile: toRelative(storageFile),
      credentialEnvKey: {
        email:    'AZURE_AD_CLIENT_ID',
        password: 'AZURE_AD_CLIENT_SECRET',
      },
    };
  }
}

// ── Provider: OAuth 2.0 ───────────────────────────────────────────────────

class OAuthProvider implements AuthProvider {
  readonly type: AuthType = 'oauth';

  resolve(clientId: string, role: string, _environment: string): ResolvedAuth {
    const storageFile = path.join(AUTH_DIR, clientId, `${role}.json`);
    return {
      setupProject:     resolveSetupProjectName(clientId, role),
      authType:         'oauth',
      loginPath:        '/oauth/authorize',
      storageStateFile: toRelative(storageFile),
      credentialEnvKey: {
        email:    'OAUTH_CLIENT_ID',
        password: 'OAUTH_CLIENT_SECRET',
      },
    };
  }
}

// ── Provider: SSO (delegates to Forms) ────────────────────────────────────

class SSOAuthProvider implements AuthProvider {
  readonly type: AuthType = 'sso';
  private readonly forms = new FormsAuthProvider();

  resolve(clientId: string, role: string, environment: string): ResolvedAuth {
    const resolved = this.forms.resolve(clientId, role, environment);
    return { ...resolved, authType: 'sso', loginPath: getLoginPath(clientId) + '?sso=1' };
  }
}

// ── Provider: No Auth ──────────────────────────────────────────────────────

class NoAuthProvider implements AuthProvider {
  readonly type: AuthType = 'none';

  resolve(_clientId: string, _role: string, _environment: string): ResolvedAuth {
    return {
      setupProject:     '',
      authType:         'none',
      loginPath:        '',
      storageStateFile: '',
      credentialEnvKey: { email: '', password: '' },
    };
  }
}

// ── Registry ───────────────────────────────────────────────────────────────

const AUTH_PROVIDERS: Record<AuthType, AuthProvider> = {
  'forms':    new FormsAuthProvider(),
  'azure-ad': new AzureADAuthProvider(),
  'oauth':    new OAuthProvider(),
  'sso':      new SSOAuthProvider(),
  'none':     new NoAuthProvider(),
};

// ── Helpers ────────────────────────────────────────────────────────────────

function isAdminRole(role: string): boolean {
  return role === 'admin' || role.endsWith('-admin');
}

function toRelative(absPath: string): string {
  return path.relative(WORKSPACE_ROOT, absPath).replace(/\\/g, '/');
}

/**
 * Load loginPath from client config, with fallback.
 */
function getLoginPath(clientId: string): string {
  try {
    const cfg = loadClientConfig(clientId);
    return cfg?.loginPath ?? cfg?.environments?.production?.loginPath ?? '/account/login';
  } catch {
    return '/account/login';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadClientConfig(clientId: string): any {
  const cfgPath = path.join(WORKSPACE_ROOT, 'config', 'clients', `${clientId}.json`);
  if (!fs.existsSync(cfgPath)) return null;
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

function getClientAuthType(clientId: string): AuthType {
  try {
    const cfg = loadClientConfig(clientId);
    if (!cfg) return 'forms';
    const type = cfg.authentication?.type ?? cfg.authType;
    return (type && type in AUTH_PROVIDERS) ? (type as AuthType) : 'forms';
  } catch {
    return 'forms';
  }
}

// ── Setup Project Name Resolution ──────────────────────────────────────────

/**
 * Determines the Playwright setup project name for a client × role.
 *
 * Legacy shared clients:  'setup' | 'setup-admin'
 * New clients:            'setup-{clientId}' | 'setup-{clientId}-admin'
 */
function resolveSetupProjectName(clientId: string, role: string): string {
  const isAdmin = isAdminRole(role);
  if (LEGACY_SHARED_CLIENTS.has(clientId)) {
    return isAdmin ? 'setup-admin' : 'setup';
  }
  return isAdmin ? `setup-${clientId}-admin` : `setup-${clientId}`;
}

/**
 * Returns the Playwright project name for the browser/runner project
 * (the project that actually runs tests, depending on the setup project).
 */
function resolveBrowserProjectName(
  clientId: string,
  role: string,
  browser: string,
): string {
  const isAdmin = isAdminRole(role);
  if (LEGACY_SHARED_CLIENTS.has(clientId)) {
    return isAdmin ? `${browser}-admin` : browser;
  }
  return isAdmin
    ? `${browser}-${clientId}-admin`
    : `${browser}-${clientId}`;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Resolve authentication for a given execution context.
 */
export function resolveAuth(
  clientId:    string,
  role:        string,
  environment: string,
): ResolvedAuth {
  const authType = getClientAuthType(clientId);
  const provider = AUTH_PROVIDERS[authType] ?? AUTH_PROVIDERS['forms'];
  return provider.resolve(clientId, role, environment);
}

/**
 * List all setup project names for a set of clients.
 * Used by playwright.config.ts to build the projects array dynamically.
 */
export function listSetupProjectNames(clientIds: string[]): string[] {
  const seen     = new Set<string>();
  const projects: string[] = [];

  for (const clientId of clientIds) {
    const dealer = resolveSetupProjectName(clientId, 'dealer');
    const admin  = resolveSetupProjectName(clientId, 'admin');
    if (!seen.has(dealer)) { seen.add(dealer); projects.push(dealer); }
    if (!seen.has(admin))  { seen.add(admin);  projects.push(admin);  }
  }

  return projects;
}

/**
 * Get the storageState file path for a given client × role.
 * Used directly by playwright.config.ts project definitions.
 */
export function getStorageStateFile(clientId: string, role: string): string {
  const auth = resolveAuth(clientId, role, 'production');
  return auth.storageStateFile;
}

/**
 * Discover all client IDs from config/clients/.
 * Used by playwright.config.ts to build the full project matrix.
 */
export function discoverClientIds(): string[] {
  const dir = path.join(WORKSPACE_ROOT, 'config', 'clients');
  if (!fs.existsSync(dir)) return ['demoportal'];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

/**
 * Build the complete Playwright project matrix for a set of client IDs.
 * Returns descriptors that playwright.config.ts converts to project objects.
 */
export interface ProjectDescriptor {
  name:              string;
  kind:              'setup' | 'browser' | 'api';
  clientId:          string;
  role?:             string;
  browser?:          string;
  dependencies?:     string[];
  storageStateFile?: string;
  testMatch?:        RegExp;
}

export function buildProjectDescriptors(
  clientIds: string[],
  browsers:  string[] = ['chromium'],
): ProjectDescriptor[] {
  const descriptors: ProjectDescriptor[] = [];
  const seenSetup = new Set<string>();

  for (const clientId of clientIds) {
    for (const role of ['dealer', 'admin']) {
      const setupName = resolveSetupProjectName(clientId, role);
      if (!seenSetup.has(setupName)) {
        seenSetup.add(setupName);
        descriptors.push({
          name:      setupName,
          kind:      'setup',
          clientId,
          role,
          testMatch: resolveSetupTestMatch(clientId, role),
        });
      }

      for (const browser of browsers) {
        descriptors.push({
          name:              resolveBrowserProjectName(clientId, role, browser),
          kind:              'browser',
          clientId,
          role,
          browser,
          dependencies:      [setupName],
          storageStateFile:  getStorageStateFile(clientId, role),
        });
      }
    }
  }

  // API project (shared, no browser)
  descriptors.push({
    name:     'api',
    kind:     'api',
    clientId: '',
  });

  return descriptors;
}

function resolveSetupTestMatch(clientId: string, role: string): RegExp {
  // Legacy shared clients
  if (LEGACY_SHARED_CLIENTS.has(clientId)) {
    return role === 'admin'
      ? /auth\.setup\.admin\.ts/
      : /auth\.setup\.ts(?!.*admin)/;
  }
  // New clients use the generic setup spec
  return role === 'admin'
    ? new RegExp(`auth\\.setup\\.${clientId}\\.admin\\.ts`)
    : new RegExp(`auth\\.setup\\.generic\\.ts`);
}

export { resolveSetupProjectName, resolveBrowserProjectName };
