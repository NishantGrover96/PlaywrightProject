import { test, expect } from '@playwright/test';
import { EnvironmentHelper } from '../../utils/env/environment.helper';

test('Environment configuration works', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const config = envHelper.getConfig();

  expect(config.NODE_ENV).toBeDefined();
  expect(config.BASE_URL).toBeDefined();
  expect(config.CLIENT).toBeDefined();

  console.log('Environment Config:', config);
});

test('Client URL resolution works', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const clientId = process.env.CLIENT || 'demo';
  const urls = envHelper.getUrlsForClient(clientId);

  expect(urls.baseUrl).toBeDefined();
  expect(urls.loginUrl).toBeDefined();

  console.log('Client URLs:', urls);
});

test('Client modules can be retrieved', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const clientId = process.env.CLIENT || 'demo';
  const modules = envHelper.getClientModules(clientId);

  expect(modules).toBeDefined();
  expect(Array.isArray(modules)).toBe(true);
  expect(modules.length).toBeGreaterThan(0);

  console.log('Client Modules:', modules);
});

test('Client configuration is available', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const clientId = process.env.CLIENT || 'demo';
  const clientConfig = envHelper.getClientConfig(clientId);

  expect(clientConfig).toBeDefined();
  expect(clientConfig?.clientId).toBe(clientId);
  expect(clientConfig?.clientName).toBeDefined();
  expect(clientConfig?.baseUrl).toBeDefined();
  expect(clientConfig?.loginUrl).toBeDefined();

  console.log('Client Config:', clientConfig);
});

test('Environment helper handles different environments', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const clientId = 'demo';

  // Test different environment URLs
  const devUrls = envHelper.getUrlsForClient(clientId, 'dev');
  const uatUrls = envHelper.getUrlsForClient(clientId, 'uat');

  expect(devUrls).toBeDefined();
  expect(uatUrls).toBeDefined();
  expect(devUrls.baseUrl).not.toBe(uatUrls.baseUrl);

  console.log('Dev URLs:', devUrls);
  console.log('UAT URLs:', uatUrls);
});

test('Invalid client throws error', async () => {
  const envHelper = EnvironmentHelper.getInstance();

  expect(() => {
    envHelper.getUrlsForClient('nonexistent-client');
  }).toThrow('Client nonexistent-client not found in configuration');
});
