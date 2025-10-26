/**
 * Helper functions for class name validation
 */

import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'
import { matchesPattern } from 'src/utils/pattern-matcher'
import { parseClassName } from 'src/utils/tailwind-variants'

import type {
  JSXAttribute,
  SvelteAttribute,
  SvelteDirective,
  TextAttribute,
  VAttribute,
} from './ast-types'

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
 * Checks if a class name is an empty Tailwind arbitrary value
 * Empty arbitrary values like w-[], bg-[], text-[] are always invalid
 * as they don't specify an actual value to use.
 *
 * @param className - The class name to check
 * @returns true if the class name is an empty arbitrary value
 * @example
 * isEmptyArbitraryValue('w-[]')     // true
 * isEmptyArbitraryValue('bg-[]')    // true
 * isEmptyArbitraryValue('w-[100px]') // false
 */
function isEmptyArbitraryValue(className: string): boolean {
  // Match pattern: word characters or hyphens, followed by -[]
  // Examples: w-[], bg-[], text-[], border-x-[]
  return /^[\w-]+-\[\]$/.test(className)
}

/**
 * Reports an invalid class name error
 */
function reportInvalidClassName(
  context: Rule.RuleContext,
  node:
    | JSXAttribute
    | TextAttribute
    | VAttribute
    | SvelteAttribute
    | SvelteDirective,
  className: string,
): void {
  context.report({
    node,
    messageId: 'invalidClassName',
    data: { className },
  })
}

/**
 * Reports an invalid variant error
 */
function reportInvalidVariant(
  context: Rule.RuleContext,
  node:
    | JSXAttribute
    | TextAttribute
    | VAttribute
    | SvelteAttribute
    | SvelteDirective,
  variant: string,
  fullClassName: string,
): void {
  context.report({
    node,
    messageId: 'invalidVariant',
    data: {
      variant,
      className: fullClassName,
    },
  })
}

/**
 * Validates a class name that has Tailwind variants (e.g., hover:mt-2)
 */
function validateClassWithVariants(
  fullClassName: string,
  base: string,
  variants: string[],
  params: {
    node:
      | JSXAttribute
      | TextAttribute
      | VAttribute
      | SvelteAttribute
      | SvelteDirective
    context: Rule.RuleContext
    classRegistry: ClassRegistry
  },
): void {
  const { node, context, classRegistry } = params

  // First check if base is valid (Tailwind or CSS)
  const isBaseValid = classRegistry.isValid(base)

  if (!isBaseValid) {
    // Base itself is invalid
    reportInvalidClassName(context, node, base)
    return
  }

  // Base is valid - determine if it's CSS or Tailwind
  const isCssClass = classRegistry.isCssClass(base)

  if (isCssClass) {
    // It's a pure CSS class - cannot be used with Tailwind variants
    reportInvalidClassName(context, node, base)
    return
  }

  // Base is Tailwind - check if it's Tailwind-only
  const isTailwindOnly = classRegistry.isTailwindOnly(base)

  if (isTailwindOnly) {
    // Base is a pure Tailwind class, validate the full className with variants
    const isValidWithVariants = classRegistry.isValid(fullClassName)

    if (!isValidWithVariants) {
      // Full className is not valid - report the first invalid variant
      for (const variant of variants) {
        reportInvalidVariant(context, node, variant, fullClassName)
        break // Only report the first invalid variant
      }
    }
  }
}

/**
 * Validates a class name without variants (e.g., mt-2, btn-primary)
 */
function validateClassWithoutVariants(
  base: string,
  params: {
    node:
      | JSXAttribute
      | TextAttribute
      | VAttribute
      | SvelteAttribute
      | SvelteDirective
    context: Rule.RuleContext
    classRegistry: ClassRegistry
  },
): void {
  const { node, context, classRegistry } = params

  // Validate base utility against all sources
  const isValidBase = classRegistry.isValid(base)

  if (!isValidBase) {
    reportInvalidClassName(context, node, base)
  }
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
  node:
    | JSXAttribute
    | TextAttribute
    | VAttribute
    | SvelteAttribute
    | SvelteDirective
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
    if (isEmptyArbitraryValue(base)) {
      reportInvalidClassName(context, node, base)
      continue
    }

    // Delegate to appropriate validation function based on presence of variants
    if (variants.length > 0) {
      validateClassWithVariants(className, base, variants, {
        node,
        context,
        classRegistry,
      })
    } else {
      validateClassWithoutVariants(base, { node, context, classRegistry })
    }
  }
}
