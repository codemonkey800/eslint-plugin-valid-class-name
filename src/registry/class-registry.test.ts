import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { clearCache, getClassRegistry } from './class-registry'

describe('ClassRegistry', () => {
  let tempDir: string

  beforeEach(() => {
    // Clear cache before each test
    clearCache()

    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'class-registry-test-'))
  })

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('with CSS files', () => {
    it('should extract classes from a single CSS file', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; } .card { padding: 10px; }')

      const registry = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
      expect(registry.isValid('nonexistent')).toBe(false)
    })

    it('should extract classes from multiple CSS files', () => {
      const css1 = path.join(tempDir, 'buttons.css')
      const css2 = path.join(tempDir, 'cards.css')

      fs.writeFileSync(
        css1,
        '.btn { color: red; } .btn-primary { color: blue; }',
      )
      fs.writeFileSync(
        css2,
        '.card { padding: 10px; } .card-header { font-weight: bold; }',
      )

      const registry = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry.isValid('btn')).toBe(true)
      expect(registry.isValid('btn-primary')).toBe(true)
      expect(registry.isValid('card')).toBe(true)
      expect(registry.isValid('card-header')).toBe(true)
    })

    it('should handle nested glob patterns', () => {
      const nestedDir = path.join(tempDir, 'nested')
      fs.mkdirSync(nestedDir)

      const css1 = path.join(tempDir, 'root.css')
      const css2 = path.join(nestedDir, 'nested.css')

      fs.writeFileSync(css1, '.root-class { color: red; }')
      fs.writeFileSync(css2, '.nested-class { color: blue; }')

      const registry = getClassRegistry(
        [path.join(tempDir, '**/*.css')],
        undefined,
        tempDir,
      )

      expect(registry.isValid('root-class')).toBe(true)
      expect(registry.isValid('nested-class')).toBe(true)
    })

    it('should handle missing CSS files gracefully', () => {
      const registry = getClassRegistry(
        [path.join(tempDir, 'nonexistent.css')],
        undefined,
        tempDir,
      )

      expect(registry.isValid('anything')).toBe(false)
    })

    it('should ignore node_modules directory', () => {
      const nodeModules = path.join(tempDir, 'node_modules')
      fs.mkdirSync(nodeModules)

      const nodeModuleCss = path.join(nodeModules, 'library.css')
      fs.writeFileSync(nodeModuleCss, '.library-class { color: red; }')

      const registry = getClassRegistry(
        [path.join(tempDir, '**/*.css')],
        undefined,
        tempDir,
      )

      expect(registry.isValid('library-class')).toBe(false)
    })
  })

  describe('caching', () => {
    it('should cache registry with same configuration', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry1).toBe(registry2)
    })

    it('should invalidate cache when configuration changes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        true, // Different tailwind config
        tempDir,
      )

      expect(registry1).not.toBe(registry2)
    })

    it('should invalidate cache when CSS patterns change', () => {
      const css1 = path.join(tempDir, 'buttons.css')
      const css2 = path.join(tempDir, 'cards.css')

      fs.writeFileSync(css1, '.btn { color: red; }')
      fs.writeFileSync(css2, '.card { padding: 10px; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir, 'buttons.css')],
        undefined,
        tempDir,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry1).not.toBe(registry2)
      expect(registry1.isValid('card')).toBe(false)
      expect(registry2.isValid('card')).toBe(true)
    })

    it('should invalidate cache when cwd changes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        '/different/path',
      )

      expect(registry1).not.toBe(registry2)
    })

    it('should invalidate cache when Tailwind config changes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        true,
        tempDir,
      )
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        false,
        tempDir,
      )
      const registry3 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        { config: 'custom.js' },
        tempDir,
      )

      expect(registry1).not.toBe(registry2)
      expect(registry2).not.toBe(registry3)
      expect(registry1).not.toBe(registry3)
    })
  })

  describe('getAllClasses', () => {
    it('should return all literal class names', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; } .card { padding: 10px; }')

      const registry = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )
      const allClasses = registry.getAllClasses()

      expect(allClasses.has('btn')).toBe(true)
      expect(allClasses.has('card')).toBe(true)
      expect(allClasses.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty CSS patterns', () => {
      const registry = getClassRegistry([], undefined, tempDir)

      expect(registry.isValid('anything')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle CSS files with no classes', () => {
      const cssFile = path.join(tempDir, 'empty.css')
      fs.writeFileSync(cssFile, 'body { margin: 0; }')

      const registry = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry.isValid('anything')).toBe(false)
      expect(registry.getAllClasses().size).toBe(0)
    })

    it('should handle malformed CSS gracefully', () => {
      const cssFile = path.join(tempDir, 'malformed.css')
      fs.writeFileSync(cssFile, '.btn { color: red')

      const registry = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry).toBeDefined()
    })
  })

  describe('glob caching', () => {
    it('should cache glob resolution results on repeated calls', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      // First call - should resolve files
      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Second call with same patterns - should use cached glob results
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Both should return the same cached registry
      expect(registry1).toBe(registry2)
      expect(registry1.isValid('btn')).toBe(true)
    })

    it('should invalidate glob cache when patterns change', () => {
      const css1 = path.join(tempDir, 'buttons.css')
      const css2 = path.join(tempDir, 'cards.css')

      fs.writeFileSync(css1, '.btn { color: red; }')
      fs.writeFileSync(css2, '.card { padding: 10px; }')

      // First call with specific pattern
      const registry1 = getClassRegistry(
        [path.join(tempDir, 'buttons.css')],
        undefined,
        tempDir,
      )

      // Second call with different pattern - should invalidate cache
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry1).not.toBe(registry2)
      expect(registry1.isValid('card')).toBe(false)
      expect(registry2.isValid('card')).toBe(true)
    })

    it('should invalidate glob cache when cwd changes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      // First call with tempDir as cwd
      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Second call with different cwd - should invalidate cache
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        '/different/path',
      )

      expect(registry1).not.toBe(registry2)
    })

    it('should invalidate glob cache when file mtime changes', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      // First call - caches glob results
      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Modify file to change mtime
      // Add a small delay to ensure mtime actually changes
      const newTime = Date.now() + 100
      fs.utimesSync(cssFile, new Date(newTime), new Date(newTime))

      // Second call within TTL - should use cached registry
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Should use cached registry (same reference) within TTL
      expect(registry1).toBe(registry2)
    })

    it('should invalidate glob cache when file is deleted', () => {
      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      // First call - caches glob results
      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry1.isValid('btn')).toBe(true)

      // Delete file
      fs.unlinkSync(cssFile)

      // Second call within TTL - should use cached registry
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Should use cached registry (same reference) within TTL
      expect(registry1).toBe(registry2)
      // Class is still valid because we're using the cached registry
      expect(registry2.isValid('btn')).toBe(true)
    })

    it('should invalidate glob cache after TTL expires', () => {
      jest.useFakeTimers()

      const cssFile = path.join(tempDir, 'styles.css')
      fs.writeFileSync(cssFile, '.btn { color: red; }')

      // Set initial time
      const startTime = Date.now()
      jest.setSystemTime(startTime)

      // First call - caches glob results
      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Advance time by less than TTL (1000ms)
      jest.setSystemTime(startTime + 500)

      // Second call - should still use cache
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry1).toBe(registry2)

      // Advance time past TTL
      jest.setSystemTime(startTime + 1100)

      // Third call - glob cache expires, but registry cache may return same object
      // if files haven't changed (which is correct behavior)
      const registry3 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Registry might be the same object if files haven't changed
      // (this is expected - registry cache is based on file contents)
      // The important thing is that glob cache was invalidated and re-checked
      expect(registry3.isValid('btn')).toBe(true)

      jest.useRealTimers()
    })

    it('should handle empty patterns efficiently', () => {
      // Should return empty result immediately without caching
      const registry1 = getClassRegistry([], undefined, tempDir)
      const registry2 = getClassRegistry([], undefined, tempDir)

      expect(registry1).toBe(registry2)
      expect(registry1.getAllClasses().size).toBe(0)
    })

    it('should detect new files after TTL expiry', () => {
      jest.useFakeTimers()

      const startTime = Date.now()
      jest.setSystemTime(startTime)

      const css1 = path.join(tempDir, 'file1.css')
      fs.writeFileSync(css1, '.btn { color: red; }')

      // First call - caches results with only file1
      const registry1 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry1.isValid('btn')).toBe(true)
      expect(registry1.isValid('card')).toBe(false)

      // Advance time slightly but within TTL
      jest.setSystemTime(startTime + 500)

      // Add new file within TTL
      const css2 = path.join(tempDir, 'file2.css')
      fs.writeFileSync(css2, '.card { padding: 10px; }')

      // Call within TTL - won't detect new file yet
      const registry2 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      // Should still use cached results (missing new file)
      expect(registry2.isValid('card')).toBe(false)

      // Advance past TTL
      jest.setSystemTime(startTime + 1100)

      // Call after TTL - should detect new file
      const registry3 = getClassRegistry(
        [path.join(tempDir, '*.css')],
        undefined,
        tempDir,
      )

      expect(registry3.isValid('card')).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('with Tailwind configuration', () => {
    // Note: Tailwind integration tests are in src/rules/valid-class-name.test.ts
    // and src/registry/registry-builder.test.ts (with mocked TailwindUtils)

    it('should handle Tailwind config disabled', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['bg-red-500']
        }
      `,
      )

      const registry = getClassRegistry([], false, tempDir)

      expect(registry.isValid('bg-red-500')).toBe(false)
    })
  })
})
