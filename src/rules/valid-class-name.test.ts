import { RuleTester } from 'eslint'
import rule from 'src/rules/valid-class-name'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { clearCache } from 'src/cache/class-registry'

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

// Tests for Tailwind variant validation
describe('Tailwind variant validation', () => {
  beforeEach(() => {
    clearCache()
  })

  const tailwindOptions = [
    {
      sources: {
        tailwind: {
          config: path.join(process.cwd(), 'test-project/tailwind.config.cjs'),
        },
      },
      validation: {
        whitelist: ['mt-2', 'bg-blue-500', 'text-lg', 'opacity-100', 'ring-2'],
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
                      'test-project/tailwind.config.cjs',
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
                      'test-project/tailwind.config.cjs',
                    ),
                  },
                },
              },
            ],
          },
          // Whitelist pattern with variants should be valid
          {
            code: '<div className="hover:custom-button" />',
            filename: 'test.jsx',
            options: [
              {
                sources: {
                  tailwind: {
                    config: path.join(
                      process.cwd(),
                      'test-project/tailwind.config.cjs',
                    ),
                  },
                },
                validation: {
                  whitelist: ['custom-*'],
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
                      'test-project/tailwind.config.cjs',
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
                      'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
                ),
              },
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
                  'test-project/tailwind.config.cjs',
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
})
