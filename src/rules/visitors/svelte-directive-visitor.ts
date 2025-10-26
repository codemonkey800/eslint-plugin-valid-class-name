import type { SvelteDirective } from '../ast-types'
import { validateClassNames } from '../validation-helpers'
import type { VisitorContext } from './types'

/**
 * Creates a visitor function for Svelte SvelteDirective nodes
 * Used for validating reactive class directives in Svelte SFCs
 *
 * Supports:
 * - Shorthand: <div class:active> (shorthand: true, expression: null)
 * - Full form: <div class:active={isActive}> (shorthand: false, has expression)
 *
 * @param params - Visitor context containing ESLint context, class registry, and options
 * @returns Visitor function for SvelteDirective nodes
 */
export function createSvelteDirectiveVisitor(params: VisitorContext) {
  const { context, classRegistry, ignorePatterns } = params

  return (node: SvelteDirective) => {
    // Only process class directives
    if (node.kind !== 'Class') {
      return
    }

    // Extract the class name from the directive key
    // For class:active or class:active={expr}, the class name is "active"
    const className = node.key.name.name

    // If empty class name, skip validation
    if (!className) {
      return
    }

    // Validate the single class name
    validateClassNames({
      classNames: new Set([className]),
      node,
      context,
      classRegistry,
      ignorePatterns,
    })
  }
}
