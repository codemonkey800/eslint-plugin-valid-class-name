import fs from 'fs'
import path from 'path'
import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from 'src/parsers/css-parser'
import type { ResolvedFile } from 'src/registry/file-resolver'
import { logger } from 'src/utils/logger'
import { compilePattern } from 'src/utils/pattern-matcher'

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
   * Gets all literal class names in the registry (excludes patterns)
   * @returns Set of all literal class names
   */
  getAllClasses(): Set<string>

  /**
   * Gets all valid Tailwind variants (for variant validation)
   * @returns Set of all valid variant names
   */
  getValidVariants(): Set<string>
}

/**
 * Builds a class registry from CSS files, Tailwind config, and allowlist patterns
 *
 * Note: Uses synchronous file I/O (fs.readFileSync) because ESLint rules must be
 * synchronous. Performance impact is mitigated by the caching strategy - files are
 * only read when the cache is invalid (i.e., when configuration or files change).
 *
 * @param resolvedFiles - Pre-resolved CSS files with paths and mtimes
 * @param allowlist - Array of class name patterns (supports wildcards)
 * @param tailwindClasses - Pre-loaded Tailwind classes (optional)
 * @param validVariants - Pre-loaded valid Tailwind variants (optional)
 * @param cwd - Current working directory for resolving SCSS imports
 * @returns ClassRegistry instance
 */
export function buildClassRegistry(
  resolvedFiles: ResolvedFile[],
  allowlist: string[],
  tailwindClasses: Set<string> | undefined,
  validVariants: Set<string> | undefined,
  cwd: string,
): ClassRegistry {
  // Separate CSS classes from Tailwind classes
  const cssClasses = new Set<string>()
  const tailwindLiteralClasses = new Set<string>()
  const allowlistLiteralClasses = new Set<string>()

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

  // Add Tailwind classes if provided
  if (tailwindClasses) {
    tailwindClasses.forEach(cls => tailwindLiteralClasses.add(cls))
  }

  // Extract wildcard patterns from allowlist and compile them to RegExp
  const wildcardPatterns = allowlist.filter(pattern => pattern.includes('*'))
  const compiledWildcardPatterns = wildcardPatterns
    .map(compilePattern)
    .filter((regex): regex is RegExp => regex !== null)

  // Performance optimization: Keep source Sets separate instead of merging them.
  // This avoids O(n) Set creation overhead during registry build.
  // Trade-off: Validation performs 2-3 sequential Set.has() checks (still O(1))
  // instead of a single check, but the constant factor overhead (~20ns) is
  // negligible compared to the registry build time savings.
  return {
    isValid(className: string): boolean {
      // Check source Sets in order of likelihood for early returns:
      // 1. Allowlist (often matches dynamic patterns)
      // 2. Tailwind (most common in modern projects)
      // 3. CSS (project-specific classes)
      if (
        allowlistLiteralClasses.has(className) ||
        tailwindLiteralClasses.has(className) ||
        cssClasses.has(className)
      ) {
        return true
      }

      // Check wildcard patterns using pre-compiled RegExp
      return compiledWildcardPatterns.some(regex => regex.test(className))
    },

    isTailwindClass(className: string): boolean {
      // Check only Tailwind and allowlist sources (excludes CSS)
      if (
        allowlistLiteralClasses.has(className) ||
        tailwindLiteralClasses.has(className)
      ) {
        return true
      }

      // Check wildcard patterns using pre-compiled RegExp
      return compiledWildcardPatterns.some(regex => regex.test(className))
    },

    getAllClasses(): Set<string> {
      // Create merged Set on-demand (only used in tests, not hot path)
      const allClasses = new Set<string>()
      cssClasses.forEach(cls => allClasses.add(cls))
      tailwindLiteralClasses.forEach(cls => allClasses.add(cls))
      allowlistLiteralClasses.forEach(cls => allClasses.add(cls))
      return allClasses
    },

    getValidVariants(): Set<string> {
      return validVariants || new Set()
    },
  }
}
