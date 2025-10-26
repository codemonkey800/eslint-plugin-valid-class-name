import fs from 'fs'
import path from 'path'

import { logger } from 'src/utils/logger'

/**
 * Default Tailwind config file names to search for (v3)
 */
const CONFIG_FILE_NAMES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
]

/**
 * Common CSS entry points for Tailwind v4 CSS-based configuration
 * These files typically contain @import 'tailwindcss' and @theme directives
 */
const V4_CSS_CONFIG_PATHS = [
  'src/styles/tailwind.css',
  'src/app.css',
  'src/index.css',
  'src/main.css',
  'tailwind.css',
]

/**
 * Checks if a CSS file is a valid Tailwind CSS v4 configuration file
 * by looking for @import 'tailwindcss' or @import "tailwindcss"
 * @param filePath - Absolute path to CSS file
 * @returns True if file contains Tailwind CSS import
 */
export function isTailwindCSSFile(filePath: string): boolean {
  try {
    // Read first 1000 characters to check for @import statement
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(1000)
    const bytesRead = fs.readSync(fd, buffer, 0, 1000, 0)
    fs.closeSync(fd)

    const content = buffer.toString('utf-8', 0, bytesRead)

    // Check for @import 'tailwindcss' or @import "tailwindcss"
    return (
      content.includes("@import 'tailwindcss'") ||
      content.includes('@import "tailwindcss"')
    )
  } catch {
    return false
  }
}

/**
 * Finds a Tailwind CSS v4 configuration file (CSS-based)
 * Searches common entry points for files with @import 'tailwindcss'
 * @param cwd - Current working directory
 * @returns Absolute path to CSS config file, or null if not found
 */
export function findTailwindCSSConfig(cwd: string): string | null {
  for (const cssPath of V4_CSS_CONFIG_PATHS) {
    const filePath = path.resolve(cwd, cssPath)
    if (fs.existsSync(filePath) && isTailwindCSSFile(filePath)) {
      return filePath
    }
  }
  return null
}

/**
 * Finds the Tailwind configuration file
 * @param configPath - Explicit path to config file (optional)
 * @param cwd - Current working directory
 * @returns Absolute path to config file, or null if not found
 */
export function findTailwindConfigPath(
  configPath: string | undefined,
  cwd: string,
): string | null {
  // If explicit path provided, resolve and check if it exists
  if (configPath) {
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(cwd, configPath)

    if (fs.existsSync(absolutePath)) {
      return absolutePath
    }

    logger.warn(`Tailwind config file not found at "${configPath}"`)
    return null
  }

  // Auto-detect: search for common config file names
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.resolve(cwd, fileName)
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  // Not found
  return null
}
