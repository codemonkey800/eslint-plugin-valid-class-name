import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import jestPlugin from 'eslint-plugin-jest'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-n'
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

// Shared configuration across all file types
const sharedPlugins = {
  'import': importPlugin,
  'simple-import-sort': simpleImportSort,
  'n': nodePlugin,
}

const sharedSettings = {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: './tsconfig.json',
    },
  },
}

const sharedRules = {
  'import/no-unresolved': 'error',
  'import/named': 'error',
  'import/no-duplicates': 'error',
  'simple-import-sort/imports': [
    'error',
    {
      groups: [
        // Side effect imports
        ['^\\u0000'],
        // Node.js builtins
        ['^node:'],
        // External packages
        ['^@?\\w'],
        // Absolute imports starting with "src/"
        ['^src/'],
        // Other absolute imports
        ['^[^.]'],
        // Relative imports
        ['^\\.'],
      ],
    },
  ],
  'simple-import-sort/exports': 'error',
  ...nodePlugin.configs.recommended.rules,
  'n/no-missing-import': 'off',
}

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
      ...sharedPlugins,
      'eslint-plugin': eslintPluginPlugin,
    },
    settings: sharedSettings,
    rules: {
      ...sharedRules,
      '@typescript-eslint/no-require-imports': 'off',
      ...eslintPluginPlugin.configs.recommended.rules,
      // Don't enforce relative imports rules since we're using absolute imports
      'import/no-relative-packages': 'off',
      'import/no-relative-parent-imports': 'off',
      // Enforce named exports only
      'import/no-default-export': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    ...tseslint.configs.disableTypeChecked,
    plugins: {
      ...sharedPlugins,
      jest: jestPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    settings: sharedSettings,
    rules: {
      ...sharedRules,
      ...jestPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'n/no-unpublished-import': 'off',
    },
  },
  {
    files: ['**/*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
    plugins: sharedPlugins,
    settings: sharedSettings,
    rules: {
      ...sharedRules,
      '@typescript-eslint/no-explicit-any': 'off',
      'n/no-unpublished-import': 'off',
    },
  },
  prettierConfig,
]
