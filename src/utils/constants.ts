/**
 * Centralized constants for the plugin
 * Extracted from magic numbers throughout the codebase
 */

/**
 * Tailwind CSS default grid column range
 * Matches Tailwind's default configuration (grid-cols-1 through grid-cols-12)
 */
export const DEFAULT_GRID_COLS_RANGE = 12

/**
 * Tailwind CSS default grid row range
 * Matches Tailwind's default configuration (grid-rows-1 through grid-rows-6)
 */
export const DEFAULT_GRID_ROWS_RANGE = 6

/**
 * Tailwind CSS default grid column start/end range
 * Matches Tailwind's default configuration (col-start-1 through col-start-13)
 */
export const DEFAULT_GRID_COL_START_END_RANGE = 13

/**
 * Tailwind CSS default grid row start/end range
 * Matches Tailwind's default configuration (row-start-1 through row-start-7)
 */
export const DEFAULT_GRID_ROW_START_END_RANGE = 7

/**
 * Maximum allowed length for a glob pattern
 * Prevents ReDoS (Regular Expression Denial of Service) attacks
 */
export const MAX_PATTERN_LENGTH = 200

/**
 * Maximum depth for theme object traversal
 * Prevents infinite recursion and stack overflow from circular references
 */
export const MAX_THEME_DEPTH = 10
