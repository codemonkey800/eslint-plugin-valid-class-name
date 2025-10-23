/**
 * Helper functions for class name validation
 */

import { matchesPattern } from 'src/utils/pattern-matcher'

/**
 * Checks if a class name should be ignored based on ignore patterns
 * @param className - The class name to check
 * @param ignorePatterns - Array of patterns to ignore
 * @returns true if the class name should be ignored
 */
export function isClassNameIgnored(
  className: string,
  ignorePatterns: string[],
): boolean {
  return ignorePatterns.some(pattern => matchesPattern(className, pattern))
}
