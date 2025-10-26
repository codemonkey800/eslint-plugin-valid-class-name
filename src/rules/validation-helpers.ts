/**
 * Helper functions for class name validation
 */

import type { Rule } from 'eslint'
import type { ClassRegistry } from 'src/registry/registry-builder'
import { matchesPattern } from 'src/utils/pattern-matcher'
import { parseClassName } from 'src/utils/tailwind-variants'

import type { JSXAttribute, TextAttribute } from './ast-types'

/**
 * Checks if a class name should be ignored based on ignore patterns
 * @param className - The class name to check
 * @param ignorePatterns - Array of patterns to ignore
 * @returns true if the class name should be ignored
 */
export function isClassNameIgnored(
  className: string,
  ignorePatterns: string[],
): boolean {
  return ignorePatterns.some(pattern => matchesPattern(className, pattern))
}

/**
 * Validates a set of class names against the class registry
 * @param params - Validation parameters
 * @param params.classNames - Set or array of class names to validate
 * @param params.node - AST node to report errors on
 * @param params.context - ESLint rule context for reporting errors
 * @param params.classRegistry - Class registry to validate against
 * @param params.ignorePatterns - Array of patterns to skip validation for
 */
export function validateClassNames(params: {
  classNames: Set<string> | string[]
  node: JSXAttribute | TextAttribute
  context: Rule.RuleContext
  classRegistry: ClassRegistry
  ignorePatterns: string[]
}): void {
  const { classNames, node, context, classRegistry, ignorePatterns } = params

  // Validate each unique class name
  for (const className of classNames) {
    // Parse className to extract base utility and variants
    const { variants, base } = parseClassName(className)

    // Skip if the BASE matches an ignore pattern (not full className)
    // This check happens first to allow users to ignore any pattern they want
    if (isClassNameIgnored(base, ignorePatterns)) {
      continue
    }

    // Check for empty arbitrary values (e.g., w-[], bg-[])
    // These should always be invalid (unless explicitly ignored above)
    if (/^[\w-]+-\[\]$/.test(base)) {
      context.report({
        node,
        messageId: 'invalidClassName',
        data: {
          className: base,
        },
      })
      continue
    }

    // If className has variants, validate the full className with variants
    if (variants.length > 0) {
      // First check if base is valid (Tailwind or CSS)
      const isBaseValid = classRegistry.isValid(base)

      if (!isBaseValid) {
        // Base itself is invalid
        context.report({
          node,
          messageId: 'invalidClassName',
          data: {
            className: base,
          },
        })
        continue
      }

      // Base is valid - determine if it's CSS or Tailwind
      const isCssClass = classRegistry.isCssClass(base)

      if (isCssClass) {
        // It's a pure CSS class - cannot be used with Tailwind variants
        context.report({
          node,
          messageId: 'invalidClassName',
          data: {
            className: base,
          },
        })
      } else {
        // Base is Tailwind
        const isTailwindOnly = classRegistry.isTailwindOnly(base)

        if (isTailwindOnly) {
          // Base is a pure Tailwind class, validate the full className with variants
          const isValidWithVariants = classRegistry.isValid(className)

          if (!isValidWithVariants) {
            // Full className is not valid - variant is invalid
            for (const variant of variants) {
              context.report({
                node,
                messageId: 'invalidVariant',
                data: {
                  variant,
                  className,
                },
              })
              break // Only report the first invalid variant
            }
          }
        }
      }
    } else {
      // No variants - validate base utility against all sources
      const isValidBase = classRegistry.isValid(base)

      if (!isValidBase) {
        context.report({
          node,
          messageId: 'invalidClassName',
          data: {
            className: base,
          },
        })
      }
    }
  }
}
