import { RuleTester } from 'eslint'

import { validClassNameRule } from './valid-class-name'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

// Test valid configurations - these should all pass
ruleTester.run(
  'valid-class-name schema - valid configurations',
  validClassNameRule,
  {
    valid: [
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [{}],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              css: ['**/*.css'],
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              scss: ['**/*.scss', 'styles/**/*.sass'],
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: true,
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: false,
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: './tailwind.config.js',
              },
            },
          },
        ],
      },
      {
        code: '<div className="custom-btn" />',
        filename: 'test.jsx',
        options: [
          {
            validation: {
              allowlist: ['custom-*', 'app-*'],
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            validation: {
              blocklist: ['legacy-*', 'deprecated-*'],
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            validation: {
              ignorePatterns: ['dynamic-*', 'state-*'],
            },
          },
        ],
      },
      {
        code: '<div className="custom-class" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              css: ['**/*.css'],
              scss: ['**/*.scss'],
              tailwind: {
                config: './tailwind.config.js',
              },
            },
            validation: {
              allowlist: ['custom-*'],
              blocklist: ['legacy-*'],
              ignorePatterns: ['dynamic-*'],
            },
          },
        ],
      },
      {
        code: '<div />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              css: [],
              scss: [],
            },
            validation: {
              allowlist: [],
              blocklist: [],
              ignorePatterns: [],
            },
          },
        ],
      },
    ],
    invalid: [],
  },
)
