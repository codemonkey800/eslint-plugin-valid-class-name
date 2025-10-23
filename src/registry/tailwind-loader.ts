import fs from 'fs'
import { createRequire } from 'module'
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
import { DEFAULT_TAILWIND_VARIANTS } from 'src/utils/tailwind-variants'
import { isResolvedTailwindConfig } from 'src/utils/type-guards'

/**
 * Result of loading Tailwind configuration
 */
export interface TailwindLoadResult {
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
export function loadTailwindClassesSync(
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
