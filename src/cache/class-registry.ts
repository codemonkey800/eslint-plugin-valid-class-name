import fg from 'fast-glob'
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from 'src/parsers/css-parser'
import {
  extractSafelistClasses,
  extractVariantsFromConfig,
  findTailwindConfigPath,
  generateUtilityClasses,
  type ResolvedTailwindConfig,
} from 'src/parsers/tailwind-parser'
import type { TailwindConfig } from 'src/types/options'
import { DEFAULT_TAILWIND_VARIANTS } from 'src/utils/tailwind-variants'

/**
 * Helper function to check if a class name matches a glob-style pattern
 * @param className - The class name to test
 * @param pattern - The pattern to match against (supports * wildcard)
 * @returns true if the class name matches the pattern
 */
function matchesPattern(className: string, pattern: string): boolean {
  // Escape special regex characters except *
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  // Replace * with .*
  const regexPattern = escapedPattern.replace(/\*/g, '.*')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(className)
}

/**
 * Interface for the class registry
 */
export interface ClassRegistry {
  /**
   * Checks if a class name is valid according to the registry
   * @param className - The class name to validate
   * @returns true if the class name is valid
   */
  isValid(className: string): boolean

  /**
   * Gets all literal class names in the registry (excludes patterns)
   * @returns Set of all literal class names
   */
  getAllClasses(): Set<string>

  /**
   * Gets all valid Tailwind variants (for variant validation)
   * @returns Set of all valid variant names
   */
  getValidVariants(): Set<string>
}

/**
 * Cache for class registries
 * Key: JSON-stringified configuration
 * Value: ClassRegistry instance
 */
let cachedRegistry: ClassRegistry | null = null
let cacheKey: string | null = null

/**
 * Represents a resolved CSS file with its path and modification time
 */
interface ResolvedFile {
  path: string
  mtime: number
}

/**
 * Resolves CSS file patterns to actual files with modification times
 * @param cssPatterns - Glob patterns for CSS files
 * @param cwd - Current working directory for resolving relative paths
 * @returns Array of resolved files with paths and modification times
 */
function resolveFilesWithMtimes(
  cssPatterns: string[],
  cwd: string,
): ResolvedFile[] {
  if (cssPatterns.length === 0) {
    return []
  }

  try {
    // Check if patterns are absolute or relative
    const isAbsolutePattern = cssPatterns.some(pattern =>
      path.isAbsolute(pattern),
    )

    const files = fg.sync(cssPatterns, {
      cwd: isAbsolutePattern ? undefined : cwd,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    })

    // Get modification times for each file
    return files
      .map(file => {
        try {
          const stats = fs.statSync(file)
          return { path: file, mtime: stats.mtimeMs }
        } catch (error) {
          // If we can't stat the file, skip it
          console.warn(`Warning: Failed to stat file "${file}":`, error)
          return null
        }
      })
      .filter((file): file is ResolvedFile => file !== null)
  } catch (globError) {
    console.warn('Warning: Failed to find CSS files:', globError)
    return []
  }
}

/**
 * Creates a cache key from configuration and resolved files
 */
function createCacheKey(
  resolvedFiles: ResolvedFile[],
  whitelist: string[],
  tailwindConfig: boolean | TailwindConfig | undefined,
  cwd: string,
): string {
  // Include file paths and mtimes in the cache key
  // This ensures cache invalidates when files are added/removed/modified
  const fileData = resolvedFiles.map(f => ({ path: f.path, mtime: f.mtime }))
  return JSON.stringify({ fileData, whitelist, tailwindConfig, cwd })
}

/**
 * Builds a class registry from CSS files, Tailwind config, and whitelist patterns
 * @param resolvedFiles - Pre-resolved CSS files with paths and mtimes
 * @param whitelist - Array of class name patterns (supports wildcards)
 * @param tailwindClasses - Pre-loaded Tailwind classes (optional)
 * @param validVariants - Pre-loaded valid Tailwind variants (optional)
 * @returns ClassRegistry instance
 */
function buildClassRegistry(
  resolvedFiles: ResolvedFile[],
  whitelist: string[],
  tailwindClasses: Set<string> | undefined,
  validVariants: Set<string> | undefined,
): ClassRegistry {
  const literalClasses = new Set<string>()

  // Extract classes from CSS files
  for (const file of resolvedFiles) {
    try {
      const content = fs.readFileSync(file.path, 'utf-8')
      const ext = path.extname(file.path).toLowerCase()

      // Handle SCSS files differently from CSS files
      let classes: Set<string>
      if (ext === '.scss') {
        classes = extractClassNamesFromScss(content, file.path)
      } else {
        classes = extractClassNamesFromCss(content)
      }

      classes.forEach(cls => literalClasses.add(cls))
    } catch (readError) {
      console.warn(
        `Warning: Failed to read CSS/SCSS file "${file.path}":`,
        readError,
      )
    }
  }

  // Add literal whitelist entries (non-wildcard patterns) to the set
  whitelist.forEach(pattern => {
    if (!pattern.includes('*')) {
      literalClasses.add(pattern)
    }
  })

  // Add Tailwind classes if provided
  if (tailwindClasses) {
    tailwindClasses.forEach(cls => literalClasses.add(cls))
  }

  // Extract wildcard patterns from whitelist
  const wildcardPatterns = whitelist.filter(pattern => pattern.includes('*'))

  return {
    isValid(className: string): boolean {
      // Check literal classes first (O(1) lookup)
      if (literalClasses.has(className)) {
        return true
      }

      // Check wildcard patterns
      return wildcardPatterns.some(pattern =>
        matchesPattern(className, pattern),
      )
    },

    getAllClasses(): Set<string> {
      return new Set(literalClasses)
    },

    getValidVariants(): Set<string> {
      return validVariants || new Set()
    },
  }
}

/**
 * Gets or creates a class registry with caching
 * @param cssPatterns - Glob patterns for CSS files to validate against
 * @param whitelist - Array of class name patterns that are always valid
 * @param tailwindConfig - Tailwind configuration (boolean or config object)
 * @param cwd - Current working directory for resolving relative paths
 * @returns ClassRegistry instance
 */
export function getClassRegistry(
  cssPatterns: string[],
  whitelist: string[],
  tailwindConfig: boolean | TailwindConfig | undefined,
  cwd: string,
): ClassRegistry {
  // Resolve CSS files with modification times
  const resolvedFiles = resolveFilesWithMtimes(cssPatterns, cwd)

  const currentCacheKey = createCacheKey(
    resolvedFiles,
    whitelist,
    tailwindConfig,
    cwd,
  )

  // Return cached registry if configuration and files haven't changed
  if (cachedRegistry && cacheKey === currentCacheKey) {
    return cachedRegistry
  }

  // Load Tailwind classes and variants synchronously if enabled
  // Note: This blocks, but only once per config change due to caching
  let tailwindClasses: Set<string> | undefined
  let validVariants: Set<string> | undefined
  if (tailwindConfig) {
    try {
      // Use dynamic import in a blocking way for initial load
      // The classes will be cached after first load
      const tailwindData = loadTailwindClassesSync(tailwindConfig, cwd)
      tailwindClasses = tailwindData.classes
      validVariants = tailwindData.variants
    } catch (error) {
      console.warn('Warning: Failed to load Tailwind classes:', error)
    }
  }

  // Build new registry with pre-resolved files
  cachedRegistry = buildClassRegistry(
    resolvedFiles,
    whitelist,
    tailwindClasses,
    validVariants,
  )
  cacheKey = currentCacheKey

  return cachedRegistry
}

/**
 * Result of loading Tailwind configuration
 */
interface TailwindLoadResult {
  classes: Set<string>
  variants: Set<string>
}

/**
 * Synchronously loads Tailwind classes and variants (blocking operation)
 * This is necessary because ESLint rules must be synchronous
 * @param tailwindConfig - Tailwind configuration
 * @param cwd - Current working directory
 * @returns Object containing utility classes and valid variants
 */
function loadTailwindClassesSync(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): TailwindLoadResult {
  // Create a require function for loading CommonJS modules from ES modules
  const require = createRequire(import.meta.url)

  const configPath =
    typeof tailwindConfig === 'object' ? tailwindConfig.config : undefined

  const resolvedConfigPath = findTailwindConfigPath(configPath, cwd)

  if (!resolvedConfigPath) {
    console.warn(
      'Warning: Tailwind config file not found, skipping Tailwind validation',
    )
    return { classes: new Set(), variants: new Set() }
  }

  try {
    // Use require for synchronous loading (CommonJS/ESM compatible)
    const configModule = require(resolvedConfigPath)
    const userConfig = configModule.default || configModule

    // Use Tailwind's resolveConfig
    const resolveConfig = require('tailwindcss/resolveConfig')
    const resolved = resolveConfig(userConfig) as ResolvedTailwindConfig

    // Extract safelist classes
    const safelistClasses = extractSafelistClasses(resolved.safelist || [])

    // Generate utility classes from theme configuration
    const utilityClasses = generateUtilityClasses(resolved)

    // Combine safelist and generated utilities
    const allClasses = new Set<string>([...safelistClasses, ...utilityClasses])

    // Extract custom variants from config
    const customVariants = extractVariantsFromConfig(resolved)

    // Combine default variants with custom variants
    const allVariants = new Set([
      ...DEFAULT_TAILWIND_VARIANTS,
      ...customVariants,
    ])

    return { classes: allClasses, variants: allVariants }
  } catch (error) {
    console.warn(
      `Warning: Failed to load Tailwind config from "${resolvedConfigPath}":`,
      error,
    )
    return { classes: new Set(), variants: new Set() }
  }
}

/**
 * Clears the cache (useful for testing)
 */
export function clearCache(): void {
  cachedRegistry = null
  cacheKey = null
}
