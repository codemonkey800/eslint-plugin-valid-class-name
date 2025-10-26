import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import fg from 'fast-glob'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { logger } from 'src/utils/logger'

import {
  clearFileResolverCache,
  getCachedOrResolveFiles,
} from './file-resolver'

describe('file-resolver', () => {
  let tempDir: string

  beforeEach(() => {
    // Clear cache before each test
    clearFileResolverCache()

    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-resolver-test-'))
  })

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('getCachedOrResolveFiles', () => {
    describe('basic file resolution', () => {
      it('should resolve single CSS file with glob pattern', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn { color: red; }')

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(cssFile)
        expect(files[0].mtime).toBeGreaterThan(0)
      })

      it('should resolve multiple CSS files with glob pattern', () => {
        const css1 = path.join(tempDir, 'buttons.css')
        const css2 = path.join(tempDir, 'cards.css')
        const css3 = path.join(tempDir, 'utils.css')

        fs.writeFileSync(css1, '.btn {}')
        fs.writeFileSync(css2, '.card {}')
        fs.writeFileSync(css3, '.util {}')

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files).toHaveLength(3)
        expect(files.map(f => f.path).sort()).toEqual([css1, css2, css3].sort())
      })

      it('should resolve nested files with ** glob pattern', () => {
        const nestedDir = path.join(tempDir, 'nested')
        fs.mkdirSync(nestedDir)

        const css1 = path.join(tempDir, 'root.css')
        const css2 = path.join(nestedDir, 'nested.css')

        fs.writeFileSync(css1, '.root {}')
        fs.writeFileSync(css2, '.nested {}')

        const files = getCachedOrResolveFiles([`${tempDir}/**/*.css`], tempDir)

        expect(files).toHaveLength(2)
        expect(files.map(f => f.path).sort()).toEqual([css1, css2].sort())
      })

      it('should resolve files with multiple patterns', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        const scssFile = path.join(tempDir, 'styles.scss')

        fs.writeFileSync(cssFile, '.btn {}')
        fs.writeFileSync(scssFile, '.card {}')

        const files = getCachedOrResolveFiles(
          [`${tempDir}/*.css`, `${tempDir}/*.scss`],
          tempDir,
        )

        expect(files).toHaveLength(2)
        expect(files.map(f => f.path).sort()).toEqual(
          [cssFile, scssFile].sort(),
        )
      })

      it('should return empty array for non-matching patterns', () => {
        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files).toHaveLength(0)
      })

      it('should return empty array for empty patterns', () => {
        const files = getCachedOrResolveFiles([], tempDir)

        expect(files).toHaveLength(0)
      })
    })

    describe('ignore patterns', () => {
      it('should ignore node_modules directory', () => {
        const nodeModules = path.join(tempDir, 'node_modules')
        fs.mkdirSync(nodeModules)

        const regularCss = path.join(tempDir, 'styles.css')
        const nodeModuleCss = path.join(nodeModules, 'library.css')

        fs.writeFileSync(regularCss, '.btn {}')
        fs.writeFileSync(nodeModuleCss, '.lib {}')

        const files = getCachedOrResolveFiles([`${tempDir}/**/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(regularCss)
      })

      it('should ignore dist directory', () => {
        const distDir = path.join(tempDir, 'dist')
        fs.mkdirSync(distDir)

        const regularCss = path.join(tempDir, 'styles.css')
        const distCss = path.join(distDir, 'bundle.css')

        fs.writeFileSync(regularCss, '.btn {}')
        fs.writeFileSync(distCss, '.bundled {}')

        const files = getCachedOrResolveFiles([`${tempDir}/**/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(regularCss)
      })

      it('should ignore build directory', () => {
        const buildDir = path.join(tempDir, 'build')
        fs.mkdirSync(buildDir)

        const regularCss = path.join(tempDir, 'styles.css')
        const buildCss = path.join(buildDir, 'output.css')

        fs.writeFileSync(regularCss, '.btn {}')
        fs.writeFileSync(buildCss, '.built {}')

        const files = getCachedOrResolveFiles([`${tempDir}/**/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(regularCss)
      })
    })

    describe('caching behavior', () => {
      it('should cache results on repeated calls within TTL', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Should return same array reference (cached)
        expect(files1).toBe(files2)
      })

      it('should invalidate cache after TTL expires', () => {
        jest.useFakeTimers()

        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const startTime = Date.now()
        jest.setSystemTime(startTime)

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Advance time past TTL (1000ms)
        jest.setSystemTime(startTime + 1100)

        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Should not be the same reference (cache expired and re-resolved)
        expect(files1).not.toBe(files2)
        // But should have same content
        expect(files1).toEqual(files2)

        jest.useRealTimers()
      })

      it('should use cache within TTL even if called multiple times', () => {
        jest.useFakeTimers()

        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const startTime = Date.now()
        jest.setSystemTime(startTime)

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Advance time but stay within TTL
        jest.setSystemTime(startTime + 500)

        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        jest.setSystemTime(startTime + 900)

        const files3 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files1).toBe(files2)
        expect(files2).toBe(files3)

        jest.useRealTimers()
      })

      it('should invalidate cache when patterns change', () => {
        const css1 = path.join(tempDir, 'buttons.css')
        const css2 = path.join(tempDir, 'cards.css')

        fs.writeFileSync(css1, '.btn {}')
        fs.writeFileSync(css2, '.card {}')

        const files1 = getCachedOrResolveFiles(
          [`${tempDir}/buttons.css`],
          tempDir,
        )
        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files1).not.toBe(files2)
        expect(files1).toHaveLength(1)
        expect(files2).toHaveLength(2)
      })

      it('should invalidate cache when cwd changes', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        const files2 = getCachedOrResolveFiles(
          [`${tempDir}/*.css`],
          '/different/cwd',
        )

        expect(files1).not.toBe(files2)
      })

      it('should use cached data within TTL even when file changes', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Modify file to change mtime
        const newTime = Date.now() + 100
        fs.utimesSync(cssFile, new Date(newTime), new Date(newTime))

        // Within TTL, should return cached results (same reference)
        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files1).toBe(files2)
        expect(files1[0].mtime).toBe(files2[0].mtime)
      })

      it('should use cached data within TTL even when file is deleted', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        expect(files1).toHaveLength(1)

        // Delete file
        fs.unlinkSync(cssFile)

        // Within TTL, should return cached results (same reference)
        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files1).toBe(files2)
        expect(files2).toHaveLength(1)
      })

      it('should detect new files after TTL expiry', () => {
        jest.useFakeTimers()

        const css1 = path.join(tempDir, 'file1.css')
        fs.writeFileSync(css1, '.btn {}')

        const startTime = Date.now()
        jest.setSystemTime(startTime)

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        expect(files1).toHaveLength(1)

        // Advance time slightly but within TTL
        jest.setSystemTime(startTime + 500)

        // Add new file within TTL
        const css2 = path.join(tempDir, 'file2.css')
        fs.writeFileSync(css2, '.card {}')

        // Call within TTL - won't detect new file
        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        expect(files2).toHaveLength(1) // Still cached, missing new file

        // Advance past TTL
        jest.setSystemTime(startTime + 1100)

        // Call after TTL - should detect new file
        const files3 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        expect(files3).toHaveLength(2)

        jest.useRealTimers()
      })
    })

    describe('mtime validation', () => {
      it('should store correct mtime for each file', () => {
        const css1 = path.join(tempDir, 'file1.css')
        const css2 = path.join(tempDir, 'file2.css')

        fs.writeFileSync(css1, '.btn {}')
        // Small delay to ensure different mtimes
        const time1 = Date.now()
        fs.utimesSync(css1, new Date(time1), new Date(time1))

        const time2 = time1 + 1000
        fs.writeFileSync(css2, '.card {}')
        fs.utimesSync(css2, new Date(time2), new Date(time2))

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        const file1 = files.find(f => f.path === css1)
        const file2 = files.find(f => f.path === css2)

        // Use approximate equality since file system times can have precision variations
        expect(Math.abs((file1?.mtime ?? 0) - time1)).toBeLessThan(2)
        expect(Math.abs((file2?.mtime ?? 0) - time2)).toBeLessThan(2)
      })
    })

    describe('absolute vs relative paths', () => {
      it('should handle absolute path patterns', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const absolutePattern = path.join(tempDir, '*.css')
        const files = getCachedOrResolveFiles([absolutePattern], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(cssFile)
      })

      it('should handle relative path patterns with cwd', () => {
        const subDir = path.join(tempDir, 'src')
        fs.mkdirSync(subDir)

        const cssFile = path.join(subDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        // Use relative pattern from tempDir
        const files = getCachedOrResolveFiles(['src/*.css'], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(cssFile)
      })

      it('should handle mixed absolute and relative patterns', () => {
        const subDir = path.join(tempDir, 'src')
        fs.mkdirSync(subDir)

        const css1 = path.join(tempDir, 'root.css')
        const css2 = path.join(subDir, 'nested.css')

        fs.writeFileSync(css1, '.root {}')
        fs.writeFileSync(css2, '.nested {}')

        // When mixing absolute and relative patterns, both must be absolute
        // because fast-glob ignores cwd when absolute patterns are present
        const files = getCachedOrResolveFiles(
          [path.join(tempDir, 'root.css'), path.join(tempDir, 'src/*.css')],
          tempDir,
        )

        expect(files).toHaveLength(2)
      })
    })

    describe('deeply nested structures', () => {
      it('should handle deeply nested directory structures', () => {
        // Create nested structure: a/b/c/d/e/file.css
        const deepPath = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
        fs.mkdirSync(deepPath, { recursive: true })

        const cssFile = path.join(deepPath, 'deep.css')
        fs.writeFileSync(cssFile, '.deep {}')

        const files = getCachedOrResolveFiles([`${tempDir}/**/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(cssFile)
      })

      it('should handle multiple files at different nesting levels', () => {
        const level1 = path.join(tempDir, 'level1.css')
        const level2Dir = path.join(tempDir, 'sub')
        const level2 = path.join(level2Dir, 'level2.css')
        const level3Dir = path.join(level2Dir, 'deep')
        const level3 = path.join(level3Dir, 'level3.css')

        fs.mkdirSync(level2Dir)
        fs.mkdirSync(level3Dir)

        fs.writeFileSync(level1, '.l1 {}')
        fs.writeFileSync(level2, '.l2 {}')
        fs.writeFileSync(level3, '.l3 {}')

        const files = getCachedOrResolveFiles([`${tempDir}/**/*.css`], tempDir)

        expect(files).toHaveLength(3)
        expect(files.map(f => f.path).sort()).toEqual(
          [level1, level2, level3].sort(),
        )
      })
    })

    describe('clearFileResolverCache', () => {
      it('should clear the cache', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        clearFileResolverCache()

        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Should not be the same reference after clearing cache
        expect(files1).not.toBe(files2)
        // But should have same content
        expect(files1).toEqual(files2)
      })

      it('should allow cache to rebuild after clearing', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        clearFileResolverCache()

        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        const files3 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // files2 and files3 should be cached together
        expect(files2).toBe(files3)
      })
    })

    describe('edge cases', () => {
      it('should handle files with special characters in names', () => {
        const specialFile = path.join(tempDir, 'file with spaces.css')
        fs.writeFileSync(specialFile, '.btn {}')

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(specialFile)
      })

      it('should handle empty files', () => {
        const emptyFile = path.join(tempDir, 'empty.css')
        fs.writeFileSync(emptyFile, '')

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(emptyFile)
        expect(files[0].mtime).toBeGreaterThan(0)
      })

      it('should handle very large files', () => {
        const largeFile = path.join(tempDir, 'large.css')
        // Create a 1MB file
        const largeContent = '.class { color: red; }\n'.repeat(50000)
        fs.writeFileSync(largeFile, largeContent)

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        expect(files).toHaveLength(1)
        expect(files[0].path).toBe(largeFile)
      })

      it('should handle multiple calls with same patterns', () => {
        const cssFile = path.join(tempDir, 'styles.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const files1 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        const files2 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)
        const files3 = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // All should return successfully
        expect(files1).toHaveLength(1)
        expect(files2).toHaveLength(1)
        expect(files3).toHaveLength(1)

        // They should be the same cached reference
        expect(files1).toBe(files2)
        expect(files2).toBe(files3)
      })

      it('should handle patterns that match no files without errors', () => {
        const files = getCachedOrResolveFiles(
          [`${tempDir}/nonexistent/*.css`],
          tempDir,
        )

        expect(files).toHaveLength(0)
      })

      it('should handle invalid glob patterns gracefully', () => {
        // Some invalid patterns might be caught by fast-glob
        const files = getCachedOrResolveFiles(['[invalid'], tempDir)

        // Should not throw and should return an array (may be empty)
        expect(Array.isArray(files)).toBe(true)
        expect(files.length).toBeGreaterThanOrEqual(0)
      })
    })

    describe('error handling and logging', () => {
      it('should log warning when file stat fails', () => {
        const cssFile = path.join(tempDir, 'test.css')
        fs.writeFileSync(cssFile, '.btn {}')

        const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation()

        // Mock statSync to throw error for this specific file
        const originalStatSync = fs.statSync
        jest.spyOn(fs, 'statSync').mockImplementation((filePath, ...args) => {
          if (filePath === cssFile) {
            throw new Error('Permission denied')
          }
          return originalStatSync(filePath, ...args)
        })

        // Clear cache to force resolution
        clearFileResolverCache()

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // File should be skipped due to stat error
        expect(files).toHaveLength(0)
        // Logger should be called with warning
        expect(loggerSpy).toHaveBeenCalledWith(
          `Failed to stat file "${cssFile}"`,
          expect.any(Error),
        )

        loggerSpy.mockRestore()
        jest.spyOn(fs, 'statSync').mockRestore()
      })

      it('should log warning when glob operation fails', () => {
        const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation()

        // Mock fg.sync to throw error
        jest.spyOn(fg, 'sync').mockImplementation(() => {
          throw new Error('Glob error')
        })

        // Clear cache to force resolution
        clearFileResolverCache()

        const files = getCachedOrResolveFiles([`${tempDir}/*.css`], tempDir)

        // Should return empty array on error
        expect(files).toHaveLength(0)
        // Logger should be called with warning
        expect(loggerSpy).toHaveBeenCalledWith(
          'Failed to find CSS files',
          expect.any(Error),
        )

        loggerSpy.mockRestore()
        jest.spyOn(fg, 'sync').mockRestore()
      })
    })
  })
})
