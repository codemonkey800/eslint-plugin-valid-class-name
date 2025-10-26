import { isSvelteLiteral, isSvelteMustacheTag } from '../ast-guards'
import type { SvelteAttribute } from '../ast-types'
import {
  extractClassNamesFromString,
  extractClassStringsFromExpression,
} from '../class-extractors'
import { validateClassNames } from '../validation-helpers'
import type { VisitorContext } from './types'

/**
 * Creates a visitor function for Svelte SvelteAttribute nodes
 * Used for validating static, mixed, and dynamic class attributes in Svelte SFCs
 *
 * Supports:
 * - Static: <div class="foo bar"> (value contains SvelteLiteral)
 * - Mixed: <div class="foo {bar}"> (value contains SvelteLiteral + SvelteMustacheTag)
 * - Dynamic: <div class={expr}> (value contains SvelteMustacheTag)
 *
 * @param params - Visitor context containing ESLint context, class registry, and options
 * @returns Visitor function for SvelteAttribute nodes
 */
export function createSvelteVisitor(params: VisitorContext) {
  const { context, classRegistry, ignorePatterns } = params

  return (node: SvelteAttribute) => {
    // Only process class attributes
    if (node.key.name !== 'class') {
      return
    }

    // If no value, skip validation
    if (!node.value || node.value.length === 0) {
      return
    }

    // Collect class strings from both literals and mustache expressions
    const classStrings: string[] = []

    for (const valueNode of node.value) {
      if (isSvelteLiteral(valueNode)) {
        // Static string literal: <div class="foo bar">
        const literalValue = valueNode.value
        if (typeof literalValue === 'string' && literalValue !== '') {
          classStrings.push(literalValue)
        }
      } else if (isSvelteMustacheTag(valueNode)) {
        // Dynamic mustache expression: <div class="foo {bar}"> or <div class={expr}>
        const expression = valueNode.expression
        if (expression) {
          const extractedClasses = extractClassStringsFromExpression(expression)
          classStrings.push(...extractedClasses)
        }
      }
    }

    // If we couldn't extract any class strings, skip validation
    if (classStrings.length === 0) {
      return
    }

    // Extract all individual class names from all class strings
    const allClassNames: string[] = []
    for (const classString of classStrings) {
      const classNames = extractClassNamesFromString(classString)
      allClassNames.push(...classNames)
    }

    // Deduplicate class names
    const uniqueClassNames = new Set(allClassNames)

    // Validate each unique class name
    validateClassNames({
      classNames: uniqueClassNames,
      node,
      context,
      classRegistry,
      ignorePatterns,
    })
  }
}
