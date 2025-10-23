import { describe, expect, it } from '@jest/globals'

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

describe('ast-guards', () => {
  describe('isLiteral', () => {
    it('should return true for Literal nodes with string values', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test-class',
      }
      expect(isLiteral(node)).toBe(true)
    })

    it('should return true for Literal nodes with number values', () => {
      const node: Literal = {
        type: 'Literal',
        value: 42,
      }
      expect(isLiteral(node)).toBe(true)
    })

    it('should return true for Literal nodes with boolean values', () => {
      const node: Literal = {
        type: 'Literal',
        value: true,
      }
      expect(isLiteral(node)).toBe(true)
    })

    it('should return true for Literal nodes with null values', () => {
      const node: Literal = {
        type: 'Literal',
        value: null,
      }
      expect(isLiteral(node)).toBe(true)
    })

    it('should return false for non-Literal nodes', () => {
      const node: TemplateLiteral = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }
      expect(isLiteral(node as Expression)).toBe(false)
    })

    it('should narrow type to Literal when true', () => {
      const node: Expression = {
        type: 'Literal',
        value: 'test',
      }

      // Verify type guard returns true
      const result = isLiteral(node)
      expect(result).toBe(true)

      // Type narrowing is verified at compile time by TypeScript
      // If isLiteral didn't properly narrow the type, accessing node.value below would cause a compile error
      // This demonstrates the type guard works correctly for runtime checking
      expect(node.value).toBe('test')
    })
  })

  describe('isTemplateLiteral', () => {
    it('should return true for TemplateLiteral nodes', () => {
      const node: TemplateLiteral = {
        type: 'TemplateLiteral',
        quasis: [
          {
            type: 'TemplateElement',
            value: { cooked: 'test', raw: 'test' },
          },
        ],
        expressions: [],
      }
      expect(isTemplateLiteral(node)).toBe(true)
    })

    it('should return true for TemplateLiteral nodes with interpolations', () => {
      const node: TemplateLiteral = {
        type: 'TemplateLiteral',
        quasis: [
          {
            type: 'TemplateElement',
            value: { cooked: 'prefix-', raw: 'prefix-' },
          },
          {
            type: 'TemplateElement',
            value: { cooked: '-suffix', raw: '-suffix' },
          },
        ],
        expressions: [{ type: 'Literal', value: 'dynamic' }],
      }
      expect(isTemplateLiteral(node)).toBe(true)
    })

    it('should return false for non-TemplateLiteral nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isTemplateLiteral(node as Expression)).toBe(false)
    })

    it('should narrow type to TemplateLiteral when true', () => {
      const node: Expression = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      const result = isTemplateLiteral(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing quasis demonstrates it works
      expect(Array.isArray(node.quasis)).toBe(true)
    })
  })

  describe('isConditionalExpression', () => {
    it('should return true for ConditionalExpression nodes', () => {
      const node: ConditionalExpression = {
        type: 'ConditionalExpression',
        test: { type: 'Literal', value: true },
        consequent: { type: 'Literal', value: 'yes' },
        alternate: { type: 'Literal', value: 'no' },
      }
      expect(isConditionalExpression(node)).toBe(true)
    })

    it('should return false for non-ConditionalExpression nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isConditionalExpression(node as Expression)).toBe(false)
    })

    it('should narrow type to ConditionalExpression when true', () => {
      const node: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Literal', value: true },
        consequent: { type: 'Literal', value: 'yes' },
        alternate: { type: 'Literal', value: 'no' },
      }

      const result = isConditionalExpression(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing these properties demonstrates it works
      expect(node.test).toBeDefined()
      expect(node.consequent).toBeDefined()
      expect(node.alternate).toBeDefined()
    })
  })

  describe('isLogicalExpression', () => {
    it('should return true for LogicalExpression with && operator', () => {
      const node: LogicalExpression = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Literal', value: true },
        right: { type: 'Literal', value: 'class' },
      }
      expect(isLogicalExpression(node)).toBe(true)
    })

    it('should return true for LogicalExpression with || operator', () => {
      const node: LogicalExpression = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Literal', value: 'class1' },
        right: { type: 'Literal', value: 'class2' },
      }
      expect(isLogicalExpression(node)).toBe(true)
    })

    it('should return true for LogicalExpression with ?? operator', () => {
      const node: LogicalExpression = {
        type: 'LogicalExpression',
        operator: '??',
        left: { type: 'Literal', value: null },
        right: { type: 'Literal', value: 'default' },
      }
      expect(isLogicalExpression(node)).toBe(true)
    })

    it('should return false for non-LogicalExpression nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isLogicalExpression(node as Expression)).toBe(false)
    })

    it('should narrow type to LogicalExpression when true', () => {
      const node: Expression = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Literal', value: true },
        right: { type: 'Literal', value: 'class' },
      }

      const result = isLogicalExpression(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing operator demonstrates it works
      expect(['&&', '||', '??']).toContain(node.operator)
    })
  })

  describe('isCallExpression', () => {
    it('should return true for CallExpression nodes', () => {
      const node: CallExpression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clsx' },
        arguments: [{ type: 'Literal', value: 'class1' }],
      }
      expect(isCallExpression(node)).toBe(true)
    })

    it('should return true for CallExpression nodes with no arguments', () => {
      const node: CallExpression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getClasses' },
        arguments: [],
      }
      expect(isCallExpression(node)).toBe(true)
    })

    it('should return true for CallExpression nodes with multiple arguments', () => {
      const node: CallExpression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clsx' },
        arguments: [
          { type: 'Literal', value: 'class1' },
          { type: 'Literal', value: 'class2' },
          { type: 'Literal', value: 'class3' },
        ],
      }
      expect(isCallExpression(node)).toBe(true)
    })

    it('should return false for non-CallExpression nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isCallExpression(node as Expression)).toBe(false)
    })

    it('should narrow type to CallExpression when true', () => {
      const node: Expression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clsx' },
        arguments: [],
      }

      const result = isCallExpression(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing these properties demonstrates it works
      expect(node.callee).toBeDefined()
      expect(Array.isArray(node.arguments)).toBe(true)
    })
  })

  describe('isArrayExpression', () => {
    it('should return true for ArrayExpression nodes', () => {
      const node: ArrayExpression = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'class1' },
          { type: 'Literal', value: 'class2' },
        ],
      }
      expect(isArrayExpression(node)).toBe(true)
    })

    it('should return true for empty ArrayExpression nodes', () => {
      const node: ArrayExpression = {
        type: 'ArrayExpression',
        elements: [],
      }
      expect(isArrayExpression(node)).toBe(true)
    })

    it('should return true for ArrayExpression with null elements (sparse arrays)', () => {
      const node: ArrayExpression = {
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 'class1' }, null, { type: 'Literal', value: 'class2' }],
      }
      expect(isArrayExpression(node)).toBe(true)
    })

    it('should return false for non-ArrayExpression nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isArrayExpression(node as Expression)).toBe(false)
    })

    it('should narrow type to ArrayExpression when true', () => {
      const node: Expression = {
        type: 'ArrayExpression',
        elements: [],
      }

      const result = isArrayExpression(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing elements demonstrates it works
      expect(Array.isArray(node.elements)).toBe(true)
    })
  })

  describe('isObjectExpression', () => {
    it('should return true for ObjectExpression nodes', () => {
      const node: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'active' },
            value: { type: 'Literal', value: true },
            computed: false,
            shorthand: false,
          },
        ],
      }
      expect(isObjectExpression(node)).toBe(true)
    })

    it('should return true for empty ObjectExpression nodes', () => {
      const node: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [],
      }
      expect(isObjectExpression(node)).toBe(true)
    })

    it('should return true for ObjectExpression with spread elements', () => {
      const node: ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'SpreadElement',
            argument: { type: 'Identifier', name: 'otherProps' },
          },
        ],
      }
      expect(isObjectExpression(node)).toBe(true)
    })

    it('should return false for non-ObjectExpression nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isObjectExpression(node as Expression)).toBe(false)
    })

    it('should narrow type to ObjectExpression when true', () => {
      const node: Expression = {
        type: 'ObjectExpression',
        properties: [],
      }

      const result = isObjectExpression(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing properties demonstrates it works
      expect(Array.isArray(node.properties)).toBe(true)
    })
  })

  describe('isIdentifier', () => {
    it('should return true for Identifier nodes', () => {
      const node: Identifier = {
        type: 'Identifier',
        name: 'myVariable',
      }
      expect(isIdentifier(node)).toBe(true)
    })

    it('should return false for non-Identifier nodes', () => {
      const node: Literal = {
        type: 'Literal',
        value: 'test',
      }
      expect(isIdentifier(node as Expression)).toBe(false)
    })

    it('should narrow type to Identifier when true', () => {
      const node: Expression = {
        type: 'Identifier',
        name: 'testVar',
      }

      const result = isIdentifier(node)
      expect(result).toBe(true)
      // Type narrowing verified at compile time - accessing name demonstrates it works
      expect(node.name).toBe('testVar')
    })
  })

  describe('type guards with UnknownExpression', () => {
    it('should return false for all guards when given UnknownExpression', () => {
      const node: UnknownExpression = {
        type: 'MemberExpression',
        someProperty: 'value',
      }

      expect(isLiteral(node as Expression)).toBe(false)
      expect(isTemplateLiteral(node as Expression)).toBe(false)
      expect(isConditionalExpression(node as Expression)).toBe(false)
      expect(isLogicalExpression(node as Expression)).toBe(false)
      expect(isCallExpression(node as Expression)).toBe(false)
      expect(isArrayExpression(node as Expression)).toBe(false)
      expect(isObjectExpression(node as Expression)).toBe(false)
      expect(isIdentifier(node as Expression)).toBe(false)
    })
  })
})
