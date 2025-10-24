/**
 * Type-safe builders for AST nodes used in tests
 * These eliminate repetitive node creation and provide compile-time type checking
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
  Property,
  SpreadElement,
  TemplateLiteral,
} from '../../rules/ast-types'

/**
 * AST node builders - use these to create type-safe test data
 */
export const ast = {
  /**
   * Create a Literal node
   */
  literal(value: string | number | boolean | null): Literal {
    return {
      type: 'Literal',
      value,
    }
  },

  /**
   * Create an Identifier node
   */
  identifier(name: string): Identifier {
    return {
      type: 'Identifier',
      name,
    }
  },

  /**
   * Create a ConditionalExpression node (ternary)
   */
  conditional(
    test: Expression,
    consequent: Expression,
    alternate: Expression,
  ): ConditionalExpression {
    return {
      type: 'ConditionalExpression',
      test,
      consequent,
      alternate,
    }
  },

  /**
   * Create a LogicalExpression node (&&, ||, ??)
   */
  logical(
    operator: '&&' | '||' | '??',
    left: Expression,
    right: Expression,
  ): LogicalExpression {
    return {
      type: 'LogicalExpression',
      operator,
      left,
      right,
    }
  },

  /**
   * Create a CallExpression node
   */
  call(callee: Expression, ...args: Expression[]): CallExpression {
    return {
      type: 'CallExpression',
      callee,
      arguments: args,
    }
  },

  /**
   * Create an ArrayExpression node
   */
  array(...elements: Array<Expression | null>): ArrayExpression {
    return {
      type: 'ArrayExpression',
      elements,
    }
  },

  /**
   * Create an ObjectExpression node
   */
  object(...properties: Array<Property | SpreadElement>): ObjectExpression {
    return {
      type: 'ObjectExpression',
      properties,
    }
  },

  /**
   * Create a Property node for object expressions
   */
  property(
    key: string | Expression,
    value: Expression,
    computed = false,
    shorthand = false,
  ): Property {
    return {
      type: 'Property',
      key: typeof key === 'string' ? ast.identifier(key) : key,
      value,
      computed,
      shorthand,
    }
  },

  /**
   * Create a Property node with a literal string key
   */
  propertyLiteral(
    key: string,
    value: Expression,
    computed = false,
    shorthand = false,
  ): Property {
    return {
      type: 'Property',
      key: ast.literal(key),
      value,
      computed,
      shorthand,
    }
  },

  /**
   * Create a SpreadElement node
   */
  spread(argument: Expression): SpreadElement {
    return {
      type: 'SpreadElement',
      argument,
    }
  },

  /**
   * Create a TemplateLiteral node with no interpolation (static)
   */
  templateLiteral(staticText: string): TemplateLiteral {
    return {
      type: 'TemplateLiteral',
      quasis: [
        {
          type: 'TemplateElement',
          value: { cooked: staticText, raw: staticText },
        },
      ],
      expressions: [],
    }
  },

  /**
   * Create a TemplateLiteral node with interpolation
   */
  templateLiteralWithExpressions(
    parts: string[],
    expressions: Expression[],
  ): TemplateLiteral {
    if (parts.length !== expressions.length + 1) {
      throw new Error(
        'Template literal parts must have one more element than expressions',
      )
    }

    return {
      type: 'TemplateLiteral',
      quasis: parts.map(part => ({
        type: 'TemplateElement' as const,
        value: { cooked: part, raw: part },
      })),
      expressions,
    }
  },

  /**
   * Create a TemplateLiteral with null cooked value
   */
  templateLiteralWithNullCooked(rawValue: string): TemplateLiteral {
    return {
      type: 'TemplateLiteral',
      quasis: [
        {
          type: 'TemplateElement',
          value: { cooked: null, raw: rawValue },
        },
      ],
      expressions: [],
    }
  },
}
