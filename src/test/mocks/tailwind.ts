/**
 * Type-safe mock implementations for TailwindUtils
 */

import type { TailwindUtils } from 'tailwind-api-utils'

/**
 * Mock implementation of TailwindUtils for testing
 * Only implements the methods needed for testing
 */
export class MockTailwindUtils
  implements Pick<TailwindUtils, 'isValidClassName'>
{
  private validClasses: Set<string>

  constructor(validClasses: string[]) {
    this.validClasses = new Set(validClasses)
  }

  // Implement the overloaded signature from TailwindUtils
  isValidClassName(className: string): boolean
  isValidClassName(className: string[]): boolean[]
  isValidClassName(className: string | string[]): boolean | boolean[] {
    if (Array.isArray(className)) {
      return className.map(cls => this.validClasses.has(cls))
    }
    return this.validClasses.has(className)
  }

  /**
   * Add classes to the mock after construction
   */
  addClasses(...classes: string[]): void {
    for (const cls of classes) {
      this.validClasses.add(cls)
    }
  }

  /**
   * Remove classes from the mock
   */
  removeClasses(...classes: string[]): void {
    for (const cls of classes) {
      this.validClasses.delete(cls)
    }
  }

  /**
   * Clear all classes
   */
  clear(): void {
    this.validClasses.clear()
  }

  /**
   * Get all valid classes (for debugging)
   */
  getAllClasses(): string[] {
    return Array.from(this.validClasses)
  }
}

/**
 * Convert MockTailwindUtils to TailwindUtils type for use in functions
 * that expect the full TailwindUtils interface
 */
export function asTailwindUtils(
  mock: MockTailwindUtils | null | undefined,
): TailwindUtils | null | undefined {
  if (mock === null) return null
  if (mock === undefined) return undefined
  return mock as unknown as TailwindUtils
}
