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
})
