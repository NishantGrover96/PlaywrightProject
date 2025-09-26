module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es2020: true,
    browser: true,
  },
  globals: {
    // Playwright globals
    expect: 'readonly',
    test: 'readonly',
    describe: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    // Browser globals
    window: 'readonly',
    document: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    PerformanceNavigationTiming: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-useless-escape': 'warn',
    'no-undef': 'error',
  },
};
