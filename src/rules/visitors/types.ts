import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

/**
 * Common context passed to all visitor factories
 * Contains the shared state and utilities needed by visitor functions
 */
export interface VisitorContext {
  /** ESLint rule context for reporting errors and accessing parser services */
  context: Rule.RuleContext
  /** Registry of valid class names from CSS/SCSS files and Tailwind */
  classRegistry: ClassRegistry
  /** Array of glob patterns to skip validation for */
  ignorePatterns: string[]
}

/**
 * Extended visitor context for JSX/TSX visitors
 * Includes additional configuration for object-style class attributes
 */
export interface JSXVisitorContext extends VisitorContext {
  /** Array of attribute names that use object-style syntax (e.g., 'classes', 'classNames', 'sx') */
  objectStyleAttributes: string[]
}
