import { createRequire } from 'module'
import path from 'path'
import { runAsWorker } from 'synckit'
import { TailwindUtils } from 'tailwind-api-utils'

/**
 * Worker thread for async Tailwind CSS v4 validation
 *
 * This worker is spawned by synckit to handle async validation operations
 * for Tailwind CSS v4, which requires async config loading.
 *
 * The main thread calls this via createSyncFn(), making it appear synchronous
 * to ESLint rules while actually running async operations in a worker thread.
 */

// Ensure globalThis.require is available for tailwind-api-utils
if (
  typeof (globalThis as unknown as { require?: unknown }).require ===
  'undefined'
) {
  ;(globalThis as unknown as { require: NodeRequire }).require = createRequire(
    import.meta.url,
  )
}

interface WorkerInput {
  configPath: string
  className: string
  cwd: string
  isV4: boolean
}

// Cache for loaded TailwindUtils instances to avoid reloading config for every validation
const configCache = new Map<string, TailwindUtils>()

runAsWorker(async ({ configPath, className, cwd, isV4 }: WorkerInput) => {
  try {
    // Check cache first
    let utils = configCache.get(configPath)

    if (!utils || !utils.context) {
      // Create new TailwindUtils instance
      utils = new TailwindUtils({ paths: [cwd] })

      // Load config based on version
      if (isV4) {
        // For v4, load CSS config asynchronously
        await utils.loadConfigV4(configPath, {
          pwd: path.dirname(configPath),
        })
      } else {
        // For v3, load JS config synchronously (within async context)
        utils.loadConfigV3(configPath, {
          pwd: path.dirname(configPath),
        })
      }

      // Cache the loaded utils
      configCache.set(configPath, utils)
    }

    // Validate the class name
    return utils.isValidClassName(className)
  } catch (error) {
    // Log error and return false (treat as invalid)
    console.error(
      `Tailwind worker error validating "${className}":`,
      error instanceof Error ? error.message : String(error),
    )
    return false
  }
})
