import type { TextAttribute } from '../ast-types'
import { extractClassNamesFromString } from '../class-extractors'
import { validateClassNames } from '../validation-helpers'
import type { VisitorContext } from './types'

/**
 * Creates a visitor function for HTML TextAttribute nodes
 * Used for validating class attributes in HTML files
 * Requires @angular-eslint/template-parser to be configured
 *
 * @param params - Visitor context containing ESLint context, class registry, and options
 * @returns Visitor function for TextAttribute nodes
 */
export function createHTMLVisitor(params: VisitorContext) {
  const { context, classRegistry, ignorePatterns } = params

  return (node: TextAttribute) => {
    // Only validate class attributes in HTML
    if (node.name !== 'class') {
      return
    }

    // For HTML, the value is directly a string
    const classString = node.value

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
  }
}
