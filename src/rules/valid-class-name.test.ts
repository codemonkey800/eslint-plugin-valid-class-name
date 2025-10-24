import { RuleTester } from 'eslint'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { clearCache } from 'src/registry/class-registry'

import { validClassNameRule as rule } from './valid-class-name'

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
    // With allowlist - exact matches
    {
      code: '<div className="custom-class" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['custom-class'],
          },
        },
      ],
    },
    // With allowlist - multiple classes, all valid
    {
      code: '<div className="foo bar baz" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    // With allowlist - glob pattern matching
    {
      code: '<div className="btn-primary" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['btn-*'],
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
            ignorePatterns: ['text-*'],
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
            ignorePatterns: ['static-class'],
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
            ignorePatterns: ['foo', 'bar'],
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
            ignorePatterns: ['foo', 'bar', 'baz'],
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
            ignorePatterns: ['foo', 'bar'],
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
            ignorePatterns: ['*-middle-*'],
          },
        },
      ],
    },
    // Array syntax within function calls
    {
      code: '<div className={clsx(["foo", "bar"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    {
      code: '<div className={classnames(["btn-primary", "btn-large"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['btn-*'],
          },
        },
      ],
    },
    // Object syntax within function calls
    {
      code: '<div className={clsx({ foo: true, bar: false })} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    {
      code: '<div className={clsx({ "btn-primary": true, "text-large": condition })} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['btn-*', 'text-*'],
          },
        },
      ],
    },
    // Mixed array and object syntax
    {
      code: '<div className={clsx(["foo", { bar: true, baz: false }])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    {
      code: '<div className={cns("base", ["container"], { active: true })} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['base', 'container', 'active'],
          },
        },
      ],
    },
    // Nested arrays
    {
      code: '<div className={clsx(["foo", ["bar", "baz"]])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    // Array with conditionals
    {
      code: '<div className={clsx(["foo", condition && "bar"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    {
      code: '<div className={clsx(["foo", condition ? "bar" : "baz"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    // Complex nested patterns
    {
      code: '<div className={clsx(["flex", ["items-center", { "bg-blue-500": isActive }]])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['flex', 'items-center', 'bg-*'],
          },
        },
      ],
    },
    // Empty array and object (should not cause errors)
    {
      code: '<div className={clsx([])} />',
      filename: 'test.jsx',
    },
    {
      code: '<div className={clsx({})} />',
      filename: 'test.jsx',
    },
    // Sparse arrays
    {
      code: '<div className={clsx(["foo",, "bar"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    // Object with identifier keys (shorthand)
    {
      code: '<div className={clsx({ foo, bar })} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
  ],
  invalid: [
    // No allowlist - all class names are invalid
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
    // With allowlist - class not in list
    {
      code: '<div className="invalid-class" />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['valid-class'],
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
            ignorePatterns: ['foo', 'baz'],
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
            ignorePatterns: ['valid-*'],
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
            ignorePatterns: ['btn-*'],
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
            ignorePatterns: ['valid-class'],
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
            ignorePatterns: ['valid-class'],
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
    // Array with invalid class
    {
      code: '<div className={clsx(["invalid-class"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['valid-class'],
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
    // Object with invalid class key
    {
      code: '<div className={clsx({ "invalid-class": true })} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['valid-class'],
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
    // Mixed valid and invalid in array
    {
      code: '<div className={clsx(["valid-class", "invalid-class"])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['valid-class'],
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
    // Nested array with invalid class
    {
      code: '<div className={clsx(["valid-class", ["invalid-nested"]])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['valid-class'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-nested',
          },
        },
      ],
    },
    // Mixed array/object with invalid class in object
    {
      code: '<div className={clsx(["valid-class", { "invalid-class": true }])} />',
      filename: 'test.jsx',
      options: [
        {
          validation: {
            ignorePatterns: ['valid-class'],
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
              ignorePatterns: ['custom-*'],
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
              ignorePatterns: ['custom-*'],
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

// Tests for Tailwind variant validation
describe('Tailwind variant validation', () => {
  beforeEach(() => {
    clearCache()
  })

  const tailwindOptions = [
    {
      sources: {
        tailwind: {
          config: path.join(process.cwd(), 'examples/react/tailwind.config.js'),
        },
      },
    },
  ]

  // Valid variant tests
  ruleTester.run('valid-class-name (variants - valid)', rule, {
    valid: [
      {
        code: '<div className="hover:bg-blue-500" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="first:mt-2" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="sm:text-lg" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="dark:bg-blue-500" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="sm:hover:bg-blue-500" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="group-hover:opacity-100" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="peer-focus:ring-2" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="[&:nth-child(3)]:mt-2" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
      {
        code: '<div className="md:hover:first:mt-2" />',
        filename: 'test.jsx',
        options: tailwindOptions,
      },
    ],
    invalid: [],
  })

  // Invalid variant tests
  ruleTester.run('valid-class-name (variants - invalid)', rule, {
    valid: [],
    invalid: [
      {
        code: '<div className="hovr:bg-blue-500" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidVariant',
            data: {
              variant: 'hovr',
              className: 'hovr:bg-blue-500',
            },
          },
        ],
      },
      {
        code: '<div className="firs:mt-2" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidVariant',
            data: {
              variant: 'firs',
              className: 'firs:mt-2',
            },
          },
        ],
      },
      {
        code: '<div className="smm:text-lg" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidVariant',
            data: {
              variant: 'smm',
              className: 'smm:text-lg',
            },
          },
        ],
      },
      {
        code: '<div className="group-hovr:opacity-100" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidVariant',
            data: {
              variant: 'group-hovr',
              className: 'group-hovr:opacity-100',
            },
          },
        ],
      },
      {
        code: '<div className="peer-focs:ring-2" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidVariant',
            data: {
              variant: 'peer-focs',
              className: 'peer-focs:ring-2',
            },
          },
        ],
      },
    ],
  })

  // Invalid base utility with valid variant
  ruleTester.run('valid-class-name (variants - invalid base)', rule, {
    valid: [],
    invalid: [
      {
        code: '<div className="hover:bg-blue-50000" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidClassName',
            data: {
              className: 'bg-blue-50000',
            },
          },
        ],
      },
      {
        code: '<div className="first:mt-2x" />',
        filename: 'test.jsx',
        options: tailwindOptions,
        errors: [
          {
            messageId: 'invalidClassName',
            data: {
              className: 'mt-2x',
            },
          },
        ],
      },
    ],
  })

  // Test that CSS classes with Tailwind variants are invalid
  // (variants should only work with Tailwind utilities)
  describe('CSS classes with Tailwind variants', () => {
    const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-test-'))
    const cssFile = path.join(testDir, 'test.css')

    beforeAll(() => {
      // Create a CSS file with a container class
      fs.writeFileSync(
        cssFile,
        `
        .container {
          max-width: 1200px;
        }
        .header {
          background: #fff;
        }
      `,
      )
    })

    afterAll(() => {
      // Clean up
      fs.unlinkSync(cssFile)
      fs.rmdirSync(testDir)
      clearCache()
    })

    ruleTester.run(
      'valid-class-name (CSS classes with Tailwind variants)',
      rule,
      {
        valid: [
          // CSS class without variants should be valid
          {
            code: '<div className="container" />',
            filename: 'test.jsx',
            options: [
              {
                sources: {
                  css: [cssFile],
                  tailwind: {
                    config: path.join(
                      process.cwd(),
                      'examples/react/tailwind.config.js',
                    ),
                  },
                },
              },
            ],
          },
          // Tailwind utility with variants should be valid
          {
            code: '<div className="focus:first:mb-2" />',
            filename: 'test.jsx',
            options: [
              {
                sources: {
                  css: [cssFile],
                  tailwind: {
                    config: path.join(
                      process.cwd(),
                      'examples/react/tailwind.config.js',
                    ),
                  },
                },
              },
            ],
          },
          // Allowlist pattern with variants should be valid
          {
            code: '<div className="hover:custom-button" />',
            filename: 'test.jsx',
            options: [
              {
                sources: {
                  tailwind: {
                    config: path.join(
                      process.cwd(),
                      'examples/react/tailwind.config.js',
                    ),
                  },
                },
                validation: {
                  ignorePatterns: ['custom-*'],
                },
              },
            ],
          },
        ],
        invalid: [
          // CSS class with Tailwind variants should be invalid
          {
            code: '<div className="focus:first:container" />',
            filename: 'test.jsx',
            options: [
              {
                sources: {
                  css: [cssFile],
                  tailwind: {
                    config: path.join(
                      process.cwd(),
                      'examples/react/tailwind.config.js',
                    ),
                    includePluginClasses: false, // Disable to test CSS-only validation
                  },
                },
              },
            ],
            errors: [
              {
                messageId: 'invalidClassName',
                data: {
                  className: 'container',
                },
              },
            ],
          },
          {
            code: '<div className="hover:header" />',
            filename: 'test.jsx',
            options: [
              {
                sources: {
                  css: [cssFile],
                  tailwind: {
                    config: path.join(
                      process.cwd(),
                      'examples/react/tailwind.config.js',
                    ),
                  },
                },
              },
            ],
            errors: [
              {
                messageId: 'invalidClassName',
                data: {
                  className: 'header',
                },
              },
            ],
          },
        ],
      },
    )
  })

  // Test that ignore patterns work with variants
  ruleTester.run('valid-class-name (variants - ignore patterns)', rule, {
    valid: [
      {
        code: '<div className="hover:dynamic-loader" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
            validation: {
              ignorePatterns: ['dynamic-*'],
            },
          },
        ],
      },
    ],
    invalid: [],
  })
})

describe('Dynamic class names - ConditionalExpression', () => {
  beforeEach(() => {
    clearCache()
  })

  const options = [
    {
      validation: {
        ignorePatterns: [
          'opacity-0',
          'opacity-1',
          'bg-blue-500',
          'bg-gray-500',
        ],
      },
    },
  ]

  ruleTester.run('valid-class-name - ConditionalExpression', rule, {
    valid: [
      // Simple ternary with valid classes
      {
        code: '<div className={isActive ? "opacity-0" : "opacity-1"} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={isActive ? "bg-blue-500" : "bg-gray-500"} />',
        filename: 'test.jsx',
        options,
      },
      // Nested ternary
      {
        code: '<div className={a ? (b ? "opacity-0" : "opacity-1") : "bg-blue-500"} />',
        filename: 'test.jsx',
        options,
      },
      // Ternary with multiple classes in string
      {
        code: '<div className={isActive ? "opacity-0 bg-blue-500" : "opacity-1 bg-gray-500"} />',
        filename: 'test.jsx',
        options,
      },
    ],
    invalid: [
      // Invalid class in consequent
      {
        code: '<div className={isActive ? "invalid-class" : "opacity-1"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Invalid class in alternate
      {
        code: '<div className={isActive ? "opacity-0" : "invalid-class"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Both branches invalid
      {
        code: '<div className={isActive ? "invalid-1" : "invalid-2"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-1' },
          },
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-2' },
          },
        ],
      },
      // Nested with invalid in inner ternary
      {
        code: '<div className={a ? (b ? "invalid-class" : "opacity-1") : "bg-blue-500"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
    ],
  })
})

describe('Dynamic class names - LogicalExpression', () => {
  beforeEach(() => {
    clearCache()
  })

  const options = [
    {
      validation: {
        ignorePatterns: ['opacity-0', 'opacity-50', 'flex', 'mt-2'],
      },
    },
  ]

  ruleTester.run('valid-class-name - LogicalExpression', rule, {
    valid: [
      // Logical AND with valid class
      {
        code: '<div className={isDisabled && "opacity-50"} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={condition && "flex"} />',
        filename: 'test.jsx',
        options,
      },
      // Logical OR with valid class
      {
        code: '<div className={customClass || "flex"} />',
        filename: 'test.jsx',
        options,
      },
      // Multiple logical operators
      {
        code: '<div className={a && b && "opacity-0"} />',
        filename: 'test.jsx',
        options,
      },
      // String on left side of &&
      {
        code: '<div className={"flex" && condition} />',
        filename: 'test.jsx',
        options,
      },
    ],
    invalid: [
      // Invalid class with AND
      {
        code: '<div className={isDisabled && "invalid-class"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Invalid class with OR
      {
        code: '<div className={customClass || "invalid-class"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Multiple logical with invalid
      {
        code: '<div className={a && b && "invalid-class"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
    ],
  })
})

describe('Dynamic class names - CallExpression', () => {
  beforeEach(() => {
    clearCache()
  })

  const options = [
    {
      validation: {
        ignorePatterns: [
          'mt-2',
          'opacity-0',
          'bg-blue-500',
          'flex',
          'items-center',
        ],
      },
    },
  ]

  ruleTester.run('valid-class-name - CallExpression', rule, {
    valid: [
      // cns() with static classes
      {
        code: '<div className={cns("mt-2", "flex")} />',
        filename: 'test.jsx',
        options,
      },
      // cns() with logical expression
      {
        code: '<div className={cns("mt-2", isDisabled && "opacity-0")} />',
        filename: 'test.jsx',
        options,
      },
      // clsx() with logical expression
      {
        code: '<div className={clsx("flex", isActive && "bg-blue-500")} />',
        filename: 'test.jsx',
        options,
      },
      // classnames() with ternary
      {
        code: '<div className={classnames("mt-2", isActive ? "opacity-0" : "bg-blue-500")} />',
        filename: 'test.jsx',
        options,
      },
      // Multiple classes in one string argument
      {
        code: '<div className={cns("flex items-center")} />',
        filename: 'test.jsx',
        options,
      },
      // Nested function calls
      {
        code: '<div className={cns(clsx("mt-2", "flex"))} />',
        filename: 'test.jsx',
        options,
      },
      // Empty call (should not error)
      {
        code: '<div className={cns()} />',
        filename: 'test.jsx',
        options,
      },
    ],
    invalid: [
      // cns() with invalid class
      {
        code: '<div className={cns("mt-2", "invalid-class")} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // clsx() with invalid in logical expression
      {
        code: '<div className={clsx("flex", isActive && "invalid-class")} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // classnames() with invalid in ternary
      {
        code: '<div className={classnames("mt-2", isActive ? "invalid-class" : "bg-blue-500")} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Multiple invalid classes
      {
        code: '<div className={cns("invalid-1", "mt-2", "invalid-2")} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-1' },
          },
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-2' },
          },
        ],
      },
    ],
  })
})

describe('Dynamic class names - TemplateLiteral and edge cases', () => {
  beforeEach(() => {
    clearCache()
  })

  const options = [
    {
      validation: {
        ignorePatterns: ['flex', 'opacity-0', 'mt-2'],
      },
    },
  ]

  ruleTester.run('valid-class-name - TemplateLiteral and edge cases', rule, {
    valid: [
      // Template literal without interpolation (valid)
      {
        code: '<div className={`flex`} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={`opacity-0`} />',
        filename: 'test.jsx',
        options,
      },
      // Template literal with interpolation (should skip validation)
      {
        code: '<div className={`flex-${direction}`} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={`opacity-${value}`} />',
        filename: 'test.jsx',
        options,
      },
      // Mixed valid scenarios
      {
        code: '<div className={condition ? `flex` : "opacity-0"} />',
        filename: 'test.jsx',
        options,
      },
      // Non-string literals (should skip)
      {
        code: '<div className={condition ? null : "flex"} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={condition ? undefined : "flex"} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={condition ? 123 : "flex"} />',
        filename: 'test.jsx',
        options,
      },
      // Variables (should skip)
      {
        code: '<div className={condition ? someVar : "flex"} />',
        filename: 'test.jsx',
        options,
      },
    ],
    invalid: [
      // Template literal without interpolation with invalid class
      {
        code: '<div className={`invalid-class`} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Mixed with invalid in ternary
      {
        code: '<div className={condition ? `invalid-class` : "flex"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
    ],
  })
})

describe('Dynamic class names - Advanced cases', () => {
  beforeEach(() => {
    clearCache()
  })

  const options = [
    {
      validation: {
        ignorePatterns: [
          'flex',
          'opacity-0',
          'mt-2',
          'bg-blue-500',
          'bg-gray-300',
          'p-2',
          'p-4',
          'text-sm',
          'text-base',
          'ring-2',
        ],
      },
    },
  ]

  ruleTester.run('valid-class-name - Advanced cases', rule, {
    valid: [
      // Nullish coalescing operator (??)
      {
        code: '<div className={customClass ?? "flex"} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={value1 ?? value2 ?? "opacity-0"} />',
        filename: 'test.jsx',
        options,
      },
      // Multiple classes in template literal (no interpolation)
      {
        code: '<div className={`flex opacity-0`} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={`mt-2 bg-blue-500`} />',
        filename: 'test.jsx',
        options,
      },
      // Deeply nested structures
      {
        code: '<div className={cns(a ? (b && "flex") : clsx("opacity-0"))} />',
        filename: 'test.jsx',
        options,
      },
      {
        code: '<div className={cns(a ? (b ? (c ? "flex" : "opacity-0") : "mt-2") : "bg-blue-500")} />',
        filename: 'test.jsx',
        options,
      },
      // Mixed valid/invalid in single string (all valid)
      {
        code: '<div className={isActive ? "flex mt-2 opacity-0" : "bg-gray-300"} />',
        filename: 'test.jsx',
        options,
      },
      // Complex nested with multiple functions
      {
        code: '<div className={clsx(cns("flex", isActive && "mt-2"), classnames("opacity-0"))} />',
        filename: 'test.jsx',
        options,
      },
    ],
    invalid: [
      // Nullish coalescing with invalid class
      {
        code: '<div className={customClass ?? "invalid-class"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Multiple classes in template literal with one invalid
      {
        code: '<div className={`flex invalid-class opacity-0`} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      // Deeply nested with invalid class
      {
        code: '<div className={cns(a ? (b && "invalid-class") : clsx("opacity-0"))} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
      {
        code: '<div className={cns(a ? (b ? (c ? "flex" : "invalid-nested") : "mt-2") : "bg-blue-500")} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-nested' },
          },
        ],
      },
      // Mixed valid/invalid in single string
      {
        code: '<div className={isActive ? "flex invalid-one mt-2" : "bg-gray-300"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-one' },
          },
        ],
      },
      {
        code: '<div className={isActive ? "flex mt-2" : "invalid-one bg-gray-300 invalid-two"} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-one' },
          },
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-two' },
          },
        ],
      },
      // Complex nested with multiple functions and invalid
      {
        code: '<div className={clsx(cns("flex", isActive && "invalid-class"), classnames("opacity-0"))} />',
        filename: 'test.jsx',
        options,
        errors: [
          {
            messageId: 'invalidClassName',
            data: { className: 'invalid-class' },
          },
        ],
      },
    ],
  })
})

describe('Tailwind arbitrary value support', () => {
  ruleTester.run('valid-class-name (arbitrary values)', rule, {
    valid: [
      // Simple arbitrary values
      {
        code: '<div className="w-[100px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      {
        code: '<div className="h-[50vh]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Arbitrary color values
      {
        code: '<div className="bg-[#1da1f2]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      {
        code: '<div className="text-[#ff0000]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Multi-part prefixes
      {
        code: '<div className="min-w-[100px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      {
        code: '<div className="grid-cols-[200px_1fr]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Complex arbitrary values
      {
        code: '<div className="grid-cols-[200px_minmax(900px,_1fr)_100px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Arbitrary values with variants
      {
        code: '<div className="hover:w-[100px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      {
        code: '<div className="md:text-[18px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      {
        code: '<div className="hover:focus:bg-[#1da1f2]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Multiple arbitrary values
      {
        code: '<div className="w-[100px] h-[50vh] bg-[#1da1f2]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Mixed arbitrary and regular values
      {
        code: '<div className="w-[100px] h-full bg-blue-500" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
      },
      // Empty arbitrary values can be ignored with ignorePatterns (fix for issue 1.1)
      {
        code: '<div className="w-[]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
                includePluginClasses: false,
              },
            },
            validation: {
              ignorePatterns: ['w-[]'],
            },
          },
        ],
      },
    ],
    invalid: [
      // Invalid prefix
      {
        code: '<div className="invalid-[100px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
        errors: [
          {
            messageId: 'invalidClassName',
            data: {
              className: 'invalid-[100px]',
            },
          },
        ],
      },
      // Empty value
      {
        code: '<div className="w-[]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
                includePluginClasses: false, // Disable to avoid interference
              },
            },
          },
        ],
        errors: [
          {
            messageId: 'invalidClassName',
            data: {
              className: 'w-[]',
            },
          },
        ],
      },
      // Invalid prefix with variant
      {
        code: '<div className="hover:invalid-[100px]" />',
        filename: 'test.jsx',
        options: [
          {
            sources: {
              tailwind: {
                config: path.join(
                  process.cwd(),
                  'examples/react/tailwind.config.js',
                ),
              },
            },
          },
        ],
        errors: [
          {
            messageId: 'invalidClassName',
            data: {
              className: 'invalid-[100px]',
            },
          },
        ],
      },
    ],
  })

  // Test object-style class name attributes
  describe('object-style attributes', () => {
    const ruleTesterForObjects = new RuleTester({
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

    ruleTesterForObjects.run(
      'valid-class-name with object-style attributes',
      rule,
      {
        valid: [
          // Basic object literal with valid classes
          {
            code: '<Component classes={{ root: "mt-2", container: "p-4" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2', 'p-4'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Object with conditional expressions
          {
            code: '<Component classes={{ root: condition ? "mt-2" : "mt-4" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2', 'mt-4'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Object with logical expressions
          {
            code: '<Component classes={{ root: condition && "mt-2" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Object with function calls (clsx)
          {
            code: '<Component classes={{ root: clsx("mt-2", "p-4") }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2', 'p-4'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Dynamic variable (should skip validation)
          {
            code: '<Component classes={{ root: someVariable }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Spread operator (should skip)
          {
            code: '<Component classes={{ ...others, root: "mt-2" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Multiple attributes on same element
          {
            code: '<Component className="foo" classes={{ root: "bar" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['foo', 'bar'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Custom attribute name: classNames
          {
            code: '<Component classNames={{ root: "mt-2" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classNames'],
                },
              },
            ],
          },
          // Custom attribute name: sx
          {
            code: '<Component sx={{ root: "mt-2" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['sx'],
                },
              },
            ],
          },
          // Multiple custom attribute names
          {
            code: '<Component classes={{ root: "mt-2" }} classNames={{ body: "p-4" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2', 'p-4'],
                  objectStyleAttributes: ['classes', 'classNames'],
                },
              },
            ],
          },
          // Empty configuration (backward compatibility - should not validate)
          {
            code: '<Component classes={{ root: "invalid-class" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  // objectStyleAttributes not configured
                },
              },
            ],
          },
          // Object with multiple properties
          {
            code: '<Component classes={{ root: "mt-2", header: "flex items-center", body: "p-4 rounded" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: [
                    'mt-2',
                    'flex',
                    'items-center',
                    'p-4',
                    'rounded',
                  ],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
          // Non-object value (should skip validation)
          {
            code: '<Component classes="string-value" />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
          },
        ],
        invalid: [
          // Invalid class in object value
          {
            code: '<Component classes={{ root: "invalid-class" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
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
          // Multiple invalid classes in single property
          {
            code: '<Component classes={{ root: "invalid-1 invalid-2" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
                },
              },
            ],
            errors: [
              {
                messageId: 'invalidClassName',
                data: { className: 'invalid-1' },
              },
              {
                messageId: 'invalidClassName',
                data: { className: 'invalid-2' },
              },
            ],
          },
          // Invalid class with custom attribute name
          {
            code: '<Component classNames={{ root: "invalid-class" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classNames'],
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
          // Mixed valid and invalid classes in object
          {
            code: '<Component classes={{ root: "mt-2", container: "invalid-class" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
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
          // Invalid class in conditional
          {
            code: '<Component classes={{ root: condition ? "mt-2" : "invalid-class" }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
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
          // Invalid class in function call
          {
            code: '<Component classes={{ root: clsx("mt-2", "invalid-class") }} />',
            filename: 'test.jsx',
            options: [
              {
                validation: {
                  ignorePatterns: ['mt-2'],
                  objectStyleAttributes: ['classes'],
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
      },
    )
  })
})
