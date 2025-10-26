import { describe, expect, it, jest } from '@jest/globals'
import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

import type {
  Expression,
  SvelteDirective,
  SvelteDirectiveKey,
  SvelteName,
} from '../ast-types'
import { createSvelteDirectiveVisitor } from './svelte-directive-visitor'

describe('createSvelteDirectiveVisitor', () => {
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
   * Helper to create a SvelteName
   */
  function createSvelteName(name: string): SvelteName {
    return {
      type: 'SvelteName',
      name,
    }
  }

  /**
   * Helper to create a shorthand class directive
   * Example: <div class:active>
   */
  function createShorthandClassDirective(className: string): SvelteDirective {
    const key: SvelteDirectiveKey = {
      type: 'SvelteDirectiveKey',
      name: createSvelteName(className),
    }

    return {
      type: 'SvelteDirective',
      kind: 'Class',
      key,
      shorthand: true,
      expression: null,
    }
  }

  /**
   * Helper to create a full-form class directive with expression
   * Example: <div class:active={isActive}>
   */
  function createFullFormClassDirective(
    className: string,
    expression: Expression | null,
  ): SvelteDirective {
    const key: SvelteDirectiveKey = {
      type: 'SvelteDirectiveKey',
      name: createSvelteName(className),
    }

    return {
      type: 'SvelteDirective',
      kind: 'Class',
      key,
      shorthand: false,
      expression,
    }
  }

  describe('directive filtering', () => {
    it('should process Class kind directives', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('active')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should skip non-Class directives', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: SvelteDirectiveKey = {
        type: 'SvelteDirectiveKey',
        name: createSvelteName('myProp'),
      }

      const node: SvelteDirective = {
        type: 'SvelteDirective',
        kind: 'Style', // Not a Class directive
        key,
        shorthand: false,
        expression: null,
      }

      visitor(node)

      // Should not validate non-Class directives
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should skip Use directives', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: SvelteDirectiveKey = {
        type: 'SvelteDirectiveKey',
        name: createSvelteName('action'),
      }

      const node: SvelteDirective = {
        type: 'SvelteDirective',
        kind: 'Use',
        key,
        shorthand: false,
        expression: null,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should skip Animation directives', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const key: SvelteDirectiveKey = {
        type: 'SvelteDirectiveKey',
        name: createSvelteName('fade'),
      }

      const node: SvelteDirective = {
        type: 'SvelteDirective',
        kind: 'Animation',
        key,
        shorthand: false,
        expression: null,
      }

      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('shorthand form', () => {
    it('should validate simple class name', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('active')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(classRegistry.isValid).toHaveBeenCalledTimes(1)
    })

    it('should validate class name with hyphens', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn-primary'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('btn-primary')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn-primary')
    })

    it('should validate class name with underscores', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['my_component'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('my_component')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('my_component')
    })

    it('should validate Tailwind-style class names', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['bg-blue-500'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('hover:bg-blue-500')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('bg-blue-500')
    })

    it('should report invalid class name', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('invalid-class')
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(1)
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          node,
          messageId: expect.any(String),
        }),
      )
    })

    it('should skip empty class name', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('')
      visitor(node)

      // Should not validate empty class name
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('full form with expression', () => {
    it('should validate class name with boolean expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const expression: Expression = {
        type: 'Identifier',
        name: 'isActive',
      }

      const node = createFullFormClassDirective('active', expression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should validate class name with literal expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['disabled'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const expression: Expression = {
        type: 'Literal',
        value: true,
      }

      const node = createFullFormClassDirective('disabled', expression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('disabled')
    })

    it('should validate class name with complex expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['primary'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      // Logical expression: status === 'active' && isPrimary
      const expression: Expression = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'status' },
          right: { type: 'Literal', value: 'active' },
        },
        right: { type: 'Identifier', name: 'isPrimary' },
      }

      const node = createFullFormClassDirective('primary', expression)
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should validate class name even when expression is null', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createFullFormClassDirective('active', null)
      visitor(node)

      // Should still validate the class name even if expression is null
      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should report invalid class name regardless of expression', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const expression: Expression = {
        type: 'Identifier',
        name: 'isInvalid',
      }

      const node = createFullFormClassDirective('invalid-class', expression)
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(1)
    })
  })

  describe('validation integration', () => {
    it('should respect ignorePatterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*'],
      })

      const node = createShorthandClassDirective('dynamic-123')
      visitor(node)

      // Should not report because 'dynamic-123' matches ignore pattern
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should validate only the single class name from directive', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['active', 'disabled', 'primary'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('active')
      visitor(node)

      // Should only validate 'active', not other classes
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(classRegistry.isValid).toHaveBeenCalledTimes(1)
      expect(classRegistry.isValid).not.toHaveBeenCalledWith('disabled')
      expect(classRegistry.isValid).not.toHaveBeenCalledWith('primary')
    })

    it('should pass correct node to validateClassNames', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('invalid-class')
      visitor(node)

      // The report should include the directive node
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          node,
        }),
      )
    })
  })

  describe('edge cases', () => {
    it('should handle class names with multiple hyphens', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn-primary-lg-hover'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createShorthandClassDirective('btn-primary-lg-hover')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle class names with numbers', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['col-12', 'mt-2'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node1 = createShorthandClassDirective('col-12')
      visitor(node1)

      const node2 = createShorthandClassDirective('mt-2')
      visitor(node2)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle class names with special characters', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['bg-blue-500', 'text-red-700'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node1 = createShorthandClassDirective('sm:hover:bg-blue-500')
      visitor(node1)

      const node2 = createShorthandClassDirective('lg:focus:text-red-700')
      visitor(node2)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle wildcard ignore patterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: ['*'],
      })

      const node = createShorthandClassDirective('any-class-name')
      visitor(node)

      // Everything should be ignored with '*' pattern
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle multiple ignore patterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['valid'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*', 'temp-*', 'test-*'],
      })

      const node1 = createShorthandClassDirective('dynamic-foo')
      visitor(node1)

      const node2 = createShorthandClassDirective('temp-bar')
      visitor(node2)

      const node3 = createShorthandClassDirective('test-baz')
      visitor(node3)

      // All should be ignored by their respective patterns
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should validate the directive class name even if it contains spaces (edge case)', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['class with spaces'],
      })
      const visitor = createSvelteDirectiveVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      // Although unlikely in practice, the visitor should handle it
      const node = createShorthandClassDirective('class with spaces')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('class with spaces')
    })
  })
})
