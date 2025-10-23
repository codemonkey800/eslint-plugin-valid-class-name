import type { TailwindConfig } from 'src/types/options'
import { logger } from 'src/utils/logger'

import { createCacheKey } from './cache-key'
import {
  clearFileResolverCache,
  getCachedOrResolveFiles,
} from './file-resolver'
import { buildClassRegistry, type ClassRegistry } from './registry-builder'
import { createTailwindValidator } from './tailwind-loader'

// Re-export ClassRegistry interface for backward compatibility
export type { ClassRegistry }

/**
 * Module-level cache for class registries.
 *
 * Key: SHA-256 hash of configuration (files, allowlist, tailwind config, cwd)
 * Value: ClassRegistry instance
 *
 * NOTE: This cache is shared across all ESLint instances in the same Node.js process.
 * In test environments, use clearCache() to reset state between tests to avoid
 * cache pollution.
 */
let cachedRegistry: ClassRegistry | null = null
let cacheKey: string | null = null

/**
 * Gets or creates a class registry with caching
 * @param cssPatterns - Glob patterns for CSS files to validate against
 * @param allowlist - Array of class name patterns that are always valid
 * @param blocklist - Array of class name patterns that are forbidden
 * @param tailwindConfig - Tailwind configuration (boolean or config object)
 * @param cwd - Current working directory for resolving relative paths
 * @returns ClassRegistry instance
 */
export function getClassRegistry(
  cssPatterns: string[],
  allowlist: string[],
  blocklist: string[],
  tailwindConfig: boolean | TailwindConfig | undefined,
  cwd: string,
): ClassRegistry {
  // Resolve CSS files with modification times (uses cached results when possible)
  const resolvedFiles = getCachedOrResolveFiles(cssPatterns, cwd)

  const currentCacheKey = createCacheKey(
    resolvedFiles,
    allowlist,
    blocklist,
    tailwindConfig,
    cwd,
  )

  // Return cached registry if configuration and files haven't changed
  if (cachedRegistry && cacheKey === currentCacheKey) {
    return cachedRegistry
  }

  // Create Tailwind validator synchronously if enabled
  // Note: This blocks, but only once per config change due to caching
  let tailwindUtils = null
  if (tailwindConfig) {
    try {
      tailwindUtils = createTailwindValidator(tailwindConfig, cwd)
    } catch (error) {
      logger.warn('Failed to create Tailwind validator', error)
    }
  }

  // Build new registry with pre-resolved files
  cachedRegistry = buildClassRegistry(
    resolvedFiles,
    allowlist,
    blocklist,
    tailwindUtils,
    cwd,
  )
  cacheKey = currentCacheKey

  return cachedRegistry
}

/**
 * Clears all caches (useful for testing)
 */
export function clearCache(): void {
  cachedRegistry = null
  cacheKey = null
  clearFileResolverCache()
}
