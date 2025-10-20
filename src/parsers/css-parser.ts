import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

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
