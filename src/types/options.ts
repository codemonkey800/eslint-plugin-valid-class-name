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

  /**
   * Whether to include plugin-generated classes via Tailwind build process
   * When enabled, processes CSS through Tailwind's PostCSS plugin to capture:
   * - Classes from Tailwind plugins
   * - Classes from @layer utilities
   * - Classes from @layer components
   *
   * Default: true (recommended for complete validation)
   * Set to false for faster performance if you don't use plugins or @layer directives
   *
   * @default true
   */
  includePluginClasses?: boolean
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
  allowlist?: string[]

  /**
   * Array of class name patterns that are forbidden
   * Supports glob patterns and regular expressions
   * @example ["legacy-*", "deprecated-*"]
   */
  blocklist?: string[]

  /**
   * Array of patterns to skip validation for
   * Useful for dynamic or generated class names
   * @example ["dynamic-*", "state-*"]
   */
  ignorePatterns?: string[]

  /**
   * Array of attribute names that use object-style class name syntax
   * For these attributes, class names are extracted from object property VALUES
   * Example: classes={{ root: 'mt-2', container: 'p-4' }}
   * Common in component libraries like Material-UI, Chakra UI, etc.
   * @example ["classes", "classNames", "sx"]
   */
  objectStyleAttributes?: string[]
}
