import { describe, expect, it, jest } from '@jest/globals'
import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

import type {
  Expression,
  JSXAttribute,
  JSXExpressionContainer,
  Literal,
} from '../ast-types'
import { createJSXVisitor } from './jsx-visitor'

describe('createJSXVisitor', () => {
  /**
   * Helper to create a mock ESLint context
   */
  function createMockContext(): Rule.RuleContext {
    return {
      report: jest.fn(),
    } as unknown as Rule.RuleContext
  }

  /**
   * Helper to create a mock ClassRegistry
   */
  function createMockRegistry(config: {
    validClasses?: string[]
    cssClasses?: string[]
    tailwindOnlyClasses?: string[]
  }): ClassRegistry {
    const validClasses = new Set(config.validClasses || [])
    const cssClasses = new Set(config.cssClasses || [])
    const tailwindOnlyClasses = new Set(config.tailwindOnlyClasses || [])

    return {
      isValid: jest.fn((className: string) => validClasses.has(className)),
      isCssClass: jest.fn((className: string) => cssClasses.has(className)),
      isTailwindOnly: jest.fn((className: string) =>
        tailwindOnlyClasses.has(className),
      ),
      isTailwindClass: jest.fn(
        (className: string) =>
          !cssClasses.has(className) && validClasses.has(className),
      ),
      getAllClasses: jest.fn(() => validClasses),
      getValidVariants: jest.fn(() => new Set<string>()),
    }
  }

  /**
   * Helper to create a JSXAttribute node
   */
  function createJSXAttributeNode(
    attributeName: string,
    value: JSXAttribute['value'],
  ): JSXAttribute {
    return {
      type: 'JSXAttribute',
      name: { type: 'JSXIdentifier', name: attributeName },
      value,
    }
  }

  /**
   * Helper to create a Literal node
   */
  function createLiteral(value: string | number | boolean | null): Literal {
    return {
      type: 'Literal',
      value,
    }
  }

  /**
   * Helper to create a JSXExpressionContainer with an expression
   */
  function createJSXExpressionContainer(
    expression: Expression,
  ): JSXExpressionContainer {
    return {
      type: 'JSXExpressionContainer',
      expression,
    }
  }

  describe('attribute filtering', () => {
    it('should process className attribute', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode('className', createLiteral('btn'))
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should process object-style attributes when configured', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['mt-2'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: ['classes', 'sx'],
      })

      // Create object expression: { root: 'mt-2' }
      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: createLiteral('mt-2'),
            computed: false,
            shorthand: false,
          },
        ],
      }

      const node = createJSXAttributeNode(
        'classes',
        createJSXExpressionContainer(objectExpression),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should skip attributes not in the list', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode('id', createLiteral('my-id'))
      visitor(node)

      // Should not call any validation
      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should skip object-style attributes when not configured', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['mt-2'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [], // Empty array
      })

      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: createLiteral('mt-2'),
            computed: false,
            shorthand: false,
          },
        ],
      }

      const node = createJSXAttributeNode(
        'classes',
        createJSXExpressionContainer(objectExpression),
      )
      visitor(node)

      // Should not validate because 'classes' is not in objectStyleAttributes
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('className attribute - value types', () => {
    it('should handle string literal value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode(
        'className',
        createLiteral('btn primary'),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should handle JSXExpressionContainer with string literal', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode(
        'className',
        createJSXExpressionContainer(createLiteral('btn')),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle ternary expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'btn-primary', 'btn-secondary'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const ternary: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'condition' },
        consequent: createLiteral('btn btn-primary'),
        alternate: createLiteral('btn btn-secondary'),
      }

      const node = createJSXAttributeNode(
        'className',
        createJSXExpressionContainer(ternary),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle logical expression (&&)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const logical: Expression = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'isActive' },
        right: createLiteral('active'),
      }

      const node = createJSXAttributeNode(
        'className',
        createJSXExpressionContainer(logical),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle function call expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const callExpression: Expression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clsx' },
        arguments: [createLiteral('btn'), createLiteral('primary')],
      }

      const node = createJSXAttributeNode(
        'className',
        createJSXExpressionContainer(callExpression),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle empty string', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode('className', createLiteral(''))
      visitor(node)

      // Should not validate empty string
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle null value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode('className', null)
      visitor(node)

      // Should not validate
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle non-string literal', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      // Number literal instead of string
      const node = createJSXAttributeNode('className', createLiteral(42))
      visitor(node)

      // Should not validate non-string
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('object-style attributes', () => {
    it('should extract class strings from object property values', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['mt-2', 'p-4'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: ['classes'],
      })

      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: createLiteral('mt-2'),
            computed: false,
            shorthand: false,
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'container' },
            value: createLiteral('p-4'),
            computed: false,
            shorthand: false,
          },
        ],
      }

      const node = createJSXAttributeNode(
        'classes',
        createJSXExpressionContainer(objectExpression),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('mt-2')
      expect(classRegistry.isValid).toHaveBeenCalledWith('p-4')
    })

    it('should skip non-object expression for object-style attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['mt-2'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: ['classes'],
      })

      // String literal instead of object
      const node = createJSXAttributeNode(
        'classes',
        createJSXExpressionContainer(createLiteral('mt-2')),
      )
      visitor(node)

      // Should not validate because it's not an object expression
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle empty object expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: ['classes'],
      })

      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [],
      }

      const node = createJSXAttributeNode(
        'classes',
        createJSXExpressionContainer(objectExpression),
      )
      visitor(node)

      // Should not validate empty object
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle multiple classes in a single property value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['flex', 'items-center', 'justify-between'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: ['sx'],
      })

      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'container' },
            value: createLiteral('flex items-center justify-between'),
            computed: false,
            shorthand: false,
          },
        ],
      }

      const node = createJSXAttributeNode(
        'sx',
        createJSXExpressionContainer(objectExpression),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('flex')
      expect(classRegistry.isValid).toHaveBeenCalledWith('items-center')
      expect(classRegistry.isValid).toHaveBeenCalledWith('justify-between')
    })
  })

  describe('validation integration', () => {
    it('should report invalid class names', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode(
        'className',
        createLiteral('btn invalid-class'),
      )
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(1)
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          node,
          messageId: expect.any(String),
        }),
      )
    })

    it('should deduplicate class names before validation', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      // Same class appears in both branches of ternary
      const ternary: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'condition' },
        consequent: createLiteral('btn primary'),
        alternate: createLiteral('btn'),
      }

      const node = createJSXAttributeNode(
        'className',
        createJSXExpressionContainer(ternary),
      )
      visitor(node)

      // 'btn' appears twice but should only be validated once
      const btnCalls = (classRegistry.isValid as jest.Mock).mock.calls.filter(
        call => call[0] === 'btn',
      )
      expect(btnCalls.length).toBe(1)
    })

    it('should respect ignorePatterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*'],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode(
        'className',
        createLiteral('btn dynamic-123'),
      )
      visitor(node)

      // Should not report 'dynamic-123' because it matches ignore pattern
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should validate each unique class name', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode(
        'className',
        createLiteral('btn primary active'),
      )
      visitor(node)

      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(context.report).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle attribute with no value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      const node = createJSXAttributeNode('className', null)
      visitor(node)

      // Should not crash or validate
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle JSXExpressionContainer with non-extractable expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: [],
      })

      // Identifier (variable reference) - can't extract static classes
      const node = createJSXAttributeNode(
        'className',
        createJSXExpressionContainer({
          type: 'Identifier',
          name: 'dynamicClassName',
        }),
      )
      visitor(node)

      // Should not validate because we can't extract static classes
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle multiple object-style attributes in config', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['mt-2', 'p-4'],
      })
      const visitor = createJSXVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
        objectStyleAttributes: ['classes', 'classNames', 'sx'],
      })

      // Test 'sx' attribute
      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'root' },
            value: createLiteral('mt-2 p-4'),
            computed: false,
            shorthand: false,
          },
        ],
      }

      const node = createJSXAttributeNode(
        'sx',
        createJSXExpressionContainer(objectExpression),
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })
  })
})
