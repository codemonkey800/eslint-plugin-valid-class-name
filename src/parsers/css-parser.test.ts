import { describe, expect, it } from '@jest/globals'
import path from 'path'
import { fileURLToPath } from 'url'

import { INVALID_INPUTS } from '../test'
import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from './css-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('extractClassNamesFromCss', () => {
  it('should extract simple class names', () => {
    const css = '.btn { color: red; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should extract multiple class names', () => {
    const css = `
      .btn { color: red; }
      .card { padding: 10px; }
      .header { font-size: 20px; }
    `
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('card')).toBe(true)
    expect(classes.has('header')).toBe(true)
    expect(classes.size).toBe(3)
  })

  it('should extract classes from pseudo-class selectors', () => {
    const css = '.btn:hover { color: blue; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should extract classes from pseudo-element selectors', () => {
    const css = ".btn::before { content: ''; }"
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should extract classes from compound selectors', () => {
    const css = '.btn.primary { color: blue; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('primary')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should extract classes from descendant selectors', () => {
    const css = '.parent .child { color: red; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('parent')).toBe(true)
    expect(classes.has('child')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should extract classes from child selectors', () => {
    const css = '.parent > .child { color: red; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('parent')).toBe(true)
    expect(classes.has('child')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should extract classes from adjacent sibling selectors', () => {
    const css = '.first + .second { margin-top: 10px; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('first')).toBe(true)
    expect(classes.has('second')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should extract classes from general sibling selectors', () => {
    const css = '.first ~ .second { margin-top: 10px; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('first')).toBe(true)
    expect(classes.has('second')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should extract classes from complex selectors', () => {
    const css = '.nav .menu-item:hover .dropdown.active { display: block; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('nav')).toBe(true)
    expect(classes.has('menu-item')).toBe(true)
    expect(classes.has('dropdown')).toBe(true)
    expect(classes.has('active')).toBe(true)
    expect(classes.size).toBe(4)
  })

  it('should handle classes with hyphens and underscores', () => {
    const css = `
      .my-button { color: red; }
      .my_button { color: blue; }
      .my-button_2 { color: green; }
    `
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('my-button')).toBe(true)
    expect(classes.has('my_button')).toBe(true)
    expect(classes.has('my-button_2')).toBe(true)
    expect(classes.size).toBe(3)
  })

  it('should handle classes with numbers', () => {
    const css = `
      .col-12 { width: 100%; }
      .mt-3 { margin-top: 1rem; }
    `
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('col-12')).toBe(true)
    expect(classes.has('mt-3')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should handle multiple selectors in one rule', () => {
    const css = '.btn, .button, .link { cursor: pointer; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('button')).toBe(true)
    expect(classes.has('link')).toBe(true)
    expect(classes.size).toBe(3)
  })

  it('should handle at-rules like @media', () => {
    const css = `
      @media (min-width: 768px) {
        .container { max-width: 1200px; }
        .responsive { display: flex; }
      }
    `
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('container')).toBe(true)
    expect(classes.has('responsive')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should handle nested at-rules', () => {
    const css = `
      @media (min-width: 768px) {
        @supports (display: grid) {
          .grid-container { display: grid; }
        }
      }
    `
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('grid-container')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should handle malformed CSS gracefully', () => {
    const css = '.btn { color: red'
    const classes = extractClassNamesFromCss(css)
    // Should not throw and may still extract some classes
    expect(classes).toBeInstanceOf(Set)
  })

  it('should handle empty CSS', () => {
    const css = ''
    const classes = extractClassNamesFromCss(css)
    expect(classes.size).toBe(0)
  })

  it('should handle CSS with only comments', () => {
    const css = '/* This is a comment */'
    const classes = extractClassNamesFromCss(css)
    expect(classes.size).toBe(0)
  })

  it('should ignore element selectors', () => {
    const css = 'div { color: red; } .btn { color: blue; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should ignore ID selectors', () => {
    const css = '#header { color: red; } .btn { color: blue; }'
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should ignore attribute selectors', () => {
    const css = "[data-id='123'] { color: red; } .btn { color: blue; }"
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  it('should extract unique classes only once', () => {
    const css = `
      .btn { color: red; }
      .btn:hover { color: blue; }
      .btn.active { color: green; }
    `
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('active')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should handle attribute selectors with class names', () => {
    const css =
      ".btn[disabled] { opacity: 0.5; } .btn[data-state='active'] { color: green; }"
    const classes = extractClassNamesFromCss(css)
    expect(classes.has('btn')).toBe(true)
    expect(classes.size).toBe(1)
  })

  describe('@layer directives', () => {
    it('should extract classes from @layer utilities', () => {
      const css = `
        @layer utilities {
          .text-shadow-sm {
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .text-shadow-lg {
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('text-shadow-sm')).toBe(true)
      expect(classes.has('text-shadow-lg')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should extract classes from @layer components', () => {
      const css = `
        @layer components {
          .btn {
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
          }
          .btn-primary {
            background-color: #3b82f6;
            color: white;
          }
          .card {
            background-color: white;
            border-radius: 0.5rem;
            padding: 1rem;
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('btn-primary')).toBe(true)
      expect(classes.has('card')).toBe(true)
      expect(classes.size).toBe(3)
    })

    it('should extract classes from @layer base', () => {
      const css = `
        @layer base {
          .reset {
            margin: 0;
            padding: 0;
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('reset')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes from multiple @layer blocks', () => {
      const css = `
        @layer utilities {
          .utility-1 {
            display: flex;
          }
        }

        @layer components {
          .component-1 {
            padding: 1rem;
          }
        }

        @layer utilities {
          .utility-2 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('utility-1')).toBe(true)
      expect(classes.has('utility-2')).toBe(true)
      expect(classes.has('component-1')).toBe(true)
      expect(classes.size).toBe(3)
    })

    it('should extract classes from nested selectors within @layer', () => {
      const css = `
        @layer components {
          .btn {
            padding: 1rem;
          }
          .btn:hover {
            opacity: 0.8;
          }
          .btn.active {
            font-weight: bold;
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('active')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle @layer with complex selectors', () => {
      const css = `
        @layer components {
          .card .header .title {
            font-size: 1.5rem;
          }
          .card > .body {
            padding: 1rem;
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('card')).toBe(true)
      expect(classes.has('header')).toBe(true)
      expect(classes.has('title')).toBe(true)
      expect(classes.has('body')).toBe(true)
      expect(classes.size).toBe(4)
    })

    it('should extract classes from @layer with media queries', () => {
      const css = `
        @layer utilities {
          @media (min-width: 768px) {
            .md-flex {
              display: flex;
            }
            .md-hidden {
              display: none;
            }
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('md-flex')).toBe(true)
      expect(classes.has('md-hidden')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle empty @layer blocks', () => {
      const css = `
        @layer utilities {
        }

        .btn {
          padding: 1rem;
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes both inside and outside @layer', () => {
      const css = `
        .regular-class {
          color: red;
        }

        @layer components {
          .layer-class {
            color: blue;
          }
        }

        .another-regular {
          color: green;
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('regular-class')).toBe(true)
      expect(classes.has('layer-class')).toBe(true)
      expect(classes.has('another-regular')).toBe(true)
      expect(classes.size).toBe(3)
    })
  })

  describe('Modern CSS pseudo-classes', () => {
    it('should extract classes from :not() pseudo-class', () => {
      const css = '.btn:not(.disabled) { cursor: pointer; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('disabled')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should extract classes from :is() pseudo-class', () => {
      const css = ':is(.btn, .link):hover { opacity: 0.8; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('link')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should extract classes from :where() pseudo-class', () => {
      const css = ':where(.card, .panel) .title { font-size: 1.5rem; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('card')).toBe(true)
      expect(classes.has('panel')).toBe(true)
      expect(classes.has('title')).toBe(true)
      expect(classes.size).toBe(3)
    })

    it('should extract classes from :has() pseudo-class', () => {
      const css = '.parent:has(.child) { padding: 1rem; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('parent')).toBe(true)
      expect(classes.has('child')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle complex modern pseudo-class combinations', () => {
      const css =
        ':is(.btn, .link):not(.disabled):has(.icon) { display: flex; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('link')).toBe(true)
      expect(classes.has('disabled')).toBe(true)
      expect(classes.has('icon')).toBe(true)
      expect(classes.size).toBe(4)
    })
  })

  describe('Escaped characters in class names', () => {
    it('should extract classes with escaped colons', () => {
      const css = '.hover\\:text-blue-500 { color: #3b82f6; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('hover:text-blue-500')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes with escaped brackets', () => {
      const css = '.w-\\[100px\\] { width: 100px; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('w-[100px]')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes with escaped at symbols', () => {
      const css = '.\\@media { color: red; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('@media')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes with multiple escaped characters', () => {
      const css = '.hover\\:focus\\:text-\\[red\\] { color: red; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('hover:focus:text-[red]')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes with escaped forward slashes', () => {
      const css = '.w-1\\/2 { width: 50%; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('w-1/2')).toBe(true)
      expect(classes.size).toBe(1)
    })
  })

  describe('Native CSS nesting', () => {
    it('should extract classes from native CSS nesting with ampersand', () => {
      const css = `
        .btn {
          color: blue;
          &:hover {
            color: red;
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract classes from nested child selectors', () => {
      const css = `
        .btn {
          & .icon {
            margin-right: 8px;
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('icon')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle multiple levels of native CSS nesting', () => {
      const css = `
        .card {
          .header {
            & .title {
              font-size: 1.5rem;
            }
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('card')).toBe(true)
      expect(classes.has('header')).toBe(true)
      expect(classes.has('title')).toBe(true)
      expect(classes.size).toBe(3)
    })
  })

  describe('Unicode and international characters', () => {
    it('should extract classes with German umlauts', () => {
      const css = '.über-menu { color: red; }'
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('über-menu')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should extract multiple international classes', () => {
      const css = `
        .café { color: brown; }
        .naïve { font-style: italic; }
        .São-Paulo { text-transform: uppercase; }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('café')).toBe(true)
      expect(classes.has('naïve')).toBe(true)
      expect(classes.has('São-Paulo')).toBe(true)
      expect(classes.size).toBe(3)
    })
  })

  describe('@container queries', () => {
    it('should handle @container queries', () => {
      const css = `
        @container (min-width: 400px) {
          .card { padding: 2rem; }
          .title { font-size: 1.5rem; }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('card')).toBe(true)
      expect(classes.has('title')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle named @container queries', () => {
      const css = `
        @container sidebar (min-width: 200px) {
          .nav { display: block; }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('nav')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should handle nested @container queries', () => {
      const css = `
        @container (min-width: 768px) {
          @container (min-height: 600px) {
            .full-layout { display: grid; }
          }
        }
      `
      const classes = extractClassNamesFromCss(css)
      expect(classes.has('full-layout')).toBe(true)
      expect(classes.size).toBe(1)
    })
  })

  describe('input validation', () => {
    it('should return empty set for invalid inputs', () => {
      // Test all invalid inputs using type-safe helper
      const invalidInputs = [
        INVALID_INPUTS.null,
        INVALID_INPUTS.undefined,
        INVALID_INPUTS.number,
        INVALID_INPUTS.object,
        INVALID_INPUTS.array,
        INVALID_INPUTS.boolean,
      ]

      for (const input of invalidInputs) {
        const classes = extractClassNamesFromCss(input as never)
        expect(classes).toBeInstanceOf(Set)
        expect(classes.size).toBe(0)
      }
    })

    it('should return empty set for whitespace-only input', () => {
      const classes = extractClassNamesFromCss(INVALID_INPUTS.whitespace)
      expect(classes.size).toBe(0)
    })
  })
})

describe('extractClassNamesFromScss', () => {
  // Mock file path for testing
  const mockFilePath = path.join(__dirname, 'test.scss')

  it('should extract class names from basic SCSS', () => {
    const scss = `
      .btn {
        color: red;
      }
      .card {
        padding: 10px;
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('card')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should extract class names from nested SCSS', () => {
    const scss = `
      .parent {
        color: blue;

        .child {
          color: red;
        }

        .another-child {
          color: green;
        }
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('parent')).toBe(true)
    expect(classes.has('child')).toBe(true)
    expect(classes.has('another-child')).toBe(true)
    expect(classes.size).toBe(3)
  })

  it('should extract class names from SCSS with ampersand nesting', () => {
    const scss = `
      .btn {
        color: blue;

        &:hover {
          color: red;
        }

        &.active {
          color: green;
        }

        &-primary {
          background: blue;
        }
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('active')).toBe(true)
    expect(classes.has('btn-primary')).toBe(true)
    expect(classes.size).toBe(3)
  })

  it('should handle SCSS variables', () => {
    const scss = `
      $primary-color: blue;

      .btn {
        color: $primary-color;
      }

      .card {
        background: $primary-color;
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('card')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should handle SCSS mixins', () => {
    const scss = `
      @mixin button-styles {
        padding: 10px;
        border-radius: 5px;
      }

      .btn {
        @include button-styles;
        color: blue;
      }

      .link-btn {
        @include button-styles;
        text-decoration: none;
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('btn')).toBe(true)
    expect(classes.has('link-btn')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should handle SCSS with deep nesting', () => {
    const scss = `
      .nav {
        .menu {
          .item {
            .link {
              color: blue;
            }
          }
        }
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('nav')).toBe(true)
    expect(classes.has('menu')).toBe(true)
    expect(classes.has('item')).toBe(true)
    expect(classes.has('link')).toBe(true)
    expect(classes.size).toBe(4)
  })

  it('should handle SCSS with @extend', () => {
    const scss = `
      .base-btn {
        padding: 10px;
      }

      .primary-btn {
        @extend .base-btn;
        color: blue;
      }

      .secondary-btn {
        @extend .base-btn;
        color: gray;
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('base-btn')).toBe(true)
    expect(classes.has('primary-btn')).toBe(true)
    expect(classes.has('secondary-btn')).toBe(true)
    expect(classes.size).toBe(3)
  })

  it('should handle SCSS with interpolation', () => {
    const scss = `
      $prefix: "btn";

      .#{$prefix}-primary {
        color: blue;
      }

      .#{$prefix}-secondary {
        color: gray;
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.has('btn-primary')).toBe(true)
    expect(classes.has('btn-secondary')).toBe(true)
    expect(classes.size).toBe(2)
  })

  it('should handle SCSS compilation errors gracefully', () => {
    const scss = `
      .btn {
        color: $undefined-variable;
      }
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    // Should return empty set on compilation error
    expect(classes.size).toBe(0)
  })

  it('should handle malformed SCSS gracefully', () => {
    const scss = `
      .btn {
        color: red
    `
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    // Should return empty set on compilation error
    expect(classes.size).toBe(0)
  })

  it('should handle empty SCSS', () => {
    const scss = ''
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.size).toBe(0)
  })

  it('should handle SCSS with only comments', () => {
    const scss = '// This is a comment\n/* This is another comment */'
    const classes = extractClassNamesFromScss(scss, mockFilePath)
    expect(classes.size).toBe(0)
  })

  describe('input validation', () => {
    it('should return empty set for invalid scssContent inputs', () => {
      // Test all invalid inputs using type-safe helper
      const invalidInputs = [
        INVALID_INPUTS.null,
        INVALID_INPUTS.undefined,
        INVALID_INPUTS.number,
      ]

      for (const input of invalidInputs) {
        const classes = extractClassNamesFromScss(input as never, mockFilePath)
        expect(classes.size).toBe(0)
      }
    })

    it('should return empty set for whitespace-only SCSS', () => {
      const classes = extractClassNamesFromScss(
        INVALID_INPUTS.whitespace,
        mockFilePath,
      )
      expect(classes.size).toBe(0)
    })

    it('should return empty set for missing filePath', () => {
      const classes = extractClassNamesFromScss(
        '.btn { color: red; }',
        INVALID_INPUTS.emptyString as never,
      )
      expect(classes.size).toBe(0)
    })
  })

  describe('cwd parameter', () => {
    it('should work with optional cwd parameter', () => {
      const scss = '.btn { color: red; }'
      const classes = extractClassNamesFromScss(
        scss,
        mockFilePath,
        process.cwd(),
      )
      expect(classes.has('btn')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should work without cwd parameter (backward compatibility)', () => {
      const scss = '.card { padding: 10px; }'
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('card')).toBe(true)
      expect(classes.size).toBe(1)
    })
  })

  describe('SCSS @for loops', () => {
    it('should extract classes from @for loop with through', () => {
      const scss = `
        @for $i from 1 through 3 {
          .col-#{$i} {
            width: percentage($i / 12);
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('col-1')).toBe(true)
      expect(classes.has('col-2')).toBe(true)
      expect(classes.has('col-3')).toBe(true)
      expect(classes.size).toBe(3)
    })

    it('should extract classes from @for loop with to (exclusive)', () => {
      const scss = `
        @for $i from 1 to 3 {
          .item-#{$i} {
            order: $i;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('item-1')).toBe(true)
      expect(classes.has('item-2')).toBe(true)
      expect(classes.has('item-3')).toBe(false)
      expect(classes.size).toBe(2)
    })

    it('should handle @for loops generating grid classes', () => {
      const scss = `
        @for $i from 1 through 12 {
          .col-#{$i} {
            flex: 0 0 percentage($i / 12);
          }
          .offset-#{$i} {
            margin-left: percentage($i / 12);
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      // Check a few samples
      expect(classes.has('col-1')).toBe(true)
      expect(classes.has('col-6')).toBe(true)
      expect(classes.has('col-12')).toBe(true)
      expect(classes.has('offset-1')).toBe(true)
      expect(classes.has('offset-6')).toBe(true)
      expect(classes.has('offset-12')).toBe(true)
      expect(classes.size).toBe(24) // 12 cols + 12 offsets
    })
  })

  describe('SCSS @each loops', () => {
    it('should extract classes from @each with simple list', () => {
      const scss = `
        @each $color in red, blue, green {
          .text-#{$color} {
            color: $color;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('text-red')).toBe(true)
      expect(classes.has('text-blue')).toBe(true)
      expect(classes.has('text-green')).toBe(true)
      expect(classes.size).toBe(3)
    })

    it('should extract classes from @each with map', () => {
      const scss = `
        $colors: (
          'primary': #007bff,
          'secondary': #6c757d,
          'success': #28a745
        );

        @each $name, $value in $colors {
          .bg-#{$name} {
            background-color: $value;
          }
          .text-#{$name} {
            color: $value;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('bg-primary')).toBe(true)
      expect(classes.has('bg-secondary')).toBe(true)
      expect(classes.has('bg-success')).toBe(true)
      expect(classes.has('text-primary')).toBe(true)
      expect(classes.has('text-secondary')).toBe(true)
      expect(classes.has('text-success')).toBe(true)
      expect(classes.size).toBe(6)
    })

    it('should extract classes from @each with multiple variables', () => {
      const scss = `
        @each $size, $value in (sm: 12px, md: 16px, lg: 20px) {
          .text-#{$size} {
            font-size: $value;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('text-sm')).toBe(true)
      expect(classes.has('text-md')).toBe(true)
      expect(classes.has('text-lg')).toBe(true)
      expect(classes.size).toBe(3)
    })
  })

  describe('SCSS BEM patterns', () => {
    it('should extract BEM element classes with double underscore', () => {
      const scss = `
        .block {
          color: blue;

          &__element {
            color: red;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('block')).toBe(true)
      expect(classes.has('block__element')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should extract BEM modifier classes with double dash', () => {
      const scss = `
        .block {
          color: blue;

          &--modifier {
            color: green;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('block')).toBe(true)
      expect(classes.has('block--modifier')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle nested BEM elements and modifiers', () => {
      const scss = `
        .card {
          display: block;

          &__header {
            font-weight: bold;

            &--large {
              font-size: 2rem;
            }
          }
          &__body {
            padding: 1rem;
          }
          &--featured {
            border: 2px solid gold;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('card')).toBe(true)
      expect(classes.has('card__header')).toBe(true)
      expect(classes.has('card__header--large')).toBe(true)
      expect(classes.has('card__body')).toBe(true)
      expect(classes.has('card--featured')).toBe(true)
      expect(classes.size).toBe(5)
    })

    it('should handle multiple BEM modifiers', () => {
      const scss = `
        .button {
          cursor: pointer;

          &--primary {
            background: blue;
          }
          &--secondary {
            background: gray;
          }
          &--large {
            padding: 1rem 2rem;
          }
          &--small {
            padding: 0.25rem 0.5rem;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('button')).toBe(true)
      expect(classes.has('button--primary')).toBe(true)
      expect(classes.has('button--secondary')).toBe(true)
      expect(classes.has('button--large')).toBe(true)
      expect(classes.has('button--small')).toBe(true)
      expect(classes.size).toBe(5)
    })
  })

  describe('SCSS placeholder selectors', () => {
    it('should handle placeholder selectors with @extend', () => {
      const scss = `
        %button-base {
          padding: 10px 20px;
          border-radius: 4px;
        }

        .btn-primary {
          @extend %button-base;
          background: blue;
        }

        .btn-secondary {
          @extend %button-base;
          background: gray;
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('btn-primary')).toBe(true)
      expect(classes.has('btn-secondary')).toBe(true)
      expect(classes.size).toBe(2)
      // Note: Placeholder %button-base should NOT be extracted
    })

    it('should handle multiple placeholder selectors', () => {
      const scss = `
        %flex-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        %shadow {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .card {
          @extend %flex-center;
          @extend %shadow;
          padding: 1rem;
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('card')).toBe(true)
      expect(classes.size).toBe(1)
    })
  })

  describe('SCSS conditionals', () => {
    it('should extract classes from @if block when condition is true', () => {
      const scss = `
        @if true {
          .visible {
            display: block;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('visible')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should not extract classes from @if block when condition is false', () => {
      const scss = `
        @if false {
          .hidden {
            display: none;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.size).toBe(0)
    })

    it('should handle @if @else conditionals', () => {
      const scss = `
        @if false {
          .light-theme {
            background: white;
          }
        } @else {
          .dark-theme {
            background: black;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('dark-theme')).toBe(true)
      expect(classes.has('light-theme')).toBe(false)
      expect(classes.size).toBe(1)
    })

    it('should handle variable-based @if conditions', () => {
      const scss = `
        $theme: 'dark';

        @if $theme == 'dark' {
          .bg-dark {
            background: #000;
            color: #fff;
          }
        } @else {
          .bg-light {
            background: #fff;
            color: #000;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('bg-dark')).toBe(true)
      expect(classes.has('bg-light')).toBe(false)
      expect(classes.size).toBe(1)
    })

    it('should handle @else if chains', () => {
      const scss = `
        $size: 'medium';

        @if $size == 'small' {
          .text-sm { font-size: 12px; }
        } @else if $size == 'medium' {
          .text-md { font-size: 16px; }
        } @else {
          .text-lg { font-size: 20px; }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('text-md')).toBe(true)
      expect(classes.has('text-sm')).toBe(false)
      expect(classes.has('text-lg')).toBe(false)
      expect(classes.size).toBe(1)
    })
  })

  describe('SCSS advanced features', () => {
    it('should handle @function definitions', () => {
      const scss = `
        @function calculate-rem($px) {
          @return #{$px / 16}rem;
        }

        .text {
          font-size: calculate-rem(24);
        }

        .heading {
          font-size: calculate-rem(32);
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('text')).toBe(true)
      expect(classes.has('heading')).toBe(true)
      expect(classes.size).toBe(2)
    })

    it('should handle @while loops', () => {
      const scss = `
        $i: 1;

        @while $i <= 3 {
          .mb-#{$i} {
            margin-bottom: #{$i}rem;
          }
          $i: $i + 1;
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('mb-1')).toBe(true)
      expect(classes.has('mb-2')).toBe(true)
      expect(classes.has('mb-3')).toBe(true)
      expect(classes.size).toBe(3)
    })

    it('should handle @import statements', () => {
      // Note: @import will fail compilation if files don't exist
      // This tests that we gracefully handle compilation errors
      const scss = `
        @import 'variables';
        @import 'mixins';

        .btn {
          color: red;
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      // Import fails, so no classes are extracted (compilation error)
      expect(classes.size).toBe(0)
    })

    it('should handle @use from built-in modules', () => {
      const scss = `
        @use 'sass:math';
        @use 'sass:color';

        .calculated {
          width: math.div(100%, 3);
          color: color.adjust(blue, $lightness: 20%);
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('calculated')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should handle @keyframes (should not extract animation names as classes)', () => {
      const scss = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animated {
          animation: fadeIn 1s;
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('animated')).toBe(true)
      expect(classes.has('fadeIn')).toBe(false) // Animation name is not a class
      expect(classes.size).toBe(1)
    })

    it('should handle @supports in SCSS', () => {
      const scss = `
        @supports (display: grid) {
          .grid-layout {
            display: grid;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('grid-layout')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should handle complex @for loop with calculations', () => {
      const scss = `
        @for $i from 1 through 5 {
          .w-#{$i * 20} {
            width: percentage($i / 5);
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('w-20')).toBe(true)
      expect(classes.has('w-40')).toBe(true)
      expect(classes.has('w-60')).toBe(true)
      expect(classes.has('w-80')).toBe(true)
      expect(classes.has('w-100')).toBe(true)
      expect(classes.size).toBe(5)
    })

    it('should handle @content in mixins', () => {
      const scss = `
        @mixin responsive($breakpoint) {
          @if $breakpoint == mobile {
            @media (max-width: 767px) {
              @content;
            }
          }
        }

        .container {
          width: 100%;

          @include responsive(mobile) {
            width: 90%;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('container')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should handle SCSS with multiple @use imports', () => {
      const scss = `
        @use 'sass:color';
        @use 'sass:list';
        @use 'sass:map';

        .themed {
          background: color.adjust(blue, $lightness: 20%);
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('themed')).toBe(true)
      expect(classes.size).toBe(1)
    })

    it('should handle parent selector in complex ways', () => {
      const scss = `
        .btn {
          &:hover,
          &:focus {
            opacity: 0.8;
          }

          &.active,
          &.selected {
            font-weight: bold;
          }

          &__icon {
            margin-right: 8px;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('btn')).toBe(true)
      expect(classes.has('active')).toBe(true)
      expect(classes.has('selected')).toBe(true)
      expect(classes.has('btn__icon')).toBe(true)
      expect(classes.size).toBe(4)
    })

    it('should handle @at-root directive', () => {
      const scss = `
        .parent {
          color: blue;

          @at-root .independent {
            color: red;
          }

          .child {
            color: green;
          }
        }
      `
      const classes = extractClassNamesFromScss(scss, mockFilePath)
      expect(classes.has('parent')).toBe(true)
      expect(classes.has('independent')).toBe(true)
      expect(classes.has('child')).toBe(true)
      expect(classes.size).toBe(3)
    })
  })
})
