# eslint-plugin-valid-class-name

> ESLint plugin that validates CSS class names in JSX/TSX against actual CSS/SCSS files and Tailwind configuration.

Catch typos and invalid class names at lint time, before they reach production. This plugin ensures that every `className` in your React/JSX code corresponds to an actual CSS class that exists in your stylesheets or Tailwind configuration.

## Features

- 📝 **CSS/SCSS Validation** - Parses your CSS and SCSS files to extract valid class names
- 🎨 **Tailwind CSS Support** - Validates Tailwind utilities, variants, arbitrary values, and plugin-generated classes
- 🔀 **Dynamic Expression Support** - Validates class names in ternaries, logical operators, and utility functions (cns/clsx/classnames)
- 🎯 **Object-Style Attributes** - Validates component library patterns like `classes={{ root: 'mt-2' }}` (Material-UI, Chakra UI, etc.)
- 🔇 **Ignore Patterns** - Skip validation for dynamic or generated class names
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

##### `validation.ignorePatterns`

Array of patterns to skip validation for. Useful for dynamic or generated class names.

```javascript
{
  validation: {
    ignorePatterns: ['dynamic-*', 'generated-*', 'state-*']
  }
}
```

**Example usage:**

```jsx
// With ignorePatterns: ['dynamic-*']
<div className="dynamic-widget" />
// ⏭️ Validation completely skipped (not checked at all)
```

##### `validation.objectStyleAttributes`

Array of attribute names that use object-style class name syntax. Common in component libraries like Material-UI, Chakra UI, Mantine, etc.

For these attributes, the plugin extracts and validates class names from object property **values** (not keys).

```javascript
{
  validation: {
    // Enable validation for object-style attributes
    objectStyleAttributes: ['classes', 'classNames', 'sx']
  }
}
```

**How it works:**

```jsx
// With objectStyleAttributes: ['classes']
<Component classes={{ root: 'mt-2', header: 'flex' }} />
//                    ^^^^^^^^^^^^  ^^^^^^^^^^^^^^
//                    Key (ignored) Value (validated)
```

**Common attribute names:**

- `classes` - Material-UI, Chakra UI, Mantine
- `classNames` - Some custom component libraries
- `sx` - Material-UI's sx prop (when using string values)

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
            ignorePatterns: ['dynamic-*', 'js-*'],
            objectStyleAttributes: ['classes', 'classNames', 'sx'],
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

// Ignored patterns (validation skipped)
<div className="dynamic-class-123" />
// (with ignorePatterns: ['dynamic-*'])
```

### 🎯 Object-Style Attributes

Component libraries like Material-UI and Chakra UI use object-style props for nested component styling:

```jsx
// Material-UI style - classes prop
<Card
  classes={{
    root: 'card rounded',
    header: 'flex items-center',
    body: 'p-4 bg-blue-500',
  }}
/>

// Alternative naming - classNames prop
<Component
  classNames={{
    container: 'flex',
    title: 'text-lg font-bold',
  }}
/>

// Mix of className and object-style
<Card
  className="main-content"
  classes={{
    root: 'card',
    header: 'flex',
  }}
/>

// Object values support all dynamic expressions
<Card
  classes={{
    root: isActive ? 'bg-blue-500' : 'bg-gray-500',
    header: condition && 'flex items-center',
    body: clsx('p-4', isLarge && 'text-lg'),
  }}
/>
```

**Configuration required:**

```javascript
{
  validation: {
    objectStyleAttributes: ['classes', 'classNames', 'sx']
  }
}
```

### 🔀 Dynamic Expressions

The plugin validates static class strings within dynamic expressions:

```jsx
// Ternary operators (validates both branches)
<div className={isActive ? "bg-blue-500" : "bg-gray-300"} />
<div className={size === 'large' ? "p-4 text-lg" : "p-2 text-sm"} />

// Logical operators
<div className={isDisabled && "opacity-50"} />
<div className={customClass || "flex"} />
<div className={value ?? "items-center"} />

// Utility functions (cns, clsx, classnames)
<div className={cns("flex", isActive && "bg-blue-500")} />
<div className={clsx("p-4", condition ? "rounded" : "square")} />
<div className={classnames("mt-2", isDisabled && "opacity-50")} />

// Template literals without interpolation
<div className={`flex items-center`} />

// Nested combinations
<div className={cns(
  "container",
  isActive ? (isLarge ? "p-4" : "p-2") : "p-1",
  showBorder && "border"
)} />

// Note: Variables and template interpolations are skipped
<div className={dynamicClass} />  {/* Skipped - can't validate variables */}
<div className={`flex-${direction}`} />  {/* Skipped - has interpolation */}
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

**✅ What IS validated:**

The plugin extracts and validates static string literals from dynamic expressions:

```jsx
// Ternary expressions - BOTH branches are validated
<div className={condition ? 'class-a' : 'class-b'} />

// Logical expressions - string literals are validated
<div className={isDisabled && 'opacity-50'} />

// Function calls - all static strings are validated
<div className={cns('flex', condition && 'bg-blue-500')} />

// Template literals without interpolation
<div className={`flex items-center`} />

// String literals in JSX expressions
<div className={'static-class'} />
```

**⏭️ What is NOT validated (skipped):**

The plugin skips validation for truly dynamic values that can't be determined at lint time:

```jsx
// Variables and identifiers
<div className={dynamicClass} />
<div className={condition ? someVar : 'flex'} />

// Template literals with interpolation
<div className={`dynamic-${foo}`} />
<div className={`flex-${direction} mt-${spacing}`} />
```

**✅ What IS validated (even within function calls):**

The plugin extracts and validates static string literals from arrays, objects, and mixed syntax:

```jsx
// Object syntax - validates class names from keys
<div className={clsx({ 'active': isActive, 'disabled': isDisabled })} />
// ✅ Validates: 'active', 'disabled'

// Array syntax - validates all static strings
<div className={cns(['flex', condition && 'active'])} />
// ✅ Validates: 'flex', 'active'

// Mixed array and object syntax
<div className={clsx(['flex', { 'active': isActive }])} />
// ✅ Validates: 'flex', 'active'

// Nested arrays and conditionals
<div className={clsx(['base', condition ? 'variant-a' : 'variant-b', { 'special': true }])} />
// ✅ Validates: 'base', 'variant-a', 'variant-b', 'special'
```

## Dynamic Class Name Support

The plugin uses **recursive expression tree traversal** to extract and validate static string literals from dynamic expressions. This means you can use common JavaScript patterns while still getting validation for the class names you use.

### Supported Patterns

| Pattern                         | Example                      | Status       |
| ------------------------------- | ---------------------------- | ------------ |
| **Ternary Operators**           | `condition ? 'a' : 'b'`      | ✅ Validated |
| **Logical AND**                 | `condition && 'class'`       | ✅ Validated |
| **Logical OR**                  | `value \|\| 'class'`         | ✅ Validated |
| **Nullish Coalescing**          | `value ?? 'class'`           | ✅ Validated |
| **Function Calls**              | `cns('a', 'b')`              | ✅ Validated |
| **Nested Combinations**         | `cns('a', b ? 'c' : 'd')`    | ✅ Validated |
| **Template Literals (static)**  | `` `class` ``                | ✅ Validated |
| **Template Literals (dynamic)** | `` `class-${var}` ``         | ⏭️ Skipped   |
| **Variables**                   | `className={someVar}`        | ⏭️ Skipped   |
| **Object Syntax**               | `clsx({ 'class': true })`    | ✅ Validated |
| **Array Syntax**                | `clsx(['class1', 'class2'])` | ✅ Validated |
| **Object-Style Attributes**     | `classes={{ root: 'mt-2' }}` | ✅ Validated |

### How It Works

The plugin walks through your expression tree and extracts **all static string literals** it encounters:

```jsx
// Plugin extracts: ["container", "p-4", "p-2", "bg-blue-500"]
<div
  className={cns(
    'container',
    isLarge ? 'p-4' : 'p-2',
    isActive && 'bg-blue-500',
  )}
/>
```

Each extracted string is then validated against your CSS files, Tailwind configuration, and whitelist patterns.

### Recognized Utility Functions

The plugin recognizes these common utility function names:

- `cns()`, `clsx()`, `classnames()`, `cn()`, `cx()`
- Any function name ending in `classnames` or `classNames`

All arguments to these functions are recursively scanned for static strings.

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

1. **Expression Parser** - Recursively extracts static string literals from dynamic expressions (ternaries, logical operators, function calls)
2. **Class Registry** - Central caching layer that aggregates class names from all sources
3. **CSS/SCSS Parser** - Uses PostCSS to extract class names from stylesheets
4. **Tailwind Parser** - Generates utilities from Tailwind configuration
5. **Variant Validator** - Handles Tailwind variants and arbitrary values

### Performance

- **Smart Caching**: Registry is cached based on configuration. Cache invalidates only when config changes.
- **Efficient Lookups**: Literal classes use Set for O(1) lookup. Wildcard patterns are checked only after literal lookup fails.
- **Lazy Loading**: CSS files are parsed only once during ESLint execution.

## Limitations

- **Static Strings Only**: The plugin validates static string literals within expressions (ternaries, logical operators, function calls, arrays, and objects), but truly dynamic values like variables, interpolated template literals, and computed expressions are skipped.
- **CSS Modules**: Out of scope for this plugin. CSS/SCSS modules are best validated using dedicated type generation tools like [typed-css-modules](https://github.com/Quramy/typed-css-modules) for CSS and [typed-scss-modules](https://github.com/skovy/typed-scss-modules) for SCSS. These tools generate TypeScript declaration files that provide both type safety and IDE autocomplete.
- **Direct Assignment Limitation**: Arrays and objects are validated when used within function calls like `clsx()` or `classnames()`. Direct assignment like `className={['foo']}` or `className={{ foo: true }}` won't be validated because React doesn't support these patterns (React expects className to be a string).

## Roadmap

We're actively developing this plugin and listening to community feedback. Here's what's coming and what's being considered.

### Planned Features

Features we're actively planning to implement:

#### 🏷️ Tagged Template Support

**Status:** Planned for v1.x

Support for validating class names in tagged template literals used by CSS-in-JS libraries:

```tsx
// twin.macro
const Button = tw`bg-blue-500 hover:bg-blue-600 p-4`

// styled-components with Tailwind
const Card = styled.div`flex items-center mt-4`

// emotion
const styles = css`rounded-lg shadow-md`

// With expressions
const Button = tw`mt-2 ${isActive && 'bg-green-500'}`
```

**Configuration:**

```javascript
{
  sources: { tailwind: true },
  tags: ['tw', 'css', 'styled']  // Enable validation for these tags
}
```

**Use case:** Popular in projects using twin.macro, tailwind-styled-components, or emotion with Tailwind CSS.

See [TAGGED_TEMPLATE_IMPL.md](TAGGED_TEMPLATE_IMPL.md) for implementation details.

#### 📞 Standalone Callee Validation

**Status:** Planned for v1.x

Validate `clsx()`, `classnames()`, and other utility function calls outside JSX attributes.

**Current behavior:** Only validates callees inside JSX expressions:

```tsx
// ✅ Currently validated
<div className={clsx('flex', 'items-center')} />
```

**New behavior:** Will also validate standalone calls:

```tsx
// ✅ Will be validated
const buttonClasses = clsx('btn', isActive && 'btn-active')
const cardStyles = classnames({ 'card': true, 'card-elevated': elevated })
```

**Configuration:**

```javascript
{
  callees: ['clsx', 'classnames', 'cn', 'cva']  // Specify which functions to validate
}
```

#### 🔤 Advanced Pattern Matching

**Status:** Planned for v1.x

Full regular expression support in `allowlist` and `blocklist` patterns.

**Current:** Only supports glob-style wildcards (`*`)

```javascript
{
  allowlist: ['custom-*', 'app-*']  // ✅ Currently supported
}
```

**New:** Full regex patterns with advanced features:

```javascript
{
  allowlist: [
    'custom-*',                  // Wildcards still supported
    'skin\\-(summer|xmas)',      // Regex alternation
    '(?!(bg|text)\\-).*'         // Negative lookahead - "everything except bg-* and text-*"
  ],
  blocklist: [
    'legacy-v[12]-.*',           // Block legacy-v1-* and legacy-v2-*
    '^old-(btn|card|modal)$'     // Exact matches only
  ]
}
```

**Use cases:**
- Complex naming patterns from design systems
- Fine-grained control over allowed/blocked classes
- Migration scenarios with specific class patterns

### Framework Support

Currently, the plugin focuses on React/JSX. Based on community demand, we're considering support for additional frameworks:

#### Vue.js

**Status:** Under consideration

Validate class names in Vue templates and components.

**Patterns that would be supported:**

```vue
<!-- Static classes -->
<div class="flex items-center"></div>

<!-- v-bind shorthand -->
<div :class="dynamicClass"></div>

<!-- v-bind long form -->
<div v-bind:class="computedClass"></div>

<!-- Array syntax -->
<div :class="['flex', isActive && 'bg-blue-500']"></div>

<!-- Object syntax -->
<div :class="{ 'active': isActive, 'disabled': isDisabled }"></div>
```

#### Angular

**Status:** Under consideration

Validate class names in Angular templates.

**Patterns that would be supported:**

```html
<!-- Static classes -->
<div class="flex items-center"></div>

<!-- Property binding -->
<div [class]="dynamicClass"></div>

<!-- ngClass directive -->
<div [ngClass]="{'active': isActive, 'disabled': isDisabled}"></div>
```

#### Svelte

**Status:** Under consideration

Validate class names in Svelte components.

**Patterns that would be supported:**

```svelte
<!-- Static classes -->
<div class="flex items-center"></div>

<!-- Dynamic classes -->
<div class={dynamicClass}></div>

<!-- Conditional classes -->
<div class:active={isActive} class:disabled={isDisabled}></div>
```

**Note:** Framework support depends on community demand and maintainer bandwidth. If you'd like to see support for a specific framework, please [open an issue](https://github.com/your-username/eslint-plugin-valid-class-name/issues) with your use case and examples.

### Other Features Under Consideration

- **Custom Group/Peer Names** - Support Tailwind's custom group names like `group/edit:opacity-50`, `peer/draft:text-gray-400`
- **Tailwind v4 Support** - When Tailwind v4 becomes stable, add async validation support via worker threads
- **Configuration Profiles** - Preset configurations for common setups (e.g., Material-UI, Chakra UI, DaisyUI)

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
