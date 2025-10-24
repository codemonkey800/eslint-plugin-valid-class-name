import crypto from 'crypto'
import type { TailwindConfig } from 'src/types/options'

import type { ResolvedFile } from './file-resolver'

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
export function createCacheKey(
  resolvedFiles: ResolvedFile[],
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
