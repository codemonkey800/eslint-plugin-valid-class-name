import { describe, expect, it } from '@jest/globals'

import { isObject, isString, isThemeScale, isThemeValue } from './type-guards'

describe('isString', () => {
  it('should return true for strings', () => {
    expect(isString('hello')).toBe(true)
    expect(isString('')).toBe(true)
    expect(isString('123')).toBe(true)
  })

  it('should return false for non-strings', () => {
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString({})).toBe(false)
    expect(isString([])).toBe(false)
    expect(isString(true)).toBe(false)
  })
})

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ key: 'value' })).toBe(true)
    expect(isObject({ nested: { obj: true } })).toBe(true)
  })

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false)
  })

  it('should return false for arrays', () => {
    expect(isObject([])).toBe(false)
    expect(isObject([1, 2, 3])).toBe(false)
  })

  it('should return false for primitives', () => {
    expect(isObject('string')).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject(true)).toBe(false)
    expect(isObject(undefined)).toBe(false)
  })
})

describe('isThemeValue', () => {
  it('should return true for strings', () => {
    expect(isThemeValue('red')).toBe(true)
    expect(isThemeValue('#ff0000')).toBe(true)
  })

  it('should return true for numbers', () => {
    expect(isThemeValue(123)).toBe(true)
    expect(isThemeValue(0)).toBe(true)
    expect(isThemeValue(-5)).toBe(true)
  })

  it('should return true for objects', () => {
    expect(isThemeValue({})).toBe(true)
    expect(isThemeValue({ nested: 'value' })).toBe(true)
  })

  it('should return false for null', () => {
    expect(isThemeValue(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isThemeValue(undefined)).toBe(false)
  })

  it('should return false for arrays', () => {
    expect(isThemeValue([])).toBe(false)
    expect(isThemeValue([1, 2, 3])).toBe(false)
  })

  it('should return false for booleans', () => {
    expect(isThemeValue(true)).toBe(false)
    expect(isThemeValue(false)).toBe(false)
  })
})

describe('isThemeScale', () => {
  it('should return true for plain objects', () => {
    expect(isThemeScale({})).toBe(true)
    expect(isThemeScale({ key: 'value' })).toBe(true)
    expect(isThemeScale({ red: '#ff0000', blue: '#0000ff' })).toBe(true)
  })

  it('should return false for null', () => {
    expect(isThemeScale(null)).toBe(false)
  })

  it('should return false for arrays', () => {
    expect(isThemeScale([])).toBe(false)
    expect(isThemeScale(['red', 'blue'])).toBe(false)
  })

  it('should return false for primitives', () => {
    expect(isThemeScale('string')).toBe(false)
    expect(isThemeScale(123)).toBe(false)
    expect(isThemeScale(true)).toBe(false)
    expect(isThemeScale(undefined)).toBe(false)
  })
})
