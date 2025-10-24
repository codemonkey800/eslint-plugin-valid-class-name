import { describe, expect, it } from '@jest/globals'
import fs from 'fs'
import path from 'path'

import { useTempDir } from '../test'
import { findTailwindConfigPath } from './tailwind-parser'

describe('findTailwindConfigPath', () => {
  const tempDir = useTempDir('tailwind-parser-test')

  describe('Explicit config path', () => {
    it('should return absolute path when explicit absolute path exists', () => {
      const configPath = tempDir.createTailwindConfig('custom.config.js')

      const result = findTailwindConfigPath(configPath, tempDir.path)

      expect(result).toBe(configPath)
    })

    it('should return absolute path when explicit relative path exists', () => {
      const configFileName = 'custom.config.js'
      const configPath = tempDir.createTailwindConfig(configFileName)

      const result = findTailwindConfigPath(configFileName, tempDir.path)

      expect(result).toBe(configPath)
    })

    it('should return absolute path for nested relative path', () => {
      tempDir.createDir('config')
      const configPath = tempDir.createTailwindConfig(
        'config/tailwind.config.js',
      )

      const result = findTailwindConfigPath(
        'config/tailwind.config.js',
        tempDir.path,
      )

      expect(result).toBe(configPath)
    })

    it('should return null when explicit path does not exist', () => {
      const nonExistentPath = tempDir.resolve('nonexistent.config.js')

      const result = findTailwindConfigPath(nonExistentPath, tempDir.path)

      expect(result).toBeNull()
    })

    it('should return null when explicit relative path does not exist', () => {
      const result = findTailwindConfigPath(
        'nonexistent/tailwind.config.js',
        tempDir.path,
      )

      expect(result).toBeNull()
    })

    it('should handle explicit path with special characters', () => {
      tempDir.createDir('config-[special]')
      const configPath = tempDir.createTailwindConfig(
        'config-[special]/tailwind.config.js',
      )

      const result = findTailwindConfigPath(
        'config-[special]/tailwind.config.js',
        tempDir.path,
      )

      expect(result).toBe(configPath)
    })
  })

  describe('Auto-detection', () => {
    it('should find tailwind.config.js', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBe(configPath)
    })

    it('should find tailwind.config.cjs', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.cjs')

      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBe(configPath)
    })

    it('should find tailwind.config.mjs', () => {
      const configPath = tempDir.createFile(
        'tailwind.config.mjs',
        'export default {}',
      )

      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBe(configPath)
    })

    it('should prioritize .js over .cjs and .mjs', () => {
      const jsConfig = tempDir.createTailwindConfig('tailwind.config.js')
      tempDir.createTailwindConfig('tailwind.config.cjs')
      tempDir.createFile('tailwind.config.mjs', 'export default {}')

      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBe(jsConfig)
    })

    it('should prioritize .cjs over .mjs when .js does not exist', () => {
      const cjsConfig = tempDir.createTailwindConfig('tailwind.config.cjs')
      tempDir.createFile('tailwind.config.mjs', 'export default {}')

      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBe(cjsConfig)
    })

    it('should return null when no config file found', () => {
      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBeNull()
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined configPath parameter', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      const result = findTailwindConfigPath(undefined, tempDir.path)

      expect(result).toBe(configPath)
    })

    it('should handle empty string configPath', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      // Empty string is truthy, so it tries to resolve as a path
      // which ends up finding the default config in the directory
      const result = findTailwindConfigPath('', tempDir.path)

      // Empty string resolves to cwd, so it finds the default config
      expect(result).toBe(configPath)
    })

    it('should handle cwd with trailing slash', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      const cwdWithSlash = tempDir.path + path.sep
      const result = findTailwindConfigPath(undefined, cwdWithSlash)

      expect(result).toBe(configPath)
    })

    it('should handle relative cwd', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      // Get a relative path to tempDir from current directory
      const relativeCwd = path.relative(process.cwd(), tempDir.path)

      const result = findTailwindConfigPath(undefined, relativeCwd)

      expect(result).toBe(configPath)
    })

    it('should handle config path with dots', () => {
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      const result = findTailwindConfigPath(
        './tailwind.config.js',
        tempDir.path,
      )

      expect(result).toBe(configPath)
    })

    it('should handle config path with parent directory reference', () => {
      const nestedDir = tempDir.createDir('nested')
      const configPath = tempDir.createTailwindConfig('tailwind.config.js')

      const result = findTailwindConfigPath('../tailwind.config.js', nestedDir)

      expect(result).toBe(configPath)
    })
  })

  describe('File system permissions', () => {
    it('should handle directory without read permissions gracefully', () => {
      // This test might be skipped on Windows where permissions work differently
      if (process.platform === 'win32') {
        return
      }

      const restrictedDir = tempDir.createDir('restricted')
      tempDir.createTailwindConfig('restricted/tailwind.config.js')

      // Remove read permissions
      fs.chmodSync(restrictedDir, 0o000)

      try {
        const result = findTailwindConfigPath(
          'restricted/tailwind.config.js',
          tempDir.path,
        )

        // Should return null since we can't read the file
        expect(result).toBeNull()
      } finally {
        // Restore permissions for cleanup
        fs.chmodSync(restrictedDir, 0o755)
      }
    })
  })

  describe('Multiple config scenarios', () => {
    it('should prefer explicit path even when default config exists', () => {
      tempDir.createTailwindConfig('tailwind.config.js')
      const customConfig = tempDir.createTailwindConfig('custom.config.js', {
        custom: true,
      })

      const result = findTailwindConfigPath('custom.config.js', tempDir.path)

      expect(result).toBe(customConfig)
    })

    it('should only find first match when multiple defaults exist', () => {
      const jsConfig = tempDir.createTailwindConfig('tailwind.config.js')
      tempDir.createTailwindConfig('tailwind.config.cjs')

      const result = findTailwindConfigPath(undefined, tempDir.path)

      // Should find .js first due to priority
      expect(result).toBe(jsConfig)
    })
  })
})
