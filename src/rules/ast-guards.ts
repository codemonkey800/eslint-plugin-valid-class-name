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
  TemplateLiteral,
  TextAttribute,
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
