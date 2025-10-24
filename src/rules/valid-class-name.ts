import type { Rule } from 'eslint'

import { getClassRegistry } from '../registry/class-registry'
import type { RuleOptions } from '../types/options'
import { parseClassName } from '../utils/tailwind-variants'
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
    const classRegistry = getClassRegistry(
      allCssPatterns,
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
            // Parse className to extract base utility and variants
            const { variants, base } = parseClassName(className)

            // Check for empty arbitrary values (e.g., w-[], bg-[])
            // These should always be invalid
            if (/^[\w-]+-\[\]$/.test(base)) {
              context.report({
                node,
                messageId: 'invalidClassName',
                data: {
                  className: base,
                },
              })
              continue
            }

            // Skip if the BASE matches an ignore pattern (not full className)
            if (isClassNameIgnored(base, ignorePatterns)) {
              continue
            }

            // If className has variants, validate the full className with variants
            if (variants.length > 0) {
              // First check if base is valid (Tailwind or CSS)
              const isBaseValid = classRegistry.isValid(base)

              if (!isBaseValid) {
                // Base itself is invalid
                context.report({
                  node,
                  messageId: 'invalidClassName',
                  data: {
                    className: base,
                  },
                })
                continue
              }

              // Base is valid - determine if it's CSS or Tailwind
              const isCssClass = classRegistry.isCssClass(base)

              if (isCssClass) {
                // It's a pure CSS class - cannot be used with Tailwind variants
                context.report({
                  node,
                  messageId: 'invalidClassName',
                  data: {
                    className: base,
                  },
                })
              } else {
                // Base is Tailwind
                const isTailwindOnly = classRegistry.isTailwindOnly(base)

                if (isTailwindOnly) {
                  // Base is a pure Tailwind class, validate the full className with variants
                  const isValidWithVariants = classRegistry.isValid(className)

                  if (!isValidWithVariants) {
                    // Full className is not valid - variant is invalid
                    for (const variant of variants) {
                      context.report({
                        node,
                        messageId: 'invalidVariant',
                        data: {
                          variant,
                          className,
                        },
                      })
                      break // Only report the first invalid variant
                    }
                  }
                }
              }
            } else {
              // No variants - validate base utility against all sources
              const isValidBase = classRegistry.isValid(base)

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
        }
      },
    }
  },
}
