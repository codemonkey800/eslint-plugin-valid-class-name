import fs from 'fs'
import path from 'path'
import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from 'src/parsers/css-parser'
import type { ResolvedFile } from 'src/registry/file-resolver'
import { logger } from 'src/utils/logger'
import { compilePattern } from 'src/utils/pattern-matcher'
import type { TailwindUtils } from 'tailwind-api-utils'

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
 * Builds a class registry from CSS files, Tailwind config, allowlist patterns, and blocklist patterns
 *
 * Note: Uses synchronous file I/O (fs.readFileSync) because ESLint rules must be
 * synchronous. Performance impact is mitigated by the caching strategy - files are
 * only read when the cache is invalid (i.e., when configuration or files change).
 *
 * @param resolvedFiles - Pre-resolved CSS files with paths and mtimes
 * @param allowlist - Array of class name patterns (supports wildcards)
 * @param blocklist - Array of class name patterns to forbid (supports wildcards)
 * @param tailwindUtils - TailwindUtils instance for validating Tailwind classes (optional)
 * @param cwd - Current working directory for resolving SCSS imports
 * @returns ClassRegistry instance
 */
export function buildClassRegistry(
  resolvedFiles: ResolvedFile[],
  allowlist: string[],
  blocklist: string[],
  tailwindUtils: TailwindUtils | null | undefined,
  cwd: string,
): ClassRegistry {
  // Separate CSS classes from allowlist/blocklist
  const cssClasses = new Set<string>()
  const allowlistLiteralClasses = new Set<string>()
  const blocklistLiteralClasses = new Set<string>()

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

  // Add literal allowlist entries (non-wildcard patterns) to allowlist set
  allowlist.forEach(pattern => {
    if (!pattern.includes('*')) {
      allowlistLiteralClasses.add(pattern)
    }
  })

  // Add literal blocklist entries (non-wildcard patterns) to blocklist set
  blocklist.forEach(pattern => {
    if (!pattern.includes('*')) {
      blocklistLiteralClasses.add(pattern)
    }
  })

  // Extract wildcard patterns from allowlist and compile them to RegExp
  const wildcardPatterns = allowlist.filter(pattern => pattern.includes('*'))
  const compiledWildcardPatterns = wildcardPatterns
    .map(compilePattern)
    .filter((regex): regex is RegExp => regex !== null)

  // Extract wildcard patterns from blocklist and compile them to RegExp
  const blocklistWildcardPatterns = blocklist.filter(pattern =>
    pattern.includes('*'),
  )
  const compiledBlocklistPatterns = blocklistWildcardPatterns
    .map(compilePattern)
    .filter((regex): regex is RegExp => regex !== null)

  // Performance optimization: Keep source Sets separate instead of merging them.
  // This avoids O(n) Set creation overhead during registry build.
  // Validation checks happen in order of likelihood for early returns.
  return {
    isValid(className: string): boolean {
      // Check blocklist first - blocked classes are always invalid
      // This takes precedence over all other sources
      if (blocklistLiteralClasses.has(className)) {
        return false
      }

      // Check blocklist wildcard patterns
      if (compiledBlocklistPatterns.some(regex => regex.test(className))) {
        return false
      }

      // Check source Sets in order of likelihood for early returns:
      // 1. Literal allowlist (often matches dynamic patterns)
      // 2. CSS classes (project-specific classes)
      if (allowlistLiteralClasses.has(className) || cssClasses.has(className)) {
        return true
      }

      // Check Tailwind classes via API (if enabled)
      if (tailwindUtils?.isValidClassName(className)) {
        return true
      }

      // Check allowlist wildcard patterns using pre-compiled RegExp
      return compiledWildcardPatterns.some(regex => regex.test(className))
    },

    isTailwindClass(className: string): boolean {
      // Check blocklist first - blocked classes are always invalid
      // This takes precedence over all other sources
      if (blocklistLiteralClasses.has(className)) {
        return false
      }

      // Check blocklist wildcard patterns
      if (compiledBlocklistPatterns.some(regex => regex.test(className))) {
        return false
      }

      // Check literal allowlist first
      if (allowlistLiteralClasses.has(className)) {
        return true
      }

      // Check Tailwind classes via API (if enabled)
      if (tailwindUtils?.isValidClassName(className)) {
        return true
      }

      // Check allowlist wildcard patterns using pre-compiled RegExp
      return compiledWildcardPatterns.some(regex => regex.test(className))
    },

    isTailwindOnly(className: string): boolean {
      // Check blocklist first
      if (blocklistLiteralClasses.has(className)) {
        return false
      }

      if (compiledBlocklistPatterns.some(regex => regex.test(className))) {
        return false
      }

      // Don't check allowlist - we only want pure Tailwind classes
      // Check Tailwind classes via API (if enabled)
      return tailwindUtils?.isValidClassName(className) ?? false
    },

    isCssClass(className: string): boolean {
      // Check if the class is from a CSS file (not allowlist)
      return cssClasses.has(className)
    },

    getAllClasses(): Set<string> {
      // Create merged Set on-demand (only used in tests, not hot path)
      // Note: Does not include Tailwind classes when using API mode
      const allClasses = new Set<string>()
      cssClasses.forEach(cls => allClasses.add(cls))
      allowlistLiteralClasses.forEach(cls => allClasses.add(cls))
      return allClasses
    },

    getValidVariants(): Set<string> {
      // Return empty set when using API mode
      // Variant validation is handled by the TailwindUtils API
      return new Set()
    },
  }
}
