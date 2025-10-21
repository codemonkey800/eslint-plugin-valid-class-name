/**
 * Centralized logging utility
 * Replaces direct console.warn calls throughout the codebase
 * Provides consistent logging format and allows for future enhancements
 */

/**
 * Logger interface for consistent logging across the plugin
 */
export interface Logger {
  /**
   * Log a warning message
   * @param message - The warning message
   * @param context - Optional context (error object, additional data, etc.)
   */
  warn(message: string, context?: unknown): void

  /**
   * Log an error message
   * @param message - The error message
   * @param context - Optional context (error object, additional data, etc.)
   */
  error(message: string, context?: unknown): void
}

/**
 * Console-based logger implementation
 * Can be extended or replaced for testing or alternative outputs
 */
class ConsoleLogger implements Logger {
  /**
   * Whether to suppress log output (for testing or quiet mode)
   */
  private quiet: boolean

  constructor() {
    // Check for quiet mode via environment variable
    this.quiet = process.env.ESLINT_PLUGIN_VALID_CLASS_NAME_QUIET === 'true'
  }

  warn(message: string, context?: unknown): void {
    if (this.quiet) {
      return
    }

    if (context !== undefined) {
      console.warn(`Warning: ${message}`, context)
    } else {
      console.warn(`Warning: ${message}`)
    }
  }

  error(message: string, context?: unknown): void {
    if (this.quiet) {
      return
    }

    if (context !== undefined) {
      console.error(`Error: ${message}`, context)
    } else {
      console.error(`Error: ${message}`)
    }
  }
}

/**
 * Singleton logger instance
 * Export this to use throughout the codebase
 */
export const logger: Logger = new ConsoleLogger()
