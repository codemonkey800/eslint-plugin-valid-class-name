import crypto from 'crypto'
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
  generateTailwindBuildClassesSync,
  generateUtilityClasses,
  type ResolvedTailwindConfig,
} from 'src/parsers/tailwind-parser'
import type { TailwindConfig } from 'src/types/options'
import { logger } from 'src/utils/logger'
import { compilePattern } from 'src/utils/pattern-matcher'
import { DEFAULT_TAILWIND_VARIANTS } from 'src/utils/tailwind-variants'
import { isResolvedTailwindConfig } from 'src/utils/type-guards'

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
   * Checks if a class name is a valid Tailwind class (excludes CSS classes)
   * Used when validating classes with Tailwind variants
   * @param className - The class name to validate
   * @returns true if the class name is a Tailwind utility or matches whitelist pattern
   */
  isTailwindClass(className: string): boolean

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
          logger.warn(`Failed to stat file "${file}"`, error)
          return null
        }
      })
      .filter((file): file is ResolvedFile => file !== null)
  } catch (globError) {
    logger.warn('Failed to find CSS files', globError)
    return []
  }
}

/**
 * Creates a cache key from configuration and resolved files using SHA-256 hash
 *
 * Note: This cache key automatically invalidates when files are added/removed
 * because resolveFilesWithMtimes() is called on each lint run, returning the
 * current file set. Any changes to files (additions, removals, or modifications)
 * will result in a different cache key, triggering cache invalidation.
 *
 * Performance: Uses incremental hashing to avoid creating large intermediate strings.
 * Returns a fixed 64-character hash regardless of project size.
 */
function createCacheKey(
  resolvedFiles: ResolvedFile[],
  whitelist: string[],
  tailwindConfig: boolean | TailwindConfig | undefined,
  cwd: string,
): string {
  const hash = crypto.createHash('sha256')

  // Hash file paths and modification times directly
  // Avoids creating large intermediate objects/strings
  for (const file of resolvedFiles) {
    hash.update(file.path)
    hash.update(String(file.mtime))
  }

  // Hash whitelist patterns directly
  for (const pattern of whitelist) {
    hash.update(pattern)
  }

  // Hash Tailwind config (only place where JSON.stringify is needed)
  // This is typically small compared to file lists
  // Handle undefined explicitly since JSON.stringify(undefined) returns undefined
  hash.update(
    tailwindConfig === undefined ? 'undefined' : JSON.stringify(tailwindConfig),
  )

  // Hash current working directory
  hash.update(cwd)

  // Return fixed-length 64-character hex string
  return hash.digest('hex')
}

/**
 * Builds a class registry from CSS files, Tailwind config, and whitelist patterns
 *
 * Note: Uses synchronous file I/O (fs.readFileSync) because ESLint rules must be
 * synchronous. Performance impact is mitigated by the caching strategy - files are
 * only read when the cache is invalid (i.e., when configuration or files change).
 *
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
  // Separate CSS classes from Tailwind classes
  const cssClasses = new Set<string>()
  const tailwindLiteralClasses = new Set<string>()
  const whitelistLiteralClasses = new Set<string>()

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

      classes.forEach(cls => cssClasses.add(cls))
    } catch (readError) {
      logger.warn(`Failed to read CSS/SCSS file "${file.path}"`, readError)
    }
  }

  // Add literal whitelist entries (non-wildcard patterns) to whitelist set
  whitelist.forEach(pattern => {
    if (!pattern.includes('*')) {
      whitelistLiteralClasses.add(pattern)
    }
  })

  // Add Tailwind classes if provided
  if (tailwindClasses) {
    tailwindClasses.forEach(cls => tailwindLiteralClasses.add(cls))
  }

  // Combine all literal classes for general validation
  const allLiteralClasses = new Set<string>([
    ...cssClasses,
    ...tailwindLiteralClasses,
    ...whitelistLiteralClasses,
  ])

  // Combine Tailwind and whitelist for Tailwind-only validation
  const tailwindOnlyLiteralClasses = new Set<string>([
    ...tailwindLiteralClasses,
    ...whitelistLiteralClasses,
  ])

  // Extract wildcard patterns from whitelist and compile them to RegExp
  const wildcardPatterns = whitelist.filter(pattern => pattern.includes('*'))
  const compiledWildcardPatterns = wildcardPatterns
    .map(compilePattern)
    .filter((regex): regex is RegExp => regex !== null)

  return {
    isValid(className: string): boolean {
      // Check literal classes first (O(1) lookup)
      if (allLiteralClasses.has(className)) {
        return true
      }

      // Check wildcard patterns using pre-compiled RegExp
      return compiledWildcardPatterns.some(regex => regex.test(className))
    },

    isTailwindClass(className: string): boolean {
      // Check Tailwind + whitelist literal classes first (O(1) lookup)
      if (tailwindOnlyLiteralClasses.has(className)) {
        return true
      }

      // Check wildcard patterns using pre-compiled RegExp
      return compiledWildcardPatterns.some(regex => regex.test(className))
    },

    getAllClasses(): Set<string> {
      return new Set(allLiteralClasses)
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
      logger.warn('Failed to load Tailwind classes', error)
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
    logger.warn('Tailwind config file not found, skipping Tailwind validation')
    return { classes: new Set(), variants: new Set() }
  }

  // Defensive check: ensure file still exists before requiring
  if (!fs.existsSync(resolvedConfigPath)) {
    logger.warn(
      `Tailwind config file no longer exists at "${resolvedConfigPath}"`,
    )
    return { classes: new Set(), variants: new Set() }
  }

  try {
    // Use require for synchronous loading (CommonJS/ESM compatible)
    const configModule = require(resolvedConfigPath)
    const userConfig = configModule.default || configModule

    // Use Tailwind's resolveConfig
    const resolveConfig = require('tailwindcss/resolveConfig')
    const resolved = resolveConfig(userConfig)

    // Validate the resolved config structure
    if (!isResolvedTailwindConfig(resolved)) {
      logger.warn(
        'Invalid Tailwind config structure returned from resolveConfig',
      )
      return { classes: new Set(), variants: new Set() }
    }

    const validResolved = resolved as ResolvedTailwindConfig

    // Determine if we should include plugin classes
    const includePluginClasses =
      typeof tailwindConfig === 'object'
        ? tailwindConfig.includePluginClasses !== false // Default to true
        : true

    // Extract safelist classes
    const safelistClasses = extractSafelistClasses(validResolved.safelist || [])

    // Generate utility classes from theme configuration
    const utilityClasses = generateUtilityClasses(validResolved)

    // Generate classes from Tailwind build (includes plugin-generated classes)
    // Only if includePluginClasses is enabled
    let buildClasses = new Set<string>()
    if (includePluginClasses) {
      buildClasses = generateTailwindBuildClassesSync(resolvedConfigPath)
    }

    // Combine all sources: safelist, static generation, and build
    const allClasses = new Set<string>([
      ...safelistClasses,
      ...utilityClasses,
      ...buildClasses,
    ])

    // Extract custom variants from config
    const customVariants = extractVariantsFromConfig(validResolved)

    // Combine default variants with custom variants
    const allVariants = new Set([
      ...DEFAULT_TAILWIND_VARIANTS,
      ...customVariants,
    ])

    return { classes: allClasses, variants: allVariants }
  } catch (error) {
    logger.warn(
      `Failed to load Tailwind config from "${resolvedConfigPath}"`,
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
