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
import type { TailwindUtils } from 'tailwind-api-utils'
import { TailwindUtils as TailwindUtilsImpl } from 'tailwind-api-utils'

/**
 * Minimal interface for Tailwind v4 validation via worker thread
 * Implements only the methods and properties needed for class name validation
 */
interface TailwindV4Validator {
  readonly isV4: true
  readonly context: null
  isValidClassName(className: string): boolean
}

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
 * For Tailwind CSS v3: Loads JS config synchronously and returns TailwindUtils
 * For Tailwind CSS v4: Returns a minimal validator that delegates to synckit worker
 *
 * @param tailwindConfig - Tailwind configuration
 * @param cwd - Current working directory
 * @returns TailwindUtils (v3) or TailwindV4Validator (v4) or null if loading fails
 */
export function createTailwindValidator(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): TailwindUtils | TailwindV4Validator | null {
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
        logger.warn(
          `Tailwind config file not found at "${explicitConfigPath}" (cwd: ${cwd})`,
        )
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
          `Tailwind config file not found in "${cwd}", skipping Tailwind validation`,
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
    const utils = new TailwindUtilsImpl({ paths: [cwd] })

    // Handle v4 with synckit worker for async support
    if (isV4Config) {
      // Return a minimal validator that delegates to the worker thread
      // This makes async validation appear synchronous to ESLint rules
      const v4Validator: TailwindV4Validator = {
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
      }
      return v4Validator
    }

    // Load config synchronously for v3
    // TailwindUtils will read separator and prefix directly from the config file
    utils.loadConfigV3(resolvedConfigPath, {
      pwd: path.dirname(resolvedConfigPath),
    })

    return utils
  } catch (error) {
    logger.warn(`Failed to create Tailwind validator (cwd: ${cwd})`, error)
    return null
  }
}
