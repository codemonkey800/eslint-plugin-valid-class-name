import type { Rule } from 'eslint'

import { getClassRegistry } from '../registry/class-registry'
import type { RuleOptions } from '../types/options'
import {
  isValidArbitraryValue,
  parseClassName,
  validateVariants,
} from '../utils/tailwind-variants'
import { isObjectExpression } from './ast-guards'
import type { JSXAttribute } from './ast-types'
import {
  extractClassNamesFromString,
  extractClassStringsFromExpression,
  extractClassStringsFromObjectValues,
} from './class-extractors'
import { isClassNameIgnored } from './validation-helpers'

export const validClassNameRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Validates CSS class names against actual CSS/SCSS files, Tailwind config, and allowlists',
      recommended: true,
    },
    messages: {
      invalidClassName:
        'Class name "{{className}}" is not defined in any CSS files or configuration',
      invalidVariant:
        "Variant '{{variant}}' is not a valid Tailwind variant in class '{{className}}'",
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
              allowlist: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Array of class name patterns that are always considered valid',
              },
              blocklist: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of class name patterns that are forbidden',
              },
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
    const allowlist = options.validation?.allowlist || []
    const ignorePatterns = options.validation?.ignorePatterns || []
    const objectStyleAttributes =
      options.validation?.objectStyleAttributes || []
    const cwd = context.getCwd ? context.getCwd() : process.cwd()

    // Get the class registry (with CSS, SCSS, Tailwind parsing and caching)
    const classRegistry = getClassRegistry(
      allCssPatterns,
      allowlist,
      tailwindConfig,
      cwd,
    )

    return {
      JSXAttribute(node: JSXAttribute) {
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

        // Process each class string
        for (const classString of classStrings) {
          // Extract individual class names from the string
          const classNames = extractClassNamesFromString(classString)

          // Validate each class name
          for (const className of classNames) {
            // Parse className to extract variants and base utility
            const { variants, base } = parseClassName(className)

            // Skip if the BASE matches an ignore pattern (not full className)
            if (isClassNameIgnored(base, ignorePatterns)) {
              continue
            }

            // Validate variants if present
            const validVariants = classRegistry.getValidVariants()
            const hasTailwindVariants =
              variants.length > 0 && validVariants.size > 0

            if (hasTailwindVariants) {
              const { valid, invalidVariant } = validateVariants(
                variants,
                validVariants,
              )

              if (!valid && invalidVariant) {
                context.report({
                  node,
                  messageId: 'invalidVariant',
                  data: {
                    variant: invalidVariant,
                    className,
                  },
                })
                continue
              }
            }

            // Check if the base utility uses arbitrary value syntax
            // Arbitrary values (e.g., w-[100px], bg-[#1da1f2]) bypass registry validation
            if (isValidArbitraryValue(base)) {
              // Valid arbitrary value, skip further validation
              continue
            }

            // Validate base utility
            // When Tailwind variants are present, only validate against Tailwind classes
            // Otherwise, validate against all sources (CSS, Tailwind, allowlist)
            const isValidBase = hasTailwindVariants
              ? classRegistry.isTailwindClass(base)
              : classRegistry.isValid(base)

            if (!isValidBase) {
              context.report({
                node,
                messageId: 'invalidClassName',
                data: {
                  className: base,
                },
              })
            }
          }
        }
      },
    }
  },
}
