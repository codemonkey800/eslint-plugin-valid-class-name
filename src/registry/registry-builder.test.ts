import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import fs from 'fs'
import os from 'os'
import path from 'path'

import type { ResolvedFile } from './file-resolver'
import { buildClassRegistry } from './registry-builder'

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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
      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry).toBeDefined()
    })

    it('should handle CSS file read errors gracefully', () => {
      const nonExistentFile = path.join(tempDir, 'nonexistent.css')

      const resolvedFiles: ResolvedFile[] = [
        { path: nonExistentFile, mtime: Date.now() },
      ]

      // Should not throw
      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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
      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('css-class')).toBe(true)
      expect(registry.isValid('scss-class')).toBe(true)
      expect(registry.isValid('scss-class-nested')).toBe(true)
    })
  })

  describe('allowlist handling', () => {
    it('should add literal allowlist entries', () => {
      const registry = buildClassRegistry(
        [],
        ['custom-class', 'another-class'],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('custom-class')).toBe(true)
      expect(registry.isValid('another-class')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should handle wildcard patterns in allowlist', () => {
      const registry = buildClassRegistry(
        [],
        ['custom-*', '*-suffix'],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('custom-button')).toBe(true)
      expect(registry.isValid('custom-card')).toBe(true)
      expect(registry.isValid('btn-suffix')).toBe(true)
      expect(registry.isValid('other-class')).toBe(false)
    })

    it('should handle mixed literal and wildcard allowlist patterns', () => {
      const registry = buildClassRegistry(
        [],
        ['literal-class', 'custom-*', 'another-literal'],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('literal-class')).toBe(true)
      expect(registry.isValid('another-literal')).toBe(true)
      expect(registry.isValid('custom-anything')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should include literal allowlist in getAllClasses', () => {
      const registry = buildClassRegistry(
        [],
        ['literal-class', 'custom-*'],
        undefined,
        undefined,
        process.cwd(),
      )

      const allClasses = registry.getAllClasses()

      expect(allClasses.has('literal-class')).toBe(true)
      expect(allClasses.has('custom-*')).toBe(false) // Wildcards not included
    })
  })

  describe('Tailwind classes handling', () => {
    it('should add Tailwind classes when provided', () => {
      const tailwindClasses = new Set(['flex', 'bg-blue-500', 'p-4'])

      const registry = buildClassRegistry(
        [],
        [],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('flex')).toBe(true)
      expect(registry.isValid('bg-blue-500')).toBe(true)
      expect(registry.isValid('p-4')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should handle empty Tailwind classes set', () => {
      const tailwindClasses = new Set<string>()

      const registry = buildClassRegistry(
        [],
        [],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('flex')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle undefined Tailwind classes', () => {
      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('flex')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should include Tailwind classes in getAllClasses', () => {
      const tailwindClasses = new Set(['flex', 'bg-blue-500'])

      const registry = buildClassRegistry(
        [],
        [],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      const allClasses = registry.getAllClasses()

      expect(allClasses.has('flex')).toBe(true)
      expect(allClasses.has('bg-blue-500')).toBe(true)
    })
  })

  describe('combined sources', () => {
    it('should combine CSS classes and allowlist', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(
        resolvedFiles,
        ['custom-*'],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('custom-button')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should combine CSS classes and Tailwind classes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const tailwindClasses = new Set(['flex', 'p-4'])

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('flex')).toBe(true)
      expect(registry.isValid('p-4')).toBe(true)
    })

    it('should combine all sources: CSS + SCSS + Tailwind + whitelist', () => {
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
      const tailwindClasses = new Set(['flex'])

      const registry = buildClassRegistry(
        resolvedFiles,
        ['whitelist-*'],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('css-class')).toBe(true)
      expect(registry.isValid('scss-class')).toBe(true)
      expect(registry.isValid('scss-class-nested')).toBe(true)
      expect(registry.isValid('flex')).toBe(true)
      expect(registry.isValid('whitelist-anything')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should handle overlapping classes from different sources', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const tailwindClasses = new Set(['btn']) // Same as CSS

      const registry = buildClassRegistry(
        resolvedFiles,
        ['btn'], // Same as CSS and Tailwind
        tailwindClasses,
        undefined,
        process.cwd(),
      )

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
      const tailwindClasses = new Set(['tw-btn'])

      const registry = buildClassRegistry(
        resolvedFiles,
        ['wl-btn'],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      // Each source should be checked
      expect(registry.isValid('css-btn')).toBe(true)
      expect(registry.isValid('tw-btn')).toBe(true)
      expect(registry.isValid('wl-btn')).toBe(true)
    })

    it('should check wildcard patterns after literal lookups', () => {
      const registry = buildClassRegistry(
        [],
        ['literal', 'custom-*'],
        undefined,
        undefined,
        process.cwd(),
      )

      // Literal should match
      expect(registry.isValid('literal')).toBe(true)
      // Wildcard should match
      expect(registry.isValid('custom-button')).toBe(true)
      // Neither should match
      expect(registry.isValid('nonexistent')).toBe(false)
    })
  })

  describe('isTailwindClass method', () => {
    it('should return true for Tailwind classes', () => {
      const tailwindClasses = new Set(['flex', 'p-4'])

      const registry = buildClassRegistry(
        [],
        [],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      expect(registry.isTailwindClass('flex')).toBe(true)
      expect(registry.isTailwindClass('p-4')).toBe(true)
    })

    it('should return true for allowlist patterns', () => {
      const registry = buildClassRegistry(
        [],
        ['custom-*'],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isTailwindClass('custom-button')).toBe(true)
    })

    it('should return false for CSS classes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isTailwindClass('btn')).toBe(false)
    })

    it('should exclude CSS but include Tailwind and allowlist', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.css-btn { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const tailwindClasses = new Set(['tw-btn'])

      const registry = buildClassRegistry(
        resolvedFiles,
        ['wl-*'],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      expect(registry.isTailwindClass('css-btn')).toBe(false)
      expect(registry.isTailwindClass('tw-btn')).toBe(true)
      expect(registry.isTailwindClass('wl-custom')).toBe(true)
    })
  })

  describe('getAllClasses method', () => {
    it('should return all literal classes from all sources', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.css-class { color: red; }')

      const resolvedFiles: ResolvedFile[] = [
        { path: cssFile, mtime: Date.now() },
      ]
      const tailwindClasses = new Set(['tw-class'])

      const registry = buildClassRegistry(
        resolvedFiles,
        ['literal-class', 'wildcard-*'],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      const allClasses = registry.getAllClasses()

      expect(allClasses.has('css-class')).toBe(true)
      expect(allClasses.has('tw-class')).toBe(true)
      expect(allClasses.has('literal-class')).toBe(true)
      expect(allClasses.has('wildcard-*')).toBe(false) // Wildcards excluded
    })

    it('should not include wildcard patterns', () => {
      const registry = buildClassRegistry(
        [],
        ['custom-*', '*-suffix', 'literal'],
        undefined,
        undefined,
        process.cwd(),
      )

      const allClasses = registry.getAllClasses()

      expect(allClasses.has('literal')).toBe(true)
      expect(allClasses.has('custom-*')).toBe(false)
      expect(allClasses.has('*-suffix')).toBe(false)
      expect(allClasses.size).toBe(1)
    })

    it('should return empty set when no classes present', () => {
      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      const allClasses = registry.getAllClasses()

      expect(allClasses.size).toBe(0)
    })
  })

  describe('getValidVariants method', () => {
    it('should return provided variants set', () => {
      const variants = new Set(['hover', 'focus', 'active'])

      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        variants,
        process.cwd(),
      )

      const validVariants = registry.getValidVariants()

      expect(validVariants.has('hover')).toBe(true)
      expect(validVariants.has('focus')).toBe(true)
      expect(validVariants.has('active')).toBe(true)
      expect(validVariants.size).toBe(3)
    })

    it('should return empty set when no variants provided', () => {
      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      const validVariants = registry.getValidVariants()

      expect(validVariants.size).toBe(0)
    })

    it('should return empty set when variants is undefined', () => {
      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      const validVariants = registry.getValidVariants()

      expect(validVariants).toBeInstanceOf(Set)
      expect(validVariants.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty inputs', () => {
      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle empty allowlist array', () => {
      const registry = buildClassRegistry(
        [],
        [],
        undefined,
        undefined,
        process.cwd(),
      )

      expect(registry.isValid('anything')).toBe(false)
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

      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )

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
      const registry = buildClassRegistry(
        resolvedFiles,
        [],
        undefined,
        undefined,
        process.cwd(),
      )
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
      const tailwindClasses = new Set(['shared'])

      const registry = buildClassRegistry(
        resolvedFiles,
        ['shared'],
        tailwindClasses,
        undefined,
        process.cwd(),
      )

      // Should be valid (from any source)
      expect(registry.isValid('shared')).toBe(true)

      // Should only appear once in getAllClasses
      const allClasses = registry.getAllClasses()
      const sharedCount = Array.from(allClasses).filter(
        cls => cls === 'shared',
      ).length
      expect(sharedCount).toBe(1)
    })
  })
})
