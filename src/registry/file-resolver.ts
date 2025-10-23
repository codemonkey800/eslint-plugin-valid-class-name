import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'
import { logger } from 'src/utils/logger'

/**
 * Represents a resolved CSS file with its path and modification time
 */
export interface ResolvedFile {
  path: string
  mtime: number
}

/**
 * Cache for glob resolution results
 */
interface GlobCacheEntry {
  patterns: string[]
  cwd: string
  resolvedFiles: ResolvedFile[]
  timestamp: number
}

const GLOB_CACHE_TTL_MS = 1000 // 1 second

/**
 * Module-level cache for glob resolution results.
 *
 * NOTE: This cache is shared across all ESLint instances in the same Node.js process.
 * In test environments, use clearFileResolverCache() to reset state between tests
 * to avoid cache pollution.
 */
let globCacheEntry: GlobCacheEntry | null = null

/**
 * Compares two arrays for equality
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns true if arrays have the same elements in the same order
 */
function arraysEqual(arr1: string[], arr2: string[]): boolean {
  return (
    arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx])
  )
}

/**
 * Gets cached glob resolution results or resolves files fresh
 * This function caches glob results to avoid expensive file system operations on every call.
 * Cache is valid for GLOB_CACHE_TTL_MS (1 second) without revalidation.
 *
 * @param patterns - Glob patterns for CSS files
 * @param cwd - Current working directory for resolving relative paths
 * @returns Array of resolved files with paths and modification times
 */
export function getCachedOrResolveFiles(
  patterns: string[],
  cwd: string,
): ResolvedFile[] {
  // Early return for empty patterns
  if (patterns.length === 0) {
    return []
  }

  const now = Date.now()

  // Check if cache exists, matches patterns/cwd, and is within TTL
  if (
    globCacheEntry &&
    arraysEqual(globCacheEntry.patterns, patterns) &&
    globCacheEntry.cwd === cwd &&
    now - globCacheEntry.timestamp < GLOB_CACHE_TTL_MS
  ) {
    return globCacheEntry.resolvedFiles // Cache hit!
  }

  // Cache miss, expired, or invalidated - do full resolution
  const resolvedFiles = resolveFilesWithMtimes(patterns, cwd)

  // Update cache
  globCacheEntry = {
    patterns: [...patterns], // Copy to protect cache key integrity from external array mutations
    cwd,
    resolvedFiles,
    timestamp: now,
  }

  return resolvedFiles
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
 * Clears the file resolver cache (useful for testing)
 */
export function clearFileResolverCache(): void {
  globCacheEntry = null
}
