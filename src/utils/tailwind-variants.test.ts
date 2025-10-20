import {
  DEFAULT_TAILWIND_VARIANTS,
  isValidVariant,
  parseClassName,
  validateVariants,
} from './tailwind-variants'

describe('DEFAULT_TAILWIND_VARIANTS', () => {
  it('should include common pseudo-classes', () => {
    expect(DEFAULT_TAILWIND_VARIANTS.has('hover')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('focus')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('active')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('disabled')).toBe(true)
  })

  it('should include child selectors', () => {
    expect(DEFAULT_TAILWIND_VARIANTS.has('first')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('last')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('odd')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('even')).toBe(true)
  })

  it('should include responsive breakpoints', () => {
    expect(DEFAULT_TAILWIND_VARIANTS.has('sm')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('md')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('lg')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('xl')).toBe(true)
    expect(DEFAULT_TAILWIND_VARIANTS.has('2xl')).toBe(true)
  })

  it('should include dark mode', () => {
    expect(DEFAULT_TAILWIND_VARIANTS.has('dark')).toBe(true)
  })
})

describe('parseClassName', () => {
  it('should parse class without variants', () => {
    const result = parseClassName('mt-2')
    expect(result).toEqual({
      variants: [],
      base: 'mt-2',
    })
  })

  it('should parse class with single variant', () => {
    const result = parseClassName('hover:bg-blue-500')
    expect(result).toEqual({
      variants: ['hover'],
      base: 'bg-blue-500',
    })
  })

  it('should parse class with multiple variants', () => {
    const result = parseClassName('sm:hover:first:mt-2')
    expect(result).toEqual({
      variants: ['sm', 'hover', 'first'],
      base: 'mt-2',
    })
  })

  it('should handle empty variant (edge case)', () => {
    const result = parseClassName(':mt-2')
    expect(result).toEqual({
      variants: [''],
      base: 'mt-2',
    })
  })

  it('should handle trailing colon (edge case)', () => {
    const result = parseClassName('hover:')
    expect(result).toEqual({
      variants: ['hover'],
      base: '',
    })
  })

  it('should handle arbitrary variants', () => {
    const result = parseClassName('[&:nth-child(3)]:mt-2')
    expect(result).toEqual({
      variants: ['[&:nth-child(3)]'],
      base: 'mt-2',
    })
  })
})

describe('isValidVariant', () => {
  const validVariants = new Set(['hover', 'focus', 'active', 'sm', 'md', 'lg'])

  it('should validate standard variants', () => {
    expect(isValidVariant('hover', validVariants)).toBe(true)
    expect(isValidVariant('focus', validVariants)).toBe(true)
    expect(isValidVariant('sm', validVariants)).toBe(true)
  })

  it('should reject invalid variants', () => {
    expect(isValidVariant('hovr', validVariants)).toBe(false)
    expect(isValidVariant('focs', validVariants)).toBe(false)
    expect(isValidVariant('smm', validVariants)).toBe(false)
  })

  it('should reject empty variants', () => {
    expect(isValidVariant('', validVariants)).toBe(false)
  })

  it('should accept arbitrary variants', () => {
    expect(isValidVariant('[&:nth-child(3)]', validVariants)).toBe(true)
    expect(isValidVariant('[&>*]', validVariants)).toBe(true)
    expect(isValidVariant('[.custom&]', validVariants)).toBe(true)
  })

  it('should validate group- variants', () => {
    expect(isValidVariant('group-hover', validVariants)).toBe(true)
    expect(isValidVariant('group-focus', validVariants)).toBe(true)
    expect(isValidVariant('group-active', validVariants)).toBe(true)
  })

  it('should reject invalid group- variants', () => {
    expect(isValidVariant('group-hovr', validVariants)).toBe(false)
    expect(isValidVariant('group-invalid', validVariants)).toBe(false)
  })

  it('should validate peer- variants', () => {
    expect(isValidVariant('peer-hover', validVariants)).toBe(true)
    expect(isValidVariant('peer-focus', validVariants)).toBe(true)
    expect(isValidVariant('peer-active', validVariants)).toBe(true)
  })

  it('should reject invalid peer- variants', () => {
    expect(isValidVariant('peer-hovr', validVariants)).toBe(false)
    expect(isValidVariant('peer-invalid', validVariants)).toBe(false)
  })
})

describe('validateVariants', () => {
  const validVariants = new Set(['hover', 'focus', 'first', 'sm', 'md'])

  it('should validate all valid variants', () => {
    const result = validateVariants(['hover', 'first'], validVariants)
    expect(result).toEqual({ valid: true })
  })

  it('should reject when any variant is invalid', () => {
    const result = validateVariants(['hover', 'firs', 'sm'], validVariants)
    expect(result).toEqual({ valid: false, invalidVariant: 'firs' })
  })

  it('should return the first invalid variant', () => {
    const result = validateVariants(['hovr', 'focs', 'sm'], validVariants)
    expect(result).toEqual({ valid: false, invalidVariant: 'hovr' })
  })

  it('should validate empty array', () => {
    const result = validateVariants([], validVariants)
    expect(result).toEqual({ valid: true })
  })

  it('should validate group/peer variants', () => {
    const result = validateVariants(
      ['group-hover', 'peer-focus'],
      validVariants,
    )
    expect(result).toEqual({ valid: true })
  })

  it('should validate arbitrary variants', () => {
    const result = validateVariants(
      ['[&:nth-child(3)]', 'hover'],
      validVariants,
    )
    expect(result).toEqual({ valid: true })
  })
})
