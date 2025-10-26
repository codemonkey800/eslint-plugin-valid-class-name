/**
 * Type guard functions for AST node validation
 */

import type {
  ArrayExpression,
  CallExpression,
  ConditionalExpression,
  Expression,
  Identifier,
  Literal,
  LogicalExpression,
  ObjectExpression,
  SvelteAttribute,
  SvelteDirective,
  SvelteLiteral,
  SvelteMustacheTag,
  TemplateLiteral,
  TextAttribute,
  VAttribute,
  VDirectiveKey,
  VExpressionContainer,
  VLiteral,
} from './ast-types'

/**
 * Type guard to check if an expression is a Literal
 */
export function isLiteral(expression: Expression): expression is Literal {
  return expression.type === 'Literal'
}

/**
 * Type guard to check if an expression is a TemplateLiteral
 */
export function isTemplateLiteral(
  expression: Expression,
): expression is TemplateLiteral {
  return expression.type === 'TemplateLiteral'
}

/**
 * Type guard to check if an expression is a ConditionalExpression
 */
export function isConditionalExpression(
  expression: Expression,
): expression is ConditionalExpression {
  return expression.type === 'ConditionalExpression'
}

/**
 * Type guard to check if an expression is a LogicalExpression
 */
export function isLogicalExpression(
  expression: Expression,
): expression is LogicalExpression {
  return expression.type === 'LogicalExpression'
}

/**
 * Type guard to check if an expression is a CallExpression
 */
export function isCallExpression(
  expression: Expression,
): expression is CallExpression {
  return expression.type === 'CallExpression'
}

/**
 * Type guard to check if an expression is an ArrayExpression
 */
export function isArrayExpression(
  expression: Expression,
): expression is ArrayExpression {
  return expression.type === 'ArrayExpression'
}

/**
 * Type guard to check if an expression is an ObjectExpression
 */
export function isObjectExpression(
  expression: Expression,
): expression is ObjectExpression {
  return expression.type === 'ObjectExpression'
}

/**
 * Type guard to check if an expression is an Identifier
 */
export function isIdentifier(expression: Expression): expression is Identifier {
  return expression.type === 'Identifier'
}

/**
 * Type guard to check if a node is a TextAttribute (HTML attribute from Angular parser)
 */
export function isTextAttribute(node: unknown): node is TextAttribute {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'TextAttribute'
  )
}

/**
 * Type guard to check if a node is a VAttribute (Vue template attribute)
 */
export function isVAttribute(node: unknown): node is VAttribute {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'VAttribute'
  )
}

/**
 * Type guard to check if a node is a VExpressionContainer (Vue template expression)
 */
export function isVExpressionContainer(
  value: unknown,
): value is VExpressionContainer {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'VExpressionContainer'
  )
}

/**
 * Type guard to check if a node is a VLiteral (Vue template literal)
 */
export function isVLiteral(value: unknown): value is VLiteral {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'VLiteral'
  )
}

/**
 * Type guard to check if a key is a VDirectiveKey (Vue directive like v-bind:class)
 */
export function isVDirectiveKey(key: unknown): key is VDirectiveKey {
  return (
    typeof key === 'object' &&
    key !== null &&
    'type' in key &&
    key.type === 'VDirectiveKey'
  )
}

/**
 * Type guard to check if a node is a SvelteAttribute (Svelte class attribute)
 */
export function isSvelteAttribute(node: unknown): node is SvelteAttribute {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'SvelteAttribute'
  )
}

/**
 * Type guard to check if a node is a SvelteDirective (Svelte class directive)
 */
export function isSvelteDirective(node: unknown): node is SvelteDirective {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'SvelteDirective'
  )
}

/**
 * Type guard to check if a value is a SvelteLiteral (Svelte literal value)
 */
export function isSvelteLiteral(value: unknown): value is SvelteLiteral {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'SvelteLiteral'
  )
}

/**
 * Type guard to check if a value is a SvelteMustacheTag (Svelte mustache expression)
 */
export function isSvelteMustacheTag(
  value: unknown,
): value is SvelteMustacheTag {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'SvelteMustacheTag'
  )
}
