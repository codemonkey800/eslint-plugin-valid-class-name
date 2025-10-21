import { describe, expect, it } from '@jest/globals'
import {
  extractClassNamesFromCss,
  extractClassNamesFromScss,
} from './css-parser'
import path from 'path'
import { fileURLToPath } from 'url'

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
})
