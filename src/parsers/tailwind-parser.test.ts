import { describe, expect, it } from '@jest/globals'
import fs from 'fs'
import path from 'path'

import { useTempDir } from '../test'
import {
  findTailwindConfigPath,
  findTailwindCSSConfig,
  isTailwindCSSFile,
} from './tailwind-parser'

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

describe('isTailwindCSSFile', () => {
  const tempDir = useTempDir('tailwind-css-file-test')

  describe('Tailwind CSS v4 detection', () => {
    it('should detect @import "tailwindcss" with double quotes', () => {
      const cssFile = tempDir.createFile(
        'app.css',
        '@import "tailwindcss";\n.custom { color: red; }',
      )

      const result = isTailwindCSSFile(cssFile)

      expect(result).toBe(true)
    })

    it("should detect @import 'tailwindcss' with single quotes", () => {
      const cssFile = tempDir.createFile(
        'app.css',
        "@import 'tailwindcss';\n.custom { color: red; }",
      )

      const result = isTailwindCSSFile(cssFile)

      expect(result).toBe(true)
    })

    it('should detect import within first 1000 characters', () => {
      const cssFile = tempDir.createFile(
        'app.css',
        '/* Comment */\n\n@import "tailwindcss";\n\n.class { color: blue; }',
      )

      const result = isTailwindCSSFile(cssFile)

      expect(result).toBe(true)
    })

    it('should return false for files without Tailwind import', () => {
      const cssFile = tempDir.createFile(
        'regular.css',
        '.btn { color: red; }\n.card { padding: 10px; }',
      )

      const result = isTailwindCSSFile(cssFile)

      expect(result).toBe(false)
    })

    it('should return false for files with similar but incorrect imports', () => {
      const cssFile = tempDir.createFile(
        'app.css',
        '@import "tailwind-css";\n@import url("tailwindcss");',
      )

      const result = isTailwindCSSFile(cssFile)

      expect(result).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('should handle file read errors gracefully', () => {
      const nonExistentFile = tempDir.resolve('nonexistent.css')

      const result = isTailwindCSSFile(nonExistentFile)

      expect(result).toBe(false)
    })

    it('should handle files that cannot be opened', () => {
      // This test might be skipped on Windows where permissions work differently
      if (process.platform === 'win32') {
        return
      }

      const cssFile = tempDir.createFile(
        'restricted.css',
        '@import "tailwindcss";',
      )

      // Remove read permissions
      fs.chmodSync(cssFile, 0o000)

      try {
        const result = isTailwindCSSFile(cssFile)

        // Should return false when file can't be read
        expect(result).toBe(false)
      } finally {
        // Restore permissions for cleanup
        fs.chmodSync(cssFile, 0o644)
      }
    })
  })

  describe('Edge cases', () => {
    it('should handle empty files', () => {
      const cssFile = tempDir.createFile('empty.css', '')

      const result = isTailwindCSSFile(cssFile)

      expect(result).toBe(false)
    })

    it('should handle very large files by only reading first 1000 bytes', () => {
      // Create a file larger than 1000 bytes with import at the end
      const largeContent =
        '/* ' + 'x'.repeat(1100) + ' */\n@import "tailwindcss";'
      const cssFile = tempDir.createFile('large.css', largeContent)

      const result = isTailwindCSSFile(cssFile)

      // Should return false because import is after first 1000 bytes
      expect(result).toBe(false)
    })

    it('should handle files with import within first 1000 bytes', () => {
      // Create a file with import early, then lots of content
      const content =
        '@import "tailwindcss";\n' + '/* ' + 'x'.repeat(2000) + ' */'
      const cssFile = tempDir.createFile('early-import.css', content)

      const result = isTailwindCSSFile(cssFile)

      // Should return true because import is within first 1000 bytes
      expect(result).toBe(true)
    })
  })
})

describe('findTailwindCSSConfig', () => {
  const tempDir = useTempDir('tailwind-css-config-test')

  describe('CSS config detection', () => {
    it('should find src/styles/tailwind.css with Tailwind import', () => {
      const srcDir = tempDir.createDir('src')
      const stylesDir = path.join(srcDir, 'styles')
      fs.mkdirSync(stylesDir)

      const cssFile = tempDir.createFile(
        'src/styles/tailwind.css',
        '@import "tailwindcss";',
      )

      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBe(cssFile)
    })

    it('should find src/app.css with Tailwind import', () => {
      const srcDir = tempDir.createDir('src')
      const cssFile = path.join(srcDir, 'app.css')
      fs.writeFileSync(cssFile, '@import "tailwindcss";')

      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBe(cssFile)
    })

    it('should find src/index.css with Tailwind import', () => {
      const srcDir = tempDir.createDir('src')
      const cssFile = path.join(srcDir, 'index.css')
      fs.writeFileSync(cssFile, '@import "tailwindcss";')

      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBe(cssFile)
    })

    it('should find src/main.css with Tailwind import', () => {
      const srcDir = tempDir.createDir('src')
      const cssFile = path.join(srcDir, 'main.css')
      fs.writeFileSync(cssFile, '@import "tailwindcss";')

      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBe(cssFile)
    })

    it('should find tailwind.css in root with Tailwind import', () => {
      const cssFile = tempDir.createFile(
        'tailwind.css',
        '@import "tailwindcss";',
      )

      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBe(cssFile)
    })

    it('should return null when no CSS config found', () => {
      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBeNull()
    })

    it('should return null when CSS files exist but lack Tailwind import', () => {
      const srcDir = tempDir.createDir('src')
      fs.writeFileSync(path.join(srcDir, 'app.css'), '.custom { color: red; }')

      const result = findTailwindCSSConfig(tempDir.path)

      expect(result).toBeNull()
    })
  })

  describe('Priority order', () => {
    it('should prioritize src/styles/tailwind.css over other paths', () => {
      const srcDir = tempDir.createDir('src')
      const stylesDir = path.join(srcDir, 'styles')
      fs.mkdirSync(stylesDir)

      // Create multiple CSS configs
      const priorityFile = tempDir.createFile(
        'src/styles/tailwind.css',
        '@import "tailwindcss";',
      )
      tempDir.createFile('src/app.css', '@import "tailwindcss";')
      tempDir.createFile('tailwind.css', '@import "tailwindcss";')

      const result = findTailwindCSSConfig(tempDir.path)

      // Should find the first one in priority order
      expect(result).toBe(priorityFile)
    })

    it('should check paths in order and return first match', () => {
      const srcDir = tempDir.createDir('src')

      // Create only the second priority file
      const appCss = path.join(srcDir, 'app.css')
      fs.writeFileSync(appCss, '@import "tailwindcss";')
      tempDir.createFile('tailwind.css', '@import "tailwindcss";')

      const result = findTailwindCSSConfig(tempDir.path)

      // Should find src/app.css before tailwind.css
      expect(result).toBe(appCss)
    })
  })
})
