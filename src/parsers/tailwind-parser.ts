import fs from 'fs'
import path from 'path'
import { logger } from 'src/utils/logger'

/**
 * Default Tailwind config file names to search for
 */
const CONFIG_FILE_NAMES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
]

/**
 * Finds the Tailwind configuration file
 * @param configPath - Explicit path to config file (optional)
 * @param cwd - Current working directory
 * @returns Absolute path to config file, or null if not found
 */
export function findTailwindConfigPath(
  configPath: string | undefined,
  cwd: string,
): string | null {
  // If explicit path provided, resolve and check if it exists
  if (configPath) {
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(cwd, configPath)

    if (fs.existsSync(absolutePath)) {
      return absolutePath
    }

    logger.warn(`Tailwind config file not found at "${configPath}"`)
    return null
  }

  // Auto-detect: search for common config file names
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.resolve(cwd, fileName)
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  // Not found
  return null
}
