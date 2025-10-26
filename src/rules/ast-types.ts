/**
 * Type definitions for JSX and HTML AST nodes used in ESLint rule validation
 */

import type { Rule } from 'eslint'

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

/**
 * Vue template identifier node from vue-eslint-parser
 */
export interface VIdentifier {
  type: 'VIdentifier'
  name: string
  rawName: string
}

/**
 * Vue template literal node from vue-eslint-parser
 * Contains decoded HTML string value
 */
export interface VLiteral {
  type: 'VLiteral'
  value: string
}

/**
 * Vue expression container from vue-eslint-parser
 * Wraps JavaScript expressions in template attributes
 */
export interface VExpressionContainer {
  type: 'VExpressionContainer'
  expression: Expression | null
  references: Array<{
    id: Identifier
    mode: string
    variable: unknown
  }>
}

/**
 * Vue directive key from vue-eslint-parser
 * Represents the directive name and argument (e.g., v-bind:class or :class)
 */
export interface VDirectiveKey {
  type: 'VDirectiveKey'
  name: VIdentifier
  argument: VIdentifier | null
  modifiers: VIdentifier[]
}

/**
 * Vue attribute node from vue-eslint-parser
 * Used for both static attributes and directives in Vue templates
 * When directive is false, it's a static attribute (e.g., <div class="foo">)
 * When directive is true, it's a Vue directive (e.g., <div :class="bar">)
 */
export interface VAttribute {
  type: 'VAttribute'
  directive: boolean
  key: VIdentifier | VDirectiveKey
  value: VLiteral | VExpressionContainer | null
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

/**
 * Svelte AST node types from svelte-eslint-parser
 */

/**
 * Svelte name identifier node
 * Similar to Identifier but allows special strings
 */
export interface SvelteName {
  type: 'SvelteName'
  name: string
}

/**
 * Svelte literal node containing decoded string value
 */
export interface SvelteLiteral {
  type: 'SvelteLiteral'
  value: string
}

/**
 * Svelte mustache tag for dynamic expressions in attributes
 * Wraps JavaScript expressions within templates
 */
export interface SvelteMustacheTag {
  type: 'SvelteMustacheTag'
  expression: Expression | null
}

/**
 * Svelte attribute node from svelte-eslint-parser
 * Used for static and interpolated class attributes
 * Examples:
 * - <div class="foo"> (static - value contains SvelteLiteral)
 * - <div class="foo {bar}"> (mixed - value contains SvelteLiteral and SvelteMustacheTag)
 * - <div class={expr}> (dynamic - value contains SvelteMustacheTag)
 */
export interface SvelteAttribute {
  type: 'SvelteAttribute'
  key: SvelteName
  boolean: boolean
  value: Array<SvelteLiteral | SvelteMustacheTag>
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

/**
 * Svelte directive key containing the directive name
 */
export interface SvelteDirectiveKey {
  type: 'SvelteDirectiveKey'
  name: SvelteName
  modifiers: SvelteName[]
}

/**
 * Svelte directive node from svelte-eslint-parser
 * Used for reactive class directives
 * Examples:
 * - <div class:active> (shorthand - boolean is true, expression is null)
 * - <div class:active={isActive}> (full form - boolean is false, expression contains value)
 */
export interface SvelteDirective {
  type: 'SvelteDirective'
  kind:
    | 'Animation'
    | 'Action'
    | 'Binding'
    | 'Class'
    | 'Let'
    | 'On'
    | 'Ref'
    | 'Transition'
  key: SvelteDirectiveKey
  shorthand: boolean
  expression: Expression | null
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

/**
 * Vue parser types from vue-eslint-parser
 * Used for working with Vue SFC templates
 */

/**
 * Interface for Vue parser services from vue-eslint-parser
 * Used to visit both template and script sections in Vue SFCs
 */
export interface VueParserServices {
  defineTemplateBodyVisitor: (
    templateVisitor: Record<string, (node: VAttribute) => void>,
    scriptVisitor?: Record<string, (node: JSXAttribute) => void>,
  ) => Record<string, (node: VAttribute | JSXAttribute) => void>
}

/**
 * Extended RuleContext that may include Vue parser services
 * Uses intersection type to add Vue-specific properties without conflicting with base type
 */
export type RuleContextWithVueParser = Rule.RuleContext & {
  parserServices?: VueParserServices
  sourceCode?: Rule.RuleContext['sourceCode'] & {
    parserServices?: VueParserServices
  }
}
