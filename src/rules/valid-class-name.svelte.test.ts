import { RuleTester } from 'eslint'
import * as svelteParser from 'svelte-eslint-parser'

import { validClassNameRule as rule } from './valid-class-name'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: svelteParser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

// Test Svelte class and class: directive validation
ruleTester.run('valid-class-name (Svelte)', rule, {
  valid: [
    // ========== Static class attributes ==========

    // No class attribute
    {
      code: '<div></div>',
      filename: 'test.svelte',
    },

    // Empty class attribute
    {
      code: '<div class=""></div>',
      filename: 'test.svelte',
    },

    // Static class with ignore patterns
    {
      code: '<div class="custom-class"></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['custom-class'],
          },
        },
      ],
    },

    // Multiple static classes
    {
      code: '<div class="foo bar baz"></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar', 'baz'],
          },
        },
      ],
    },

    // Static class with glob pattern
    {
      code: '<div class="btn-primary"></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['btn-*'],
          },
        },
      ],
    },

    // ========== Mixed static + dynamic ==========

    // Mixed literal and mustache expression (variable - skipped)
    {
      code: '<div class="static {dynamicClass}"></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['static'],
          },
        },
      ],
    },

    // Mixed with string literal in mustache
    {
      code: '<div class="foo {\'bar\'}"></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },

    // ========== Fully dynamic class attributes ==========

    // Dynamic with string literal
    {
      code: "<div class={'foo bar'}></div>",
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },

    // Dynamic with ternary
    {
      code: "<div class={isActive ? 'active' : 'inactive'}></div>",
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active', 'inactive'],
          },
        },
      ],
    },

    // Dynamic with logical operator
    {
      code: "<div class={isActive && 'active'}></div>",
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active'],
          },
        },
      ],
    },

    // Dynamic with array syntax (via function)
    {
      code: "<div class={clsx(['foo', 'bar'])}></div>",
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },

    // Dynamic with object syntax (via function)
    {
      code: '<div class={clsx({ active: true, disabled: false })}></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active', 'disabled'],
          },
        },
      ],
    },

    // Dynamic with variable (should be skipped)
    {
      code: '<div class={dynamicClass}></div>',
      filename: 'test.svelte',
    },

    // Dynamic with template literal (should be skipped)
    {
      code: '<div class={`dynamic-${foo}`}></div>',
      filename: 'test.svelte',
    },

    // ========== Class directives (shorthand) ==========

    // Shorthand class directive
    {
      code: '<div class:active></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active'],
          },
        },
      ],
    },

    // Multiple shorthand directives
    {
      code: '<div class:active class:disabled></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active', 'disabled'],
          },
        },
      ],
    },

    // ========== Class directives (full form) ==========

    // Full form class directive
    {
      code: '<div class:active={isActive}></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active'],
          },
        },
      ],
    },

    // Multiple full form directives
    {
      code: '<div class:active={isActive} class:disabled={isDisabled}></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active', 'disabled'],
          },
        },
      ],
    },

    // ========== Mixed patterns ==========

    // Static class + class directive
    {
      code: '<div class="container" class:active={isActive}></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['container', 'active'],
          },
        },
      ],
    },

    // Dynamic class + class directive
    {
      code: '<div class={baseClass} class:active></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active'],
          },
        },
      ],
    },

    // ========== Nested elements ==========

    {
      code: '<section class="container"><h1 class="title">Heading</h1></section>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['container', 'title'],
          },
        },
      ],
    },

    // ========== Other attributes should not trigger ==========

    {
      code: '<div id="test" data-class="not-validated"></div>',
      filename: 'test.svelte',
    },
  ],

  invalid: [
    // ========== Invalid static classes ==========

    {
      code: '<div class="invalid-class"></div>',
      filename: 'test.svelte',
      errors: [
        {
          messageId: 'invalidClassName',
          data: { className: 'invalid-class' },
        },
      ],
    },

    // Multiple classes, one invalid
    {
      code: '<div class="valid-one invalid-class valid-two"></div>',
      filename: 'test.svelte',
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
          data: { className: 'invalid-class' },
        },
      ],
    },

    // ========== Invalid mixed classes ==========

    {
      code: '<div class="valid {\'invalid-class\'}"></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['valid'],
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

    // ========== Invalid dynamic classes ==========

    {
      code: "<div class={'invalid-class'}></div>",
      filename: 'test.svelte',
      errors: [
        {
          messageId: 'invalidClassName',
          data: { className: 'invalid-class' },
        },
      ],
    },

    {
      code: "<div class={isActive ? 'active' : 'invalid-class'}></div>",
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['active'],
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

    // ========== Invalid class directives ==========

    // Note: Shorthand class directives require valid JavaScript identifiers
    // So we use camelCase instead of kebab-case for shorthand tests
    {
      code: '<div class:invalidClass></div>',
      filename: 'test.svelte',
      errors: [
        {
          messageId: 'invalidClassName',
          data: { className: 'invalidClass' },
        },
      ],
    },

    {
      code: '<div class:invalid-class={isActive}></div>',
      filename: 'test.svelte',
      errors: [
        {
          messageId: 'invalidClassName',
          data: { className: 'invalid-class' },
        },
      ],
    },

    // Multiple directives, one invalid (using camelCase for shorthand)
    {
      code: '<div class:validOne class:invalidClass class:validTwo></div>',
      filename: 'test.svelte',
      options: [
        {
          validation: {
            ignorePatterns: ['valid*'],
          },
        },
      ],
      errors: [
        {
          messageId: 'invalidClassName',
          data: { className: 'invalidClass' },
        },
      ],
    },

    // ========== Nested elements with invalid classes ==========

    {
      code: '<section class="container"><h1 class="invalid-title">Heading</h1></section>',
      filename: 'test.svelte',
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
          data: { className: 'invalid-title' },
        },
      ],
    },

    // ========== Empty arbitrary values ==========

    {
      code: '<div class="w-[]"></div>',
      filename: 'test.svelte',
      errors: [
        {
          messageId: 'invalidClassName',
          data: { className: 'w-[]' },
        },
      ],
    },
  ],
})
