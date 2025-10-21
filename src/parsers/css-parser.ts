import path from 'path'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import * as sass from 'sass'
import { logger } from 'src/utils/logger'

/**
 * Extracts CSS class names from CSS content using PostCSS
 * @param cssContent - The CSS content to parse
 * @returns Set of class names found in the CSS
 */
export function extractClassNamesFromCss(cssContent: string): Set<string> {
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
 * @param scssContent - The SCSS content to compile and parse
 * @param filePath - The file path for resolving @import/@use statements
 * @returns Set of class names found in the SCSS
 */
export function extractClassNamesFromScss(
  scssContent: string,
  filePath: string,
): Set<string> {
  try {
    // Compile SCSS to CSS
    const result = sass.compileString(scssContent, {
      loadPaths: [path.dirname(filePath)],
      // Use legacy API for better compatibility
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
