import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { loadTailwindClassesSync } from './tailwind-loader'

describe('loadTailwindClassesSync', () => {
  let tempDir: string

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tailwind-loader-test-'))
  })

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('config file discovery', () => {
    it('should find default tailwind.config.js', () => {
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

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bg-red-500')).toBe(true)
    })

    it('should use explicit config path when provided', () => {
      const configFile = path.join(tempDir, 'custom.tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['custom-class']
        }
      `,
      )

      const result = loadTailwindClassesSync(
        { config: 'custom.tailwind.config.js' },
        tempDir,
      )

      expect(result.classes.has('custom-class')).toBe(true)
    })

    it('should return empty sets when config file not found', () => {
      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.size).toBe(0)
      expect(result.variants.size).toBe(0)
    })

    it('should return empty sets when explicit config path does not exist', () => {
      const result = loadTailwindClassesSync(
        { config: 'nonexistent.config.js' },
        tempDir,
      )

      expect(result.classes.size).toBe(0)
      expect(result.variants.size).toBe(0)
    })
  })

  describe('safelist extraction', () => {
    it('should extract simple safelist classes', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['bg-red-500', 'text-blue-600', 'p-4']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bg-red-500')).toBe(true)
      expect(result.classes.has('text-blue-600')).toBe(true)
      expect(result.classes.has('p-4')).toBe(true)
    })

    it('should handle empty safelist', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should still have theme-based utilities even with empty safelist
      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should handle config with no safelist property', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          theme: {}
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should still have theme-based utilities
      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should extract safelist with pattern objects', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: [
            'bg-red-500',
            { pattern: /bg-(red|blue)/ }
          ]
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bg-red-500')).toBe(true)
    })
  })

  describe('utility class generation', () => {
    it('should generate utilities from default theme', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should have common utilities from default theme
      expect(result.classes.has('flex')).toBe(true)
      expect(result.classes.has('grid')).toBe(true)
      expect(result.classes.has('bg-blue-500')).toBe(true)
      expect(result.classes.has('p-4')).toBe(true)
      expect(result.classes.has('text-red-500')).toBe(true)
    })

    it('should generate utilities from custom theme', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          theme: {
            extend: {
              colors: {
                'custom': '#123456'
              }
            }
          }
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bg-custom')).toBe(true)
      expect(result.classes.has('text-custom')).toBe(true)
    })

    it('should generate spacing utilities', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('m-0')).toBe(true)
      expect(result.classes.has('m-4')).toBe(true)
      expect(result.classes.has('p-0')).toBe(true)
      expect(result.classes.has('p-4')).toBe(true)
      expect(result.classes.has('mt-2')).toBe(true)
      expect(result.classes.has('px-4')).toBe(true)
    })

    it('should generate a large set of utility classes', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Default Tailwind config should generate thousands of utilities
      expect(result.classes.size).toBeGreaterThan(1000)
    })
  })

  describe('includePluginClasses flag', () => {
    it('should include plugin classes by default', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Default behavior should include classes from Tailwind build
      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should include plugin classes when explicitly set to true', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(
        { config: 'tailwind.config.js', includePluginClasses: true },
        tempDir,
      )

      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should exclude plugin classes when set to false', () => {
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

      const result = loadTailwindClassesSync(
        { config: 'tailwind.config.js', includePluginClasses: false },
        tempDir,
      )

      // Should still have safelist and static utilities
      expect(result.classes.has('bg-red-500')).toBe(true)
      expect(result.classes.size).toBeGreaterThan(0)
    })
  })

  describe('variant handling', () => {
    it('should include default Tailwind variants', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should have common default variants
      expect(result.variants.has('hover')).toBe(true)
      expect(result.variants.has('focus')).toBe(true)
      expect(result.variants.has('active')).toBe(true)
      expect(result.variants.has('disabled')).toBe(true)
    })

    it('should include default variants even with custom theme config', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          theme: {
            extend: {
              colors: {
                custom: '#123456'
              }
            }
          }
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should have default variants even with custom theme extensions
      expect(result.variants.size).toBeGreaterThan(0)
      expect(result.variants.has('hover')).toBe(true)
      expect(result.variants.has('focus')).toBe(true)
    })

    it('should merge default and custom variants', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should have many variants (default + custom if any)
      expect(result.variants.size).toBeGreaterThan(10)
    })
  })

  describe('error handling', () => {
    it('should handle invalid config structure gracefully', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = "invalid config"
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Tailwind's resolveConfig is forgiving and merges with defaults
      // So even invalid configs produce valid output
      expect(result.classes.size).toBeGreaterThan(0)
      expect(result.variants.size).toBeGreaterThan(0)
    })

    it('should handle config with syntax errors gracefully', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: []
          // Missing comma
          safelist: ['bg-red-500']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.size).toBe(0)
      expect(result.variants.size).toBe(0)
    })

    it('should handle config that throws during require', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        throw new Error('Config error');
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.size).toBe(0)
      expect(result.variants.size).toBe(0)
    })

    it('should handle missing resolveConfig from tailwindcss', () => {
      // This test is theoretical - if tailwindcss is missing, require would fail
      // The function should handle this gracefully
      const result = loadTailwindClassesSync(true, '/nonexistent/directory')

      expect(result.classes.size).toBe(0)
      expect(result.variants.size).toBe(0)
    })

    it('should handle file deleted after discovery', () => {
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

      // Delete the file before loading
      fs.unlinkSync(configFile)

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.size).toBe(0)
      expect(result.variants.size).toBe(0)
    })
  })

  describe('config module formats', () => {
    it('should handle CommonJS export', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['commonjs-class']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('commonjs-class')).toBe(true)
    })

    it('should handle default export', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports.default = {
          content: [],
          safelist: ['default-class']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('default-class')).toBe(true)
    })
  })

  describe('boolean config handling', () => {
    it('should handle true as config value', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['test-class']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should look for default config when boolean true provided', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['bool-class']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bool-class')).toBe(true)
    })
  })

  describe('complex config scenarios', () => {
    it('should handle config with plugins', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          plugins: [
            // Plugin that doesn't add classes
            function({ addUtilities }) {}
          ]
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should not throw and should have theme-based utilities
      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should handle config with multiple theme extensions', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          theme: {
            extend: {
              colors: {
                primary: '#111111',
                secondary: '#222222'
              },
              spacing: {
                '128': '32rem'
              }
            }
          }
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bg-primary')).toBe(true)
      expect(result.classes.has('bg-secondary')).toBe(true)
      expect(result.classes.has('p-128')).toBe(true)
    })

    it('should handle config with complex safelist patterns', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: [
            'class-1',
            'class-2',
            { pattern: /bg-/ },
            { pattern: /text-/, variants: ['hover', 'focus'] }
          ]
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('class-1')).toBe(true)
      expect(result.classes.has('class-2')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty config object', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {}
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should have default theme utilities
      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should handle config with only content property', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: ['./src/**/*.{js,ts,jsx,tsx}']
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should handle very large safelist', () => {
      const largeSafelist = Array.from(
        { length: 1000 },
        (_, i) => `'class-${i}'`,
      ).join(',')

      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: [${largeSafelist}]
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('class-0')).toBe(true)
      expect(result.classes.has('class-500')).toBe(true)
      expect(result.classes.has('class-999')).toBe(true)
      expect(result.classes.size).toBeGreaterThan(1000)
    })

    it('should handle config with circular references gracefully', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        const config = {
          content: []
        };
        config.self = config;
        module.exports = config;
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // Should not throw and should process config
      expect(result.classes.size).toBeGreaterThan(0)
    })

    it('should handle special characters in config path', () => {
      const specialDir = path.join(tempDir, 'dir with spaces')
      fs.mkdirSync(specialDir)

      const configFile = path.join(specialDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          safelist: ['special-class']
        }
      `,
      )

      const result = loadTailwindClassesSync(
        { config: path.join('dir with spaces', 'tailwind.config.js') },
        tempDir,
      )

      expect(result.classes.has('special-class')).toBe(true)
    })
  })

  describe('integration with resolveConfig', () => {
    it('should properly resolve config with Tailwind resolveConfig', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          theme: {
            extend: {
              colors: {
                brand: '#ff0000'
              }
            }
          }
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      // resolveConfig should merge with default theme
      expect(result.classes.has('bg-brand')).toBe(true)
      expect(result.classes.has('bg-blue-500')).toBe(true) // Default color
    })

    it('should handle config that overrides default theme', () => {
      const configFile = path.join(tempDir, 'tailwind.config.js')
      fs.writeFileSync(
        configFile,
        `
        module.exports = {
          content: [],
          theme: {
            colors: {
              custom: '#123456'
            }
          }
        }
      `,
      )

      const result = loadTailwindClassesSync(true, tempDir)

      expect(result.classes.has('bg-custom')).toBe(true)
    })
  })
})
