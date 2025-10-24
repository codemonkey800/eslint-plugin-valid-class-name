import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { findTailwindConfigPath } from 'src/parsers/tailwind-parser'
import type { TailwindConfig } from 'src/types/options'
import { logger } from 'src/utils/logger'
import { TailwindUtils } from 'tailwind-api-utils'

// Make require available globally for tailwind-api-utils
// This is needed because tailwind-api-utils uses require() internally
// but is distributed as an ES module
if (
  typeof (globalThis as unknown as { require?: unknown }).require ===
  'undefined'
) {
  ;(globalThis as unknown as { require: NodeRequire }).require = createRequire(
    import.meta.url,
  )
}

/**
 * Synchronously creates a Tailwind validator using tailwind-api-utils
 * This is necessary because ESLint rules must be synchronous
 * @param tailwindConfig - Tailwind configuration
 * @param cwd - Current working directory
 * @returns TailwindUtils instance or null if loading fails
 */
export function createTailwindValidator(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): TailwindUtils | null {
  const configPath =
    typeof tailwindConfig === 'object' ? tailwindConfig.config : undefined

  const resolvedConfigPath = findTailwindConfigPath(configPath, cwd)

  if (!resolvedConfigPath) {
    logger.warn('Tailwind config file not found, skipping Tailwind validation')
    return null
  }

  // Defensive check: ensure file still exists before requiring
  if (!fs.existsSync(resolvedConfigPath)) {
    logger.warn(
      `Tailwind config file no longer exists at "${resolvedConfigPath}"`,
    )
    return null
  }

  try {
    // Create TailwindUtils instance
    const utils = new TailwindUtils({ paths: [cwd] })

    // Load config synchronously (v3 only)
    // Note: v4 support requires async initialization
    if (utils.isV4) {
      logger.warn(
        'Tailwind CSS v4 is not yet supported. Please use Tailwind CSS v3.',
      )
      return null
    }

    // Extract options
    const options = {
      pwd: path.dirname(resolvedConfigPath),
      separator: undefined as string | undefined,
      prefix: undefined as string | undefined,
    }

    if (typeof tailwindConfig === 'object') {
      // User can override separator and prefix if needed (future enhancement)
      // For now, let TailwindUtils read it from the config
    }

    // Load config synchronously for v3
    utils.loadConfigV3(resolvedConfigPath, options)

    return utils
  } catch (error) {
    logger.warn(
      `Failed to create Tailwind validator from "${resolvedConfigPath}"`,
      error,
    )
    return null
  }
}
