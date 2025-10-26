import { describe, expect, it } from '@jest/globals'

import {
  asTailwindUtils,
  measureAndExpect,
  measurePerformance,
  MockTailwindUtils,
  performanceThresholds,
  testData,
  useTempDir,
} from '../test'
import { buildClassRegistry } from './registry-builder'

describe('buildClassRegistry', () => {
  const tempDir = useTempDir('registry-builder-test')

  describe('CSS file handling', () => {
    it('should extract classes from single CSS file', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn', 'card'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses('btn', 'card')
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should extract classes from multiple CSS files', () => {
      const css1 = tempDir.createCssFile('buttons.css', ['btn'])
      const css2 = tempDir.createCssFile('cards.css', ['card'])
      const resolvedFiles = testData.resolvedFiles(css1, css2)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses('btn', 'card')
    })

    it('should handle CSS with complex selectors', () => {
      const cssFile = tempDir.createCssFileWithContent(
        'complex.css',
        `
        .nav .menu-item:hover { color: blue; }
        .btn.primary { background: red; }
        .card > .header { font-weight: bold; }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses(
        'nav',
        'menu-item',
        'btn',
        'primary',
        'card',
        'header',
      )
    })

    it('should handle malformed CSS gracefully', () => {
      const cssFile = tempDir.createCssFileWithContent(
        'malformed.css',
        '.btn { color: red',
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      // Should not throw
      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeDefined()
    })

    it('should handle CSS file read errors gracefully', () => {
      const nonExistentFile = tempDir.resolve('nonexistent.css')
      const resolvedFiles = testData.resolvedFiles(nonExistentFile)

      // Should not throw
      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeDefined()
      expect(registry).toHaveClassCount(0)
    })
  })

  describe('SCSS file handling', () => {
    it('should extract classes from SCSS file with nesting', () => {
      const scssFile = tempDir.createScssFile(
        'styles.scss',
        `
        .parent {
          color: blue;

          .child {
            color: red;
          }
        }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(scssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses('parent', 'child')
    })

    it('should extract classes from SCSS with ampersand nesting', () => {
      const scssFile = tempDir.createScssFile(
        'buttons.scss',
        `
        .btn {
          color: blue;

          &-primary {
            background: blue;
          }

          &.active {
            font-weight: bold;
          }
        }
      `,
      )

      const resolvedFiles = testData.resolvedFiles(scssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses('btn', 'btn-primary', 'active')
    })

    it('should handle SCSS compilation errors gracefully', () => {
      const scssFile = tempDir.createScssFile(
        'invalid.scss',
        `
        .btn {
          color: $undefined-variable;
        }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(scssFile)

      // Should not throw
      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeDefined()
    })

    it('should handle mixed CSS and SCSS files', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['css-class'])
      const scssFile = tempDir.createScssFile(
        'styles.scss',
        `
        .scss-class {
          color: blue;

          &-nested {
            color: green;
          }
        }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(cssFile, scssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses(
        'css-class',
        'scss-class',
        'scss-class-nested',
      )
    })
  })

  describe('TailwindUtils integration', () => {
    it('should validate Tailwind classes via API', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['flex', 'bg-blue-500', 'p-4']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry).toHaveClasses('flex', 'bg-blue-500', 'p-4')
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should validate Tailwind classes with variants', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils([
          'hover:bg-blue-500',
          'sm:flex',
          'md:hover:text-red-500',
        ]),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry).toHaveClasses(
        'hover:bg-blue-500',
        'sm:flex',
        'md:hover:text-red-500',
      )
    })

    it('should validate arbitrary value classes', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['w-[100px]', 'bg-[#ff0000]', 'text-[14px]']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry).toHaveClasses('w-[100px]', 'bg-[#ff0000]', 'text-[14px]')
    })

    it('should validate group and peer variants', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils([
          'group-hover:bg-blue-500',
          'peer-focus:text-red-500',
        ]),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry).toHaveClasses(
        'group-hover:bg-blue-500',
        'peer-focus:text-red-500',
      )
    })

    it('should validate negative values', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['-mt-4', '-ml-2']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isValid('-mt-4')).toBe(true)
      expect(registry.isValid('-ml-2')).toBe(true)
    })

    it('should validate important modifier', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['!bg-blue-500', '!p-4']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry).toHaveClasses('!bg-blue-500', '!p-4')
    })

    it('should handle null TailwindUtils gracefully', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry.isValid('flex')).toBe(false)
      expect(registry).toHaveClassCount(0)
    })

    it('should handle undefined TailwindUtils gracefully', () => {
      const registry = buildClassRegistry([], undefined, tempDir.path)

      expect(registry.isValid('flex')).toBe(false)
      expect(registry).toHaveClassCount(0)
    })
  })

  describe('combined sources', () => {
    it('should combine CSS classes and Tailwind classes', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['flex', 'p-4']),
      )

      const registry = buildClassRegistry(
        resolvedFiles,
        mockTailwind,
        tempDir.path,
      )

      expect(registry).toHaveClasses('btn', 'flex', 'p-4')
    })

    it('should combine all sources: CSS + SCSS + Tailwind', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['css-class'])
      const scssFile = tempDir.createScssFile(
        'styles.scss',
        `
        .scss-class {
          color: blue;
          &-nested { color: green; }
        }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(cssFile, scssFile)
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['flex']))

      const registry = buildClassRegistry(
        resolvedFiles,
        mockTailwind,
        tempDir.path,
      )

      expect(registry).toHaveClasses(
        'css-class',
        'scss-class',
        'scss-class-nested',
        'flex',
      )
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should handle overlapping classes from different sources', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['btn'])) // Same as CSS

      const registry = buildClassRegistry(
        resolvedFiles,
        mockTailwind,
        tempDir.path,
      )

      expect(registry).toBeValidClassName('btn')
      // Should only be counted once in getAllClasses
      const allClasses = registry.getAllClasses()
      expect(Array.from(allClasses).filter(cls => cls === 'btn').length).toBe(1)
    })
  })

  describe('isValid method', () => {
    it('should check all sources for validation', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['css-btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['tw-btn']))

      const registry = buildClassRegistry(
        resolvedFiles,
        mockTailwind,
        tempDir.path,
      )

      // Each source should be checked
      expect(registry).toHaveClasses('css-btn', 'tw-btn')
    })

    it('should return false for empty string', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry.isValid('')).toBe(false)
    })
  })

  describe('isTailwindClass method', () => {
    it('should return true for Tailwind classes', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['flex', 'p-4']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry).toBeTailwindClass('flex')
      expect(registry).toBeTailwindClass('p-4')
    })

    it('should return false for CSS classes', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry.isTailwindClass('btn')).toBe(false)
    })

    it('should return false when no Tailwind provided', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry.isTailwindClass('flex')).toBe(false)
    })

    it('should return false for nonexistent class', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['flex']))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindClass('nonexistent')).toBe(false)
    })
  })

  describe('isTailwindOnly method', () => {
    it('should return true for Tailwind-only classes', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['flex', 'p-4']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindOnly('flex')).toBe(true)
      expect(registry.isTailwindOnly('p-4')).toBe(true)
    })

    it('should return false for CSS classes', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry.isTailwindOnly('btn')).toBe(false)
    })

    it('should return false when no Tailwind provided', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry.isTailwindOnly('flex')).toBe(false)
    })

    it('should return false for classes that do not exist', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['flex']))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindOnly('nonexistent')).toBe(false)
    })
  })

  describe('isCssClass method', () => {
    it('should return true for CSS classes', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn', 'card'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeCssClass('btn')
      expect(registry).toBeCssClass('card')
    })

    it('should return true for SCSS classes', () => {
      const scssFile = tempDir.createScssFile(
        'styles.scss',
        `
        .parent {
          .child { color: red; }
        }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(scssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeCssClass('parent')
      expect(registry).toBeCssClass('child')
    })

    it('should return false for Tailwind classes', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['flex', 'p-4']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isCssClass('flex')).toBe(false)
      expect(registry.isCssClass('p-4')).toBe(false)
    })

    it('should return false for nonexistent classes', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry.isCssClass('nonexistent')).toBe(false)
    })

    it('should return false when no CSS files provided', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry.isCssClass('btn')).toBe(false)
    })
  })

  describe('getAllClasses method', () => {
    it('should return CSS classes only', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['css-class'])
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      const allClasses = registry.getAllClasses()

      expect(allClasses.has('css-class')).toBe(true)
      expect(registry).toHaveClassCount(1)
    })

    it('should NOT include Tailwind classes in API mode', () => {
      const mockTailwind = asTailwindUtils(
        new MockTailwindUtils(['flex', 'bg-blue-500']),
      )

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      const allClasses = registry.getAllClasses()

      // Tailwind classes are NOT enumerable in API mode
      expect(allClasses.has('flex')).toBe(false)
      expect(allClasses.has('bg-blue-500')).toBe(false)
      expect(registry).toHaveClassCount(0)
    })

    it('should return empty set when no classes present', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry).toHaveClassCount(0)
    })
  })

  describe('getValidVariants method', () => {
    it('should return empty set in API mode', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['flex']))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      const validVariants = registry.getValidVariants()

      // API mode delegates variant validation to TailwindUtils
      expect(validVariants.size).toBe(0)
    })

    it('should return empty set when no Tailwind provided', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      const validVariants = registry.getValidVariants()

      expect(validVariants.size).toBe(0)
    })
  })

  describe('TAILWIND_SPECIAL_CLASSES', () => {
    it('should validate "group" class via isValid', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils([]))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isValid('group')).toBe(true)
    })

    it('should validate "peer" class via isValid', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils([]))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isValid('peer')).toBe(true)
    })

    it('should return true for "group" in isTailwindClass', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils([]))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindClass('group')).toBe(true)
    })

    it('should return true for "peer" in isTailwindClass', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils([]))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindClass('peer')).toBe(true)
    })

    it('should return true for "group" in isTailwindOnly', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils([]))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindOnly('group')).toBe(true)
    })

    it('should return true for "peer" in isTailwindOnly', () => {
      const mockTailwind = asTailwindUtils(new MockTailwindUtils([]))

      const registry = buildClassRegistry([], mockTailwind, tempDir.path)

      expect(registry.isTailwindOnly('peer')).toBe(true)
    })

    it('should not return special classes when no Tailwind provided', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry.isValid('group')).toBe(false)
      expect(registry.isValid('peer')).toBe(false)
      expect(registry.isTailwindClass('group')).toBe(false)
      expect(registry.isTailwindOnly('group')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty inputs', () => {
      const registry = buildClassRegistry([], null, tempDir.path)

      expect(registry.isValid('anything')).toBe(false)
      expect(registry.isTailwindClass('anything')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
      expect(registry.getValidVariants().size).toBe(0)
    })

    it('should handle files with no classes', () => {
      const cssFile = tempDir.createCssFileWithContent(
        'empty.css',
        'body { margin: 0; }',
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClassCount(0)
    })

    it('should handle special characters in class names', () => {
      const cssFile = tempDir.createCssFileWithContent(
        'special.css',
        `
        .btn-primary { color: red; }
        .card_container { padding: 10px; }
        .item\\:active { background: blue; }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClasses(
        'btn-primary',
        'card_container',
        'item:active',
      )
    })

    it('should handle very large class sets efficiently', () => {
      // Create a CSS file with many classes
      const cssFile = tempDir.createCssFileWithContent(
        'large.css',
        testData.largeCssFile(10000),
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const { result: registry } = measureAndExpect(
        () => buildClassRegistry(resolvedFiles, null, tempDir.path),
        performanceThresholds.registryBuildLarge,
      )

      expect(registry).toHaveClassCount(10000)

      // Validation should be fast (O(1) for literals)
      const { result: isValid, duration: validateTime } = measurePerformance(
        () => {
          expect(registry).toBeValidClassName('class-5000')
          return registry.isValid('nonexistent')
        },
      )

      expect(isValid).toBe(false)
      expect(validateTime).toBeLessThan(performanceThresholds.validation)
    })

    it('should handle duplicate classes across sources', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['shared'])
      const resolvedFiles = testData.resolvedFiles(cssFile)
      const mockTailwind = asTailwindUtils(new MockTailwindUtils(['shared']))

      const registry = buildClassRegistry(
        resolvedFiles,
        mockTailwind,
        tempDir.path,
      )

      // Should be valid (from any source)
      expect(registry).toBeValidClassName('shared')

      // Should only appear once in getAllClasses
      // Note: Tailwind classes are NOT in getAllClasses in API mode
      const allClasses = registry.getAllClasses()
      const sharedCount = Array.from(allClasses).filter(
        cls => cls === 'shared',
      ).length
      expect(sharedCount).toBe(1)
    })

    it('should handle CSS with only whitespace', () => {
      const cssFile = tempDir.createCssFileWithContent(
        'whitespace.css',
        '   \n\n\t\t   \n   ',
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClassCount(0)
    })

    it('should handle CSS with only comments', () => {
      const cssFile = tempDir.createCssFileWithContent(
        'comments.css',
        '/* Comment 1 */\n// Comment 2\n/* Comment 3 */',
      )
      const resolvedFiles = testData.resolvedFiles(cssFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toHaveClassCount(0)
    })

    it('should handle files with unusual extensions', () => {
      // File with .css extension but actually SCSS content
      const weirdFile = tempDir.createCssFileWithContent(
        'styles.css',
        `
        .parent {
          .child { color: red; }
        }
      `,
      )
      const resolvedFiles = testData.resolvedFiles(weirdFile)

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      // CSS parser should handle nested selectors differently than SCSS
      // This might not extract 'child' class as expected
      expect(registry).toBeDefined()
    })

    it('should handle zero mtime in resolved files', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = [testData.resolvedFile(cssFile, 0)]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeValidClassName('btn')
    })

    it('should handle negative mtime in resolved files', () => {
      const cssFile = tempDir.createCssFile('styles.css', ['btn'])
      const resolvedFiles = [testData.resolvedFile(cssFile, -1)]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir.path)

      expect(registry).toBeValidClassName('btn')
    })
  })
})
