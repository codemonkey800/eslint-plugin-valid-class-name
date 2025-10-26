import { isObjectExpression } from '../ast-guards'
import type { JSXAttribute } from '../ast-types'
import {
  extractClassNamesFromString,
  extractClassStringsFromExpression,
  extractClassStringsFromObjectValues,
} from '../class-extractors'
import { validateClassNames } from '../validation-helpers'
import type { JSXVisitorContext } from './types'

/**
 * Creates a visitor function for JSX className and object-style class attributes
 * Used in both Vue SFC script sections and non-Vue JSX/TSX files
 *
 * Supports:
 * - className attribute with string literals and expressions
 * - Object-style attributes (e.g., classes, classNames, sx) with object literals
 *
 * @param params - Visitor context containing ESLint context, class registry, and options
 * @returns Visitor function for JSXAttribute nodes
 */
export function createJSXVisitor(params: JSXVisitorContext) {
  const { context, classRegistry, ignorePatterns, objectStyleAttributes } =
    params

  return (node: JSXAttribute) => {
    const attributeName = node.name.name

    // Check if this is an attribute we should validate
    const isClassNameAttribute = attributeName === 'className'
    const isObjectStyleAttribute = objectStyleAttributes.includes(attributeName)

    if (!isClassNameAttribute && !isObjectStyleAttribute) {
      return
    }

    // Extract class strings from the attribute value
    let classStrings: string[] = []

    if (isClassNameAttribute) {
      // Handle className attribute (existing behavior)
      if (node.value?.type === 'Literal') {
        // Handle direct string literal: <div className="foo bar" />
        const value = node.value.value
        if (typeof value === 'string') {
          classStrings.push(value)
        }
      } else if (node.value?.type === 'JSXExpressionContainer') {
        // Handle JSXExpressionContainer with dynamic expressions:
        // - String literals: <div className={"foo bar"} />
        // - Ternary: <div className={condition ? "foo" : "bar"} />
        // - Logical: <div className={condition && "foo"} />
        // - Function calls: <div className={cns("foo", condition && "bar")} />
        const expression = node.value.expression
        classStrings = extractClassStringsFromExpression(expression)
      }
    } else if (isObjectStyleAttribute) {
      // Handle object-style attributes (new behavior)
      // Extract class strings from object property VALUES
      // Example: <Component classes={{ root: 'mt-2', container: 'p-4' }} />
      if (node.value?.type === 'JSXExpressionContainer') {
        const expression = node.value.expression
        if (isObjectExpression(expression)) {
          classStrings = extractClassStringsFromObjectValues(expression)
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

    // Deduplicate class names to avoid validating the same class multiple times
    // This is especially helpful when the same class appears in multiple branches
    // (e.g., className={condition ? "mt-2 flex" : "mt-2 grid"})
    const uniqueClassNames = new Set(allClassNames)

    // Validate each unique class name using the shared utility
    validateClassNames({
      classNames: uniqueClassNames,
      node,
      context,
      classRegistry,
      ignorePatterns,
    })
  }
}
