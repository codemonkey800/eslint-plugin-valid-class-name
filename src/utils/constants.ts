/**
 * Centralized constants for the plugin
 * Extracted from magic numbers throughout the codebase
 */

/**
 * Maximum allowed length for a glob pattern
 * Prevents ReDoS (Regular Expression Denial of Service) attacks
 */
export const MAX_PATTERN_LENGTH = 200
