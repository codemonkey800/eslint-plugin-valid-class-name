import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import * as sass from "sass";
import path from "path";

/**
 * Extracts CSS class names from CSS content using PostCSS
 * @param cssContent - The CSS content to parse
 * @returns Set of class names found in the CSS
 */
export function extractClassNamesFromCss(cssContent: string): Set<string> {
  const classNames = new Set<string>();

  try {
    const root = postcss.parse(cssContent);

    root.walkRules((rule) => {
      try {
        selectorParser((selectors) => {
          selectors.walkClasses((classNode) => {
            // Extract just the class name without the dot
            classNames.add(classNode.value);
          });
        }).processSync(rule.selector);
      } catch (selectorError) {
        // Log warning but continue processing other selectors
        console.warn(
          `Warning: Failed to parse selector "${rule.selector}":`,
          selectorError,
        );
      }
    });
  } catch (parseError) {
    // Log warning but return what we have so far
    console.warn("Warning: Failed to parse CSS content:", parseError);
  }

  return classNames;
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
      syntax: "scss",
    });

    // Extract class names from compiled CSS
    return extractClassNamesFromCss(result.css);
  } catch (compileError) {
    // Log warning but return empty set on compilation errors
    console.warn(
      `Warning: Failed to compile SCSS file "${filePath}":`,
      compileError,
    );
    return new Set<string>();
  }
}
