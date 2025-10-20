import { describe, it, expect } from '@jest/globals'
import { extractSafelistClasses } from './tailwind-parser'

describe('tailwind-parser', () => {
  // Note: findTailwindConfigPath and getTailwindClasses tests are not included
  // because fs mocking in ES modules is complex. This functionality is already
  // tested via integration tests in class-registry.test.ts

  describe('extractSafelistClasses', () => {
    it('should extract string literal classes from safelist', () => {
      const safelist = ['bg-red-500', 'text-blue-600', 'hover:bg-green-400']

      const result = extractSafelistClasses(safelist)

      expect(result).toEqual(
        new Set(['bg-red-500', 'text-blue-600', 'hover:bg-green-400']),
      )
    })

    it('should handle empty safelist', () => {
      const result = extractSafelistClasses([])

      expect(result).toEqual(new Set())
    })

    it('should skip pattern objects (for future implementation)', () => {
      const safelist = ['bg-red-500', { pattern: /bg-.*-500/ }, 'text-blue-600']

      const result = extractSafelistClasses(safelist)

      // Should only extract string literals
      expect(result).toEqual(new Set(['bg-red-500', 'text-blue-600']))
    })

    it('should skip pattern objects with variants', () => {
      const safelist = [
        'bg-red-500',
        { pattern: /text-.*/, variants: ['lg', 'hover'] },
      ]

      const result = extractSafelistClasses(safelist)

      expect(result).toEqual(new Set(['bg-red-500']))
    })

    it('should handle undefined safelist gracefully', () => {
      const result = extractSafelistClasses(undefined as any)

      expect(result).toEqual(new Set())
    })

    it('should handle null safelist gracefully', () => {
      const result = extractSafelistClasses(null as any)

      expect(result).toEqual(new Set())
    })

    it('should handle mixed types in safelist', () => {
      const safelist = [
        'text-red-500',
        { pattern: /bg-.*-500/ },
        'hover:text-blue-600',
        { pattern: /border-.*/, variants: ['focus', 'active'] },
        null,
        undefined,
      ]

      const result = extractSafelistClasses(safelist as any)

      // Should only extract string literals, skip everything else
      expect(result).toEqual(new Set(['text-red-500', 'hover:text-blue-600']))
    })

    it('should handle safelist with only pattern objects', () => {
      const safelist = [
        { pattern: /bg-.*-500/ },
        { pattern: /text-.*/, variants: ['lg'] },
      ]

      const result = extractSafelistClasses(safelist)

      // No string literals, should return empty set
      expect(result).toEqual(new Set())
    })
  })

  // Note: Comprehensive integration tests for utility generation (getTailwindClasses)
  // and config path finding (findTailwindConfigPath) would require mocking fs and
  // dynamic imports, which is complex in Jest with ES modules. This functionality
  // is tested through real usage in class-registry.test.ts with actual Tailwind
  // config files.
})
