import { RuleTester } from 'eslint'
import * as vueParser from 'vue-eslint-parser'

import { validClassNameRule as rule } from './valid-class-name'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

// Test Vue class and :class attribute validation
ruleTester.run('valid-class-name (Vue)', rule, {
  valid: [
    // No class attribute
    {
      code: '<template><div></div></template>',
      filename: 'test.vue',
    },
    // Empty class attribute
    {
      code: '<template><div class=""></div></template>',
      filename: 'test.vue',
    },
    // Static class with ignore patterns - exact match
    {
      code: '<template><div class="custom-class"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['custom-class'],
          },
        },
      ],
    },
    // Static class with multiple classes
    {
      code: '<template><div class="foo bar baz"></div></template>',
      filename: 'test.vue',
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
      code: '<template><div class="btn-primary"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['btn-*'],
          },
        },
      ],
    },
    // Dynamic :class with string literal
    {
      code: '<template><div :class="\'foo bar\'"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    // Dynamic :class with object syntax
    {
      code: '<template><div :class="{ active: true, disabled: false }"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['active', 'disabled'],
          },
        },
      ],
    },
    // Dynamic :class with array syntax
    {
      code: "<template><div :class=\"['foo', 'bar']\"></div></template>",
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    // Dynamic :class with ternary
    {
      code: "<template><div :class=\"isActive ? 'active' : 'inactive'\"></div></template>",
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['active', 'inactive'],
          },
        },
      ],
    },
    // Dynamic :class with logical operator
    {
      code: '<template><div :class="isActive && \'active\'"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['active'],
          },
        },
      ],
    },
    // v-bind:class (long form)
    {
      code: '<template><div v-bind:class="\'foo bar\'"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['foo', 'bar'],
          },
        },
      ],
    },
    // Dynamic :class with variable (should be skipped)
    {
      code: '<template><div :class="dynamicClass"></div></template>',
      filename: 'test.vue',
    },
    // Dynamic :class with template literal (should be skipped)
    {
      code: '<template><div :class="`dynamic-${foo}`"></div></template>',
      filename: 'test.vue',
    },
    // Nested elements
    {
      code: '<template><section class="container"><h1 class="title">Heading</h1></section></template>',
      filename: 'test.vue',
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
      code: '<template><div id="test" data-class="not-validated"></div></template>',
      filename: 'test.vue',
    },
    // Mix static and dynamic in same template
    {
      code: '<template><div class="static" :class="{ dynamic: true }"></div></template>',
      filename: 'test.vue',
      options: [
        {
          validation: {
            ignorePatterns: ['static', 'dynamic'],
          },
        },
      ],
    },
  ],
  invalid: [
    // Invalid static class
    {
      code: '<template><div class="invalid-class"></div></template>',
      filename: 'test.vue',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Invalid static class - multiple classes
    {
      code: '<template><div class="valid-one invalid-class valid-two"></div></template>',
      filename: 'test.vue',
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
    // Invalid dynamic :class with string literal
    {
      code: '<template><div :class="\'invalid-class\'"></div></template>',
      filename: 'test.vue',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Invalid dynamic :class with object syntax
    {
      code: '<template><div :class="{ \'invalid-class\': true }"></div></template>',
      filename: 'test.vue',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Invalid dynamic :class with array syntax
    {
      code: "<template><div :class=\"['valid-one', 'invalid-class']\"></div></template>",
      filename: 'test.vue',
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
    // Invalid dynamic :class with ternary
    {
      code: "<template><div :class=\"isActive ? 'active' : 'invalid-class'\"></div></template>",
      filename: 'test.vue',
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
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Invalid v-bind:class (long form)
    {
      code: '<template><div v-bind:class="\'invalid-class\'"></div></template>',
      filename: 'test.vue',
      errors: [
        {
          messageId: 'invalidClassName',
          data: {
            className: 'invalid-class',
          },
        },
      ],
    },
    // Mix of valid and invalid in static class
    {
      code: '<template><div class="foo bar baz"></div></template>',
      filename: 'test.vue',
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
      code: '<template><section class="container"><h1 class="invalid-title">Heading</h1></section></template>',
      filename: 'test.vue',
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
      code: '<template><div class="w-[]"></div></template>',
      filename: 'test.vue',
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
