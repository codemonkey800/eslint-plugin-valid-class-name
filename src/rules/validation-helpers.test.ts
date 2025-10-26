import { describe, expect, it, jest } from '@jest/globals'
import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

import type { JSXAttribute } from './ast-types'
import { isClassNameIgnored, validateClassNames } from './validation-helpers'

describe('validation-helpers', () => {
  describe('isClassNameIgnored', () => {
    it('should return false when no ignore patterns are provided', () => {
      expect(isClassNameIgnored('any-class', [])).toBe(false)
    })

    it('should return false when class name does not match any pattern', () => {
      const ignorePatterns = ['dynamic-*', 'temp-*']
      expect(isClassNameIgnored('static-class', ignorePatterns)).toBe(false)
    })

    it('should return true when class name matches exact pattern', () => {
      const ignorePatterns = ['exact-match']
      expect(isClassNameIgnored('exact-match', ignorePatterns)).toBe(true)
    })

    it('should return true when class name matches wildcard pattern', () => {
      const ignorePatterns = ['dynamic-*']
      expect(isClassNameIgnored('dynamic-123', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('dynamic-abc', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('dynamic-', ignorePatterns)).toBe(true)
    })

    it('should return true when class name matches any of multiple patterns', () => {
      const ignorePatterns = ['dynamic-*', 'temp-*', 'test-*']
      expect(isClassNameIgnored('dynamic-foo', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('temp-bar', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('test-baz', ignorePatterns)).toBe(true)
    })

    it('should return false when class name partially matches but not fully', () => {
      const ignorePatterns = ['btn-*']
      expect(isClassNameIgnored('btn', ignorePatterns)).toBe(false)
      expect(isClassNameIgnored('my-btn-primary', ignorePatterns)).toBe(false)
    })

    it('should handle patterns with multiple wildcards', () => {
      const ignorePatterns = ['*-dynamic-*']
      expect(isClassNameIgnored('prefix-dynamic-suffix', ignorePatterns)).toBe(
        true,
      )
      expect(isClassNameIgnored('a-dynamic-b', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('-dynamic-', ignorePatterns)).toBe(true)
    })

    it('should handle wildcard at the beginning of pattern', () => {
      const ignorePatterns = ['*-suffix']
      expect(isClassNameIgnored('any-suffix', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('prefix-suffix', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('-suffix', ignorePatterns)).toBe(true)
    })

    it('should handle wildcard at the end of pattern', () => {
      const ignorePatterns = ['prefix-*']
      expect(isClassNameIgnored('prefix-any', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('prefix-suffix', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('prefix-', ignorePatterns)).toBe(true)
    })

    it('should handle pattern that is just a wildcard', () => {
      const ignorePatterns = ['*']
      expect(isClassNameIgnored('anything', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('any-class', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('', ignorePatterns)).toBe(true)
    })

    it('should return false for empty class name with non-wildcard patterns', () => {
      const ignorePatterns = ['some-pattern']
      expect(isClassNameIgnored('', ignorePatterns)).toBe(false)
    })

    it('should handle class names with special characters', () => {
      const ignorePatterns = ['test.*']
      // The dot is escaped as a literal character, so it must be present
      expect(isClassNameIgnored('test.class', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('test.foo', ignorePatterns)).toBe(true)
      // Without the dot, it should not match
      expect(isClassNameIgnored('test-class', ignorePatterns)).toBe(false)
      expect(isClassNameIgnored('testclass', ignorePatterns)).toBe(false)
    })

    it('should handle patterns with hyphens and underscores', () => {
      const ignorePatterns = ['my-component_*']
      expect(isClassNameIgnored('my-component_variant', ignorePatterns)).toBe(
        true,
      )
      expect(isClassNameIgnored('my-component_', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('my-component', ignorePatterns)).toBe(false)
    })

    it('should match first valid pattern and stop (short-circuit)', () => {
      const ignorePatterns = ['exact-match', 'another-*', 'test-*']
      // Should match the first pattern
      expect(isClassNameIgnored('exact-match', ignorePatterns)).toBe(true)
      // Should match the second pattern
      expect(isClassNameIgnored('another-class', ignorePatterns)).toBe(true)
      // Should match the third pattern
      expect(isClassNameIgnored('test-class', ignorePatterns)).toBe(true)
    })

    it('should handle numeric class names', () => {
      const ignorePatterns = ['item-*']
      expect(isClassNameIgnored('item-123', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('item-0', ignorePatterns)).toBe(true)
    })

    it('should be case-sensitive', () => {
      const ignorePatterns = ['Dynamic-*']
      expect(isClassNameIgnored('Dynamic-test', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('dynamic-test', ignorePatterns)).toBe(false)
    })

    it('should handle patterns with brackets (treated as literals, not regex)', () => {
      const ignorePatterns = ['test-[*]']
      expect(isClassNameIgnored('test-[abc]', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('test-[]', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('test-abc', ignorePatterns)).toBe(false)
    })

    it('should handle multiple exact matches in patterns array', () => {
      const ignorePatterns = ['class1', 'class2', 'class3']
      expect(isClassNameIgnored('class1', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('class2', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('class3', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('class4', ignorePatterns)).toBe(false)
    })

    it('should handle edge case with empty pattern in array', () => {
      const ignorePatterns = ['', 'test-*']
      // Empty pattern should match empty string
      expect(isClassNameIgnored('', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('test-foo', ignorePatterns)).toBe(true)
      expect(isClassNameIgnored('other', ignorePatterns)).toBe(false)
    })

    it('should handle pattern security edge cases (protected by pattern-matcher)', () => {
      // These patterns should be safely handled by the pattern-matcher utility
      const ignorePatterns = ['a***', 'b++', '(a+)+']
      // Invalid patterns should not match (pattern-matcher returns null for invalid patterns)
      expect(isClassNameIgnored('aaa', ignorePatterns)).toBe(false)
      expect(isClassNameIgnored('bbb', ignorePatterns)).toBe(false)
    })
  })

  describe('validateClassNames', () => {
    /**
     * Helper to create a mock ESLint context
     */
    function createMockContext(): Rule.RuleContext {
      return {
        report: jest.fn(),
      } as unknown as Rule.RuleContext
    }

    /**
     * Helper to create a mock JSXAttribute node
     */
    function createMockNode(): JSXAttribute {
      return {
        type: 'JSXAttribute',
        name: { type: 'JSXIdentifier', name: 'className' },
        value: null,
      }
    }

    /**
     * Helper to create a mock ClassRegistry
     */
    function createMockRegistry(config: {
      validClasses?: string[]
      cssClasses?: string[]
      tailwindOnlyClasses?: string[]
    }): ClassRegistry {
      const validClasses = new Set(config.validClasses || [])
      const cssClasses = new Set(config.cssClasses || [])
      const tailwindOnlyClasses = new Set(config.tailwindOnlyClasses || [])

      return {
        isValid: jest.fn((className: string) => validClasses.has(className)),
        isCssClass: jest.fn((className: string) => cssClasses.has(className)),
        isTailwindOnly: jest.fn((className: string) =>
          tailwindOnlyClasses.has(className),
        ),
        isTailwindClass: jest.fn(
          (className: string) =>
            !cssClasses.has(className) && validClasses.has(className),
        ),
        getAllClasses: jest.fn(() => validClasses),
        getValidVariants: jest.fn(() => new Set()),
      }
    }

    describe('basic validation', () => {
      it('should not report when all class names are valid', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['btn', 'card'],
        })

        validateClassNames({
          classNames: new Set(['btn', 'card']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).not.toHaveBeenCalled()
      })

      it('should report when class name is invalid', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['btn'],
        })

        validateClassNames({
          classNames: new Set(['invalid-class']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid-class' },
        })
      })

      it('should handle empty class name set', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set([]),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).not.toHaveBeenCalled()
      })

      it('should handle array of class names', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['valid'],
        })

        validateClassNames({
          classNames: ['valid', 'invalid'],
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid' },
        })
      })
    })

    describe('ignore patterns', () => {
      it('should skip classes matching ignore patterns', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['dynamic-123', 'temp-abc']),
          node,
          context,
          classRegistry,
          ignorePatterns: ['dynamic-*', 'temp-*'],
        })

        expect(context.report).not.toHaveBeenCalled()
      })

      it('should validate classes not matching ignore patterns', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['valid'],
        })

        validateClassNames({
          classNames: new Set(['valid', 'invalid', 'dynamic-skip']),
          node,
          context,
          classRegistry,
          ignorePatterns: ['dynamic-*'],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid' },
        })
      })

      it('should skip base class when it matches ignore pattern (with variants)', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['hover:dynamic-123']),
          node,
          context,
          classRegistry,
          ignorePatterns: ['dynamic-*'],
        })

        expect(context.report).not.toHaveBeenCalled()
      })
    })

    describe('empty arbitrary values', () => {
      it('should report error for empty arbitrary values', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['w-[]', 'bg-[]']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(2)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'w-[]' },
        })
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'bg-[]' },
        })
      })

      it('should skip empty arbitrary values if they match ignore pattern', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['w-[]']),
          node,
          context,
          classRegistry,
          ignorePatterns: ['w-[]'],
        })

        expect(context.report).not.toHaveBeenCalled()
      })
    })

    describe('classes with variants', () => {
      it('should report error when base class is invalid', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['hover:invalid-base']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid-base' },
        })
      })

      it('should report error when base is CSS class (CSS classes cannot have Tailwind variants)', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['my-css-class'],
          cssClasses: ['my-css-class'],
        })

        validateClassNames({
          classNames: new Set(['hover:my-css-class']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'my-css-class' },
        })
      })

      it('should report error when variant is invalid on Tailwind-only class', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['mt-2'],
          tailwindOnlyClasses: ['mt-2'],
        })

        validateClassNames({
          classNames: new Set(['hover:mt-2']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidVariant',
          data: {
            variant: 'hover',
            className: 'hover:mt-2',
          },
        })
      })

      it('should not report when base is valid Tailwind-only and variant is valid', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['mt-2', 'hover:mt-2'],
          tailwindOnlyClasses: ['mt-2'],
        })

        validateClassNames({
          classNames: new Set(['hover:mt-2']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).not.toHaveBeenCalled()
      })

      it('should report only first invalid variant when multiple variants are present', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['mt-2'],
          tailwindOnlyClasses: ['mt-2'],
        })

        validateClassNames({
          classNames: new Set(['invalid1:invalid2:mt-2']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        // Should report only the first invalid variant
        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidVariant',
          data: {
            variant: 'invalid1',
            className: 'invalid1:invalid2:mt-2',
          },
        })
      })
    })

    describe('classes without variants', () => {
      it('should not report when class is valid', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['btn', 'card'],
        })

        validateClassNames({
          classNames: new Set(['btn', 'card']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).not.toHaveBeenCalled()
      })

      it('should report when class is invalid', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['invalid']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(1)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid' },
        })
      })
    })

    describe('mixed scenarios', () => {
      it('should handle mix of valid, invalid, and ignored classes', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['valid1', 'valid2'],
        })

        validateClassNames({
          classNames: new Set([
            'valid1',
            'valid2',
            'invalid1',
            'dynamic-skip',
            'invalid2',
          ]),
          node,
          context,
          classRegistry,
          ignorePatterns: ['dynamic-*'],
        })

        expect(context.report).toHaveBeenCalledTimes(2)
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid1' },
        })
        expect(context.report).toHaveBeenCalledWith({
          node,
          messageId: 'invalidClassName',
          data: { className: 'invalid2' },
        })
      })

      it('should handle mix of classes with and without variants', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({
          validClasses: ['btn', 'hover:btn'],
          tailwindOnlyClasses: ['btn'],
        })

        validateClassNames({
          classNames: new Set(['btn', 'hover:btn']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).not.toHaveBeenCalled()
      })

      it('should report multiple errors for multiple invalid classes', () => {
        const context = createMockContext()
        const node = createMockNode()
        const classRegistry = createMockRegistry({ validClasses: [] })

        validateClassNames({
          classNames: new Set(['invalid1', 'invalid2', 'invalid3']),
          node,
          context,
          classRegistry,
          ignorePatterns: [],
        })

        expect(context.report).toHaveBeenCalledTimes(3)
      })
    })
  })
})
