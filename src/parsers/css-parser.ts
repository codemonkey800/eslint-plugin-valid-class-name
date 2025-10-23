import path from 'path'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import * as sass from 'sass'
import { logger } from 'src/utils/logger'

/**
 * Set of CSS class names extracted from CSS/SCSS content
 */
export type CssClassSet = Set<string>

/**
 * Extracts CSS class names from CSS content using PostCSS
 *
 * @param cssContent - The CSS content to parse
 * @returns Set of class names found in the CSS
 *
 * @remarks
 * **Error Handling:** If parsing fails, returns partial results (classes
 * extracted before the error occurred). This allows extraction of valid
 * classes even when the CSS file has syntax errors in some rules.
 */
export function extractClassNamesFromCss(cssContent: string): CssClassSet {
  // Input validation
  if (!cssContent || typeof cssContent !== 'string') {
    return new Set<string>()
  }
  if (!cssContent.trim()) {
    return new Set<string>()
  }

  const classNames = new Set<string>()

  try {
    const root = postcss.parse(cssContent)

    root.walkRules(rule => {
      try {
        selectorParser(selectors => {
          selectors.walkClasses(classNode => {
            // Extract just the class name without the dot
            classNames.add(classNode.value)
          })
        }).processSync(rule.selector)
      } catch (selectorError) {
        // Error recovery: Log warning but continue processing other selectors
        // This allows partial extraction of valid classes even when some
        // selectors have syntax errors
        logger.warn(
          `Failed to parse selector "${rule.selector}"`,
          selectorError,
        )
      }
    })
  } catch (parseError) {
    // Error recovery: Return partial results collected so far
    // This allows extraction of classes from valid CSS rules even if
    // the overall file has syntax errors
    logger.warn('Failed to parse CSS content', parseError)
  }

  return classNames
}

/**
 * Extracts CSS class names from SCSS content by compiling to CSS first
 *
 * @param scssContent - The SCSS content to compile and parse
 * @param filePath - The file path for resolving @import/@use statements
 * @param cwd - Optional current working directory for resolving imports from project root and node_modules
 * @returns Set of class names found in the SCSS
 *
 * @remarks
 * **Error Handling:** If SCSS compilation fails, returns an empty Set.
 * This differs from `extractClassNamesFromCss` which returns partial results,
 * because SCSS must be successfully compiled before class extraction can occur.
 *
 * **Import Resolution:** When `cwd` is provided, imports are resolved from:
 * - The SCSS file's directory (always)
 * - The project root (`cwd`)
 * - The node_modules directory (`cwd/node_modules`)
 */
export function extractClassNamesFromScss(
  scssContent: string,
  filePath: string,
  cwd?: string,
): CssClassSet {
  // Input validation
  if (!scssContent || typeof scssContent !== 'string' || !filePath) {
    return new Set<string>()
  }
  if (!scssContent.trim()) {
    return new Set<string>()
  }

  try {
    // Build loadPaths with optional cwd for better import resolution
    const loadPaths = [path.dirname(filePath)]
    if (cwd) {
      loadPaths.push(cwd)
      loadPaths.push(path.join(cwd, 'node_modules'))
    }

    // Compile SCSS to CSS
    const result = sass.compileString(scssContent, {
      loadPaths,
      syntax: 'scss',
    })

    // Extract class names from compiled CSS
    return extractClassNamesFromCss(result.css)
  } catch (compileError) {
    // SCSS compilation failure: Cannot proceed with CSS parsing
    // Return empty set since there's no compiled CSS to extract from
    logger.warn(`Failed to compile SCSS file "${filePath}"`, compileError)
    return new Set<string>()
  }
}
