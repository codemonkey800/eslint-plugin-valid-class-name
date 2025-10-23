import { describe, expect, it } from '@jest/globals'

import { createCacheKey } from './cache-key'
import type { ResolvedFile } from './file-resolver'

describe('createCacheKey', () => {
  describe('deterministic hash generation', () => {
    it('should generate the same hash for identical inputs', () => {
      const files: ResolvedFile[] = [
        { path: '/path/to/file1.css', mtime: 1234567890 },
        { path: '/path/to/file2.css', mtime: 9876543210 },
      ]
      const whitelist = ['custom-*', 'app-*']
      const tailwindConfig = { config: 'tailwind.config.js' }
      const cwd = '/project/root'

      const hash1 = createCacheKey(files, whitelist, [], tailwindConfig, cwd)
      const hash2 = createCacheKey(files, whitelist, [], tailwindConfig, cwd)

      expect(hash1).toBe(hash2)
    })

    it('should generate 64-character hex string (SHA-256)', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      const hash = createCacheKey(files, [], [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
      expect(hash.length).toBe(64)
    })
  })

  describe('different inputs produce different hashes', () => {
    it('should generate different hashes for different file paths', () => {
      const files1: ResolvedFile[] = [{ path: '/file1.css', mtime: 123 }]
      const files2: ResolvedFile[] = [{ path: '/file2.css', mtime: 123 }]

      const hash1 = createCacheKey(files1, [], [], undefined, '/cwd')
      const hash2 = createCacheKey(files2, [], [], undefined, '/cwd')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different file mtimes', () => {
      const files1: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      const files2: ResolvedFile[] = [{ path: '/file.css', mtime: 456 }]

      const hash1 = createCacheKey(files1, [], [], undefined, '/cwd')
      const hash2 = createCacheKey(files2, [], [], undefined, '/cwd')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different allowlist arrays', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(files, ['custom-*'], [], undefined, '/cwd')
      const hash2 = createCacheKey(files, ['app-*'], [], undefined, '/cwd')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different cwd values', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(files, [], [], undefined, '/cwd1')
      const hash2 = createCacheKey(files, [], [], undefined, '/cwd2')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different file ordering', () => {
      const files1: ResolvedFile[] = [
        { path: '/file1.css', mtime: 123 },
        { path: '/file2.css', mtime: 456 },
      ]
      const files2: ResolvedFile[] = [
        { path: '/file2.css', mtime: 456 },
        { path: '/file1.css', mtime: 123 },
      ]

      const hash1 = createCacheKey(files1, [], [], undefined, '/cwd')
      const hash2 = createCacheKey(files2, [], [], undefined, '/cwd')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('tailwind config variations', () => {
    it('should generate different hashes for undefined vs false', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(files, [], [], undefined, '/cwd')
      const hash2 = createCacheKey(files, [], [], false, '/cwd')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for true vs false', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(files, [], [], true, '/cwd')
      const hash2 = createCacheKey(files, [], [], false, '/cwd')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different config objects', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(
        files,
        [],
        [],
        { config: 'tailwind.config.js' },
        '/cwd',
      )
      const hash2 = createCacheKey(
        files,
        [],
        [],
        { config: 'custom.config.js' },
        '/cwd',
      )

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for config objects with different properties', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(
        files,
        [],
        [],
        { config: 'tailwind.config.js', includePluginClasses: true },
        '/cwd',
      )
      const hash2 = createCacheKey(
        files,
        [],
        [],
        { config: 'tailwind.config.js', includePluginClasses: false },
        '/cwd',
      )

      expect(hash1).not.toBe(hash2)
    })

    it('should generate same hash for same config object structure', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      const config1 = {
        config: 'tailwind.config.js',
        includePluginClasses: true,
      }
      const config2 = {
        config: 'tailwind.config.js',
        includePluginClasses: true,
      }

      const hash1 = createCacheKey(files, [], [], config1, '/cwd')
      const hash2 = createCacheKey(files, [], [], config2, '/cwd')

      expect(hash1).toBe(hash2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty files array', () => {
      const hash = createCacheKey([], [], [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
      expect(hash.length).toBe(64)
    })

    it('should handle empty allowlist array', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      const hash = createCacheKey(files, [], [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle empty cwd string', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      const hash = createCacheKey(files, [], [], undefined, '')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle all empty inputs', () => {
      const hash = createCacheKey([], [], [], undefined, '')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle special characters in file paths', () => {
      const files: ResolvedFile[] = [
        { path: '/path/with spaces/file.css', mtime: 123 },
        { path: '/path/with-special!@#$%/file.css', mtime: 456 },
        { path: '/path/with/unicode/文件.css', mtime: 789 },
      ]

      const hash = createCacheKey(files, [], [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle special characters in allowlist patterns', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      const whitelist = ['custom-*', 'app.btn-*', '[data-*]']

      const hash = createCacheKey(files, whitelist, [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle large file lists efficiently', () => {
      // Create 1000 files
      const files: ResolvedFile[] = Array.from({ length: 1000 }, (_, i) => ({
        path: `/path/to/file${i}.css`,
        mtime: 1000000 + i,
      }))

      const startTime = Date.now()
      const hash = createCacheKey(files, [], [], undefined, '/cwd')
      const endTime = Date.now()

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
      expect(endTime - startTime).toBeLessThan(50) // Should complete in < 50ms
    })

    it('should handle large allowlist arrays', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]
      // Create 500 allowlist patterns
      const whitelist = Array.from({ length: 500 }, (_, i) => `pattern-${i}-*`)

      const hash = createCacheKey(files, whitelist, [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle very long file paths', () => {
      const longPath = '/very/long/path/' + 'nested/'.repeat(50) + 'file.css'
      const files: ResolvedFile[] = [{ path: longPath, mtime: 123 }]

      const hash = createCacheKey(files, [], [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle numeric mtime values (positive and zero)', () => {
      const files: ResolvedFile[] = [
        { path: '/file1.css', mtime: 0 },
        { path: '/file2.css', mtime: 1 },
        { path: '/file3.css', mtime: Number.MAX_SAFE_INTEGER },
      ]

      const hash = createCacheKey(files, [], [], undefined, '/cwd')

      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('allowlist ordering', () => {
    it('should generate different hashes for different allowlist order', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(
        files,
        ['custom-*', 'app-*'],
        [],
        undefined,
        '/cwd',
      )
      const hash2 = createCacheKey(
        files,
        ['app-*', 'custom-*'],
        [],
        undefined,
        '/cwd',
      )

      expect(hash1).not.toBe(hash2)
    })

    it('should generate same hash for identical allowlist order', () => {
      const files: ResolvedFile[] = [{ path: '/file.css', mtime: 123 }]

      const hash1 = createCacheKey(
        files,
        ['custom-*', 'app-*', 'btn-*'],
        [],
        undefined,
        '/cwd',
      )
      const hash2 = createCacheKey(
        files,
        ['custom-*', 'app-*', 'btn-*'],
        [],
        undefined,
        '/cwd',
      )

      expect(hash1).toBe(hash2)
    })
  })

  describe('combined variations', () => {
    it('should generate different hashes when multiple inputs differ', () => {
      const files1: ResolvedFile[] = [{ path: '/file1.css', mtime: 123 }]
      const files2: ResolvedFile[] = [{ path: '/file2.css', mtime: 456 }]

      const hash1 = createCacheKey(files1, ['custom-*'], [], true, '/cwd1')
      const hash2 = createCacheKey(files2, ['app-*'], [], false, '/cwd2')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate same hash only when all inputs are identical', () => {
      const files: ResolvedFile[] = [
        { path: '/file1.css', mtime: 123 },
        { path: '/file2.css', mtime: 456 },
      ]
      const whitelist = ['custom-*', 'app-*']
      const config = { config: 'tailwind.config.js' }
      const cwd = '/project/root'

      const hash1 = createCacheKey(files, whitelist, [], config, cwd)
      const hash2 = createCacheKey(files, whitelist, [], config, cwd)
      const hash3 = createCacheKey(files, whitelist, [], config, cwd)

      expect(hash1).toBe(hash2)
      expect(hash2).toBe(hash3)
      expect(hash1).toBe(hash3)
    })
  })
})
