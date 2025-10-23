import { describe, expect, it } from '@jest/globals'

import plugin from './index'

describe('eslint-plugin-valid-class-name', () => {
  it('should export a valid ESLint plugin', () => {
    expect(plugin).toBeDefined()
    expect(typeof plugin).toBe('object')
  })

  it('should have meta information', () => {
    expect(plugin.meta).toBeDefined()
    expect(plugin.meta?.name).toBe('eslint-plugin-valid-class-name')
    expect(plugin.meta?.version).toBe('0.1.0')
  })

  it('should have a rules object', () => {
    expect(plugin.rules).toBeDefined()
    expect(typeof plugin.rules).toBe('object')
  })

  it('should have a configs object', () => {
    expect(plugin.configs).toBeDefined()
    expect(typeof plugin.configs).toBe('object')
    expect(plugin.configs?.recommended).toBeDefined()
  })

  it('should have recommended config with correct structure', () => {
    const recommended = plugin.configs?.recommended
    expect(Array.isArray(recommended)).toBe(false)
    expect(typeof recommended).toBe('object')
    expect(recommended).toBeDefined()

    // Type assertion after runtime checks
    const config = recommended as {
      plugins: string[]
      rules: Record<string, unknown>
    }
    expect(config.plugins).toContain('valid-class-name')
    expect(config.rules).toBeDefined()
    expect(typeof config.rules).toBe('object')
  })
})
