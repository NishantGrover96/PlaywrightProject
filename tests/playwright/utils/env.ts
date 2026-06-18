import * as dotenv from 'dotenv';
import * as path from 'path';

const ENV = process.env.BASE_ENV || 'modern';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${ENV}`) });

export const env = {
  baseUrl: process.env.BASE_URL ?? '',
  apiBaseUrl: process.env.API_BASE_URL ?? process.env.BASE_URL ?? '',
  testUser: {
    email: process.env.TEST_USER_EMAIL ?? '',
    password: process.env.TEST_USER_PASSWORD ?? '',
  },
  adminUser: {
    email: process.env.ADMIN_USER_EMAIL ?? '',
    password: process.env.ADMIN_USER_PASSWORD ?? '',
  },
  db: {
    server: process.env.DB_SERVER ?? '',
    name: process.env.DB_NAME ?? '',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
  },
  currentEnv: ENV,
  isLegacy: ENV === 'legacy',
  isModern: ENV === 'modern',
};

export function requireEnv(key: keyof typeof env): string {
  const value = env[key];
  if (!value || value === '') {
    throw new Error(`Required environment variable not set: ${key}. Check your .env.${ENV} file.`);
  }
  return value as string;
}
