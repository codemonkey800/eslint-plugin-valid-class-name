import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { TailwindUtils } from 'tailwind-api-utils'

import type { ResolvedFile } from './file-resolver'
import { buildClassRegistry } from './registry-builder'

// Mock TailwindUtils for testing
class MockTailwindUtils {
  private validClasses: Set<string>

  constructor(validClasses: string[]) {
    this.validClasses = new Set(validClasses)
  }

  isValidClassName(className: string): boolean {
    return this.validClasses.has(className)
  }
}

describe('buildClassRegistry', () => {
  let tempDir: string

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-builder-test-'))
  })

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('CSS file handling', () => {
    it('should extract classes from single CSS file', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; } .card { padding: 10px; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should extract classes from multiple CSS files', () => {
      const css1 = path.join(tempDir, 'buttons.css')
      const css2 = path.join(tempDir, 'cards.css')

      fs.writeFileSync(css1, '.btn { color: red; }')
      fs.writeFileSync(css2, '.card { padding: 10px; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: css1, mtime: Date.now() },
        { path: css2, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
    })

    it('should handle CSS with complex selectors', () => {
      const cssFile = path.join(tempDir, 'complex.css')
      fs.writeFileSync(
        cssFile,
        `
        .nav .menu-item:hover { color: blue; }
        .btn.primary { background: red; }
        .card > .header { font-weight: bold; }
      `,
      )

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('nav')).toBe(true)
      expect(registry.isValid('menu-item')).toBe(true)
      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('primary')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
      expect(registry.isValid('header')).toBe(true)
    })

    it('should handle malformed CSS gracefully', () => {
      const cssFile = path.join(tempDir, 'malformed.css')
      fs.writeFileSync(cssFile, '.btn { color: red')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      // Should not throw
      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry).toBeDefined()
    })

    it('should handle CSS file read errors gracefully', () => {
      const nonExistentFile = path.join(tempDir, 'nonexistent.css')

      const resolvedFiles: ResolvedFile[] = [
        { path: nonExistentFile, mtime: Date.now() },
      ]

      // Should not throw
      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry).toBeDefined()
      expect(registry.getAllClasses().size).toBe(0)
    })
  })

  describe('SCSS file handling', () => {
    it('should extract classes from SCSS file with nesting', () => {
      const scssFile = path.join(tempDir, 'styles.scss')
      fs.writeFileSync(
        scssFile,
        `
        .parent {
          color: blue;

          .child {
            color: red;
          }
        }
      `,
      )

      const resolvedFiles: ResolvedFile[] = [
        { path: scssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('parent')).toBe(true)
      expect(registry.isValid('child')).toBe(true)
    })

    it('should extract classes from SCSS with ampersand nesting', () => {
      const scssFile = path.join(tempDir, 'buttons.scss')
      fs.writeFileSync(
        scssFile,
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

      const resolvedFiles: ResolvedFile[] = [
        { path: scssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('btn-primary')).toBe(true)
      expect(registry.isValid('active')).toBe(true)
    })

    it('should handle SCSS compilation errors gracefully', () => {
      const scssFile = path.join(tempDir, 'invalid.scss')
      fs.writeFileSync(
        scssFile,
        `
        .btn {
          color: $undefined-variable;
        }
      `,
      )

      const resolvedFiles: ResolvedFile[] = [
        { path: scssFile, mtime: Date.now() },
      ]

      // Should not throw
      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry).toBeDefined()
    })

    it('should handle mixed CSS and SCSS files', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      const scssFile = path.join(tempDir, 'styles.scss')

      fs.writeFileSync(cssFile, '.css-class { color: red; }')
      fs.writeFileSync(
        scssFile,
        `
        .scss-class {
          color: blue;

          &-nested {
            color: green;
          }
        }
      `,
      )

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
        { path: scssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('css-class')).toBe(true)
      expect(registry.isValid('scss-class')).toBe(true)
      expect(registry.isValid('scss-class-nested')).toBe(true)
    })
  })

  describe('TailwindUtils integration', () => {
    it('should validate Tailwind classes via API', () => {
      const mockTailwind = new MockTailwindUtils([
        'flex',
        'bg-blue-500',
        'p-4',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isValid('flex')).toBe(true)
      expect(registry.isValid('bg-blue-500')).toBe(true)
      expect(registry.isValid('p-4')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should validate Tailwind classes with variants', () => {
      const mockTailwind = new MockTailwindUtils([
        'hover:bg-blue-500',
        'sm:flex',
        'md:hover:text-red-500',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isValid('hover:bg-blue-500')).toBe(true)
      expect(registry.isValid('sm:flex')).toBe(true)
      expect(registry.isValid('md:hover:text-red-500')).toBe(true)
    })

    it('should validate arbitrary value classes', () => {
      const mockTailwind = new MockTailwindUtils([
        'w-[100px]',
        'bg-[#ff0000]',
        'text-[14px]',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isValid('w-[100px]')).toBe(true)
      expect(registry.isValid('bg-[#ff0000]')).toBe(true)
      expect(registry.isValid('text-[14px]')).toBe(true)
    })

    it('should validate group and peer variants', () => {
      const mockTailwind = new MockTailwindUtils([
        'group-hover:bg-blue-500',
        'peer-focus:text-red-500',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isValid('group-hover:bg-blue-500')).toBe(true)
      expect(registry.isValid('peer-focus:text-red-500')).toBe(true)
    })

    it('should validate negative values', () => {
      const mockTailwind = new MockTailwindUtils([
        '-mt-4',
        '-ml-2',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isValid('-mt-4')).toBe(true)
      expect(registry.isValid('-ml-2')).toBe(true)
    })

    it('should validate important modifier', () => {
      const mockTailwind = new MockTailwindUtils([
        '!bg-blue-500',
        '!p-4',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isValid('!bg-blue-500')).toBe(true)
      expect(registry.isValid('!p-4')).toBe(true)
    })

    it('should handle null TailwindUtils gracefully', () => {
      const registry = buildClassRegistry([], null, tempDir)

      expect(registry.isValid('flex')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle undefined TailwindUtils gracefully', () => {
      const registry = buildClassRegistry([], undefined, tempDir)

      expect(registry.isValid('flex')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })
  })

  describe('combined sources', () => {
    it('should combine CSS classes and Tailwind classes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const mockTailwind = new MockTailwindUtils([
        'flex',
        'p-4',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry(resolvedFiles, mockTailwind, tempDir)

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('flex')).toBe(true)
      expect(registry.isValid('p-4')).toBe(true)
    })

    it('should combine all sources: CSS + SCSS + Tailwind', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      const scssFile = path.join(tempDir, 'styles.scss')

      fs.writeFileSync(cssFile, '.css-class { color: red; }')
      fs.writeFileSync(
        scssFile,
        `
        .scss-class {
          color: blue;
          &-nested { color: green; }
        }
      `,
      )

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
        { path: scssFile, mtime: Date.now() },
      ]
      const mockTailwind = new MockTailwindUtils([
        'flex',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry(resolvedFiles, mockTailwind, tempDir)

      expect(registry.isValid('css-class')).toBe(true)
      expect(registry.isValid('scss-class')).toBe(true)
      expect(registry.isValid('scss-class-nested')).toBe(true)
      expect(registry.isValid('flex')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should handle overlapping classes from different sources', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const mockTailwind = new MockTailwindUtils([
        'btn',
      ]) as unknown as TailwindUtils // Same as CSS

      const registry = buildClassRegistry(resolvedFiles, mockTailwind, tempDir)

      expect(registry.isValid('btn')).toBe(true)
      // Should only be counted once in getAllClasses
      const allClasses = registry.getAllClasses()
      expect(Array.from(allClasses).filter(cls => cls === 'btn').length).toBe(1)
    })
  })

  describe('isValid method', () => {
    it('should check all sources for validation', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.css-btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const mockTailwind = new MockTailwindUtils([
        'tw-btn',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry(resolvedFiles, mockTailwind, tempDir)

      // Each source should be checked
      expect(registry.isValid('css-btn')).toBe(true)
      expect(registry.isValid('tw-btn')).toBe(true)
    })

    it('should return false for empty string', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('')).toBe(false)
    })
  })

  describe('isTailwindClass method', () => {
    it('should return true for Tailwind classes', () => {
      const mockTailwind = new MockTailwindUtils([
        'flex',
        'p-4',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      expect(registry.isTailwindClass('flex')).toBe(true)
      expect(registry.isTailwindClass('p-4')).toBe(true)
    })

    it('should return false for CSS classes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isTailwindClass('btn')).toBe(false)
    })
  })

  describe('getAllClasses method', () => {
    it('should return CSS classes only', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.css-class { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      const allClasses = registry.getAllClasses()

      expect(allClasses.has('css-class')).toBe(true)
      expect(allClasses.size).toBe(1)
    })

    it('should NOT include Tailwind classes in API mode', () => {
      const mockTailwind = new MockTailwindUtils([
        'flex',
        'bg-blue-500',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      const allClasses = registry.getAllClasses()

      // Tailwind classes are NOT enumerable in API mode
      expect(allClasses.has('flex')).toBe(false)
      expect(allClasses.has('bg-blue-500')).toBe(false)
      expect(allClasses.size).toBe(0)
    })

    it('should return empty set when no classes present', () => {
      const registry = buildClassRegistry([], null, tempDir)

      const allClasses = registry.getAllClasses()

      expect(allClasses.size).toBe(0)
    })
  })

  describe('getValidVariants method', () => {
    it('should return empty set in API mode', () => {
      const mockTailwind = new MockTailwindUtils([
        'flex',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry([], mockTailwind, tempDir)

      const validVariants = registry.getValidVariants()

      // API mode delegates variant validation to TailwindUtils
      expect(validVariants.size).toBe(0)
    })

    it('should return empty set when no Tailwind provided', () => {
      const registry = buildClassRegistry([], null, tempDir)

      const validVariants = registry.getValidVariants()

      expect(validVariants.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty inputs', () => {
      const registry = buildClassRegistry([], null, tempDir)

      expect(registry.isValid('anything')).toBe(false)
      expect(registry.isTailwindClass('anything')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
      expect(registry.getValidVariants().size).toBe(0)
    })

    it('should handle files with no classes', () => {
      const cssFile = path.join(tempDir, 'empty.css')
      fs.writeFileSync(cssFile, 'body { margin: 0; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle special characters in class names', () => {
      const cssFile = path.join(tempDir, 'special.css')
      fs.writeFileSync(
        cssFile,
        `
        .btn-primary { color: red; }
        .card_container { padding: 10px; }
        .item\\:active { background: blue; }
      `,
      )

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(resolvedFiles, null, tempDir)

      expect(registry.isValid('btn-primary')).toBe(true)
      expect(registry.isValid('card_container')).toBe(true)
      expect(registry.isValid('item:active')).toBe(true)
    })

    it('should handle very large class sets efficiently', () => {
      // Create a CSS file with many classes
      const manyClasses = Array.from(
        { length: 10000 },
        (_, i) => `.class-${i} { color: red; }`,
      ).join('\n')

      const cssFile = path.join(tempDir, 'large.css')
      fs.writeFileSync(cssFile, manyClasses)

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const startTime = Date.now()
      const registry = buildClassRegistry(resolvedFiles, null, tempDir)
      const buildTime = Date.now() - startTime

      expect(registry.getAllClasses().size).toBe(10000)
      expect(buildTime).toBeLessThan(1000) // Should complete in < 1 second

      // Validation should be fast (O(1) for literals)
      const validateStart = Date.now()
      expect(registry.isValid('class-5000')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
      const validateTime = Date.now() - validateStart

      expect(validateTime).toBeLessThan(5) // Should be nearly instant
    })

    it('should handle duplicate classes across sources', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.shared { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const mockTailwind = new MockTailwindUtils([
        'shared',
      ]) as unknown as TailwindUtils

      const registry = buildClassRegistry(resolvedFiles, mockTailwind, tempDir)

      // Should be valid (from any source)
      expect(registry.isValid('shared')).toBe(true)

      // Should only appear once in getAllClasses
      // Note: Tailwind classes are NOT in getAllClasses in API mode
      const allClasses = registry.getAllClasses()
      const sharedCount = Array.from(allClasses).filter(
        cls => cls === 'shared',
      ).length
      expect(sharedCount).toBe(1)
    })
  })
})
