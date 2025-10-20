import fs from 'fs'
import path from 'path'

import type { TailwindConfig } from '../types/options.js'

/**
 * Resolved Tailwind configuration structure
 */
export interface ResolvedTailwindConfig {
  safelist: Array<string | SafelistPattern>
  theme: Record<string, unknown>
  content: string[]
  [key: string]: unknown
}

/**
 * Safelist pattern object (for future pattern matching support)
 */
interface SafelistPattern {
  pattern: RegExp
  variants?: string[]
}

/**
 * Default Tailwind config file names to search for
 */
const CONFIG_FILE_NAMES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
]

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

    console.warn(`Warning: Tailwind config file not found at "${configPath}"`)
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

/**
 * Loads and resolves a Tailwind configuration file
 * @param configPath - Absolute path to the config file
 * @returns Resolved Tailwind config, or null if loading fails
 */
export async function loadTailwindConfig(
  configPath: string,
): Promise<ResolvedTailwindConfig | null> {
  try {
    // Dynamic import to support both ESM and CJS
    const configModule = await import(configPath)
    const userConfig = configModule.default || configModule

    // Import Tailwind's resolveConfig
    const { default: resolveConfig } = await import('tailwindcss/resolveConfig')

    // Resolve the config with Tailwind defaults
    const resolved = resolveConfig(userConfig) as ResolvedTailwindConfig

    return resolved
  } catch (error) {
    console.warn(
      `Warning: Failed to load Tailwind config from "${configPath}":`,
      error,
    )
    return null
  }
}

/**
 * Extracts class names from Tailwind safelist
 * Currently only extracts string literals; pattern objects are stored for future use
 * @param safelist - Array of safelist entries from Tailwind config
 * @returns Set of class names from safelist
 */
export function extractSafelistClasses(
  safelist: Array<string | SafelistPattern> | undefined | null,
): Set<string> {
  const classes = new Set<string>()

  // Handle undefined or null safelist
  if (!safelist || !Array.isArray(safelist)) {
    return classes
  }

  for (const entry of safelist) {
    // Skip null/undefined entries
    if (entry === null || entry === undefined) {
      continue
    }

    if (typeof entry === 'string') {
      // Direct string literal class name
      classes.add(entry)
    }
    // Pattern objects (e.g., { pattern: /bg-.*-500/ }) are not handled yet
    // This will be implemented in Phase 4.2: Generate utility classes from config
  }

  return classes
}

/**
 * Gets Tailwind classes from configuration
 * Main entry point for Tailwind class extraction
 * @param tailwindConfig - Tailwind configuration from rule options
 * @param cwd - Current working directory
 * @returns Promise resolving to Set of valid Tailwind class names
 */
export async function getTailwindClasses(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): Promise<Set<string>> {
  // If Tailwind is disabled, return empty set
  if (!tailwindConfig) {
    return new Set()
  }

  // Determine config path
  const configPath =
    typeof tailwindConfig === 'object' ? tailwindConfig.config : undefined

  // Find the config file
  const resolvedConfigPath = findTailwindConfigPath(configPath, cwd)

  if (!resolvedConfigPath) {
    console.warn(
      'Warning: Tailwind config file not found, skipping Tailwind validation',
    )
    return new Set()
  }

  // Load and resolve the config
  const resolved = await loadTailwindConfig(resolvedConfigPath)

  if (!resolved) {
    return new Set()
  }

  // Extract classes from safelist
  const safelistClasses = extractSafelistClasses(resolved.safelist || [])

  // For now, only return safelist classes
  // Full utility class generation will be implemented in the next task
  return safelistClasses
}
