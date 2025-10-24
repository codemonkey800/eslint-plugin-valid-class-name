/**
 * Performance testing utilities
 */

// eslint-disable-next-line n/no-unpublished-import
import { expect } from '@jest/globals'

/**
 * Measure the execution time of a function
 * Returns both the result and the duration in milliseconds
 */
export function measurePerformance<T>(fn: () => T): {
  result: T
  duration: number
} {
  const start = Date.now()
  const result = fn()
  const duration = Date.now() - start

  return { result, duration }
}

/**
 * Measure performance and assert it's within the expected time
 * More lenient than expectFastOperation - uses Jest's expect
 */
export function measureAndExpect<T>(
  fn: () => T,
  maxMs: number,
): { result: T; duration: number } {
  const { result, duration } = measurePerformance(fn)

  expect(duration).toBeLessThan(maxMs)

  return { result, duration }
}

/**
 * Performance test configuration
 */
export const performanceThresholds = {
  /**
   * Maximum time for a single validation check (O(1) lookup)
   */
  validation: 5, // ms

  /**
   * Maximum time for parsing a small CSS file (<100 classes)
   */
  parseSmall: 50, // ms

  /**
   * Maximum time for parsing a large CSS file (10000 classes)
   */
  parseLarge: 1000, // ms

  /**
   * Maximum time for building a registry with small files
   */
  registryBuildSmall: 100, // ms

  /**
   * Maximum time for building a registry with large files
   */
  registryBuildLarge: 1000, // ms

  /**
   * Maximum time for extracting classes from simple expressions
   */
  extractClasses: 50, // ms
} as const
