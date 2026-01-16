const playwright = require('eslint-plugin-playwright');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.ts'],
    ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'playwright': playwright,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...playwright.configs.recommended.rules,
      'playwright/expect-expect': 'warn',
      // This line disables the "Unexpected any" error globally
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'playwright/no-networkidle': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'playwright/valid-title': 'warn'
    },
  },
];