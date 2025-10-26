# HTML Example Project for eslint-plugin-valid-class-name

This project demonstrates HTML support for the `eslint-plugin-valid-class-name` ESLint plugin. It validates `class` attributes in HTML files against CSS/SCSS files and Tailwind configuration.

## Project Structure

```
html-example/
├── src/
│   ├── styles/
│   │   ├── app.css              # Custom CSS classes
│   │   └── components.scss      # SCSS classes
│   └── pages/
│       ├── valid.html           # Valid HTML (should pass linting)
│       ├── invalid.html         # Invalid HTML (should fail linting)
│       ├── tailwind.html        # Tailwind utility classes
│       ├── variants.html        # Tailwind variants
│       ├── arbitrary.html       # Arbitrary values
│       ├── mixed.html           # Realistic mix of CSS/SCSS/Tailwind
│       └── edge-cases.html      # Edge cases
├── eslint.config.js             # ESLint configuration with Angular parser
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Dependencies and test scripts
```

## Setup

Install dependencies:

```bash
pnpm install
```

## Usage

### Run ESLint on all HTML files

```bash
pnpm run lint
```

### Test individual files

```bash
# Valid HTML (should pass with no errors)
pnpm run test:valid

# Invalid HTML (should fail with errors)
pnpm run test:invalid

# Tailwind utilities
pnpm run test:tailwind

# Tailwind variants
pnpm run test:variants

# Arbitrary values
pnpm run test:arbitrary

# Mixed classes (realistic example)
pnpm run test:mixed

# Edge cases
pnpm run test:edge-cases
```

### Test all valid/invalid files

```bash
# Run all valid files (should pass)
pnpm run test:all-valid

# Run all invalid files (should show errors)
pnpm run test:all-invalid
```

## HTML Files Overview

### valid.html

Demonstrates valid usage of:
- Custom CSS classes (header, container, nav, etc.)
- SCSS component classes (button-primary, alert, form-group, etc.)
- Tailwind utilities (flex, grid, text-*, bg-*, etc.)
- CSS @layer components (btn, card, badge, etc.)
- Ignore patterns (dynamic-*, custom-*)

**Expected result**: ✅ No ESLint errors

### invalid.html

Contains intentionally invalid class names:
- Typos in CSS classes (headr, containr, nvigation)
- Invalid Tailwind utilities (flx, bg-blu-500, p-400)
- Non-existent component classes (btn-danger, button-tertiary)
- Empty arbitrary values (w-[], bg-[])
- Completely made-up classes

**Expected result**: ❌ Multiple ESLint errors

### tailwind.html

Comprehensive examples of Tailwind utilities:
- Layout (flexbox, grid, display, position)
- Colors (background, text, border colors)
- Spacing (margin, padding, gap)
- Sizing (width, height, min/max)
- Typography (font size, weight, style)
- Borders and effects (border, shadow, opacity)

**Expected result**: ✅ No ESLint errors

### variants.html

Tailwind variant examples:
- Interactive states (hover:, focus:, active:, visited:)
- Form states (disabled:, checked:, invalid:, placeholder-shown:)
- Child selectors (first:, last:, odd:, even:)
- Responsive breakpoints (sm:, md:, lg:, xl:)
- Dark mode (dark:)
- Group and peer interactions (group-hover:, peer-checked:)
- Combined variants (md:hover:, dark:md:)

**Expected result**: ✅ No ESLint errors

### arbitrary.html

Arbitrary value syntax examples:
- Arbitrary spacing (w-[100px], m-[2rem])
- Arbitrary colors (bg-[#ff0000], text-[rgb(255,0,0)])
- Arbitrary sizing (min-w-[200px], h-[50vh])
- Arbitrary with variants (hover:w-[200px], md:bg-[#00ff00])
- Negative arbitrary values (-mt-[10px])
- Arbitrary content (before:content-['★'])

**Expected result**: ✅ No ESLint errors

### mixed.html

Realistic website example mixing:
- Custom CSS classes for layout (header, footer, container)
- SCSS components for UI elements (button-primary, alert, form-input)
- Tailwind utilities for spacing and styling
- Responsive design patterns
- Practical use cases (navigation, cards, forms, CTAs)

**Expected result**: ✅ No ESLint errors

### edge-cases.html

Edge cases that should be handled correctly:
- Empty class attributes
- Whitespace handling (leading/trailing spaces, multiple spaces)
- Important modifier (!)
- Zero values (m-0, p-0, w-0)
- Auto values (m-auto, w-auto)
- Full and screen values (w-full, h-screen)
- Fractional values (w-1/2, w-1/3)
- Negative values (-m-4, -mt-2)
- Decimal values (w-0.5, p-1.5)
- Slashed values for opacity (bg-blue-500/50)
- Ignored patterns (dynamic-*, custom-*)

**Expected result**: ✅ No ESLint errors

## What the Plugin Validates

The plugin is configured to validate class names against:

1. **CSS files**: `src/styles/**/*.css`
2. **SCSS files**: `src/styles/**/*.scss`
3. **Tailwind utilities**: All Tailwind classes from configuration
4. **Ignore patterns**: `dynamic-*` and `custom-*` (skips validation)

### HTML vs JSX Differences

**HTML Support (this example)**:
- ✅ Validates `class` attributes in HTML elements
- ✅ Only supports string literals (no JavaScript expressions)
- ✅ Uses `@angular-eslint/template-parser` for parsing
- ✅ All validation features work (CSS, SCSS, Tailwind, ignore patterns)

**JSX Support** (see examples/react):
- ✅ Validates `className` attributes in JSX
- ✅ Supports dynamic expressions (ternaries, function calls, variables)
- ✅ Supports object-style attributes (`classes={{ root: 'mt-2' }}`)

## Key Features Demonstrated

### Tailwind Support

- ✅ All utility classes from theme configuration
- ✅ All variants (hover, focus, responsive, dark mode, etc.)
- ✅ Arbitrary values (`w-[100px]`, `bg-[#ff0000]`)
- ✅ Arbitrary variants (`[&:nth-child(3)]:mt-2`)
- ✅ Plugin-generated classes
- ✅ @layer utilities and components

### CSS/SCSS Support

- ✅ CSS classes from any CSS files
- ✅ SCSS classes (compiled before extraction)
- ✅ @layer components and utilities
- ✅ Nested selectors and pseudo-classes

### Validation Features

- ✅ Glob pattern support for file matching
- ✅ Ignore patterns with wildcards
- ✅ Intelligent caching for performance
- ✅ Descriptive error messages

## Error Examples

When you run `pnpm run test:invalid`, you'll see errors like:

```
src/pages/invalid.html
  10:17  error  Class 'headr' is not defined in any CSS/SCSS file or Tailwind config  valid-class-name/valid-class-name
  11:18  error  Class 'containr' is not defined in any CSS/SCSS file or Tailwind config  valid-class-name/valid-class-name
  12:19  error  Class 'nvigation' is not defined in any CSS/SCSS file or Tailwind config  valid-class-name/valid-class-name
  ...
```

## Configuration

The plugin is configured in [eslint.config.js](eslint.config.js):

```javascript
export default [
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularParser,
    },
    plugins: {
      'valid-class-name': validClassName,
    },
    rules: {
      'valid-class-name/valid-class-name': [
        'error',
        {
          sources: {
            css: ['src/styles/**/*.css'],
            scss: ['src/styles/**/*.scss'],
            tailwind: true,
          },
          validation: {
            ignorePatterns: ['dynamic-*', 'custom-*'],
          },
        },
      ],
    },
  },
]
```

## Making Changes

To test changes to the main plugin:

1. Make changes in the parent directory
2. Rebuild the plugin: `cd ../.. && pnpm run build`
3. Reinstall in this example: `pnpm install`
4. Run tests again

## Notes

- The `@angular-eslint/template-parser` works with plain HTML files, not just Angular templates
- HTML validation only supports string literals in `class` attributes
- Dynamic class generation should use ignored patterns or be handled separately
- All Tailwind features are automatically supported without explicit configuration
