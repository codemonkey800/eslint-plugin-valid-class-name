import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import {
  findTailwindConfigPath,
  findTailwindCSSConfig,
} from 'src/parsers/tailwind-parser'
import type { TailwindConfig } from 'src/types/options'
import { logger } from 'src/utils/logger'
import { createSyncFn } from 'synckit'
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
 * Sync wrapper around the async Tailwind worker for v4 support
 *
 * This uses synckit to make async validation appear synchronous to ESLint rules.
 * The worker runs in a separate thread, allowing async operations without blocking.
 */
const validateClassNameWorker = createSyncFn<
  (input: {
    configPath: string
    className: string
    cwd: string
    isV4: boolean
  }) => boolean
>(new URL('./registry/tailwind-worker.js', import.meta.url).pathname)

/**
 * Creates a Tailwind validator using tailwind-api-utils
 *
 * For Tailwind CSS v3: Loads JS config synchronously
 * For Tailwind CSS v4: Loads CSS config and uses synckit worker for async validation
 *
 * @param tailwindConfig - Tailwind configuration
 * @param cwd - Current working directory
 * @returns TailwindUtils instance or null if loading fails
 */
export function createTailwindValidator(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): TailwindUtils | null {
  try {
    // Determine config path and detect version based on file presence
    let resolvedConfigPath: string | null = null
    let isV4Config = false

    // If explicit config path provided, use it
    const explicitConfigPath =
      typeof tailwindConfig === 'object' ? tailwindConfig.config : undefined

    if (explicitConfigPath) {
      const absolutePath = path.isAbsolute(explicitConfigPath)
        ? explicitConfigPath
        : path.resolve(cwd, explicitConfigPath)

      if (fs.existsSync(absolutePath)) {
        resolvedConfigPath = absolutePath
        // Detect v4 by checking if it's a CSS file with @import 'tailwindcss'
        if (absolutePath.endsWith('.css')) {
          const content = fs.readFileSync(absolutePath, 'utf-8')
          isV4Config =
            content.includes("@import 'tailwindcss'") ||
            content.includes('@import "tailwindcss"')
        }
      } else {
        logger.warn(`Tailwind config file not found at "${explicitConfigPath}"`)
        return null
      }
    } else {
      // Auto-detect: try CSS first (v4), then JS (v3)
      resolvedConfigPath = findTailwindCSSConfig(cwd)
      if (resolvedConfigPath) {
        isV4Config = true
      } else {
        resolvedConfigPath = findTailwindConfigPath(undefined, cwd)
        isV4Config = false
      }

      if (!resolvedConfigPath) {
        logger.warn(
          'Tailwind config file not found, skipping Tailwind validation',
        )
        return null
      }
    }

    // Defensive check: ensure file still exists
    if (!fs.existsSync(resolvedConfigPath)) {
      logger.warn(
        `Tailwind config file no longer exists at "${resolvedConfigPath}"`,
      )
      return null
    }

    // Create TailwindUtils instance
    const utils = new TailwindUtils({ paths: [cwd] })

    // Handle v4 with synckit worker for async support
    if (isV4Config) {
      // Return a wrapper that delegates to the worker thread
      // This makes async validation appear synchronous to ESLint rules
      return {
        isV4: true,
        context: null, // Context will be loaded in worker
        isValidClassName: (className: string) => {
          return validateClassNameWorker({
            configPath: resolvedConfigPath,
            className,
            cwd,
            isV4: true,
          })
        },
      } as TailwindUtils
    }

    // Load config synchronously for v3
    // TailwindUtils will read separator and prefix directly from the config file
    utils.loadConfigV3(resolvedConfigPath, {
      pwd: path.dirname(resolvedConfigPath),
    })

    return utils
  } catch (error) {
    logger.warn(`Failed to create Tailwind validator`, error)
    return null
  }
}
