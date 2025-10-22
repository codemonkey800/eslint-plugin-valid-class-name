import { describe, expect, it } from '@jest/globals'
import { compilePattern, matchesPattern, validatePattern } from './pattern-matcher'

describe('validatePattern', () => {
  it('should accept valid simple patterns', () => {
    expect(validatePattern('btn-*')).toBe(true)
    expect(validatePattern('custom-*')).toBe(true)
    expect(validatePattern('*-primary')).toBe(true)
  })

  it('should reject patterns that are too long', () => {
    const longPattern = 'a'.repeat(201)
    expect(validatePattern(longPattern)).toBe(false)
  })

  it('should reject patterns with multiple consecutive wildcards', () => {
    expect(validatePattern('a***')).toBe(false)
    expect(validatePattern('btn-****-end')).toBe(false)
  })

  it('should accept patterns with two wildcards', () => {
    expect(validatePattern('a**')).toBe(true)
    expect(validatePattern('btn-**')).toBe(true)
  })

  it('should reject patterns with multiple consecutive plus signs', () => {
    expect(validatePattern('a++')).toBe(false)
    expect(validatePattern('a+++')).toBe(false)
  })

  it('should reject patterns with nested quantifiers', () => {
    expect(validatePattern('(a+)+')).toBe(false)
    expect(validatePattern('(btn+)+')).toBe(false)
  })

  it('should accept normal patterns', () => {
    expect(validatePattern('btn-*')).toBe(true)
    expect(validatePattern('custom-class')).toBe(true)
    expect(validatePattern('prefix-*-suffix')).toBe(true)
  })
})

describe('matchesPattern', () => {
  it('should match exact strings', () => {
    expect(matchesPattern('btn-primary', 'btn-primary')).toBe(true)
    expect(matchesPattern('card', 'card')).toBe(true)
  })

  it('should not match different strings', () => {
    expect(matchesPattern('btn-primary', 'btn-secondary')).toBe(false)
    expect(matchesPattern('card', 'button')).toBe(false)
  })

  it('should match wildcard patterns at end', () => {
    expect(matchesPattern('btn-primary', 'btn-*')).toBe(true)
    expect(matchesPattern('btn-secondary', 'btn-*')).toBe(true)
    expect(matchesPattern('custom-style', 'custom-*')).toBe(true)
  })

  it('should match wildcard patterns at start', () => {
    expect(matchesPattern('btn-primary', '*-primary')).toBe(true)
    expect(matchesPattern('link-primary', '*-primary')).toBe(true)
  })

  it('should match wildcard patterns in middle', () => {
    expect(matchesPattern('btn-large-primary', 'btn-*-primary')).toBe(true)
    expect(matchesPattern('btn-small-primary', 'btn-*-primary')).toBe(true)
  })

  it('should match patterns with multiple wildcards', () => {
    expect(
      matchesPattern('custom-btn-large-primary', 'custom-*-*-primary'),
    ).toBe(true)
  })

  it('should not match when pattern does not fit', () => {
    expect(matchesPattern('card-primary', 'btn-*')).toBe(false)
    expect(matchesPattern('btn', 'btn-*')).toBe(false)
  })

  it('should handle special regex characters', () => {
    expect(matchesPattern('btn.primary', 'btn.primary')).toBe(true)
    expect(matchesPattern('btn[0]', 'btn[0]')).toBe(true)
    expect(matchesPattern('btn(test)', 'btn(test)')).toBe(true)
  })

  it('should reject invalid patterns safely', () => {
    // Invalid patterns should not match (not throw)
    expect(matchesPattern('test', 'a'.repeat(201))).toBe(false)
    expect(matchesPattern('test', 'a***')).toBe(false)
    expect(matchesPattern('test', '(a+)+')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(matchesPattern('', '')).toBe(true)
    expect(matchesPattern('test', '')).toBe(false)
    expect(matchesPattern('', 'test')).toBe(false)
  })

  it('should match wildcard to empty string', () => {
    expect(matchesPattern('btn-', 'btn-*')).toBe(true)
  })
})

describe('compilePattern', () => {
  it('should compile valid simple patterns', () => {
    const regex1 = compilePattern('btn-*')
    expect(regex1).not.toBeNull()
    expect(regex1?.test('btn-primary')).toBe(true)
    expect(regex1?.test('btn-secondary')).toBe(true)
    expect(regex1?.test('card')).toBe(false)

    const regex2 = compilePattern('*-primary')
    expect(regex2).not.toBeNull()
    expect(regex2?.test('btn-primary')).toBe(true)
    expect(regex2?.test('link-primary')).toBe(true)
    expect(regex2?.test('btn-secondary')).toBe(false)
  })

  it('should compile exact match patterns', () => {
    const regex = compilePattern('btn-primary')
    expect(regex).not.toBeNull()
    expect(regex?.test('btn-primary')).toBe(true)
    expect(regex?.test('btn-secondary')).toBe(false)
  })

  it('should compile patterns with multiple wildcards', () => {
    const regex = compilePattern('custom-*-*-primary')
    expect(regex).not.toBeNull()
    expect(regex?.test('custom-btn-large-primary')).toBe(true)
    expect(regex?.test('custom-link-small-primary')).toBe(true)
    expect(regex?.test('custom-primary')).toBe(false)
  })

  it('should return null for invalid patterns', () => {
    // Too long
    expect(compilePattern('a'.repeat(201))).toBeNull()

    // Multiple consecutive wildcards
    expect(compilePattern('a***')).toBeNull()

    // Nested quantifiers
    expect(compilePattern('(a+)+')).toBeNull()
  })

  it('should handle special regex characters', () => {
    const regex1 = compilePattern('btn.primary')
    expect(regex1).not.toBeNull()
    expect(regex1?.test('btn.primary')).toBe(true)
    expect(regex1?.test('btnXprimary')).toBe(false)

    const regex2 = compilePattern('btn[0]')
    expect(regex2).not.toBeNull()
    expect(regex2?.test('btn[0]')).toBe(true)
    expect(regex2?.test('btn0')).toBe(false)

    const regex3 = compilePattern('btn(test)')
    expect(regex3).not.toBeNull()
    expect(regex3?.test('btn(test)')).toBe(true)
  })

  it('should handle empty pattern', () => {
    const regex = compilePattern('')
    expect(regex).not.toBeNull()
    expect(regex?.test('')).toBe(true)
    expect(regex?.test('test')).toBe(false)
  })

  it('should return same matching behavior as matchesPattern', () => {
    const patterns = [
      'btn-*',
      '*-primary',
      'custom-*-*',
      'exact-match',
      'btn.*',
    ]
    const testCases = [
      'btn-primary',
      'btn-secondary',
      'link-primary',
      'custom-a-b',
      'exact-match',
      'btn.test',
    ]

    patterns.forEach(pattern => {
      const regex = compilePattern(pattern)
      testCases.forEach(testCase => {
        const matchesResult = matchesPattern(testCase, pattern)
        const compileResult = regex ? regex.test(testCase) : false
        expect(compileResult).toBe(matchesResult)
      })
    })
  })
})

