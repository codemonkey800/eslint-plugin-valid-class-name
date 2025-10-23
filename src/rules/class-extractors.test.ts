import { describe, expect, it } from '@jest/globals'

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
  UnknownExpression,
} from './ast-types'
import {
  extractClassNamesFromString,
  extractClassStringsFromExpression,
  extractClassStringsFromObjectValues,
} from './class-extractors'

describe('class-extractors', () => {
  describe('extractClassNamesFromString', () => {
    it('should extract a single class name', () => {
      const result = extractClassNamesFromString('btn')
      expect(result).toEqual(['btn'])
    })

    it('should extract multiple space-separated class names', () => {
      const result = extractClassNamesFromString('btn primary active')
      expect(result).toEqual(['btn', 'primary', 'active'])
    })

    it('should handle extra whitespace between classes', () => {
      const result = extractClassNamesFromString('btn  primary   active')
      expect(result).toEqual(['btn', 'primary', 'active'])
    })

    it('should handle leading whitespace', () => {
      const result = extractClassNamesFromString('  btn primary')
      expect(result).toEqual(['btn', 'primary'])
    })

    it('should handle trailing whitespace', () => {
      const result = extractClassNamesFromString('btn primary  ')
      expect(result).toEqual(['btn', 'primary'])
    })

    it('should handle tabs and newlines as whitespace', () => {
      const result = extractClassNamesFromString('btn\tprimary\nactive')
      expect(result).toEqual(['btn', 'primary', 'active'])
    })

    it('should return empty array for empty string', () => {
      const result = extractClassNamesFromString('')
      expect(result).toEqual([])
    })

    it('should return empty array for whitespace-only string', () => {
      const result = extractClassNamesFromString('   \t\n  ')
      expect(result).toEqual([])
    })

    it('should handle class names with hyphens', () => {
      const result = extractClassNamesFromString('btn-primary text-red-500')
      expect(result).toEqual(['btn-primary', 'text-red-500'])
    })

    it('should handle class names with underscores', () => {
      const result = extractClassNamesFromString('btn_primary my_component')
      expect(result).toEqual(['btn_primary', 'my_component'])
    })

    it('should handle class names with numbers', () => {
      const result = extractClassNamesFromString('col-12 mt-2 sm:p-4')
      expect(result).toEqual(['col-12', 'mt-2', 'sm:p-4'])
    })

    it('should handle Tailwind arbitrary values', () => {
      const result = extractClassNamesFromString('w-[100px] bg-[#ff0000]')
      expect(result).toEqual(['w-[100px]', 'bg-[#ff0000]'])
    })

    it('should handle Tailwind variants with colons', () => {
      const result = extractClassNamesFromString('hover:bg-blue-500 md:text-lg')
      expect(result).toEqual(['hover:bg-blue-500', 'md:text-lg'])
    })

    it('should return empty array for non-string input', () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(extractClassNamesFromString(null)).toEqual([])
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(extractClassNamesFromString(undefined)).toEqual([])
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(extractClassNamesFromString(123)).toEqual([])
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(extractClassNamesFromString({})).toEqual([])
    })
  })

  describe('extractClassStringsFromExpression', () => {
    describe('Literal expressions', () => {
      it('should extract string from string Literal', () => {
        const expr: Literal = {
          type: 'Literal',
          value: 'btn primary',
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['btn primary'])
      })

      it('should return empty array for non-string Literal', () => {
        const numberExpr: Literal = { type: 'Literal', value: 42 }
        const boolExpr: Literal = { type: 'Literal', value: true }
        const nullExpr: Literal = { type: 'Literal', value: null }

        expect(extractClassStringsFromExpression(numberExpr)).toEqual([])
        expect(extractClassStringsFromExpression(boolExpr)).toEqual([])
        expect(extractClassStringsFromExpression(nullExpr)).toEqual([])
      })
    })

    describe('TemplateLiteral expressions', () => {
      it('should extract static template literal with no interpolation', () => {
        const expr: TemplateLiteral = {
          type: 'TemplateLiteral',
          quasis: [
            {
              type: 'TemplateElement',
              value: { cooked: 'btn primary', raw: 'btn primary' },
            },
          ],
          expressions: [],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['btn primary'])
      })

      it('should return empty array for template literal with interpolation', () => {
        const expr: TemplateLiteral = {
          type: 'TemplateLiteral',
          quasis: [
            {
              type: 'TemplateElement',
              value: { cooked: 'btn-', raw: 'btn-' },
            },
            {
              type: 'TemplateElement',
              value: { cooked: '', raw: '' },
            },
          ],
          expressions: [{ type: 'Identifier', name: 'variant' }],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual([])
      })

      it('should handle template literal with null cooked value', () => {
        const expr: TemplateLiteral = {
          type: 'TemplateLiteral',
          quasis: [
            {
              type: 'TemplateElement',
              value: { cooked: null, raw: 'raw-value' },
            },
          ],
          expressions: [],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual([])
      })
    })

    describe('ConditionalExpression (ternary)', () => {
      it('should extract strings from both branches', () => {
        const expr: ConditionalExpression = {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'condition' },
          consequent: { type: 'Literal', value: 'class-a' },
          alternate: { type: 'Literal', value: 'class-b' },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should handle nested ternary expressions', () => {
        const expr: ConditionalExpression = {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'condition1' },
          consequent: { type: 'Literal', value: 'class-a' },
          alternate: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'condition2' },
            consequent: { type: 'Literal', value: 'class-b' },
            alternate: { type: 'Literal', value: 'class-c' },
          },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b', 'class-c'])
      })

      it('should skip non-string branches', () => {
        const expr: ConditionalExpression = {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'condition' },
          consequent: { type: 'Literal', value: 'class-a' },
          alternate: { type: 'Identifier', name: 'dynamicClass' },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a'])
      })
    })

    describe('LogicalExpression (&&, ||, ??)', () => {
      it('should extract strings from && expression', () => {
        const expr: LogicalExpression = {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'condition' },
          right: { type: 'Literal', value: 'class-a' },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a'])
      })

      it('should extract strings from || expression', () => {
        const expr: LogicalExpression = {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Literal', value: 'class-a' },
          right: { type: 'Literal', value: 'class-b' },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should extract strings from ?? expression', () => {
        const expr: LogicalExpression = {
          type: 'LogicalExpression',
          operator: '??',
          left: { type: 'Identifier', name: 'maybeNull' },
          right: { type: 'Literal', value: 'default-class' },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['default-class'])
      })

      it('should handle nested logical expressions', () => {
        const expr: LogicalExpression = {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'condition1' },
          right: {
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Literal', value: 'class-a' },
            right: { type: 'Literal', value: 'class-b' },
          },
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })
    })

    describe('CallExpression', () => {
      it('should extract strings from function call arguments', () => {
        const expr: CallExpression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'clsx' },
          arguments: [
            { type: 'Literal', value: 'class-a' },
            { type: 'Literal', value: 'class-b' },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should handle call expression with no arguments', () => {
        const expr: CallExpression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getClasses' },
          arguments: [],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual([])
      })

      it('should handle nested call expressions', () => {
        const expr: CallExpression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'clsx' },
          arguments: [
            { type: 'Literal', value: 'class-a' },
            {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'cns' },
              arguments: [{ type: 'Literal', value: 'class-b' }],
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should handle call with conditional argument', () => {
        const expr: CallExpression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'clsx' },
          arguments: [
            { type: 'Literal', value: 'base' },
            {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'active' },
              consequent: { type: 'Literal', value: 'active' },
              alternate: { type: 'Literal', value: 'inactive' },
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['base', 'active', 'inactive'])
      })

      it('should skip dynamic arguments', () => {
        const expr: CallExpression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'clsx' },
          arguments: [
            { type: 'Literal', value: 'static' },
            { type: 'Identifier', name: 'dynamicClass' },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['static'])
      })
    })

    describe('ArrayExpression', () => {
      it('should extract strings from array elements', () => {
        const expr: ArrayExpression = {
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 'class-a' },
            { type: 'Literal', value: 'class-b' },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should handle empty array', () => {
        const expr: ArrayExpression = {
          type: 'ArrayExpression',
          elements: [],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual([])
      })

      it('should skip null elements (sparse arrays)', () => {
        const expr: ArrayExpression = {
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 'class-a' },
            null,
            { type: 'Literal', value: 'class-b' },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should handle nested arrays', () => {
        const expr: ArrayExpression = {
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 'class-a' },
            {
              type: 'ArrayExpression',
              elements: [{ type: 'Literal', value: 'class-b' }],
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['class-a', 'class-b'])
      })

      it('should handle array with mixed expression types', () => {
        const expr: ArrayExpression = {
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 'static' },
            { type: 'Identifier', name: 'dynamic' },
            {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'test' },
              consequent: { type: 'Literal', value: 'a' },
              alternate: { type: 'Literal', value: 'b' },
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['static', 'a', 'b'])
      })
    })

    describe('ObjectExpression', () => {
      it('should extract class names from literal string keys', () => {
        const expr: ObjectExpression = {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Literal', value: 'active' },
              value: { type: 'Literal', value: true },
              computed: false,
              shorthand: false,
            },
            {
              type: 'Property',
              key: { type: 'Literal', value: 'disabled' },
              value: { type: 'Literal', value: false },
              computed: false,
              shorthand: false,
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['active', 'disabled'])
      })

      it('should extract class names from identifier keys', () => {
        const expr: ObjectExpression = {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'active' },
              value: { type: 'Literal', value: true },
              computed: false,
              shorthand: false,
            },
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'disabled' },
              value: { type: 'Identifier', name: 'isDisabled' },
              computed: false,
              shorthand: false,
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['active', 'disabled'])
      })

      it('should handle empty object', () => {
        const expr: ObjectExpression = {
          type: 'ObjectExpression',
          properties: [],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual([])
      })

      it('should skip spread elements', () => {
        const expr: ObjectExpression = {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Literal', value: 'active' },
              value: { type: 'Literal', value: true },
              computed: false,
              shorthand: false,
            },
            {
              type: 'SpreadElement',
              argument: { type: 'Identifier', name: 'otherClasses' },
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['active'])
      })

      it('should skip computed properties', () => {
        const expr: ObjectExpression = {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Literal', value: 'static' },
              value: { type: 'Literal', value: true },
              computed: false,
              shorthand: false,
            },
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'dynamicKey' },
              value: { type: 'Literal', value: true },
              computed: true,
              shorthand: false,
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['static'])
      })

      it('should skip non-string literal keys', () => {
        const expr: ObjectExpression = {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Literal', value: 'string-key' },
              value: { type: 'Literal', value: true },
              computed: false,
              shorthand: false,
            },
            {
              type: 'Property',
              key: { type: 'Literal', value: 123 },
              value: { type: 'Literal', value: true },
              computed: false,
              shorthand: false,
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['string-key'])
      })
    })

    describe('UnknownExpression', () => {
      it('should return empty array for unknown expression types', () => {
        const expr: UnknownExpression = {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }
        const result = extractClassStringsFromExpression(expr as Expression)
        expect(result).toEqual([])
      })

      it('should return empty array for Identifier expressions', () => {
        const expr: Identifier = {
          type: 'Identifier',
          name: 'dynamicClass',
        }
        const result = extractClassStringsFromExpression(expr as Expression)
        expect(result).toEqual([])
      })
    })

    describe('Complex nested expressions', () => {
      it('should handle deeply nested mixed expressions', () => {
        const expr: CallExpression = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'clsx' },
          arguments: [
            { type: 'Literal', value: 'base' },
            {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'condition' },
              consequent: {
                type: 'LogicalExpression',
                operator: '&&',
                left: { type: 'Identifier', name: 'test' },
                right: { type: 'Literal', value: 'variant-a' },
              },
              alternate: {
                type: 'ArrayExpression',
                elements: [
                  { type: 'Literal', value: 'variant-b' },
                  { type: 'Literal', value: 'variant-c' },
                ],
              },
            },
          ],
        }
        const result = extractClassStringsFromExpression(expr)
        expect(result).toEqual(['base', 'variant-a', 'variant-b', 'variant-c'])
      })
    })
  })

  describe('extractClassStringsFromObjectValues', () => {
    it('should extract strings from object property values', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: { type: 'Literal', value: 'mt-2 p-4' },
            computed: false,
            shorthand: false,
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'container' },
            value: { type: 'Literal', value: 'flex items-center' },
            computed: false,
            shorthand: false,
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual(['mt-2 p-4', 'flex items-center'])
    })

    it('should handle empty object', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual([])
    })

    it('should skip spread elements', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: { type: 'Literal', value: 'mt-2' },
            computed: false,
            shorthand: false,
          },
          {
            type: 'SpreadElement',
            argument: { type: 'Identifier', name: 'otherClasses' },
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual(['mt-2'])
    })

    it('should handle conditional expressions in values', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'active' },
              consequent: { type: 'Literal', value: 'bg-blue' },
              alternate: { type: 'Literal', value: 'bg-gray' },
            },
            computed: false,
            shorthand: false,
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual(['bg-blue', 'bg-gray'])
    })

    it('should handle call expressions in values', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'clsx' },
              arguments: [
                { type: 'Literal', value: 'base' },
                { type: 'Literal', value: 'variant' },
              ],
            },
            computed: false,
            shorthand: false,
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual(['base', 'variant'])
    })

    it('should skip dynamic values', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: { type: 'Literal', value: 'static-class' },
            computed: false,
            shorthand: false,
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'container' },
            value: { type: 'Identifier', name: 'dynamicClass' },
            computed: false,
            shorthand: false,
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual(['static-class'])
    })

    it('should handle non-string literal values', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'count' },
            value: { type: 'Literal', value: 42 },
            computed: false,
            shorthand: false,
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'enabled' },
            value: { type: 'Literal', value: true },
            computed: false,
            shorthand: false,
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual([])
    })

    it('should handle complex nested values', () => {
      const expr: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: {
              type: 'LogicalExpression',
              operator: '&&',
              left: { type: 'Identifier', name: 'condition' },
              right: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'clsx' },
                arguments: [
                  { type: 'Literal', value: 'a' },
                  { type: 'Literal', value: 'b' },
                ],
              },
            },
            computed: false,
            shorthand: false,
          },
        ],
      }
      const result = extractClassStringsFromObjectValues(expr)
      expect(result).toEqual(['a', 'b'])
    })
  })
})
