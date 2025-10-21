import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { logger } from './logger'

describe('logger', () => {
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>
  let originalEnv: string | undefined

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    originalEnv = process.env.ESLINT_PLUGIN_VALID_CLASS_NAME_QUIET
    delete process.env.ESLINT_PLUGIN_VALID_CLASS_NAME_QUIET
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    if (originalEnv !== undefined) {
      process.env.ESLINT_PLUGIN_VALID_CLASS_NAME_QUIET = originalEnv
    } else {
      delete process.env.ESLINT_PLUGIN_VALID_CLASS_NAME_QUIET
    }
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning')
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Test warning')
    })

    it('should log warning messages with context', () => {
      const error = new Error('Test error')
      logger.warn('Test warning', error)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning: Test warning',
        error,
      )
    })

    it('should handle various context types', () => {
      logger.warn('Test warning', { key: 'value' })
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Test warning', {
        key: 'value',
      })

      logger.warn('Test warning', 'string context')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning: Test warning',
        'string context',
      )
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Test error')
    })

    it('should log error messages with context', () => {
      const error = new Error('Test error')
      logger.error('Test error', error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Test error', error)
    })
  })
})
