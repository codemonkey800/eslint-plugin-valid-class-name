import type { Rule } from 'eslint'

import { getClassRegistry } from 'src/registry/class-registry'
import type { RuleOptions } from 'src/types/options'

import type { RuleContextWithVueParser, VueParserServices } from './ast-types'
import { ruleMeta } from './rule-meta'
import { createHTMLVisitor } from './visitors/html-visitor'
import { createJSXVisitor } from './visitors/jsx-visitor'
import { createSvelteDirectiveVisitor } from './visitors/svelte-directive-visitor'
import { createSvelteVisitor } from './visitors/svelte-visitor'
import { createVueVisitor } from './visitors/vue-visitor'

export const validClassNameRule: Rule.RuleModule = {
  // ESLint plugin rules can't statically analyze imported meta objects
  // The meta is correctly defined in rule-meta.ts with all required properties
  // eslint-disable-next-line eslint-plugin/prefer-message-ids, eslint-plugin/require-meta-type, eslint-plugin/require-meta-schema
  meta: ruleMeta,
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

    // Create visitor context for all visitors
    const visitorContext = {
      context,
      classRegistry,
      ignorePatterns,
    }

    // Create JSX visitor with extended context (includes objectStyleAttributes)
    const jsxVisitor = createJSXVisitor({
      ...visitorContext,
      objectStyleAttributes,
    })

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
      const vueVisitor = createVueVisitor(visitorContext)

      return parserServices.defineTemplateBodyVisitor(
        {
          // Template visitor (for Vue template)
          VAttribute: vueVisitor,
        },
        {
          // Script visitor (for regular JSX in script section)
          JSXAttribute: jsxVisitor,
        },
      )
    }

    // Non-Vue files: Return normal visitors for JSX, HTML, and Svelte
    const htmlVisitor = createHTMLVisitor(visitorContext)
    const svelteVisitor = createSvelteVisitor(visitorContext)
    const svelteDirectiveVisitor = createSvelteDirectiveVisitor(visitorContext)

    return {
      JSXAttribute: jsxVisitor,
      TextAttribute: htmlVisitor,
      SvelteAttribute: svelteVisitor,
      SvelteDirective: svelteDirectiveVisitor,
    }
  },
}
