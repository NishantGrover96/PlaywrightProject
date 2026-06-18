import { test as base, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const AUTH_FILE = path.resolve(__dirname, '.auth/user.json');
const AUTH_DIR = path.dirname(AUTH_FILE);

export interface AuthFixtures {
  authenticatedPage: Page;
}

// Global setup: run once per project to capture auth state
export async function globalSetup(baseURL: string, email: string, password: string): Promise<void> {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}

// Auth setup test — saved as tests/playwright/specs/auth.setup.ts
// Use this pattern in your playwright.config.ts projects[setup]
export async function performLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/Account/Login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).not.toHaveURL(/login/i);
}

// Extended test base with authenticated page fixture
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect } from '@playwright/test';
