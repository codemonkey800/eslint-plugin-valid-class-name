# eslint-plugin-valid-class-name

> ESLint plugin that validates CSS class names in JSX/TSX against actual CSS/SCSS files, Tailwind configuration, and whitelists.

Catch typos and invalid class names at lint time, before they reach production. This plugin ensures that every `className` in your React/JSX code corresponds to an actual CSS class that exists in your stylesheets or Tailwind configuration.

## Features

- 📝 **CSS/SCSS Validation** - Parses your CSS and SCSS files to extract valid class names
- 🎨 **Tailwind CSS Support** - Validates Tailwind utilities, variants, arbitrary values, and plugin-generated classes
- ⭐ **Whitelist Patterns** - Define custom patterns that are always valid (supports glob-style wildcards)
- 🚫 **Ignore Patterns** - Skip validation for dynamic or generated class names
- ⚡ **High Performance** - Intelligent caching ensures fast linting even in large codebases
- 🔧 **ESLint 8 & 9** - Supports both legacy and flat config formats

## Installation

```bash
npm install --save-dev eslint-plugin-valid-class-name
```

```bash
yarn add --dev eslint-plugin-valid-class-name
```

```bash
pnpm add --save-dev eslint-plugin-valid-class-name
```

**Requirements:** ESLint 8.0.0+ or 9.0.0+

## Quick Start

**ESLint 9+ (Flat Config)**

```javascript
// eslint.config.js
import validClassName from 'eslint-plugin-valid-class-name'

export default [
  {
    plugins: {
      'valid-class-name': validClassName,
    },
    rules: {
      'valid-class-name/valid-class-name': [
        'error',
        {
          sources: {
            css: ['src/**/*.css'],
            tailwind: true,
          },
        },
      ],
    },
  },
]
```

**ESLint 8 (.eslintrc)**

```json
{
  "plugins": ["valid-class-name"],
  "rules": {
    "valid-class-name/valid-class-name": [
      "error",
      {
        "sources": {
          "css": ["src/**/*.css"],
          "tailwind": true
        }
      }
    ]
  }
}
```

## Configuration

### Options

#### `sources`

Configure which files and frameworks to validate against.

##### `sources.css`

Glob patterns for CSS files.

```javascript
{
  sources: {
    css: ['src/**/*.css', 'styles/**/*.css']
  }
}
```

##### `sources.scss`

Glob patterns for SCSS files. SCSS files are compiled to CSS before class extraction.

```javascript
{
  sources: {
    scss: ['src/**/*.scss']
  }
}
```

##### `sources.tailwind`

Enable Tailwind CSS validation.

```javascript
{
  sources: {
    // Auto-detect tailwind.config.js
    tailwind: true

    // Or specify a custom config path
    tailwind: {
      config: './config/tailwind.config.js'
    }

    // Include plugin-generated classes (default: true)
    tailwind: {
      config: './tailwind.config.js',
      includePluginClasses: true
    }
  }
}
```

#### `validation`

Configure validation rules and patterns.

##### `validation.whitelist`

Array of class name patterns that are always considered valid. Supports glob-style wildcards (`*`).

```javascript
{
  validation: {
    whitelist: [
      'custom-button', // Exact match
      'app-*', // Matches app-header, app-footer, etc.
      '*-primary', // Matches btn-primary, card-primary, etc.
      'legacy-*-wrapper', // Matches legacy-nav-wrapper, etc.
    ]
  }
}
```

##### `validation.ignorePatterns`

Array of patterns to skip validation for. Useful for dynamic or generated class names.

```javascript
{
  validation: {
    ignorePatterns: ['dynamic-*', 'generated-*', 'state-*']
  }
}
```

### Complete Configuration Example

```javascript
// eslint.config.js
import validClassName from 'eslint-plugin-valid-class-name'

export default [
  {
    plugins: {
      'valid-class-name': validClassName,
    },
    rules: {
      'valid-class-name/valid-class-name': [
        'error',
        {
          sources: {
            css: ['src/**/*.css'],
            scss: ['src/**/*.scss'],
            tailwind: {
              config: './tailwind.config.js',
              includePluginClasses: true,
            },
          },
          validation: {
            whitelist: ['custom-*', 'app-*'],
            ignorePatterns: ['dynamic-*', 'js-*'],
          },
        },
      ],
    },
  },
]
```

## Examples

### ✅ Valid Code

```jsx
// Classes from CSS files
<div className="btn card" />

// Tailwind utilities
<div className="flex items-center justify-center" />

// Tailwind with variants
<button className="hover:bg-blue-500 focus:ring-2 dark:bg-gray-800" />

// Arbitrary values
<div className="w-[100px] bg-[#1da1f2] grid-cols-[200px_1fr]" />

// Arbitrary variants
<div className="[&:nth-child(3)]:mt-2" />

// Whitelisted patterns
<div className="custom-button app-header" />
// (with whitelist: ['custom-*', 'app-*'])

// Ignored patterns (validation skipped)
<div className="dynamic-class-123" />
// (with ignorePatterns: ['dynamic-*'])

// Dynamic expressions (automatically skipped)
<div className={dynamicClass} />
<div className={`flex ${someVar}`} />
```

### ❌ Invalid Code

```jsx
// Non-existent class
<div className="non-existent-class" />
// Error: Class name "non-existent-class" is not valid

// Typo in class name
<div className="txt-center" />
// Error: Class name "txt-center" is not valid
// (should be "text-center")

// Multiple invalid classes
<div className="foo bar baz" />
// Error: Class name "foo" is not valid
// Error: Class name "bar" is not valid
// Error: Class name "baz" is not valid

// Mix of valid and invalid
<div className="flex invalid-class items-center" />
// Error: Class name "invalid-class" is not valid
```

### Edge Cases

Dynamic class names and template literals are automatically skipped:

```jsx
// These are NOT validated (no errors)
<div className={dynamicClass} />
<div className={`dynamic-${foo}`} />
<div className={condition ? 'class-a' : 'class-b'} />
```

String literals in JSX expressions are validated:

```jsx
// This IS validated
<div className={'static-class'} />
```

## Tailwind CSS Support

### What's Supported

- **Utilities**: All Tailwind utility classes from your theme configuration
- **Variants**: `hover:`, `focus:`, `dark:`, `md:`, `group-hover:`, etc.
- **Arbitrary Variants**: `[&:nth-child(3)]:`, `[&_p]:`, etc.
- **Arbitrary Values**: `w-[100px]`, `bg-[#1da1f2]`, `grid-cols-[200px_1fr]`
- **Negative Values**: `-mt-4`, `-left-8`
- **Plugin Classes**: Classes from Tailwind plugins (when `includePluginClasses: true`)

### How Variant Validation Works

When a class contains Tailwind variants (e.g., `hover:bg-blue-500`):

1. The plugin separates the variants from the base utility
2. Validates each variant against known Tailwind variants
3. Validates the base utility against Tailwind classes (not CSS classes)

```jsx
// Valid - both hover variant and bg-blue-500 utility exist
<div className="hover:bg-blue-500" />

// Invalid - typo in variant
<div className="hober:bg-blue-500" />
// Error: Invalid variant "hober"

// Invalid - typo in utility
<div className="hover:bg-blue-50000" />
// Error: Class name "bg-blue-50000" is not valid
```

## How It Works

The plugin uses a multi-layered architecture:

1. **Class Registry** - Central caching layer that aggregates class names from all sources
2. **CSS/SCSS Parser** - Uses PostCSS to extract class names from stylesheets
3. **Tailwind Parser** - Generates utilities from Tailwind configuration
4. **Variant Validator** - Handles Tailwind variants and arbitrary values

### Performance

- **Smart Caching**: Registry is cached based on configuration. Cache invalidates only when config changes.
- **Efficient Lookups**: Literal classes use Set for O(1) lookup. Wildcard patterns are checked only after literal lookup fails.
- **Lazy Loading**: CSS files are parsed only once during ESLint execution.

## Limitations

- **Static Classes Only**: The plugin only validates static string literals in `className` attributes. Dynamic expressions, template literals, and variables are automatically skipped.
- **CSS Modules**: Not yet implemented. Use `validation.whitelist` patterns as a workaround.
- **Blacklist**: Not yet implemented.

## Development

For development instructions, architecture details, and contributing guidelines, see [CLAUDE.md](CLAUDE.md).

### Quick Commands

```bash
pnpm run build        # Build the plugin
pnpm test             # Run tests
pnpm run lint         # Lint source code
pnpm run type-check   # TypeScript type checking
```

## License

MIT
