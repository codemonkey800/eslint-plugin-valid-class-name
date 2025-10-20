import fs from "fs";
import path from "path";
import fg from "fast-glob";
import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from "../parsers/css-parser.js";
import { getTailwindClasses } from "../parsers/tailwind-parser.js";
import type { TailwindConfig } from "../types/options.js";

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
  tailwindConfig: boolean | TailwindConfig | undefined,
  cwd: string,
): string {
  return JSON.stringify({ cssPatterns, whitelist, tailwindConfig, cwd });
}

/**
 * Builds a class registry from CSS files, Tailwind config, and whitelist patterns
 * @param cssPatterns - Glob patterns for CSS files
 * @param whitelist - Array of class name patterns (supports wildcards)
 * @param tailwindClasses - Pre-loaded Tailwind classes (optional)
 * @param cwd - Current working directory for resolving relative paths
 * @returns ClassRegistry instance
 */
function buildClassRegistry(
  cssPatterns: string[],
  whitelist: string[],
  tailwindClasses: Set<string> | undefined,
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
          const ext = path.extname(file).toLowerCase();

          // Handle SCSS files differently from CSS files
          let classes: Set<string>;
          if (ext === ".scss") {
            classes = extractClassNamesFromScss(content, file);
          } else {
            classes = extractClassNamesFromCss(content);
          }

          classes.forEach((cls) => literalClasses.add(cls));
        } catch (readError) {
          console.warn(
            `Warning: Failed to read CSS/SCSS file "${file}":`,
            readError,
          );
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

  // Add Tailwind classes if provided
  if (tailwindClasses) {
    tailwindClasses.forEach((cls) => literalClasses.add(cls));
  }

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
 * @param tailwindConfig - Tailwind configuration (boolean or config object)
 * @param cwd - Current working directory for resolving relative paths
 * @returns ClassRegistry instance
 */
export function getClassRegistry(
  cssPatterns: string[],
  whitelist: string[],
  tailwindConfig: boolean | TailwindConfig | undefined,
  cwd: string,
): ClassRegistry {
  const currentCacheKey = createCacheKey(
    cssPatterns,
    whitelist,
    tailwindConfig,
    cwd,
  );

  // Return cached registry if configuration hasn't changed
  if (cachedRegistry && cacheKey === currentCacheKey) {
    return cachedRegistry;
  }

  // Load Tailwind classes synchronously if enabled
  // Note: This blocks, but only once per config change due to caching
  let tailwindClasses: Set<string> | undefined;
  if (tailwindConfig) {
    try {
      // Use dynamic import in a blocking way for initial load
      // The classes will be cached after first load
      tailwindClasses = loadTailwindClassesSync(tailwindConfig, cwd);
    } catch (error) {
      console.warn("Warning: Failed to load Tailwind classes:", error);
    }
  }

  // Build new registry
  cachedRegistry = buildClassRegistry(
    cssPatterns,
    whitelist,
    tailwindClasses,
    cwd,
  );
  cacheKey = currentCacheKey;

  return cachedRegistry;
}

/**
 * Synchronously loads Tailwind classes (blocking operation)
 * This is necessary because ESLint rules must be synchronous
 * @param tailwindConfig - Tailwind configuration
 * @param cwd - Current working directory
 * @returns Set of Tailwind class names
 */
function loadTailwindClassesSync(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): Set<string> {
  // For now, we'll use require() to load the config synchronously
  // This works because Tailwind configs are typically .js files

  const { findTailwindConfigPath, extractSafelistClasses } = require("../parsers/tailwind-parser.js");

  const configPath =
    typeof tailwindConfig === "object" ? tailwindConfig.config : undefined;

  const resolvedConfigPath = findTailwindConfigPath(configPath, cwd);

  if (!resolvedConfigPath) {
    console.warn(
      "Warning: Tailwind config file not found, skipping Tailwind validation",
    );
    return new Set();
  }

  try {
    // Use require for synchronous loading (CommonJS/ESM compatible)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configModule = require(resolvedConfigPath);
    const userConfig = configModule.default || configModule;

    // Use Tailwind's resolveConfig
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const resolveConfig = require("tailwindcss/resolveConfig");
    const resolved = resolveConfig(userConfig);

    // Extract safelist classes
    return extractSafelistClasses(resolved.safelist || []);
  } catch (error) {
    console.warn(
      `Warning: Failed to load Tailwind config from "${resolvedConfigPath}":`,
      error,
    );
    return new Set();
  }
}

/**
 * Clears the cache (useful for testing)
 */
export function clearCache(): void {
  cachedRegistry = null;
  cacheKey = null;
}
