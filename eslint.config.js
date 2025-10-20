import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import jestPlugin from 'eslint-plugin-jest'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-n'
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
  {
    ignores: ['lib/**', 'node_modules/**', '*.js', '*.mjs', 'test-project/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'import': importPlugin,
      'n': nodePlugin,
      'eslint-plugin': eslintPluginPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/no-duplicates': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      ...nodePlugin.configs.recommended.rules,
      ...eslintPluginPlugin.configs.recommended.rules,
      // Disable n/no-missing-import as it doesn't understand TypeScript baseUrl
      'n/no-missing-import': 'off',
      // Don't enforce relative imports rules since we're using absolute imports
      'import/no-relative-packages': 'off',
      'import/no-relative-parent-imports': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    ...tseslint.configs.disableTypeChecked,
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettierConfig,
]
