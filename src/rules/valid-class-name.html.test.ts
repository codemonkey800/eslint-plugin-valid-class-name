import * as angularParser from '@angular-eslint/template-parser'
import { RuleTester } from 'eslint'

import { validClassNameRule as rule } from './valid-class-name'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: angularParser,
  },
})

// Test HTML class attribute validation
ruleTester.run('valid-class-name (HTML)', rule, {
  valid: [
    // No class attribute
    {
      code: '<div></div>',
      filename: 'test.html',
    },
    // Empty class attribute
    {
      code: '<div class=""></div>',
      filename: 'test.html',
    },
    // With ignore patterns - exact match
    {
      code: '<div class="custom-class"></div>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['custom-class'],
          },
        },
      ],
    },
    // With ignore patterns - multiple classes
    {
      code: '<div class="foo bar baz"></div>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },
    // With ignore patterns - glob pattern
    {
      code: '<div class="btn-primary"></div>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['btn-*'],
          },
        },
      ],
    },
    // Tailwind classes with ignore pattern
    {
      code: '<div class="text-red-500"></div>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['text-*'],
          },
        },
      ],
    },
    // Multiple classes with pattern
    {
      code: '<div class="mt-2 p-4 flex"></div>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['mt-*', 'p-*', 'flex'],
          },
        },
      ],
    },
    // Nested elements
    {
      code: '<section class="container"><h1 class="title">Heading</h1></section>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['container', 'title'],
          },
        },
      ],
    },
    // Other attributes should not trigger validation
    {
      code: '<div id="test" data-class="not-validated"></div>',
      filename: 'test.html',
    },
  ],
  invalid: [
    // Invalid single class
    {
      code: '<div class="invalid-class"></div>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Invalid multiple classes
    {
      code: '<div class="valid-one invalid-class valid-two"></div>',
      filename: 'test.html',
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
            className: 'invalid-class',
          },
        },
      ],
    },
    // Mix of valid and invalid
    {
      code: '<div class="foo bar baz"></div>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'baz',
          },
        },
      ],
    },
    // Nested elements with invalid classes
    {
      code: '<section class="container"><h1 class="invalid-title">Heading</h1></section>',
      filename: 'test.html',
      options: [
        {
          validation: {
            ignorePatterns: ['container'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-title',
          },
        },
      ],
    },
    // Empty arbitrary values should be invalid
    {
      code: '<div class="w-[]"></div>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'w-[]',
          },
        },
      ],
    },
  ],
})
