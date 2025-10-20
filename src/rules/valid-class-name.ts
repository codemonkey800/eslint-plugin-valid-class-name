import type { Rule } from "eslint";
import type { RuleOptions } from "../types/options.js";

/**
 * Type definitions for JSX AST nodes
 */
interface JSXIdentifier {
  type: "JSXIdentifier";
  name: string;
}

interface Literal {
  type: "Literal";
  value: string | number | boolean | null;
}

interface JSXExpressionContainer {
  type: "JSXExpressionContainer";
  expression: Literal | Expression;
}

interface Expression {
  type: string;
  [key: string]: unknown;
}

interface JSXAttribute {
  type: "JSXAttribute";
  name: JSXIdentifier;
  value: Literal | JSXExpressionContainer | null;
}

/**
 * Helper Functions
 */

/**
 * Extracts individual class names from a space-separated class string
 * @param classString - The class string to parse (e.g., "foo bar  baz")
 * @returns Array of individual class names
 */
function extractClassNamesFromString(classString: string): string[] {
  return classString
    .split(/\s+/)
    .map((className) => className.trim())
    .filter((className) => className.length > 0);
}

/**
 * Checks if a class name matches a glob-style pattern
 * Supports * wildcard for pattern matching
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
 * Checks if a class name should be ignored based on ignore patterns
 * @param className - The class name to check
 * @param ignorePatterns - Array of patterns to ignore
 * @returns true if the class name should be ignored
 */
function isClassNameIgnored(
  className: string,
  ignorePatterns: string[],
): boolean {
  return ignorePatterns.some((pattern) => matchesPattern(className, pattern));
}

/**
 * Checks if a class name is valid according to the whitelist
 * If whitelist is empty or undefined, all class names are considered invalid
 * @param className - The class name to validate
 * @param whitelist - Array of valid class name patterns
 * @returns true if the class name is valid
 */
function isClassNameValid(className: string, whitelist: string[]): boolean {
  // If no whitelist is provided, consider all class names invalid
  if (!whitelist || whitelist.length === 0) {
    return false;
  }

  // Check if className matches any pattern in the whitelist
  return whitelist.some((pattern) => matchesPattern(className, pattern));
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validates CSS class names against actual CSS/SCSS files, Tailwind config, and whitelists",
      recommended: true,
    },
    messages: {
      invalidClassName:
        'Class name "{{className}}" is not defined in any CSS files or configuration',
    },
    schema: [
      {
        type: "object",
        properties: {
          sources: {
            type: "object",
            properties: {
              css: {
                type: "array",
                items: { type: "string" },
                description: "Glob patterns for CSS files to validate against",
              },
              scss: {
                type: "array",
                items: { type: "string" },
                description: "Glob patterns for SCSS files to validate against",
              },
              tailwind: {
                oneOf: [
                  { type: "boolean" },
                  {
                    type: "object",
                    properties: {
                      config: {
                        type: "string",
                        description: "Path to Tailwind configuration file",
                      },
                    },
                    additionalProperties: false,
                  },
                ],
                description:
                  "Enable Tailwind CSS validation or provide configuration",
              },
              cssModules: {
                type: "boolean",
                description: "Enable CSS Modules support",
              },
            },
            additionalProperties: false,
          },
          validation: {
            type: "object",
            properties: {
              whitelist: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of class name patterns that are always considered valid",
              },
              blacklist: {
                type: "array",
                items: { type: "string" },
                description: "Array of class name patterns that are forbidden",
              },
              ignorePatterns: {
                type: "array",
                items: { type: "string" },
                description: "Array of patterns to skip validation for",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    // Get configuration options with proper typing
    const options: RuleOptions = context.options[0] || {};
    const whitelist = options.validation?.whitelist || [];
    const ignorePatterns = options.validation?.ignorePatterns || [];

    return {
      JSXAttribute(node: JSXAttribute) {
        // Only process className attributes
        if (node.name.name !== "className") {
          return;
        }

        // Extract the class string from the attribute value
        let classString: string | null = null;

        if (node.value?.type === "Literal") {
          // Handle direct string literal: <div className="foo bar" />
          const value = node.value.value;
          if (typeof value === "string") {
            classString = value;
          }
        } else if (node.value?.type === "JSXExpressionContainer") {
          // Handle JSXExpressionContainer: <div className={"foo bar"} />
          const expression = node.value.expression;
          if (expression.type === "Literal") {
            const value = (expression as Literal).value;
            if (typeof value === "string") {
              classString = value;
            }
          }
          // For other expression types (variables, template literals, etc.),
          // skip validation for now - will be handled in Phase 5: Dynamic Classes
        }

        // If we couldn't extract a class string, skip validation
        if (classString === null) {
          return;
        }

        // Extract individual class names from the string
        const classNames = extractClassNamesFromString(classString);

        // Validate each class name
        for (const className of classNames) {
          // Skip if the class name matches an ignore pattern
          if (isClassNameIgnored(className, ignorePatterns)) {
            continue;
          }

          // Check if the class name is valid according to the whitelist
          if (!isClassNameValid(className, whitelist)) {
            context.report({
              node,
              messageId: "invalidClassName",
              data: {
                className,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
