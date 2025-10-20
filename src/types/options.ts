/**
 * Configuration options for the valid-class-name rule
 */

/**
 * Main configuration interface for the rule
 */
export interface RuleOptions {
  /**
   * Configuration for source files to validate against
   */
  sources?: SourcesConfig

  /**
   * Validation rules and patterns
   */
  validation?: ValidationConfig
}

/**
 * Configuration for source files to validate class names against
 */
export interface SourcesConfig {
  /**
   * Glob patterns for CSS files to validate against
   * @example ["src/styles/**\/*.css"]
   */
  css?: string[]

  /**
   * Glob patterns for SCSS files to validate against
   * @example ["src/styles/**\/*.scss"]
   */
  scss?: string[]

  /**
   * Enable Tailwind CSS validation or provide configuration
   * - Set to `true` to auto-detect tailwind.config.js
   * - Provide an object to specify custom configuration
   */
  tailwind?: boolean | TailwindConfig

  /**
   * Enable CSS Modules support
   * When enabled, validates class names against CSS Module files
   */
  cssModules?: boolean
}

/**
 * Tailwind CSS specific configuration
 */
export interface TailwindConfig {
  /**
   * Path to Tailwind configuration file
   * @example "./tailwind.config.js"
   */
  config?: string
}

/**
 * Validation rules and patterns configuration
 */
export interface ValidationConfig {
  /**
   * Array of class name patterns that are always considered valid
   * Supports glob patterns and regular expressions
   * @example ["custom-*", "app-*"]
   */
  whitelist?: string[]

  /**
   * Array of class name patterns that are forbidden
   * Supports glob patterns and regular expressions
   * @example ["legacy-*", "deprecated-*"]
   */
  blacklist?: string[]

  /**
   * Array of patterns to skip validation for
   * Useful for dynamic or generated class names
   * @example ["dynamic-*", "state-*"]
   */
  ignorePatterns?: string[]
}
