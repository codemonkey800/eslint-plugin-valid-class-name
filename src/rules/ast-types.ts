/**
 * Type definitions for JSX and HTML AST nodes used in ESLint rule validation
 */

export interface JSXIdentifier {
  type: 'JSXIdentifier'
  name: string
}

export interface Literal {
  type: 'Literal'
  value: string | number | boolean | null
}

export interface JSXExpressionContainer {
  type: 'JSXExpressionContainer'
  expression: Literal | Expression
}

export interface ConditionalExpression {
  type: 'ConditionalExpression'
  test: Expression
  consequent: Expression
  alternate: Expression
}

export interface LogicalExpression {
  type: 'LogicalExpression'
  operator: '&&' | '||' | '??'
  left: Expression
  right: Expression
}

export interface CallExpression {
  type: 'CallExpression'
  callee: Expression
  arguments: Expression[]
}

export interface TemplateLiteral {
  type: 'TemplateLiteral'
  quasis: Array<{
    type: 'TemplateElement'
    value: {
      cooked: string | null
      raw: string
    }
  }>
  expressions: Expression[]
}

export interface Identifier {
  type: 'Identifier'
  name: string
}

export interface ArrayExpression {
  type: 'ArrayExpression'
  elements: Array<Expression | null>
}

export interface SpreadElement {
  type: 'SpreadElement'
  argument: Expression
}

export interface Property {
  type: 'Property'
  key: Expression | Identifier
  value: Expression
  computed: boolean
  shorthand: boolean
}

export interface ObjectExpression {
  type: 'ObjectExpression'
  properties: Array<Property | SpreadElement>
}

// Catch-all for expression types we don't explicitly handle
// These will be skipped during validation (e.g., variables, complex expressions)
export interface UnknownExpression {
  type: string
  [key: string]: unknown
}

export type Expression =
  | Literal
  | ConditionalExpression
  | LogicalExpression
  | CallExpression
  | TemplateLiteral
  | ArrayExpression
  | ObjectExpression
  | Identifier
  | UnknownExpression

export interface JSXAttribute {
  type: 'JSXAttribute'
  name: JSXIdentifier
  value: Literal | JSXExpressionContainer | null
}

/**
 * HTML attribute node from @angular-eslint/template-parser
 * Used for validating class attributes in HTML files
 */
export interface TextAttribute {
  type: 'TextAttribute'
  name: string
  value: string
  loc: {
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
}
