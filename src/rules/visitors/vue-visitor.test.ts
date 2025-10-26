import { describe, expect, it, jest } from '@jest/globals'
import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

import type {
  Expression,
  VAttribute,
  VDirectiveKey,
  VExpressionContainer,
  VIdentifier,
  VLiteral,
} from '../ast-types'
import { createVueVisitor } from './vue-visitor'

describe('createVueVisitor', () => {
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
      getValidVariants: jest.fn(() => new Set()),
    }
  }

  /**
   * Helper to create a Literal expression
   */
  function createLiteral(value: string | number | boolean | null): Expression {
    return {
      type: 'Literal',
      value,
    }
  }

  /**
   * Helper to create a static VAttribute (non-directive)
   */
  function createStaticVAttribute(classString: string): VAttribute {
    const key: VIdentifier = {
      type: 'VIdentifier',
      name: 'class',
    }

    const value: VLiteral = {
      type: 'VLiteral',
      value: classString,
    }

    return {
      type: 'VAttribute',
      directive: false,
      key,
      value,
    }
  }

  /**
   * Helper to create a dynamic VAttribute (:class binding)
   */
  function createDynamicVAttribute(expression: Expression | null): VAttribute {
    const key: VDirectiveKey = {
      type: 'VDirectiveKey',
      name: {
        type: 'VIdentifier',
        name: 'bind',
      },
      argument: {
        type: 'VIdentifier',
        name: 'class',
      },
    }

    const value: VExpressionContainer | null = expression
      ? {
          type: 'VExpressionContainer',
          expression,
        }
      : null

    return {
      type: 'VAttribute',
      directive: true,
      key,
      value,
    }
  }

  describe('static class attributes (directive: false)', () => {
    it('should process static class attribute', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticVAttribute('btn primary')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should skip non-class attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VIdentifier = {
        type: 'VIdentifier',
        name: 'id',
      }

      const value: VLiteral = {
        type: 'VLiteral',
        value: 'my-id',
      }

      const node: VAttribute = {
        type: 'VAttribute',
        directive: false,
        key,
        value,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle empty class string', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticVAttribute('')
      visitor(node)

      // Should not validate empty string
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle attribute with no value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VIdentifier = {
        type: 'VIdentifier',
        name: 'class',
      }

      const node: VAttribute = {
        type: 'VAttribute',
        directive: false,
        key,
        value: null,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle non-VLiteral value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VIdentifier = {
        type: 'VIdentifier',
        name: 'class',
      }

      // Wrong type for static attribute
      const value = {
        type: 'VExpressionContainer',
        expression: createLiteral('btn'),
      } as unknown as VLiteral

      const node: VAttribute = {
        type: 'VAttribute',
        directive: false,
        key,
        value,
      }

      visitor(node)

      // Should skip non-VLiteral values
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('dynamic class bindings (directive: true)', () => {
    it('should process :class with string literal', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createDynamicVAttribute(createLiteral('btn primary'))
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should skip non-bind directives', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VDirectiveKey = {
        type: 'VDirectiveKey',
        name: {
          type: 'VIdentifier',
          name: 'on', // v-on directive, not v-bind
        },
        argument: {
          type: 'VIdentifier',
          name: 'click',
        },
      }

      const node: VAttribute = {
        type: 'VAttribute',
        directive: true,
        key,
        value: null,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should skip v-bind directives without class argument', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VDirectiveKey = {
        type: 'VDirectiveKey',
        name: {
          type: 'VIdentifier',
          name: 'bind',
        },
        argument: {
          type: 'VIdentifier',
          name: 'id', // Not 'class'
        },
      }

      const value: VExpressionContainer = {
        type: 'VExpressionContainer',
        expression: createLiteral('my-id'),
      }

      const node: VAttribute = {
        type: 'VAttribute',
        directive: true,
        key,
        value,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle :class with no value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createDynamicVAttribute(null)
      node.value = null

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle :class with no expression in container', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VDirectiveKey = {
        type: 'VDirectiveKey',
        name: {
          type: 'VIdentifier',
          name: 'bind',
        },
        argument: {
          type: 'VIdentifier',
          name: 'class',
        },
      }

      const value: VExpressionContainer = {
        type: 'VExpressionContainer',
        expression: null,
      }

      const node: VAttribute = {
        type: 'VAttribute',
        directive: true,
        key,
        value,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle :class with array expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const arrayExpression: Expression = {
        type: 'ArrayExpression',
        elements: [
          createLiteral('btn'),
          createLiteral('primary'),
          createLiteral('active'),
        ],
      }

      const node = createDynamicVAttribute(arrayExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should handle :class with object expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active', 'disabled'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const objectExpression: Expression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: createLiteral('active'),
            value: { type: 'Literal', value: true },
            computed: false,
            shorthand: false,
          },
          {
            type: 'Property',
            key: createLiteral('disabled'),
            value: { type: 'Literal', value: false },
            computed: false,
            shorthand: false,
          },
        ],
      }

      const node = createDynamicVAttribute(objectExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(classRegistry.isValid).toHaveBeenCalledWith('disabled')
    })

    it('should handle :class with ternary expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn-primary', 'btn-secondary'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const ternary: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'isPrimary' },
        consequent: createLiteral('btn-primary'),
        alternate: createLiteral('btn-secondary'),
      }

      const node = createDynamicVAttribute(ternary)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn-primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn-secondary')
    })

    it('should handle :class with logical expression (&&)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const logical: Expression = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'isActive' },
        right: createLiteral('active'),
      }

      const node = createDynamicVAttribute(logical)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should handle :class with function call', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const callExpression: Expression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'classNames' },
        arguments: [createLiteral('btn'), createLiteral('primary')],
      }

      const node = createDynamicVAttribute(callExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })
  })

  describe('validation integration', () => {
    it('should report invalid class names in static attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticVAttribute('btn invalid-class')
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(1)
    })

    it('should report invalid class names in dynamic bindings', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createDynamicVAttribute(createLiteral('btn invalid-class'))
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(1)
    })

    it('should deduplicate class names before validation', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const ternary: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'condition' },
        consequent: createLiteral('btn primary'),
        alternate: createLiteral('btn'),
      }

      const node = createDynamicVAttribute(ternary)
      visitor(node)

      // 'btn' appears in both branches but should only be validated once
      const btnCalls = (classRegistry.isValid as jest.Mock).mock.calls.filter(
        call => call[0] === 'btn',
      )
      expect(btnCalls.length).toBe(1)
    })

    it('should respect ignorePatterns for static attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*'],
      })

      const node = createStaticVAttribute('btn dynamic-123')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should respect ignorePatterns for dynamic bindings', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*'],
      })

      const node = createDynamicVAttribute(createLiteral('btn dynamic-123'))
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle v-bind:class (full form)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      // Both :class and v-bind:class should work the same
      const node = createDynamicVAttribute(createLiteral('btn'))
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle directive with no argument', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VDirectiveKey = {
        type: 'VDirectiveKey',
        name: {
          type: 'VIdentifier',
          name: 'bind',
        },
        argument: null, // No argument
      }

      const node: VAttribute = {
        type: 'VAttribute',
        directive: true,
        key,
        value: null,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle non-VExpressionContainer value for directive', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: VDirectiveKey = {
        type: 'VDirectiveKey',
        name: {
          type: 'VIdentifier',
          name: 'bind',
        },
        argument: {
          type: 'VIdentifier',
          name: 'class',
        },
      }

      // Wrong type for directive value
      const value = {
        type: 'VLiteral',
        value: 'btn',
      } as unknown as VExpressionContainer

      const node: VAttribute = {
        type: 'VAttribute',
        directive: true,
        key,
        value,
      }

      visitor(node)

      // Should skip non-VExpressionContainer values
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle identifier expression (variable reference)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const identifierExpression: Expression = {
        type: 'Identifier',
        name: 'dynamicClasses',
      }

      const node = createDynamicVAttribute(identifierExpression)
      visitor(node)

      // Should not validate because we can't extract static classes from identifier
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should extract classes from nested expressions', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active', 'disabled'],
      })
      const visitor = createVueVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      // Array with nested ternary: ['btn', condition ? 'primary' : 'active', 'disabled']
      const nestedExpression: Expression = {
        type: 'ArrayExpression',
        elements: [
          createLiteral('btn'),
          {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'condition' },
            consequent: createLiteral('primary'),
            alternate: createLiteral('active'),
          },
          createLiteral('disabled'),
        ],
      }

      const node = createDynamicVAttribute(nestedExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(classRegistry.isValid).toHaveBeenCalledWith('disabled')
    })
  })
})
