import { describe, it, expect } from '@jest/globals';
import plugin from './index.js';

describe('eslint-plugin-valid-class-name', () => {
  it('should export a valid ESLint plugin', () => {
    expect(plugin).toBeDefined();
    expect(typeof plugin).toBe('object');
  });

  it('should have meta information', () => {
    expect(plugin.meta).toBeDefined();
    expect(plugin.meta.name).toBe('eslint-plugin-valid-class-name');
    expect(plugin.meta.version).toBe('0.1.0');
  });

  it('should have a rules object', () => {
    expect(plugin.rules).toBeDefined();
    expect(typeof plugin.rules).toBe('object');
  });

  it('should have a configs object', () => {
    expect(plugin.configs).toBeDefined();
    expect(typeof plugin.configs).toBe('object');
    expect(plugin.configs.recommended).toBeDefined();
  });

  it('should have recommended config with correct structure', () => {
    const { recommended } = plugin.configs;
    expect(recommended.plugins).toContain('valid-class-name');
    expect(recommended.rules).toBeDefined();
    expect(typeof recommended.rules).toBe('object');
  });
});
