import { RuleTester } from 'eslint'
import rule from './valid-class-name.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { clearCache } from '../cache/class-registry.js'

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

// RuleTester internally uses describe/it blocks, so we don't wrap it in our own
ruleTester.run('valid-class-name', rule, {
  valid: [
    // Dynamic expressions are skipped
    {
      code: '<div className={dynamicClass} />',
      filename: 'test.jsx',
    },
    {
      code: '<div className={`dynamic-${foo}`} />',
      filename: 'test.jsx',
    },
    // No className attribute
    {
      code: '<div />',
      filename: 'test.jsx',
    },
    // With whitelist - exact matches
    {
      code: '<div className="custom-class" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['custom-class'],
          },
        },
      ],
    },
    // With whitelist - multiple classes, all valid
    {
      code: '<div className="foo bar baz" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    // With whitelist - glob pattern matching
    {
      code: '<div className="btn-primary" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['btn-*'],
          },
        },
      ],
    },
    {
      code: '<div className="text-red-500" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['text-*'],
          },
        },
      ],
    },
    // With ignore patterns
    {
      code: '<div className="dynamic-123" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['static-class'],
            ignorePatterns: ['dynamic-*'],
          },
        },
      ],
    },
    // JSXExpressionContainer with string literal
    {
      code: '<div className={"foo bar"} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['foo', 'bar'],
          },
        },
      ],
    },
    // Edge cases - empty string
    {
      code: '<div className="" />',
      filename: 'test.jsx',
    },
    // Edge cases - multiple spaces
    {
      code: '<div className="foo  bar   baz" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    // Edge cases - leading/trailing spaces
    {
      code: '<div className="  foo bar  " />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['foo', 'bar'],
          },
        },
      ],
    },
    // Complex glob patterns
    {
      code: '<div className="prefix-middle-suffix" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['*-middle-*'],
          },
        },
      ],
    },
  ],
  invalid: [
    // No whitelist - all class names are invalid
    {
      code: '<div className="any-class" />',
      filename: 'test.jsx',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'any-class',
          },
        },
      ],
    },
    {
      code: '<button className="btn primary" />',
      filename: 'test.jsx',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'btn',
          },
        },
        {
          messageId: 'invalidClassName',
          data: {
            className: 'primary',
          },
        },
      ],
    },
    {
      code: '<span className="text-center" />',
      filename: 'test.jsx',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'text-center',
          },
        },
      ],
    },
    // With whitelist - class not in list
    {
      code: '<div className="invalid-class" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['valid-class'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Multiple classes, some invalid
    {
      code: '<div className="foo bar baz" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['foo', 'baz'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'bar',
          },
        },
      ],
    },
    // Multiple classes, all invalid
    {
      code: '<div className="invalid-1 invalid-2" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['valid-*'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-1',
          },
        },
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-2',
          },
        },
      ],
    },
    // Glob pattern doesn't match
    {
      code: '<div className="text-red-500" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['btn-*'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'text-red-500',
          },
        },
      ],
    },
    // JSXExpressionContainer with invalid class
    {
      code: '<div className={"invalid-class"} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['valid-class'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Ignored pattern doesn't prevent whitelist validation
    {
      code: '<div className="other-class" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            whitelist: ['valid-class'],
            ignorePatterns: ['dynamic-*'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'other-class',
          },
        },
      ],
    },
  ],
})

// Additional tests for CSS file validation
// Note: These tests create temporary CSS files to test the integration
;(() => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-test-'))

  // Create test CSS files
  const cssFile = path.join(tempDir, 'styles.css')
  fs.writeFileSync(cssFile, '.btn { color: red; } .card { padding: 10px; }')

  const cssFile2 = path.join(tempDir, 'styles2.css')
  fs.writeFileSync(cssFile2, '.btn { color: red; }')

  const complexCssFile = path.join(tempDir, 'complex.css')
  fs.writeFileSync(
    complexCssFile,
    `
    .btn:hover { color: blue; }
    .card.active { border: 1px solid red; }
    .parent .child { margin: 0; }
  `,
  )

  // Clear cache before tests
  clearCache()

  const cssRuleTester = new RuleTester({
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

  cssRuleTester.run('valid-class-name with CSS files', rule, {
    valid: [
      {
        code: '<div className="btn" />',
        filename: path.join(tempDir, 'test.jsx'),
        options: [
          {
            sources: {
              css: [path.join(tempDir, 'styles.css')],
            },
          },
        ],
      },
      {
        code: '<div className="btn card" />',
        filename: path.join(tempDir, 'test.jsx'),
        options: [
          {
            sources: {
              css: [path.join(tempDir, 'styles.css')],
            },
          },
        ],
      },
      {
        code: '<div className="btn custom-class" />',
        filename: path.join(tempDir, 'test.jsx'),
        options: [
          {
            sources: {
              css: [path.join(tempDir, 'styles2.css')],
            },
            validation: {
              whitelist: ['custom-*'],
            },
          },
        ],
      },
      {
        code: '<div className="btn active card parent child" />',
        filename: path.join(tempDir, 'test.jsx'),
        options: [
          {
            sources: {
              css: [path.join(tempDir, 'complex.css')],
            },
          },
        ],
      },
    ],
    invalid: [
      {
        code: '<div className="invalid-class" />',
        filename: path.join(tempDir, 'test.jsx'),
        options: [
          {
            sources: {
              css: [path.join(tempDir, 'styles.css')],
            },
          },
        ],
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      {
        code: '<div className="btn invalid-class" />',
        filename: path.join(tempDir, 'test.jsx'),
        options: [
          {
            sources: {
              css: [path.join(tempDir, 'styles2.css')],
            },
            validation: {
              whitelist: ['custom-*'],
            },
          },
        ],
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
    ],
  })

  // Cleanup - NOTE: Files need to exist when tests actually run
  // So we can't cleanup immediately. This is a known limitation of RuleTester.
  // In practice, temp files will be cleaned by OS eventually.
  // fs.rmSync(tempDir, { recursive: true, force: true });
})()
