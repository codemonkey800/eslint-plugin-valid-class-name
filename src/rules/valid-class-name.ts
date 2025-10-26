import type { Rule } from 'eslint'
import { getClassRegistry } from 'src/registry/class-registry'
import type { RuleOptions } from 'src/types/options'

import {
  isObjectExpression,
  isSvelteLiteral,
  isSvelteMustacheTag,
  isVDirectiveKey,
  isVExpressionContainer,
  isVLiteral,
} from './ast-guards'
import type {
  JSXAttribute,
  SvelteAttribute,
  SvelteDirective,
  TextAttribute,
  VAttribute,
} from './ast-types'
import {
  extractClassNamesFromString,
  extractClassStringsFromExpression,
  extractClassStringsFromObjectValues,
} from './class-extractors'
import { validateClassNames } from './validation-helpers'

/**
 * Interface for Vue parser services from vue-eslint-parser
 * Used to visit both template and script sections in Vue SFCs
 */
interface VueParserServices {
  defineTemplateBodyVisitor: (
    templateVisitor: Record<string, (node: VAttribute) => void>,
    scriptVisitor?: Record<string, (node: JSXAttribute) => void>,
  ) => Record<string, (node: VAttribute | JSXAttribute) => void>
}

/**
 * Extended RuleContext that may include Vue parser services
 * Uses intersection type to add Vue-specific properties without conflicting with base type
 */
type RuleContextWithVueParser = Rule.RuleContext & {
  parserServices?: VueParserServices
}

export const validClassNameRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Validates CSS class names against actual CSS/SCSS files and Tailwind config',
      recommended: true,
    },
    messages: {
      invalidClassName:
        'Class name "{{className}}" is not defined in any CSS files or configuration',
      invalidVariant:
        'Variant "{{variant}}" in class "{{className}}" is not a valid Tailwind variant',
    },
    schema: [
      {
        type: 'object',
        properties: {
          sources: {
            type: 'object',
            description: 'Configuration for CSS class name sources',
            properties: {
              css: {
                type: 'array',
                items: { type: 'string' },
                description: 'Glob patterns for CSS files to validate against',
              },
              scss: {
                type: 'array',
                items: { type: 'string' },
                description: 'Glob patterns for SCSS files to validate against',
              },
              tailwind: {
                oneOf: [
                  {
                    type: 'boolean',
                    description: 'Enable Tailwind CSS validation',
                  },
                  {
                    type: 'object',
                    description: 'Tailwind CSS configuration object',
                    properties: {
                      config: {
                        type: 'string',
                        description: 'Path to Tailwind configuration file',
                      },
                      includePluginClasses: {
                        type: 'boolean',
                        description:
                          'Whether to include plugin-generated classes via Tailwind build process',
                      },
                    },
                    additionalProperties: false,
                  },
                ],
                description:
                  'Enable Tailwind CSS validation or provide configuration',
              },
            },
            additionalProperties: false,
          },
          validation: {
            type: 'object',
            description: 'Validation options for class names',
            properties: {
              ignorePatterns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of patterns to skip validation for',
              },
              objectStyleAttributes: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Array of attribute names that use object-style class name syntax (e.g., classes, classNames, sx)',
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{}],
  },
  create(context) {
    // Get configuration options with proper typing
    const options: RuleOptions = context.options[0] || {}
    const cssPatterns = options.sources?.css || []
    const scssPatterns = options.sources?.scss || []
    const allCssPatterns = [...cssPatterns, ...scssPatterns]
    const tailwindConfig = options.sources?.tailwind
    const ignorePatterns = options.validation?.ignorePatterns || []
    const objectStyleAttributes =
      options.validation?.objectStyleAttributes || []
    const cwd = context.getCwd ? context.getCwd() : process.cwd()

    // Get the class registry (with CSS, SCSS, Tailwind parsing and caching)
    const classRegistry = getClassRegistry(allCssPatterns, tailwindConfig, cwd)

    /**
     * Creates a JSXAttribute visitor function for validating className and object-style attributes
     * This is used in both Vue SFC script sections and non-Vue JSX/TSX files
     */
    const createJSXAttributeVisitor = () => (node: JSXAttribute) => {
      const attributeName = node.name.name

      // Check if this is an attribute we should validate
      const isClassNameAttribute = attributeName === 'className'
      const isObjectStyleAttribute =
        objectStyleAttributes.includes(attributeName)

      if (!isClassNameAttribute && !isObjectStyleAttribute) {
        return
      }

      // Extract class strings from the attribute value
      let classStrings: string[] = []

      if (isClassNameAttribute) {
        // Handle className attribute (existing behavior)
        if (node.value?.type === 'Literal') {
          // Handle direct string literal: <div className="foo bar" />
          const value = node.value.value
          if (typeof value === 'string') {
            classStrings.push(value)
          }
        } else if (node.value?.type === 'JSXExpressionContainer') {
          // Handle JSXExpressionContainer with dynamic expressions:
          // - String literals: <div className={"foo bar"} />
          // - Ternary: <div className={condition ? "foo" : "bar"} />
          // - Logical: <div className={condition && "foo"} />
          // - Function calls: <div className={cns("foo", condition && "bar")} />
          const expression = node.value.expression
          classStrings = extractClassStringsFromExpression(expression)
        }
      } else if (isObjectStyleAttribute) {
        // Handle object-style attributes (new behavior)
        // Extract class strings from object property VALUES
        // Example: <Component classes={{ root: 'mt-2', container: 'p-4' }} />
        if (node.value?.type === 'JSXExpressionContainer') {
          const expression = node.value.expression
          if (isObjectExpression(expression)) {
            classStrings = extractClassStringsFromObjectValues(expression)
          }
        }
      }

      // If we couldn't extract any class strings, skip validation
      if (classStrings.length === 0) {
        return
      }

      // Extract all individual class names from all class strings
      const allClassNames: string[] = []
      for (const classString of classStrings) {
        const classNames = extractClassNamesFromString(classString)
        allClassNames.push(...classNames)
      }

      // Deduplicate class names to avoid validating the same class multiple times
      // This is especially helpful when the same class appears in multiple branches
      // (e.g., className={condition ? "mt-2 flex" : "mt-2 grid"})
      const uniqueClassNames = new Set(allClassNames)

      // Validate each unique class name using the shared utility
      validateClassNames({
        classNames: uniqueClassNames,
        node,
        context,
        classRegistry,
        ignorePatterns,
      })
    }

    // Define visitor functions that will be used for both script and template
    const vueAttributeVisitor = (node: VAttribute) => {
      // Handle both static and dynamic class attributes in Vue templates
      // Static: <div class="foo"> (directive: false)
      // Dynamic: <div :class="bar"> or <div v-bind:class="bar"> (directive: true)

      if (!node.directive) {
        // Static class attribute: <div class="foo bar">
        // Check if this is the class attribute
        if (node.key.type !== 'VIdentifier' || node.key.name !== 'class') {
          return
        }

        // If no value, skip validation
        if (!node.value) {
          return
        }

        // For static attributes, the value is a VLiteral
        if (!isVLiteral(node.value)) {
          return
        }

        const classString = node.value.value

        // If empty string, skip validation
        if (classString === '') {
          return
        }

        // Extract individual class names from the string
        const classNames = extractClassNamesFromString(classString)
        const uniqueClassNames = new Set(classNames)

        // Validate each unique class name using the shared utility
        validateClassNames({
          classNames: uniqueClassNames,
          node,
          context,
          classRegistry,
          ignorePatterns,
        })
      } else {
        // Dynamic class binding: <div :class="..."> or <div v-bind:class="...">
        // Check if this is a class binding directive
        if (!isVDirectiveKey(node.key)) {
          return
        }

        // Check if the directive is v-bind (or shorthand :)
        if (node.key.name.name !== 'bind') {
          return
        }

        // Check if the argument is "class"
        if (!node.key.argument || node.key.argument.name !== 'class') {
          return
        }

        // If no value, skip validation
        if (!node.value) {
          return
        }

        // For dynamic bindings, the value is a VExpressionContainer
        if (!isVExpressionContainer(node.value)) {
          return
        }

        const expression = node.value.expression

        // If no expression, skip validation
        if (!expression) {
          return
        }

        // Extract class strings from the expression
        // This handles: string literals, ternaries, arrays, objects, function calls, etc.
        const classStrings = extractClassStringsFromExpression(expression)

        // If we couldn't extract any class strings, skip validation
        if (classStrings.length === 0) {
          return
        }

        // Extract all individual class names from all class strings
        const allClassNames: string[] = []
        for (const classString of classStrings) {
          const classNames = extractClassNamesFromString(classString)
          allClassNames.push(...classNames)
        }

        // Deduplicate class names
        const uniqueClassNames = new Set(allClassNames)

        // Validate each unique class name using the shared utility
        validateClassNames({
          classNames: uniqueClassNames,
          node,
          context,
          classRegistry,
          ignorePatterns,
        })
      }
    }

    /**
     * Visitor for Svelte static and interpolated class attributes
     * Handles:
     * - Static: <div class="foo bar">
     * - Mixed: <div class="foo {bar}">
     * - Dynamic: <div class={expr}>
     */
    const svelteAttributeVisitor = (node: SvelteAttribute) => {
      // Only process class attributes
      if (node.key.name !== 'class') {
        return
      }

      // If no value, skip validation
      if (!node.value || node.value.length === 0) {
        return
      }

      // Collect class strings from both literals and mustache expressions
      const classStrings: string[] = []

      for (const valueNode of node.value) {
        if (isSvelteLiteral(valueNode)) {
          // Static string literal: <div class="foo bar">
          const literalValue = valueNode.value
          if (typeof literalValue === 'string' && literalValue !== '') {
            classStrings.push(literalValue)
          }
        } else if (isSvelteMustacheTag(valueNode)) {
          // Dynamic mustache expression: <div class="foo {bar}"> or <div class={expr}>
          const expression = valueNode.expression
          if (expression) {
            const extractedClasses =
              extractClassStringsFromExpression(expression)
            classStrings.push(...extractedClasses)
          }
        }
      }

      // If we couldn't extract any class strings, skip validation
      if (classStrings.length === 0) {
        return
      }

      // Extract all individual class names from all class strings
      const allClassNames: string[] = []
      for (const classString of classStrings) {
        const classNames = extractClassNamesFromString(classString)
        allClassNames.push(...classNames)
      }

      // Deduplicate class names
      const uniqueClassNames = new Set(allClassNames)

      // Validate each unique class name
      validateClassNames({
        classNames: uniqueClassNames,
        node,
        context,
        classRegistry,
        ignorePatterns,
      })
    }

    /**
     * Visitor for Svelte reactive class directives
     * Handles:
     * - Shorthand: <div class:active>
     * - Full form: <div class:active={isActive}>
     */
    const svelteDirectiveVisitor = (node: SvelteDirective) => {
      // Only process class directives
      if (node.kind !== 'Class') {
        return
      }

      // Extract the class name from the directive key
      // For class:active or class:active={expr}, the class name is "active"
      const className = node.key.name.name

      // If empty class name, skip validation
      if (!className) {
        return
      }

      // Validate the single class name
      validateClassNames({
        classNames: new Set([className]),
        node,
        context,
        classRegistry,
        ignorePatterns,
      })
    }

    // Check if we have Vue parser services (for .vue files)
    // Cast to extended context type to access Vue-specific parser services
    const contextWithVue = context as RuleContextWithVueParser
    const parserServices =
      (contextWithVue.sourceCode?.parserServices as VueParserServices) ||
      contextWithVue.parserServices
    if (
      parserServices &&
      typeof parserServices.defineTemplateBodyVisitor === 'function'
    ) {
      // Vue SFC: Use parser services to visit template nodes
      return parserServices.defineTemplateBodyVisitor(
        {
          // Template visitor (for Vue template)
          VAttribute: vueAttributeVisitor,
        },
        {
          // Script visitor (for regular JSX in script section)
          JSXAttribute: createJSXAttributeVisitor(),
        },
      )
    }

    // Non-Vue files: Return normal visitors for JSX and HTML
    return {
      JSXAttribute: createJSXAttributeVisitor(),

      TextAttribute(node: TextAttribute) {
        // Only validate class attributes in HTML
        if (node.name !== 'class') {
          return
        }

        // For HTML, the value is directly a string
        const classString = node.value

        // If empty string, skip validation
        if (classString === '') {
          return
        }

        // Extract individual class names from the string
        const classNames = extractClassNamesFromString(classString)
        const uniqueClassNames = new Set(classNames)

        // Validate each unique class name using the shared utility
        validateClassNames({
          classNames: uniqueClassNames,
          node,
          context,
          classRegistry,
          ignorePatterns,
        })
      },

      // Svelte static/interpolated class attributes
      SvelteAttribute: svelteAttributeVisitor,

      // Svelte reactive class directives
      SvelteDirective: svelteDirectiveVisitor,
    }
  },
}
