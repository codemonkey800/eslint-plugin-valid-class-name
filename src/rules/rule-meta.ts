import type { Rule } from 'eslint'

/**
 * Rule metadata, schema, and error messages for the valid-class-name rule
 */
export const ruleMeta: Rule.RuleMetaData = {
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
}
