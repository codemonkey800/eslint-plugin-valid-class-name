import {
  ARBITRARY_VALUE_PREFIXES,
  DEFAULT_TAILWIND_VARIANTS,
  isArbitraryValue,
  isValidArbitraryValue,
  isValidVariant,
  parseArbitraryValue,
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

describe('ARBITRARY_VALUE_PREFIXES', () => {
  it('should include common spacing prefixes', () => {
    expect(ARBITRARY_VALUE_PREFIXES.has('p')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('m')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('px')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('mt')).toBe(true)
  })

  it('should include sizing prefixes', () => {
    expect(ARBITRARY_VALUE_PREFIXES.has('w')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('h')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('min-w')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('max-h')).toBe(true)
  })

  it('should include color prefixes', () => {
    expect(ARBITRARY_VALUE_PREFIXES.has('bg')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('text')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('border')).toBe(true)
  })

  it('should include grid prefixes', () => {
    expect(ARBITRARY_VALUE_PREFIXES.has('grid-cols')).toBe(true)
    expect(ARBITRARY_VALUE_PREFIXES.has('col-span')).toBe(true)
  })
})

describe('isArbitraryValue', () => {
  it('should detect simple arbitrary values', () => {
    expect(isArbitraryValue('w-[100px]')).toBe(true)
    expect(isArbitraryValue('h-[50vh]')).toBe(true)
    expect(isArbitraryValue('p-[2.5rem]')).toBe(true)
  })

  it('should detect arbitrary values with hex colors', () => {
    expect(isArbitraryValue('bg-[#1da1f2]')).toBe(true)
    expect(isArbitraryValue('text-[#ff0000]')).toBe(true)
  })

  it('should detect arbitrary values with complex expressions', () => {
    expect(isArbitraryValue('grid-cols-[200px_1fr]')).toBe(true)
    expect(isArbitraryValue('grid-cols-[200px_minmax(900px,_1fr)_100px]')).toBe(
      true,
    )
  })

  it('should detect multi-part prefixes', () => {
    expect(isArbitraryValue('min-w-[100px]')).toBe(true)
    expect(isArbitraryValue('max-h-[50vh]')).toBe(true)
    expect(isArbitraryValue('col-span-[2]')).toBe(true)
  })

  it('should reject regular classes', () => {
    expect(isArbitraryValue('w-full')).toBe(false)
    expect(isArbitraryValue('bg-blue-500')).toBe(false)
    expect(isArbitraryValue('mt-2')).toBe(false)
  })

  it('should reject arbitrary variants', () => {
    expect(isArbitraryValue('[&:hover]')).toBe(false)
    expect(isArbitraryValue('[&:nth-child(3)]')).toBe(false)
  })

  it('should reject malformed brackets', () => {
    expect(isArbitraryValue('w-[100px')).toBe(false)
    expect(isArbitraryValue('w-100px]')).toBe(false)
  })

  it('should detect empty brackets', () => {
    expect(isArbitraryValue('w-[]')).toBe(false) // Empty brackets don't match the pattern
  })
})

describe('parseArbitraryValue', () => {
  it('should parse simple arbitrary values', () => {
    expect(parseArbitraryValue('w-[100px]')).toEqual({
      prefix: 'w',
      value: '100px',
    })
    expect(parseArbitraryValue('h-[50vh]')).toEqual({
      prefix: 'h',
      value: '50vh',
    })
  })

  it('should parse arbitrary values with hex colors', () => {
    expect(parseArbitraryValue('bg-[#1da1f2]')).toEqual({
      prefix: 'bg',
      value: '#1da1f2',
    })
  })

  it('should parse multi-part prefixes', () => {
    expect(parseArbitraryValue('min-w-[100px]')).toEqual({
      prefix: 'min-w',
      value: '100px',
    })
    expect(parseArbitraryValue('grid-cols-[200px_1fr]')).toEqual({
      prefix: 'grid-cols',
      value: '200px_1fr',
    })
  })

  it('should parse complex values', () => {
    expect(
      parseArbitraryValue('grid-cols-[200px_minmax(900px,_1fr)_100px]'),
    ).toEqual({
      prefix: 'grid-cols',
      value: '200px_minmax(900px,_1fr)_100px',
    })
  })

  it('should return null for non-arbitrary values', () => {
    expect(parseArbitraryValue('w-full')).toBeNull()
    expect(parseArbitraryValue('bg-blue-500')).toBeNull()
  })

  it('should return null for malformed values', () => {
    expect(parseArbitraryValue('w-[100px')).toBeNull()
    expect(parseArbitraryValue('w-100px]')).toBeNull()
  })

  it('should return null for empty brackets', () => {
    expect(parseArbitraryValue('w-[]')).toBeNull()
  })
})

describe('isValidArbitraryValue', () => {
  it('should validate arbitrary values with valid prefixes', () => {
    expect(isValidArbitraryValue('w-[100px]')).toBe(true)
    expect(isValidArbitraryValue('h-[50vh]')).toBe(true)
    expect(isValidArbitraryValue('bg-[#1da1f2]')).toBe(true)
    expect(isValidArbitraryValue('text-[14px]')).toBe(true)
    expect(isValidArbitraryValue('p-[2.5rem]')).toBe(true)
  })

  it('should validate multi-part prefixes', () => {
    expect(isValidArbitraryValue('min-w-[100px]')).toBe(true)
    expect(isValidArbitraryValue('max-h-[50vh]')).toBe(true)
    expect(isValidArbitraryValue('grid-cols-[200px_1fr]')).toBe(true)
  })

  it('should validate complex values', () => {
    expect(
      isValidArbitraryValue('grid-cols-[200px_minmax(900px,_1fr)_100px]'),
    ).toBe(true)
  })

  it('should reject arbitrary values with invalid prefixes', () => {
    expect(isValidArbitraryValue('invalid-[100px]')).toBe(false)
    expect(isValidArbitraryValue('foo-[bar]')).toBe(false)
    expect(isValidArbitraryValue('custom-[value]')).toBe(false)
  })

  it('should reject arbitrary values with empty values', () => {
    expect(isValidArbitraryValue('w-[]')).toBe(false)
    expect(isValidArbitraryValue('bg-[]')).toBe(false)
  })

  it('should reject non-arbitrary values', () => {
    expect(isValidArbitraryValue('w-full')).toBe(false)
    expect(isValidArbitraryValue('bg-blue-500')).toBe(false)
  })

  it('should reject malformed values', () => {
    expect(isValidArbitraryValue('w-[100px')).toBe(false)
    expect(isValidArbitraryValue('w-100px]')).toBe(false)
  })
})

describe('Memoization', () => {
  describe('parseClassName cache', () => {
    it('should return the same object reference for repeated calls', () => {
      const className = 'hover:first:mt-2'
      const result1 = parseClassName(className)
      const result2 = parseClassName(className)

      // Should return the exact same object from cache
      expect(result1).toBe(result2)
    })

    it('should cache different class names separately', () => {
      const result1 = parseClassName('hover:mt-2')
      const result2 = parseClassName('focus:mt-4')

      expect(result1).not.toBe(result2)
      expect(result1).toEqual({ variants: ['hover'], base: 'mt-2' })
      expect(result2).toEqual({ variants: ['focus'], base: 'mt-4' })
    })

    it('should cache edge cases correctly', () => {
      const emptyResult1 = parseClassName(':mt-2')
      const emptyResult2 = parseClassName(':mt-2')
      expect(emptyResult1).toBe(emptyResult2)

      const trailingResult1 = parseClassName('hover:')
      const trailingResult2 = parseClassName('hover:')
      expect(trailingResult1).toBe(trailingResult2)
    })
  })

  describe('parseArbitraryValue cache', () => {
    it('should return the same object reference for repeated calls', () => {
      const className = 'w-[100px]'
      const result1 = parseArbitraryValue(className)
      const result2 = parseArbitraryValue(className)

      // Should return the exact same object from cache
      expect(result1).toBe(result2)
    })

    it('should cache null results for non-arbitrary values', () => {
      const className = 'w-full'
      const result1 = parseArbitraryValue(className)
      const result2 = parseArbitraryValue(className)

      expect(result1).toBeNull()
      expect(result2).toBeNull()
    })

    it('should cache different arbitrary values separately', () => {
      const result1 = parseArbitraryValue('w-[100px]')
      const result2 = parseArbitraryValue('h-[50vh]')

      expect(result1).not.toBe(result2)
      expect(result1).toEqual({ prefix: 'w', value: '100px' })
      expect(result2).toEqual({ prefix: 'h', value: '50vh' })
    })
  })

  describe('isValidArbitraryValue cache', () => {
    it('should return the same boolean value for repeated calls', () => {
      const className = 'w-[100px]'
      const result1 = isValidArbitraryValue(className)
      const result2 = isValidArbitraryValue(className)

      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })

    it('should cache false results', () => {
      const className = 'invalid-[100px]'
      const result1 = isValidArbitraryValue(className)
      const result2 = isValidArbitraryValue(className)

      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })

    it('should cache different class names separately', () => {
      const result1 = isValidArbitraryValue('w-[100px]')
      const result2 = isValidArbitraryValue('invalid-[100px]')

      expect(result1).toBe(true)
      expect(result2).toBe(false)
    })
  })
})
