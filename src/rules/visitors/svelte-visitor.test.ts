import { describe, expect, it, jest } from '@jest/globals'
import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

import type {
  Expression,
  SvelteAttribute,
  SvelteLiteral,
  SvelteMustacheTag,
  SvelteName,
} from '../ast-types'
import { createSvelteVisitor } from './svelte-visitor'

describe('createSvelteVisitor', () => {
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
   * Helper to create a SvelteName
   */
  function createSvelteName(name: string): SvelteName {
    return {
      type: 'SvelteName',
      name,
    }
  }

  /**
   * Helper to create a SvelteLiteral
   */
  function createSvelteLiteral(
    value: string | number | boolean,
  ): SvelteLiteral {
    return {
      type: 'SvelteLiteral',
      value,
    }
  }

  /**
   * Helper to create a SvelteMustacheTag
   */
  function createSvelteMustacheTag(
    expression: Expression | null,
  ): SvelteMustacheTag {
    return {
      type: 'SvelteMustacheTag',
      expression,
    }
  }

  /**
   * Helper to create a SvelteAttribute with static class
   */
  function createStaticSvelteAttribute(classString: string): SvelteAttribute {
    return {
      type: 'SvelteAttribute',
      key: createSvelteName('class'),
      value: [createSvelteLiteral(classString)],
    }
  }

  /**
   * Helper to create a SvelteAttribute with dynamic expression
   */
  function createDynamicSvelteAttribute(
    expression: Expression,
  ): SvelteAttribute {
    return {
      type: 'SvelteAttribute',
      key: createSvelteName('class'),
      value: [createSvelteMustacheTag(expression)],
    }
  }

  /**
   * Helper to create a SvelteAttribute with mixed static and dynamic
   */
  function createMixedSvelteAttribute(
    staticPart: string,
    dynamicExpression: Expression,
  ): SvelteAttribute {
    return {
      type: 'SvelteAttribute',
      key: createSvelteName('class'),
      value: [
        createSvelteLiteral(staticPart),
        createSvelteMustacheTag(dynamicExpression),
      ],
    }
  }

  describe('attribute filtering', () => {
    it('should process class attribute', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticSvelteAttribute('btn')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
    })

    it('should skip non-class attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('id'),
        value: [createSvelteLiteral('my-id')],
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('static SvelteLiteral values', () => {
    it('should handle simple static class string', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticSvelteAttribute('btn primary')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should handle empty string literal', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticSvelteAttribute('')
      visitor(node)

      // Should not validate empty string
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle non-string literal (number)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: [createSvelteLiteral(42)],
      }

      visitor(node)

      // Should not validate non-string
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle non-string literal (boolean)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: [createSvelteLiteral(true)],
      }

      visitor(node)

      // Should not validate boolean
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('dynamic SvelteMustacheTag values', () => {
    it('should handle mustache tag with string literal', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createDynamicSvelteAttribute(createLiteral('btn primary'))
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should handle mustache tag with ternary expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn-primary', 'btn-secondary'],
      })
      const visitor = createSvelteVisitor({
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

      const node = createDynamicSvelteAttribute(ternary)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn-primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn-secondary')
    })

    it('should handle mustache tag with logical expression (&&)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteVisitor({
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

      const node = createDynamicSvelteAttribute(logical)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should handle mustache tag with function call', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const callExpression: Expression = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'classNames' },
        arguments: [createLiteral('btn'), createLiteral('primary')],
      }

      const node = createDynamicSvelteAttribute(callExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should handle mustache tag with no expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: [createSvelteMustacheTag(null)],
      }

      visitor(node)

      // Should not validate when expression is null
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle mustache tag with identifier (variable reference)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const identifier: Expression = {
        type: 'Identifier',
        name: 'dynamicClass',
      }

      const node = createDynamicSvelteAttribute(identifier)
      visitor(node)

      // Should not validate because we can't extract static classes from identifier
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('mixed static and dynamic values', () => {
    it('should handle mixed literal and mustache tag', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createMixedSvelteAttribute('btn ', createLiteral('primary'))
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should handle multiple mustache tags', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: [
          createSvelteLiteral('btn '),
          createSvelteMustacheTag(createLiteral('primary')),
          createSvelteLiteral(' '),
          createSvelteMustacheTag(createLiteral('active')),
        ],
      }

      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should handle static class followed by dynamic expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'secondary'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const ternary: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'isPrimary' },
        consequent: createLiteral('primary'),
        alternate: createLiteral('secondary'),
      }

      const node = createMixedSvelteAttribute('btn ', ternary)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('secondary')
    })
  })

  describe('validation integration', () => {
    it('should report invalid class names', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createStaticSvelteAttribute('btn invalid-class')
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(1)
    })

    it('should deduplicate class names before validation', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createSvelteVisitor({
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

      const node = createDynamicSvelteAttribute(ternary)
      visitor(node)

      // 'btn' appears in both branches but should only be validated once
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
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*'],
      })

      const node = createStaticSvelteAttribute('btn dynamic-123')
      visitor(node)

      // Should not report 'dynamic-123' because it matches ignore pattern
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should validate classes from both static and dynamic parts', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createMixedSvelteAttribute('btn', createLiteral('primary'))
      visitor(node)

      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(context.report).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle attribute with no value', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: null,
      }

      visitor(node)

      // Should not crash or validate
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle attribute with empty value array', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: [],
      }

      visitor(node)

      // Should not validate empty array
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle array expression in mustache tag', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active'],
      })
      const visitor = createSvelteVisitor({
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

      const node = createDynamicSvelteAttribute(arrayExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should handle object expression in mustache tag', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active', 'disabled'],
      })
      const visitor = createSvelteVisitor({
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

      const node = createDynamicSvelteAttribute(objectExpression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(classRegistry.isValid).toHaveBeenCalledWith('disabled')
    })

    it('should handle unknown value node types gracefully', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node: SvelteAttribute = {
        type: 'SvelteAttribute',
        key: createSvelteName('class'),
        value: [
          {
            type: 'UnknownType',
          } as unknown as SvelteLiteral,
        ],
      }

      visitor(node)

      // Should not crash on unknown types
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should extract classes from nested ternaries', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'secondary', 'disabled'],
      })
      const visitor = createSvelteVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      // Nested ternary: condition1 ? 'primary' : (condition2 ? 'secondary' : 'disabled')
      const nestedTernary: Expression = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'condition1' },
        consequent: createLiteral('primary'),
        alternate: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'condition2' },
          consequent: createLiteral('secondary'),
          alternate: createLiteral('disabled'),
        },
      }

      const node = createMixedSvelteAttribute('btn ', nestedTernary)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('secondary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('disabled')
    })
  })
})
