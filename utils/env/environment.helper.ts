import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  ClientConfig,
  clientModulesConfig,
  ModuleConfig,
} from '../../configs/clients/client-modules-access';

export class EnvironmentHelper {
  private static instance: EnvironmentHelper;
  private config: any = {};

  private constructor() {
    this.loadEnvironmentConfig();
  }

  public static getInstance(): EnvironmentHelper {
    if (!EnvironmentHelper.instance) {
      EnvironmentHelper.instance = new EnvironmentHelper();
    }
    return EnvironmentHelper.instance;
  }

  private loadEnvironmentConfig(): void {
    const env = process.env.ENV || process.env.NODE_ENV || 'dev';
    const client = process.env.CLIENT || 'demo';
    const envFile = `.env.${env}`;

    // Load environment-specific .env file
    dotenv.config({ path: path.resolve(process.cwd(), envFile) });

    // Get client-specific URLs and credentials (avoiding circular dependency)
    const clientConfig = clientModulesConfig.find((c) => c.clientId === client);
    let baseUrl = process.env.BASE_URL;
    let loginUrl = process.env.LOGIN_URL;
    let username = process.env.USERNAME;
    let password = process.env.PASSWORD;

    if (clientConfig) {
      // Use environment-specific URLs if available in client config
      if (clientConfig.environments && clientConfig.environments[env]) {
        baseUrl = baseUrl || clientConfig.environments[env].baseUrl;
        loginUrl = loginUrl || clientConfig.environments[env].loginUrl;
      } else {
        // Fallback to default URLs from client config
        baseUrl = baseUrl || clientConfig.baseUrl;
        loginUrl = loginUrl || clientConfig.loginUrl;
      }

      // Use client credentials if not provided in env file
      username = username || clientConfig.credentials.username;
      password = password || clientConfig.credentials.password;
    }

    this.config = {
      NODE_ENV: process.env.NODE_ENV || env,
      BROWSER: process.env.BROWSER || 'chromium',
      HEADLESS: process.env.HEADLESS === 'true',
      TIMEOUT: parseInt(process.env.TIMEOUT || '90000'),
      RETRIES: parseInt(process.env.RETRIES || '1'),
      WORKERS: parseInt(process.env.WORKERS || '1'),
      BASE_URL: baseUrl,
      LOGIN_URL: loginUrl,
      POST_LOGIN_URL: process.env.POST_LOGIN_URL || (baseUrl ? baseUrl + '/index' : undefined),
      USERNAME: username,
      PASSWORD: password,
      CLIENT: client,
      TRACE: process.env.TRACE || 'retain-on-failure',
      VIDEO: process.env.VIDEO || 'retain-on-failure',
      SCREENSHOT: process.env.SCREENSHOT || 'only-on-failure',
    };
  }

  getConfig(key?: string): any {
    return key ? this.config[key] : this.config;
  }

  // Dynamic URL resolution based on client and environment
  getUrlsForClient(clientId: string, environment?: string): { baseUrl: string; loginUrl: string } {
    const client = clientModulesConfig.find((c) => c.clientId === clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found in configuration`);
    }

    const env = environment || process.env.ENV || 'dev';

    // Use environment-specific URLs if available in client config
    if (client.environments && client.environments[env]) {
      return client.environments[env];
    }

    // Fallback to default URLs from client config
    return {
      baseUrl: client.baseUrl,
      loginUrl: client.loginUrl,
    };
  }

  // Get client configuration
  getClientConfig(clientId: string): ClientConfig | undefined {
    return clientModulesConfig.find((c) => c.clientId === clientId);
  }

  // Get available modules for client
  getClientModules(clientId: string): ModuleConfig[] {
    const client = this.getClientConfig(clientId);
    return client ? client.modules : [];
  }
}

// Export instance for easy import
export const envHelper = EnvironmentHelper.getInstance();
