import { RuleTester } from 'eslint';
import rule from './valid-class-name.js';

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
});

// RuleTester internally uses describe/it blocks, so we don't wrap it in our own
ruleTester.run('valid-class-name', rule, {
  valid: [
    {
      code: '<div className="valid-class" />',
      filename: 'test.jsx',
    },
    {
      code: '<button className="btn primary" />',
      filename: 'test.jsx',
    },
    {
      code: '<span className="text-center" />',
      filename: 'test.jsx',
    },
    {
      code: '<div className={dynamicClass} />',
      filename: 'test.jsx',
    },
    {
      code: '<div />',
      filename: 'test.jsx',
    },
    // Example with configuration options
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
            whitelist: ['custom-class'],
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: '<div className="invalid-test" />',
      filename: 'test.jsx',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-test',
          },
        },
      ],
    },
    {
      code: '<button className="invalid-button" />',
      filename: 'test.jsx',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-button',
          },
        },
      ],
    },
  ],
});
