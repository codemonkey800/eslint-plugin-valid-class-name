import { describe, expect, it, jest } from '@jest/globals'
import type { Rule } from 'eslint'

import type { ClassRegistry } from 'src/registry/registry-builder'

import type { TextAttribute } from '../ast-types'
import { createHTMLVisitor } from './html-visitor'

describe('createHTMLVisitor', () => {
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
   * Helper to create a TextAttribute node (HTML attribute)
   */
  function createTextAttributeNode(name: string, value: string): TextAttribute {
    return {
      type: 'TextAttribute',
      name,
      value,
    }
  }

  describe('attribute filtering', () => {
    it('should process class attribute', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
    })

    it('should skip non-class attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('id', 'my-id')
      visitor(node)

      // Should not validate non-class attributes
      expect(classRegistry.isValid).not.toHaveBeenCalled()
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should skip data attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('data-test', 'value')
      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should skip aria attributes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('aria-label', 'Label')
      visitor(node)

      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })
  })

  describe('value types', () => {
    it('should handle simple class string', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn primary')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
    })

    it('should handle empty string', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', '')
      visitor(node)

      // Should not validate empty string
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle whitespace-only string', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', '   \t\n  ')
      visitor(node)

      // Should not validate whitespace-only
      expect(classRegistry.isValid).not.toHaveBeenCalled()
    })

    it('should handle multiple classes with extra spaces', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'large'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn  primary   large')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('large')
    })

    it('should handle classes with hyphens', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn-primary', 'text-red-500'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn-primary text-red-500')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle classes with underscores', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['my_component', 'another_class'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode(
        'class',
        'my_component another_class',
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle Tailwind classes with colons', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['bg-blue-500', 'text-lg'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode(
        'class',
        'hover:bg-blue-500 md:text-lg',
      )
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle Tailwind arbitrary values', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['w-[100px]', 'bg-[#ff0000]'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'w-[100px] bg-[#ff0000]')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })
  })

  describe('validation integration', () => {
    it('should report invalid class names', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn invalid-class')
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
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn btn btn')
      visitor(node)

      // 'btn' appears three times but should only be validated once
      const btnCalls = (classRegistry.isValid as jest.Mock).mock.calls.filter(
        call => call[0] === 'btn',
      )
      expect(btnCalls.length).toBe(1)
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should respect ignorePatterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*'],
      })

      const node = createTextAttributeNode('class', 'btn dynamic-123')
      visitor(node)

      // Should not report 'dynamic-123' because it matches ignore pattern
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should validate each unique class name', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn primary active')
      visitor(node)

      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should report multiple invalid classes', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode(
        'class',
        'btn invalid-one invalid-two',
      )
      visitor(node)

      expect(context.report).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('should handle class names with leading whitespace', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', '  btn primary')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle class names with trailing whitespace', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn primary  ')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle tabs and newlines as whitespace', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn', 'primary', 'active'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn\tprimary\nactive')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
      expect(classRegistry.isValid).toHaveBeenCalledWith('primary')
      expect(classRegistry.isValid).toHaveBeenCalledWith('active')
    })

    it('should handle single class name', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: [],
      })

      const node = createTextAttributeNode('class', 'btn')
      visitor(node)

      expect(context.report).not.toHaveBeenCalled()
      expect(classRegistry.isValid).toHaveBeenCalledWith('btn')
    })

    it('should handle wildcard ignore patterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: [],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: ['*'],
      })

      const node = createTextAttributeNode('class', 'anything goes here')
      visitor(node)

      // Everything should be ignored with '*' pattern
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle multiple ignore patterns', () => {
      const context = createMockContext()
      const classRegistry = createMockRegistry({
        validClasses: ['btn'],
      })
      const visitor = createHTMLVisitor({
        context,
        classRegistry,
        ignorePatterns: ['dynamic-*', 'temp-*', 'test-*'],
      })

      const node = createTextAttributeNode(
        'class',
        'btn dynamic-foo temp-bar test-baz',
      )
      visitor(node)

      // Should only validate 'btn', others are ignored
      expect(context.report).not.toHaveBeenCalled()
    })
  })
})
