# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin that validates CSS class names in JSX/TSX and HTML files against actual CSS/SCSS files and Tailwind configuration. The plugin reports errors when class names are used that don't exist in any of the configured sources.

### Supported File Types

- **JSX/TSX**: Validates `className` attributes in React/JSX components
- **HTML**: Validates `class` attributes in HTML files (requires `@angular-eslint/template-parser`)

## Development Commands

### Build

```bash
pnpm run build
```

Compiles TypeScript to JavaScript using tsup. Output goes to `lib/` directory.

### Testing

```bash
pnpm test                 # Run all tests
pnpm run test:watch       # Run tests in watch mode
pnpm run test:coverage    # Run tests with coverage report
```

To run a single test file:

```bash
pnpm test -- src/parsers/css-parser.test.ts
```

### Linting and Formatting

```bash
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Run ESLint with auto-fix
pnpm run prettier         # Check code formatting
pnpm run prettier:fix     # Auto-fix code formatting
pnpm run type-check       # Run TypeScript type checking
```

When modifying files, run linters only for changed files to save time.

## Architecture

### Core Components

**1. Rule Implementation** ([src/rules/valid-class-name.ts](src/rules/valid-class-name.ts))

- Main ESLint rule that validates class attributes in both JSX and HTML
- **JSX Support**: Validates `className` attributes via `JSXAttribute` visitor
- **HTML Support**: Validates `class` attributes via `TextAttribute` visitor (Angular template parser)
- Integrates with the class registry for validation
- Supports ignore patterns with glob-style wildcards
- Delegates to specialized helper modules for AST parsing and class extraction

**Rule Helper Modules**:
- **AST Types** ([src/rules/ast-types.ts](src/rules/ast-types.ts)) - Type definitions for JSX and HTML AST nodes
  - JSX types: `JSXAttribute`, `JSXExpressionContainer`, etc.
  - HTML types: `TextAttribute` (from `@angular-eslint/template-parser`)
- **AST Guards** ([src/rules/ast-guards.ts](src/rules/ast-guards.ts)) - Type guard functions for runtime type checking
- **Class Extractors** ([src/rules/class-extractors.ts](src/rules/class-extractors.ts)) - Functions to extract class names from various expression types (literals, ternaries, function calls, arrays, objects)
- **Validation Helpers** ([src/rules/validation-helpers.ts](src/rules/validation-helpers.ts)) - Utility functions for pattern matching and validation

**2. Class Registry** ([src/registry/class-registry.ts](src/registry/class-registry.ts))

- Central registry that aggregates class names from all sources
- Combines CSS/SCSS parsed classes and Tailwind utilities
- Uses a single cache that invalidates when configuration changes
- Returns a `ClassRegistry` interface with `isValid()` and `getAllClasses()` methods
- Supports both literal class lookups (O(1)) and wildcard pattern matching

**3. CSS/SCSS Parser** ([src/parsers/css-parser.ts](src/parsers/css-parser.ts))

- Uses PostCSS to parse CSS and extract class names
- SCSS files are compiled to CSS using Sass before extraction
- Handles syntax errors gracefully with warnings

**4. Tailwind Integration** ([src/parsers/tailwind-parser.ts](src/parsers/tailwind-parser.ts) + [src/registry/tailwind-loader.ts](src/registry/tailwind-loader.ts) + [src/registry/tailwind-worker.ts](src/registry/tailwind-worker.ts))

- **tailwind-parser.ts**: Finds Tailwind configuration file path
- **tailwind-loader.ts**: Creates TailwindUtils instance from tailwind-api-utils library
- **tailwind-worker.ts**: Worker thread for async validation (Tailwind CSS v4 support)
- Validates classes on-demand via `isValidClassName()` API (no upfront generation)
- Supports all Tailwind features automatically: variants, arbitrary values, plugins
- **Tailwind CSS v3**: Synchronous config loading
- **Tailwind CSS v4**: Async config loading via synckit worker threads

**5. Tailwind Variants** ([src/utils/tailwind-variants.ts](src/utils/tailwind-variants.ts))

- Parses class names with variants (e.g., `hover:first:mt-2`)
- Validates variants against known Tailwind variants
- Handles arbitrary variants (e.g., `[&:nth-child(3)]:mt-2`)
- Validates arbitrary value classes (e.g., `w-[100px]`, `bg-[#1da1f2]`)

### Key Design Patterns

**Caching Strategy**:

- Single registry cache at the rule level
- Cache key is a hash-based combination of: CSS patterns, Tailwind config, and cwd
- Cache invalidates automatically when configuration changes
- The registry is shared across all lint runs with the same configuration

**Pattern Matching**:

- Supports glob-style wildcards in ignore patterns
- Literal classes use Set for O(1) lookup
- Wildcard patterns are checked sequentially only after literal lookup fails

**Tailwind Integration**:

- Uses tailwind-api-utils for on-demand validation (no upfront generation)
- TailwindUtils API handles all Tailwind features automatically
- Lazy validation approach: classes validated only when encountered
- Supports variants, arbitrary values, and plugin-generated classes out-of-the-box
- **v3**: Synchronous validation in main thread
- **v4**: Uses synckit to run async validation in worker thread (transparent to ESLint rules)

**Variant Validation**:

- Separates variants from base utility (e.g., `hover:first:mt-2` → variants: `['hover', 'first']`, base: `'mt-2'`)
- When variants are present, only validates base against Tailwind classes (not CSS classes)
- Supports arbitrary variants with bracket notation
- Group and peer variants are validated by checking their suffix (e.g., `group-hover` checks if `hover` is valid)

**Arbitrary Value Handling**:

- Arbitrary values bypass registry validation (e.g., `w-[100px]`, `bg-[#1da1f2]`)
- Validates that the prefix is a known Tailwind utility that supports arbitrary values
- Validates that the value is not empty

## Configuration

The rule accepts the following options:

```javascript
{
  sources: {
    css: ['src/**/*.css'],           // CSS file patterns
    scss: ['src/**/*.scss'],         // SCSS file patterns
    tailwind: true                   // or { config: 'path/to/tailwind.config.js' }
  },
  validation: {
    ignorePatterns: ['dynamic-*']    // Skip validation for these patterns
  }
}
```

**Note**: CSS/SCSS modules are out of scope for this plugin. Use dedicated type generation tools like [typed-css-modules](https://github.com/Quramy/typed-css-modules) or [typed-scss-modules](https://github.com/skovy/typed-scss-modules) for that purpose.

## Testing

The codebase uses Jest with ts-jest for testing. Test files follow the naming convention `*.test.ts`.

Key testing utilities:

- Mock file systems for testing parsers
- Snapshot testing for generated utilities
- ESLint RuleTester for rule validation

## File Organization

```
src/
├── registry/
│   ├── cache-key.ts               # Cache key generation
│   ├── class-registry.ts          # Central registry and caching
│   ├── file-resolver.ts           # File path resolution
│   ├── registry-builder.ts        # Registry building logic
│   ├── tailwind-loader.ts         # Creates TailwindUtils validator
│   └── tailwind-worker.ts         # Worker thread for Tailwind v4 async validation
├── parsers/
│   ├── css-parser.ts              # CSS/SCSS parsing
│   └── tailwind-parser.ts         # Finds Tailwind config file path
├── rules/
│   ├── ast-types.ts               # JSX AST type definitions
│   ├── ast-guards.ts              # Type guard functions
│   ├── class-extractors.ts        # Class name extraction logic
│   ├── validation-helpers.ts      # Validation utility functions
│   ├── index.ts                   # Rule exports
│   └── valid-class-name.ts        # Main rule implementation
├── types/
│   └── options.ts                 # TypeScript types for rule options
├── utils/
│   └── tailwind-variants.ts       # Tailwind variant parsing and validation
└── index.ts                       # Plugin entry point
```

## Important Notes

- The plugin uses ES modules (`type: "module"` in package.json)
- **Tailwind CSS v3**: Synchronous initialization in main thread
- **Tailwind CSS v4**: Async initialization via synckit worker threads (transparent to ESLint)
- Uses `synckit` to bridge ESLint's synchronous constraint with Tailwind v4's async requirements
- **JSX/TSX**: Validates `className` attributes; supports complex expressions (ternaries, function calls, etc.)
- **HTML**: Validates `class` attributes; only supports string literals (no dynamic expressions)
- Dynamic class names (template literals, variables, etc.) are skipped in JSX
- **HTML Parser**: Requires `@angular-eslint/template-parser` as an optional peer dependency
