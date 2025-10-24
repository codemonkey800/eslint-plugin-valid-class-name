/**
 * Factory functions for creating common test data
 */

import type { ResolvedFile } from '../../registry/file-resolver'

/**
 * Test data factories
 */
export const testData = {
  /**
   * Create a ResolvedFile object
   */
  resolvedFile(filePath: string, mtime = Date.now()): ResolvedFile {
    return {
      path: filePath,
      mtime,
    }
  },

  /**
   * Create multiple ResolvedFile objects
   */
  resolvedFiles(...paths: string[]): ResolvedFile[] {
    return paths.map(p => testData.resolvedFile(p))
  },

  /**
   * Create CSS content with class names
   */
  cssContent(...classNames: string[]): string {
    return classNames.map(cls => `.${cls} { color: red; }`).join('\n')
  },

  /**
   * Create CSS content with custom rules
   */
  cssWithRules(rules: Record<string, string>): string {
    return Object.entries(rules)
      .map(([selector, declarations]) => `${selector} { ${declarations} }`)
      .join('\n')
  },

  /**
   * Create SCSS with nested structure
   */
  scssNested(parent: string, children: Record<string, string>): string {
    const childRules = Object.entries(children)
      .map(([child, style]) => `  .${child} { ${style} }`)
      .join('\n')
    return `.${parent} {\n  color: blue;\n${childRules}\n}`
  },

  /**
   * Create SCSS with BEM structure
   */
  scssBEM(block: string, elements: string[], modifiers: string[]): string {
    const lines: string[] = [`.${block} {`, `  display: block;`, '']

    // Add elements
    for (const element of elements) {
      lines.push(`  &__${element} {`, `    color: red;`, `  }`, '')
    }

    // Add modifiers
    for (const modifier of modifiers) {
      lines.push(`  &--${modifier} {`, `    font-weight: bold;`, `  }`, '')
    }

    lines.push('}')
    return lines.join('\n')
  },

  /**
   * Create SCSS with ampersand nesting
   */
  scssAmpersand(base: string, variants: Record<string, string>): string {
    const lines: string[] = [`.${base} {`, `  color: blue;`, '']

    for (const [variant, style] of Object.entries(variants)) {
      if (variant.startsWith('&')) {
        lines.push(`  ${variant} {`, `    ${style}`, `  }`, '')
      } else {
        lines.push(`  &${variant} {`, `    ${style}`, `  }`, '')
      }
    }

    lines.push('}')
    return lines.join('\n')
  },

  /**
   * Create multiple CSS classes as a space-separated string
   */
  classString(...classes: string[]): string {
    return classes.join(' ')
  },

  /**
   * Create an array of class names with a given prefix
   */
  prefixedClasses(prefix: string, count: number): string[] {
    return Array.from({ length: count }, (_, i) => `${prefix}-${i}`)
  },

  /**
   * Create a large number of CSS classes for performance testing
   */
  largeCssFile(count: number, prefix = 'class'): string {
    return Array.from(
      { length: count },
      (_, i) => `.${prefix}-${i} { color: red; }`,
    ).join('\n')
  },
}
