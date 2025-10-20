import type { Rule } from 'eslint';
import type { RuleOptions } from '../types/options.js';

interface JSXAttribute {
  type: 'JSXAttribute';
  name: {
    type: 'JSXIdentifier';
    name: string;
  };
  value: {
    type: 'Literal';
    value: string;
  } | null;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validates CSS class names against actual CSS/SCSS files, Tailwind config, and whitelists',
      recommended: true,
    },
    messages: {
      invalidClassName: 'Class name "{{className}}" is not defined in any CSS files or configuration',
    },
    schema: [
      {
        type: 'object',
        properties: {
          sources: {
            type: 'object',
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
                  { type: 'boolean' },
                  {
                    type: 'object',
                    properties: {
                      config: {
                        type: 'string',
                        description: 'Path to Tailwind configuration file',
                      },
                    },
                    additionalProperties: false,
                  },
                ],
                description: 'Enable Tailwind CSS validation or provide configuration',
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
            properties: {
              whitelist: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of class name patterns that are always considered valid',
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
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    // Get configuration options with proper typing
    const options: RuleOptions = context.options[0] || {};

    // This is a stub implementation - just reports any className attribute found
    // Real implementation will validate against actual CSS files
    return {
      JSXAttribute(node: JSXAttribute) {
        if (node.name.name === 'className' && node.value?.type === 'Literal') {
          const className = node.value.value;

          // Stub: For now, just report if className contains 'invalid'
          // Real implementation will check against CSS files, Tailwind config, etc.
          if (typeof className === 'string' && className.includes('invalid')) {
            context.report({
              node,
              messageId: 'invalidClassName',
              data: {
                className,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
