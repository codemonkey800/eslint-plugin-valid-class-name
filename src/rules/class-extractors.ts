/**
 * Functions for extracting class names from various expression types
 */

import {
  isArrayExpression,
  isCallExpression,
  isConditionalExpression,
  isIdentifier,
  isLiteral,
  isLogicalExpression,
  isObjectExpression,
  isTemplateLiteral,
} from './ast-guards'
import type { Expression, ObjectExpression } from './ast-types'

/**
 * Extracts individual class names from a space-separated class string
 * @param classString - The class string to parse (e.g., "foo bar  baz")
 * @returns Array of individual class names
 */
export function extractClassNamesFromString(classString: string): string[] {
  // Input validation: ensure classString is a string
  if (!classString || typeof classString !== 'string') {
    return []
  }

  // split(/\s+/) already handles multiple whitespace characters
  // and produces parts without leading/trailing whitespace
  return classString.split(/\s+/).filter(part => part.length > 0)
}

/**
 * Recursively extracts all static string literals from an expression tree
 * This enables validation of class names in dynamic expressions like:
 * - Ternary: condition ? 'class1' : 'class2'
 * - Logical: condition && 'class1'
 * - Function calls: cns('class1', condition && 'class2')
 *
 * @param expression - The expression to extract strings from
 * @returns Array of class strings found in the expression
 */
export function extractClassStringsFromExpression(
  expression: Expression,
): string[] {
  const results: string[] = []

  // Handle string literals
  if (isLiteral(expression)) {
    if (typeof expression.value === 'string') {
      results.push(expression.value)
    }
    return results
  }

  // Handle template literals (only if no interpolation)
  if (isTemplateLiteral(expression)) {
    // Only handle template literals with no interpolation (static strings)
    if (expression.expressions.length === 0) {
      const cooked = expression.quasis[0]?.value?.cooked
      if (typeof cooked === 'string') {
        results.push(cooked)
      }
    }
    return results
  }

  // Handle conditional expressions (ternary operator)
  // Example: condition ? 'class1' : 'class2'
  if (isConditionalExpression(expression)) {
    results.push(...extractClassStringsFromExpression(expression.consequent))
    results.push(...extractClassStringsFromExpression(expression.alternate))
    return results
  }

  // Handle logical expressions (&&, ||, and ?? operators)
  // Example: condition && 'class1' or 'class1' || 'class2'
  if (isLogicalExpression(expression)) {
    // Extract from both sides since either could contain class strings
    results.push(...extractClassStringsFromExpression(expression.left))
    results.push(...extractClassStringsFromExpression(expression.right))
    return results
  }

  // Handle function calls (e.g., cns(), clsx(), classnames())
  // Example: cns('class1', condition && 'class2')
  if (isCallExpression(expression)) {
    // Recursively extract from all arguments
    for (const arg of expression.arguments) {
      results.push(...extractClassStringsFromExpression(arg))
    }
    return results
  }

  // Handle array expressions (e.g., ['class1', 'class2'])
  // Note: Arrays are typically used within function calls like clsx(['class1', 'class2'])
  // Direct usage in className (e.g., className={['foo']}) won't work in React
  if (isArrayExpression(expression)) {
    // Recursively extract from all array elements
    for (const element of expression.elements) {
      // Skip null elements (sparse arrays like ['foo',, 'bar'])
      if (element === null) continue
      results.push(...extractClassStringsFromExpression(element))
    }
    return results
  }

  // Handle object expressions (e.g., { 'class1': true, 'class2': false })
  // Note: Objects are typically used within function calls like clsx({ active: true })
  // Direct usage in className (e.g., className={{ foo: true }}) won't work in React
  if (isObjectExpression(expression)) {
    // Extract class names from object keys
    for (const prop of expression.properties) {
      // Skip spread elements (e.g., ...otherClasses)
      if (prop.type === 'SpreadElement') continue

      // Skip computed properties (e.g., [dynamicKey]: true)
      if (prop.computed) continue

      // Extract string from Literal keys (e.g., 'class-name': true)
      if (isLiteral(prop.key) && typeof prop.key.value === 'string') {
        results.push(prop.key.value)
      }
      // Extract name from Identifier keys (e.g., className: true or { foo })
      else if (isIdentifier(prop.key)) {
        results.push(prop.key.name)
      }
    }
    return results
  }

  // For all other expression types (variables, complex expressions, etc.),
  // we can't statically extract class names, so skip validation
  return results
}

/**
 * Extracts class strings from object property VALUES (not keys)
 * This is used for object-style class name props like:
 * - classes={{ root: 'mt-2', container: 'p-4' }}
 * - classNames={{ header: 'flex items-center', body: 'p-4' }}
 *
 * Reuses extractClassStringsFromExpression to handle complex value expressions:
 * - String literals: { root: 'mt-2' }
 * - Conditionals: { root: condition ? 'mt-2' : 'mt-4' }
 * - Function calls: { root: clsx('mt-2', condition && 'mt-4') }
 * - Dynamic values: { root: someVar } → skipped automatically
 *
 * @param expression - The ObjectExpression to extract class strings from
 * @returns Array of class strings found in object property values
 */
export function extractClassStringsFromObjectValues(
  expression: ObjectExpression,
): string[] {
  const results: string[] = []

  for (const prop of expression.properties) {
    // Skip spread elements (e.g., { ...otherClasses })
    if (prop.type === 'SpreadElement') continue

    // Extract class strings from the property VALUE
    results.push(...extractClassStringsFromExpression(prop.value))
  }

  return results
}
