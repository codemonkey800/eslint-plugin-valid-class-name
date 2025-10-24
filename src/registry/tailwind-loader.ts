import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { findTailwindConfigPath } from 'src/parsers/tailwind-parser'
import type { TailwindConfig } from 'src/types/options'
import { logger } from 'src/utils/logger'
import { TailwindUtils } from 'tailwind-api-utils'

/**
 * IMPORTANT: globalThis Mutation Side Effect
 *
 * This module mutates `globalThis.require` to provide CommonJS require() functionality
 * in ESM context. This is required because tailwind-api-utils internally uses require()
 * but is distributed as an ES module.
 *
 * Side effects:
 * - Sets `globalThis.require` if it doesn't exist
 * - Affects the entire Node.js process (not scoped to this module)
 * - Could potentially conflict with other code that expects `globalThis.require` to be undefined
 *
 * This is a known limitation when bridging ESM and CJS dependencies.
 */
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

    // Load config synchronously for v3
    // TailwindUtils will read separator and prefix directly from the config file
    utils.loadConfigV3(resolvedConfigPath, {
      pwd: path.dirname(resolvedConfigPath),
    })

    return utils
  } catch (error) {
    logger.warn(
      `Failed to create Tailwind validator from "${resolvedConfigPath}"`,
      error,
    )
    return null
  }
}
