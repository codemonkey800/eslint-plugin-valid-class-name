import fs from 'fs'
import path from 'path'
import type { TailwindUtils } from 'tailwind-api-utils'

import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from 'src/parsers/css-parser'
import type { ResolvedFile } from 'src/registry/file-resolver'
import type { TailwindV4Validator } from 'src/registry/tailwind-loader'
import { logger } from 'src/utils/logger'

/**
 * Special Tailwind utility classes that are always valid but may not be
 * recognized by the TailwindUtils API.
 *
 * - `group`: Marks a parent element for group-* variant modifiers
 * - `peer`: Marks a sibling element for peer-* variant modifiers
 *
 * These classes are fundamental to Tailwind's variant system and should
 * always be considered valid, regardless of API validation results.
 */
const TAILWIND_SPECIAL_CLASSES = new Set(['group', 'peer'])

/**
 * Interface for the class registry
 */
export interface ClassRegistry {
  /**
   * Checks if a class name is valid according to the registry
   * @param className - The class name to validate
   * @returns true if the class name is valid
   */
  isValid(className: string): boolean

  /**
   * Checks if a class name is a valid Tailwind class (excludes CSS classes)
   * Used when validating classes with Tailwind variants
   * @param className - The class name to validate
   * @returns true if the class name is a Tailwind utility or matches allowlist pattern
   */
  isTailwindClass(className: string): boolean

  /**
   * Checks if a class name is ONLY from Tailwind (not CSS or allowlist)
   * Used to determine if we should validate variants through TailwindUtils API
   * @param className - The class name to validate
   * @returns true if the class name is validated by TailwindUtils only
   */
  isTailwindOnly(className: string): boolean

  /**
   * Checks if a class name is from CSS files
   * @param className - The class name to check
   * @returns true if the class name is from a CSS file
   */
  isCssClass(className: string): boolean

  /**
   * Gets all literal class names in the registry (excludes patterns)
   * Note: When using Tailwind API mode, this only returns CSS and allowlist classes,
   * not Tailwind classes (as they cannot be enumerated)
   * @returns Set of all literal class names
   */
  getAllClasses(): Set<string>

  /**
   * Gets all valid Tailwind variants
   * Note: When using Tailwind API mode, this returns an empty set as variant validation
   * is handled by the API along with the full class name
   * @returns Set of all valid variant names (empty when using API mode)
   */
  getValidVariants(): Set<string>
}

/**
 * Builds a class registry from CSS files and Tailwind config
 *
 * Note: Uses synchronous file I/O (fs.readFileSync) because ESLint rules must be
 * synchronous. Performance impact is mitigated by the caching strategy - files are
 * only read when the cache is invalid (i.e., when configuration or files change).
 *
 * @param resolvedFiles - Pre-resolved CSS files with paths and mtimes
 * @param tailwindUtils - TailwindUtils instance for validating Tailwind classes (optional)
 * @param cwd - Current working directory for resolving SCSS imports
 * @returns ClassRegistry instance
 */
export function buildClassRegistry(
  resolvedFiles: ResolvedFile[],
  tailwindUtils: TailwindUtils | TailwindV4Validator | null | undefined,
  cwd: string,
): ClassRegistry {
  // Extract CSS classes
  const cssClasses = new Set<string>()

  // Extract classes from CSS files
  for (const file of resolvedFiles) {
    try {
      const content = fs.readFileSync(file.path, 'utf-8')
      const ext = path.extname(file.path).toLowerCase()

      // Handle SCSS files differently from CSS files
      let classes: Set<string>
      if (ext === '.scss') {
        classes = extractClassNamesFromScss(content, file.path, cwd)
      } else {
        classes = extractClassNamesFromCss(content)
      }

      classes.forEach(cls => cssClasses.add(cls))
    } catch (readError) {
      logger.warn(`Failed to read CSS/SCSS file "${file.path}"`, readError)
    }
  }

  // Performance optimization: Keep source Sets separate instead of merging them.
  // This avoids O(n) Set creation overhead during registry build.
  // Validation checks happen in order of likelihood for early returns.
  return {
    isValid(className: string): boolean {
      // Check CSS classes first (project-specific classes)
      if (cssClasses.has(className)) {
        return true
      }

      // Check special Tailwind classes (group, peer)
      if (tailwindUtils && TAILWIND_SPECIAL_CLASSES.has(className)) {
        return true
      }

      // Check Tailwind classes via API (if enabled)
      if (tailwindUtils?.isValidClassName(className)) {
        return true
      }

      return false
    },

    isTailwindClass(className: string): boolean {
      // Check special Tailwind classes (group, peer)
      if (tailwindUtils && TAILWIND_SPECIAL_CLASSES.has(className)) {
        return true
      }

      // Check Tailwind classes via API (if enabled)
      if (tailwindUtils?.isValidClassName(className)) {
        return true
      }

      return false
    },

    isTailwindOnly(className: string): boolean {
      // Check special Tailwind classes (group, peer)
      if (tailwindUtils && TAILWIND_SPECIAL_CLASSES.has(className)) {
        return true
      }

      // Check Tailwind classes via API (if enabled)
      return tailwindUtils?.isValidClassName(className) ?? false
    },

    isCssClass(className: string): boolean {
      // Check if the class is from a CSS file
      return cssClasses.has(className)
    },

    getAllClasses(): Set<string> {
      // Return CSS classes (only used in tests, not hot path)
      // Note: Does not include Tailwind classes when using API mode
      return new Set(cssClasses)
    },

    getValidVariants(): Set<string> {
      // Return empty set when using API mode
      // Variant validation is handled by the TailwindUtils API
      return new Set()
    },
  }
}
