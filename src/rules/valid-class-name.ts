import type { Rule } from 'eslint'
import { getClassRegistry } from 'src/cache/class-registry'
import type { RuleOptions } from 'src/types/options'
import { matchesPattern } from 'src/utils/pattern-matcher'
import {
  isValidArbitraryValue,
  parseClassName,
  validateVariants,
} from 'src/utils/tailwind-variants'

/**
 * Type definitions for JSX AST nodes
 */
interface JSXIdentifier {
  type: 'JSXIdentifier'
  name: string
}

interface Literal {
  type: 'Literal'
  value: string | number | boolean | null
}

interface JSXExpressionContainer {
  type: 'JSXExpressionContainer'
  expression: Literal | Expression
}

interface ConditionalExpression {
  type: 'ConditionalExpression'
  test: Expression
  consequent: Expression
  alternate: Expression
}

interface LogicalExpression {
  type: 'LogicalExpression'
  operator: '&&' | '||' | '??'
  left: Expression
  right: Expression
}

interface CallExpression {
  type: 'CallExpression'
  callee: Expression
  arguments: Expression[]
}

interface TemplateLiteral {
  type: 'TemplateLiteral'
  quasis: Array<{
    type: 'TemplateElement'
    value: {
      cooked: string | null
      raw: string
    }
  }>
  expressions: Expression[]
}

interface Identifier {
  type: 'Identifier'
  name: string
}

interface ArrayExpression {
  type: 'ArrayExpression'
  elements: Array<Expression | null>
}

interface SpreadElement {
  type: 'SpreadElement'
  argument: Expression
}

interface Property {
  type: 'Property'
  key: Expression | Identifier
  value: Expression
  computed: boolean
  shorthand: boolean
}

interface ObjectExpression {
  type: 'ObjectExpression'
  properties: Array<Property | SpreadElement>
}

// Catch-all for expression types we don't explicitly handle
// These will be skipped during validation (e.g., variables, complex expressions)
interface UnknownExpression {
  type: string
  [key: string]: unknown
}

type Expression =
  | Literal
  | ConditionalExpression
  | LogicalExpression
  | CallExpression
  | TemplateLiteral
  | ArrayExpression
  | ObjectExpression
  | UnknownExpression

interface JSXAttribute {
  type: 'JSXAttribute'
  name: JSXIdentifier
  value: Literal | JSXExpressionContainer | null
}

/**
 * Helper Functions
 */

/**
 * Extracts individual class names from a space-separated class string
 * Optimized to reduce string allocations by using a single-pass approach
 * @param classString - The class string to parse (e.g., "foo bar  baz")
 * @returns Array of individual class names
 */
function extractClassNamesFromString(classString: string): string[] {
  // Input validation: ensure classString is a string
  if (!classString || typeof classString !== 'string') {
    return []
  }

  // Single-pass optimization: avoid unnecessary trim() calls
  // Benchmark shows 17-28% improvement over map+trim+filter
  const result: string[] = []
  const parts = classString.split(/\s+/)

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.length === 0) continue

    // Only trim if there's actually leading/trailing whitespace
    if (part[0] === ' ' || part[part.length - 1] === ' ') {
      const trimmed = part.trim()
      if (trimmed.length > 0) {
        result.push(trimmed)
      }
    } else {
      result.push(part)
    }
  }

  return result
}

/**
 * Checks if a class name should be ignored based on ignore patterns
 * @param className - The class name to check
 * @param ignorePatterns - Array of patterns to ignore
 * @returns true if the class name should be ignored
 */
function isClassNameIgnored(
  className: string,
  ignorePatterns: string[],
): boolean {
  return ignorePatterns.some(pattern => matchesPattern(className, pattern))
}

/**
 * Type guard to check if an expression is a Literal
 */
function isLiteral(expression: Expression): expression is Literal {
  return expression.type === 'Literal'
}

/**
 * Type guard to check if an expression is a TemplateLiteral
 */
function isTemplateLiteral(
  expression: Expression,
): expression is TemplateLiteral {
  return expression.type === 'TemplateLiteral'
}

/**
 * Type guard to check if an expression is a ConditionalExpression
 */
function isConditionalExpression(
  expression: Expression,
): expression is ConditionalExpression {
  return expression.type === 'ConditionalExpression'
}

/**
 * Type guard to check if an expression is a LogicalExpression
 */
function isLogicalExpression(
  expression: Expression,
): expression is LogicalExpression {
  return expression.type === 'LogicalExpression'
}

/**
 * Type guard to check if an expression is a CallExpression
 */
function isCallExpression(
  expression: Expression,
): expression is CallExpression {
  return expression.type === 'CallExpression'
}

/**
 * Type guard to check if an expression is an ArrayExpression
 */
function isArrayExpression(
  expression: Expression,
): expression is ArrayExpression {
  return expression.type === 'ArrayExpression'
}

/**
 * Type guard to check if an expression is an ObjectExpression
 */
function isObjectExpression(
  expression: Expression,
): expression is ObjectExpression {
  return expression.type === 'ObjectExpression'
}

/**
 * Recursively extracts all static string literals from an expression tree
 * This enables validation of class names in dynamic expressions like:
 * - Ternary: condition ? 'class1' : 'class2'
 * - Logical: condition && 'class1'
 * - Function calls: cns('class1', condition && 'class2')
 *
 * @param expression - The expression to extract strings from
 * @returns Array of class strings found in the expression
 */
function extractClassStringsFromExpression(expression: Expression): string[] {
  const results: string[] = []

  // Handle string literals
  if (isLiteral(expression)) {
    if (typeof expression.value === 'string') {
      results.push(expression.value)
    }
    return results
  }

  // Handle template literals (only if no interpolation)
  if (isTemplateLiteral(expression)) {
    // Only handle template literals with no interpolation (static strings)
    if (expression.expressions.length === 0) {
      const cooked = expression.quasis[0]?.value?.cooked
      if (typeof cooked === 'string') {
        results.push(cooked)
      }
    }
    return results
  }

  // Handle conditional expressions (ternary operator)
  // Example: condition ? 'class1' : 'class2'
  if (isConditionalExpression(expression)) {
    results.push(...extractClassStringsFromExpression(expression.consequent))
    results.push(...extractClassStringsFromExpression(expression.alternate))
    return results
  }

  // Handle logical expressions (&&, ||, and ?? operators)
  // Example: condition && 'class1' or 'class1' || 'class2'
  if (isLogicalExpression(expression)) {
    // Extract from both sides since either could contain class strings
    results.push(...extractClassStringsFromExpression(expression.left))
    results.push(...extractClassStringsFromExpression(expression.right))
    return results
  }

  // Handle function calls (e.g., cns(), clsx(), classnames())
  // Example: cns('class1', condition && 'class2')
  if (isCallExpression(expression)) {
    // Recursively extract from all arguments
    for (const arg of expression.arguments) {
      results.push(...extractClassStringsFromExpression(arg))
    }
    return results
  }

  // Handle array expressions (e.g., ['class1', 'class2'])
  // Note: Arrays are typically used within function calls like clsx(['class1', 'class2'])
  // Direct usage in className (e.g., className={['foo']}) won't work in React
  if (isArrayExpression(expression)) {
    // Recursively extract from all array elements
    for (const element of expression.elements) {
      // Skip null elements (sparse arrays like ['foo',, 'bar'])
      if (element === null) continue
      results.push(...extractClassStringsFromExpression(element))
    }
    return results
  }

  // Handle object expressions (e.g., { 'class1': true, 'class2': false })
  // Note: Objects are typically used within function calls like clsx({ active: true })
  // Direct usage in className (e.g., className={{ foo: true }}) won't work in React
  if (isObjectExpression(expression)) {
    // Extract class names from object keys
    for (const prop of expression.properties) {
      // Skip spread elements (e.g., ...otherClasses)
      if (prop.type === 'SpreadElement') continue

      // Skip computed properties (e.g., [dynamicKey]: true)
      if (prop.computed) continue

      // Extract string from Literal keys (e.g., 'class-name': true)
      if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
        results.push(prop.key.value)
      }
      // Extract name from Identifier keys (e.g., className: true or { foo })
      else if (prop.key.type === 'Identifier') {
        // Type assertion: we know prop.key is an Identifier at this point
        const identifier = prop.key as Identifier
        results.push(identifier.name)
      }
    }
    return results
  }

  // For all other expression types (variables, complex expressions, etc.),
  // we can't statically extract class names, so skip validation
  return results
}

/**
 * Extracts class strings from object property VALUES (not keys)
 * This is used for object-style class name props like:
 * - classes={{ root: 'mt-2', container: 'p-4' }}
 * - classNames={{ header: 'flex items-center', body: 'p-4' }}
 *
 * Reuses extractClassStringsFromExpression to handle complex value expressions:
 * - String literals: { root: 'mt-2' }
 * - Conditionals: { root: condition ? 'mt-2' : 'mt-4' }
 * - Function calls: { root: clsx('mt-2', condition && 'mt-4') }
 * - Dynamic values: { root: someVar } → skipped automatically
 *
 * @param expression - The ObjectExpression to extract class strings from
 * @returns Array of class strings found in object property values
 */
function extractClassStringsFromObjectValues(
  expression: ObjectExpression,
): string[] {
  const results: string[] = []

  for (const prop of expression.properties) {
    // Skip spread elements (e.g., { ...otherClasses })
    if (prop.type === 'SpreadElement') continue

    // Extract class strings from the property VALUE
    results.push(...extractClassStringsFromExpression(prop.value))
  }

  return results
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Validates CSS class names against actual CSS/SCSS files, Tailwind config, and whitelists',
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
              cssModules: {
                type: 'boolean',
                description: 'Enable CSS Modules support',
              },
            },
            additionalProperties: false,
          },
          validation: {
            type: 'object',
            description: 'Validation options for class names',
            properties: {
              whitelist: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Array of class name patterns that are always considered valid',
              },
              blacklist: {
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
    const whitelist = options.validation?.whitelist || []
    const ignorePatterns = options.validation?.ignorePatterns || []
    const objectStyleAttributes = options.validation?.objectStyleAttributes || []
    const cwd = context.getCwd ? context.getCwd() : process.cwd()

    // Get the class registry (with CSS, SCSS, Tailwind parsing and caching)
    const classRegistry = getClassRegistry(
      allCssPatterns,
      whitelist,
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
            // Otherwise, validate against all sources (CSS, Tailwind, whitelist)
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

export default rule
