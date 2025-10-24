import { parseClassName } from './tailwind-variants'

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

  it('should handle multiple arbitrary variants', () => {
    const result = parseClassName('[&:hover]:[@media(min-width:768px)]:mt-2')
    expect(result).toEqual({
      variants: ['[&:hover]', '[@media(min-width:768px)]'],
      base: 'mt-2',
    })
  })

  it('should handle mixed arbitrary and regular variants', () => {
    const result = parseClassName('hover:[&:nth-child(3)]:focus:mt-2')
    expect(result).toEqual({
      variants: ['hover', '[&:nth-child(3)]', 'focus'],
      base: 'mt-2',
    })
  })

  it('should handle class with only colons (no variants)', () => {
    const result = parseClassName('hover')
    expect(result).toEqual({
      variants: [],
      base: 'hover',
    })
  })

  it('should cache results', () => {
    const first = parseClassName('hover:mt-2')
    const second = parseClassName('hover:mt-2')
    expect(first).toBe(second) // Same object reference due to caching
  })

  describe('Edge cases and error handling', () => {
    it('should handle empty string input', () => {
      const result = parseClassName('')
      expect(result).toEqual({
        variants: [],
        base: '',
      })
    })

    it('should handle malformed arbitrary variant (unclosed bracket)', () => {
      const result = parseClassName('[&:hover:mt-2')
      expect(result).toEqual({
        variants: [],
        base: '[&:hover:mt-2',
      })
    })

    it('should handle malformed arbitrary variant (no colon after bracket)', () => {
      const result = parseClassName('[&:hover]mt-2')
      expect(result).toEqual({
        variants: [],
        base: '[&:hover]mt-2',
      })
    })

    it('should handle nested brackets in arbitrary variant', () => {
      const result = parseClassName('[&[data-state="open"]]:block')
      expect(result).toEqual({
        variants: ['[&[data-state="open"]'],
        base: 'block',
      })
    })

    it('should handle complex arbitrary selector with special characters', () => {
      const result = parseClassName('[&>*]:mt-2')
      expect(result).toEqual({
        variants: ['[&>*]'],
        base: 'mt-2',
      })
    })

    it('should handle arbitrary variant with pseudo-elements', () => {
      const result = parseClassName('[&::before]:content-[""]')
      expect(result).toEqual({
        variants: ['[&::before]'],
        base: 'content-[""]',
      })
    })

    it('should handle multiple consecutive colons in regular variants', () => {
      const result = parseClassName('hover::mt-2')
      expect(result).toEqual({
        variants: ['hover', ''],
        base: 'mt-2',
      })
    })

    it('should handle class with only variants and trailing colons', () => {
      const result = parseClassName('hover:focus:')
      expect(result).toEqual({
        variants: ['hover', 'focus'],
        base: '',
      })
    })

    it('should handle variant with forward slashes', () => {
      const result = parseClassName('w-1/2')
      expect(result).toEqual({
        variants: [],
        base: 'w-1/2',
      })
    })

    it('should handle variant with dots', () => {
      const result = parseClassName('sm:w-1.5')
      expect(result).toEqual({
        variants: ['sm'],
        base: 'w-1.5',
      })
    })

    it('should handle class with many variants', () => {
      const className = 'sm:md:lg:hover:focus:active:disabled:mt-2'
      const result = parseClassName(className)
      expect(result.variants).toEqual([
        'sm',
        'md',
        'lg',
        'hover',
        'focus',
        'active',
        'disabled',
      ])
      expect(result.base).toBe('mt-2')
    })

    it('should handle arbitrary variant with nested parentheses', () => {
      const result = parseClassName('[&:nth-child(2n+1)]:bg-blue')
      expect(result).toEqual({
        variants: ['[&:nth-child(2n+1)]'],
        base: 'bg-blue',
      })
    })

    it('should handle arbitrary variant with media query', () => {
      const result = parseClassName(
        '[@media(min-width:768px)and(max-width:1024px)]:flex',
      )
      expect(result).toEqual({
        variants: ['[@media(min-width:768px)and(max-width:1024px)]'],
        base: 'flex',
      })
    })

    it('should handle unicode characters in class name', () => {
      const result = parseClassName('hover:日本語-class')
      expect(result).toEqual({
        variants: ['hover'],
        base: '日本語-class',
      })
    })

    it('should handle emoji in class name', () => {
      const result = parseClassName('hover:😀-happy')
      expect(result).toEqual({
        variants: ['hover'],
        base: '😀-happy',
      })
    })

    it('should handle arbitrary variant with escaped characters', () => {
      const result = parseClassName('[&\\:hover]:text-blue')
      expect(result).toEqual({
        variants: ['[&\\:hover]'],
        base: 'text-blue',
      })
    })
  })
})
