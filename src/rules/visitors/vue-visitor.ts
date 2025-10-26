import {
  isVDirectiveKey,
  isVExpressionContainer,
  isVLiteral,
} from '../ast-guards'
import type { VAttribute } from '../ast-types'
import {
  extractClassNamesFromString,
  extractClassStringsFromExpression,
} from '../class-extractors'
import { validateClassNames } from '../validation-helpers'
import type { VisitorContext } from './types'

/**
 * Creates a visitor function for Vue VAttribute nodes
 * Used for validating both static and dynamic class attributes in Vue SFCs
 *
 * Supports:
 * - Static: <div class="foo bar"> (directive: false)
 * - Dynamic: <div :class="..."> or <div v-bind:class="..."> (directive: true)
 * - All expression types: strings, objects, arrays, ternaries, function calls, etc.
 *
 * @param params - Visitor context containing ESLint context, class registry, and options
 * @returns Visitor function for VAttribute nodes
 */
export function createVueVisitor(params: VisitorContext) {
  const { context, classRegistry, ignorePatterns } = params

  return (node: VAttribute) => {
    // Handle both static and dynamic class attributes in Vue templates
    // Static: <div class="foo"> (directive: false)
    // Dynamic: <div :class="bar"> or <div v-bind:class="bar"> (directive: true)

    if (!node.directive) {
      // Static class attribute: <div class="foo bar">
      // Check if this is the class attribute
      if (node.key.type !== 'VIdentifier' || node.key.name !== 'class') {
        return
      }

      // If no value, skip validation
      if (!node.value) {
        return
      }

      // For static attributes, the value is a VLiteral
      if (!isVLiteral(node.value)) {
        return
      }

      const classString = node.value.value

      // If empty string, skip validation
      if (classString === '') {
        return
      }

      // Extract individual class names from the string
      const classNames = extractClassNamesFromString(classString)
      const uniqueClassNames = new Set(classNames)

      // Validate each unique class name using the shared utility
      validateClassNames({
        classNames: uniqueClassNames,
        node,
        context,
        classRegistry,
        ignorePatterns,
      })
    } else {
      // Dynamic class binding: <div :class="..."> or <div v-bind:class="...">
      // Check if this is a class binding directive
      if (!isVDirectiveKey(node.key)) {
        return
      }

      // Check if the directive is v-bind (or shorthand :)
      if (node.key.name.name !== 'bind') {
        return
      }

      // Check if the argument is "class"
      if (!node.key.argument || node.key.argument.name !== 'class') {
        return
      }

      // If no value, skip validation
      if (!node.value) {
        return
      }

      // For dynamic bindings, the value is a VExpressionContainer
      if (!isVExpressionContainer(node.value)) {
        return
      }

      const expression = node.value.expression

      // If no expression, skip validation
      if (!expression) {
        return
      }

      // Extract class strings from the expression
      // This handles: string literals, ternaries, arrays, objects, function calls, etc.
      const classStrings = extractClassStringsFromExpression(expression)

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
}
