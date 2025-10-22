/**
 * Pattern matching utilities with security protections
 * Extracted from duplicate implementations in class-registry.ts and valid-class-name.ts
 */

import { MAX_PATTERN_LENGTH } from './constants'

/**
 * Validates that a pattern is safe to use in regex
 * Prevents ReDoS (Regular Expression Denial of Service) attacks
 * @param pattern - The pattern to validate
 * @returns true if the pattern is safe to use
 */
export function validatePattern(pattern: string): boolean {
  // Check pattern length
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return false
  }

  // Check for patterns that could cause catastrophic backtracking
  // Patterns like a******* or (a+)+ are dangerous
  const dangerousPatterns = [
    /\*{3,}/, // Multiple consecutive wildcards (**, ***, etc.)
    /\+{2,}/, // Multiple consecutive plus signs
    /(\(.*\+.*\))\+/, // Nested quantifiers like (a+)+
  ]

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(pattern)) {
      return false
    }
  }

  return true
}

/**
 * Compiles a glob-style pattern into a RegExp object
 * Supports * wildcard for pattern matching
 * Includes protection against ReDoS attacks
 * @param pattern - The pattern to compile (supports * wildcard)
 * @returns Compiled RegExp or null if pattern is invalid
 * @example
 * const regex = compilePattern('btn-*')
 * if (regex) regex.test('btn-primary') // true
 */
export function compilePattern(pattern: string): RegExp | null {
  // Validate pattern for security
  if (!validatePattern(pattern)) {
    // Invalid patterns return null
    // This prevents DoS attacks while maintaining functionality
    return null
  }

  // Escape special regex characters except *
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

  // Replace * with .*
  const regexPattern = escapedPattern.replace(/\*/g, '.*')

  try {
    return new RegExp(`^${regexPattern}$`)
  } catch {
    // If regex construction fails, return null
    return null
  }
}

/**
 * Checks if a class name matches a glob-style pattern
 * Supports * wildcard for pattern matching
 * Includes protection against ReDoS attacks
 * @param className - The class name to test
 * @param pattern - The pattern to match against (supports * wildcard)
 * @returns true if the class name matches the pattern
 * @example
 * matchesPattern('btn-primary', 'btn-*') // true
 * matchesPattern('card', 'btn-*') // false
 * matchesPattern('custom-style', 'custom-*') // true
 */
export function matchesPattern(className: string, pattern: string): boolean {
  const regex = compilePattern(pattern)
  if (!regex) {
    return false
  }
  return regex.test(className)
}
