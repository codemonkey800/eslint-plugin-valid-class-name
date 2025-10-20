import fs from "fs";
import path from "path";
import fg from "fast-glob";
import { extractClassNamesFromCss } from "../parsers/css-parser.js";

/**
 * Helper function to check if a class name matches a glob-style pattern
 * @param className - The class name to test
 * @param pattern - The pattern to match against (supports * wildcard)
 * @returns true if the class name matches the pattern
 */
function matchesPattern(className: string, pattern: string): boolean {
  // Escape special regex characters except *
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  // Replace * with .*
  const regexPattern = escapedPattern.replace(/\*/g, ".*");
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(className);
}

/**
 * Interface for the class registry
 */
export interface ClassRegistry {
  /**
   * Checks if a class name is valid according to the registry
   * @param className - The class name to validate
   * @returns true if the class name is valid
   */
  isValid(className: string): boolean;

  /**
   * Gets all literal class names in the registry (excludes patterns)
   * @returns Set of all literal class names
   */
  getAllClasses(): Set<string>;
}

/**
 * Cache for class registries
 * Key: JSON-stringified configuration
 * Value: ClassRegistry instance
 */
let cachedRegistry: ClassRegistry | null = null;
let cacheKey: string | null = null;

/**
 * Creates a cache key from configuration
 */
function createCacheKey(
  cssPatterns: string[],
  whitelist: string[],
  cwd: string,
): string {
  return JSON.stringify({ cssPatterns, whitelist, cwd });
}

/**
 * Builds a class registry from CSS files and whitelist patterns
 * @param cssPatterns - Glob patterns for CSS files
 * @param whitelist - Array of class name patterns (supports wildcards)
 * @param cwd - Current working directory for resolving relative paths
 * @returns ClassRegistry instance
 */
function buildClassRegistry(
  cssPatterns: string[],
  whitelist: string[],
  cwd: string,
): ClassRegistry {
  const literalClasses = new Set<string>();

  // Extract classes from CSS files
  if (cssPatterns.length > 0) {
    try {
      // Check if patterns are absolute or relative
      const isAbsolutePattern = cssPatterns.some((pattern) =>
        path.isAbsolute(pattern),
      );

      const files = fg.sync(cssPatterns, {
        cwd: isAbsolutePattern ? undefined : cwd,
        absolute: true,
        ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      });

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, "utf-8");
          const classes = extractClassNamesFromCss(content);
          classes.forEach((cls) => literalClasses.add(cls));
        } catch (readError) {
          console.warn(`Warning: Failed to read CSS file "${file}":`, readError);
        }
      }
    } catch (globError) {
      console.warn("Warning: Failed to find CSS files:", globError);
    }
  }

  // Add literal whitelist entries (non-wildcard patterns) to the set
  whitelist.forEach((pattern) => {
    if (!pattern.includes("*")) {
      literalClasses.add(pattern);
    }
  });

  // Extract wildcard patterns from whitelist
  const wildcardPatterns = whitelist.filter((pattern) => pattern.includes("*"));

  return {
    isValid(className: string): boolean {
      // Check literal classes first (O(1) lookup)
      if (literalClasses.has(className)) {
        return true;
      }

      // Check wildcard patterns
      return wildcardPatterns.some((pattern) =>
        matchesPattern(className, pattern),
      );
    },

    getAllClasses(): Set<string> {
      return new Set(literalClasses);
    },
  };
}

/**
 * Gets or creates a class registry with caching
 * @param cssPatterns - Glob patterns for CSS files to validate against
 * @param whitelist - Array of class name patterns that are always valid
 * @param cwd - Current working directory for resolving relative paths
 * @returns ClassRegistry instance
 */
export function getClassRegistry(
  cssPatterns: string[],
  whitelist: string[],
  cwd: string,
): ClassRegistry {
  const currentCacheKey = createCacheKey(cssPatterns, whitelist, cwd);

  // Return cached registry if configuration hasn't changed
  if (cachedRegistry && cacheKey === currentCacheKey) {
    return cachedRegistry;
  }

  // Build new registry
  cachedRegistry = buildClassRegistry(cssPatterns, whitelist, cwd);
  cacheKey = currentCacheKey;

  return cachedRegistry;
}

/**
 * Clears the cache (useful for testing)
 */
export function clearCache(): void {
  cachedRegistry = null;
  cacheKey = null;
}
