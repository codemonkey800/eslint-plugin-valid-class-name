import { describe, expect, it } from '@jest/globals'

import { isClassNameIgnored } from './validation-helpers'

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
      expect(isClassNameIgnored('prefix-dynamic-suffix', ignorePatterns)).toBe(true)
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
      expect(isClassNameIgnored('my-component_variant', ignorePatterns)).toBe(true)
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
})
