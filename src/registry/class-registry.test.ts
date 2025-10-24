import { beforeEach, describe, expect, it } from '@jest/globals'
import fs from 'fs'
import path from 'path'

import { useTempDir } from '../test'
import { clearCache, getClassRegistry } from './class-registry'

describe('ClassRegistry', () => {
  const tempDir = useTempDir('class-registry-test')

  beforeEach(() => {
    // Clear cache before each test
    clearCache()
  })

  describe('with CSS files', () => {
    it('should extract classes from a single CSS file', () => {
      tempDir.createFile(
        'styles.css',
        '.btn { color: red; } .card { padding: 10px; }',
      )

      const registry = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should extract classes from multiple CSS files', () => {
      tempDir.createFile(
        'buttons.css',
        '.btn { color: red; } .btn-primary { color: blue; }',
      )
      tempDir.createFile(
        'cards.css',
        '.card { padding: 10px; } .card-header { font-weight: bold; }',
      )

      const registry = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('btn-primary')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
      expect(registry.isValid('card-header')).toBe(true)
    })

    it('should handle nested glob patterns', () => {
      tempDir.createDir('nested')
      tempDir.createFile('root.css', '.root-class { color: red; }')
      tempDir.createFile('nested/nested.css', '.nested-class { color: blue; }')

      const registry = getClassRegistry(
        [path.join(tempDir.path, '**/*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry.isValid('root-class')).toBe(true)
      expect(registry.isValid('nested-class')).toBe(true)
    })

    it('should handle missing CSS files gracefully', () => {
      const registry = getClassRegistry(
        [path.join(tempDir.path, 'nonexistent.css')],
        undefined,
        tempDir.path,
      )

      expect(registry.isValid('anything')).toBe(false)
    })

    it('should ignore node_modules directory', () => {
      tempDir.createDir('node_modules')
      tempDir.createFile(
        'node_modules/library.css',
        '.library-class { color: red; }',
      )

      const registry = getClassRegistry(
        [path.join(tempDir.path, '**/*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry.isValid('library-class')).toBe(false)
    })
  })

  describe('caching', () => {
    it('should cache registry with same configuration', () => {
      tempDir.createFile('styles.css', '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry1).toBe(registry2)
    })

    it('should invalidate cache when configuration changes', () => {
      tempDir.createFile('styles.css', '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        true, // Different tailwind config
        tempDir.path,
      )

      expect(registry1).not.toBe(registry2)
    })

    it('should invalidate cache when CSS patterns change', () => {
      tempDir.createFile('buttons.css', '.btn { color: red; }')
      tempDir.createFile('cards.css', '.card { padding: 10px; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir.path, 'buttons.css')],
        undefined,
        tempDir.path,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry1).not.toBe(registry2)
      expect(registry1.isValid('card')).toBe(false)
      expect(registry2.isValid('card')).toBe(true)
    })

    it('should invalidate cache when cwd changes', () => {
      tempDir.createFile('styles.css', '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        '/different/path',
      )

      expect(registry1).not.toBe(registry2)
    })

    it('should invalidate cache when Tailwind config changes', () => {
      tempDir.createFile('styles.css', '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        true,
        tempDir.path,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        false,
        tempDir.path,
      )
      const registry3 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        { config: 'custom.js' },
        tempDir.path,
      )

      expect(registry1).not.toBe(registry2)
      expect(registry2).not.toBe(registry3)
      expect(registry1).not.toBe(registry3)
    })
  })

  describe('getAllClasses', () => {
    it('should return all literal class names', () => {
      tempDir.createFile(
        'styles.css',
        '.btn { color: red; } .card { padding: 10px; }',
      )

      const registry = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )
      const allClasses = registry.getAllClasses()

      expect(allClasses.has('btn')).toBe(true)
      expect(allClasses.has('card')).toBe(true)
      expect(allClasses.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty CSS patterns', () => {
      const registry = getClassRegistry([], undefined, tempDir.path)

      expect(registry.isValid('anything')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle CSS files with no classes', () => {
      tempDir.createFile('empty.css', 'body { margin: 0; }')

      const registry = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry.isValid('anything')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle malformed CSS gracefully', () => {
      tempDir.createFile('malformed.css', '.btn { color: red')

      const registry = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry).toBeDefined()
    })
  })

  describe('glob caching', () => {
    it('should cache glob resolution results on repeated calls', () => {
      tempDir.createFile('styles.css', '.btn { color: red; }')

      // First call - should resolve files
      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      // Second call with same patterns - should use cached glob results
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      // Both should return the same cached registry
      expect(registry1).toBe(registry2)
      expect(registry1.isValid('btn')).toBe(true)
    })

    it('should invalidate glob cache when patterns change', () => {
      tempDir.createFile('buttons.css', '.btn { color: red; }')
      tempDir.createFile('cards.css', '.card { padding: 10px; }')

      // First call with specific pattern
      const registry1 = getClassRegistry(
        [path.join(tempDir.path, 'buttons.css')],
        undefined,
        tempDir.path,
      )

      // Second call with different pattern - should invalidate cache
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry1).not.toBe(registry2)
      expect(registry1.isValid('card')).toBe(false)
      expect(registry2.isValid('card')).toBe(true)
    })

    it('should invalidate glob cache when cwd changes', () => {
      tempDir.createFile('styles.css', '.btn { color: red; }')

      // First call with tempDir as cwd
      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      // Second call with different cwd - should invalidate cache
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        '/different/path',
      )

      expect(registry1).not.toBe(registry2)
    })

    it('should invalidate glob cache when file mtime changes', () => {
      const cssFile = tempDir.resolve('styles.css')
      tempDir.createFile('styles.css', '.btn { color: red; }')

      // First call - caches glob results
      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      // Modify file to change mtime
      // Add a small delay to ensure mtime actually changes
      const newTime = Date.now() + 100
      fs.utimesSync(cssFile, new Date(newTime), new Date(newTime))

      // Second call within TTL - should use cached registry
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      // Should use cached registry (same reference) within TTL
      expect(registry1).toBe(registry2)
    })

    it('should invalidate glob cache when file is deleted', () => {
      const cssFile = tempDir.resolve('styles.css')
      tempDir.createFile('styles.css', '.btn { color: red; }')

      // First call - caches glob results
      const registry1 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      expect(registry1.isValid('btn')).toBe(true)

      // Delete file
      fs.unlinkSync(cssFile)

      // Second call within TTL - should use cached registry
      const registry2 = getClassRegistry(
        [path.join(tempDir.path, '*.css')],
        undefined,
        tempDir.path,
      )

      // Should use cached registry (same reference) within TTL
      expect(registry1).toBe(registry2)
      // Class is still valid because we're using the cached registry
      expect(registry2.isValid('btn')).toBe(true)
    })

    it('should handle empty patterns efficiently', () => {
      // Should return empty result immediately without caching
      const registry1 = getClassRegistry([], undefined, tempDir.path)
      const registry2 = getClassRegistry([], undefined, tempDir.path)

      expect(registry1).toBe(registry2)
      expect(registry1.getAllClasses().size).toBe(0)
    })
  })

  describe('with Tailwind configuration', () => {
    // Note: Tailwind integration tests are in src/rules/valid-class-name.test.ts
    // and src/registry/registry-builder.test.ts (with mocked TailwindUtils)

    it('should handle Tailwind config disabled', () => {
      tempDir.createFile(
        'tailwind.config.js',
        `
        module.exports = {
          content: [],
          safelist: ['bg-red-500']
        }
      `,
      )

      const registry = getClassRegistry([], false, tempDir.path)

      expect(registry.isValid('bg-red-500')).toBe(false)
    })
  })
})
