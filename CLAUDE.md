# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin that validates CSS class names in JSX/TSX files against actual CSS/SCSS files, Tailwind configuration, and whitelists. The plugin reports errors when class names are used that don't exist in any of the configured sources.

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

- Main ESLint rule that validates className attributes in JSX
- Extracts class names from JSX attributes (both string literals and JSXExpressionContainers)
- Integrates with the class registry for validation
- Supports ignore patterns and whitelist patterns with glob-style wildcards

**2. Class Registry** ([src/registry/class-registry.ts](src/registry/class-registry.ts))

- Central registry that aggregates class names from all sources
- Combines CSS/SCSS parsed classes, Tailwind utilities, and whitelist patterns
- Uses a single cache that invalidates when configuration changes
- Returns a `ClassRegistry` interface with `isValid()` and `getAllClasses()` methods
- Supports both literal class lookups (O(1)) and wildcard pattern matching

**3. CSS/SCSS Parser** ([src/parsers/css-parser.ts](src/parsers/css-parser.ts))

- Uses PostCSS to parse CSS and extract class names
- SCSS files are compiled to CSS using Sass before extraction
- Handles syntax errors gracefully with warnings

**4. Tailwind Parser** ([src/parsers/tailwind-parser.ts](src/parsers/tailwind-parser.ts))

- Finds and loads Tailwind configuration files
- Generates utility classes from theme configuration (colors, spacing, typography, etc.)
- Supports safelist extraction
- Uses synchronous loading (required by ESLint's synchronous rule execution)
- **Note**: Does NOT generate arbitrary value utilities (e.g., `w-[100px]`, `bg-[#ff0000]`)

**5. Tailwind Variants** ([src/utils/tailwind-variants.ts](src/utils/tailwind-variants.ts))

- Parses class names with variants (e.g., `hover:first:mt-2`)
- Validates variants against known Tailwind variants
- Handles arbitrary variants (e.g., `[&:nth-child(3)]:mt-2`)
- Validates arbitrary value classes (e.g., `w-[100px]`, `bg-[#1da1f2]`)

### Key Design Patterns

**Caching Strategy**:

- Single registry cache at the rule level
- Cache key is a JSON-stringified combination of: CSS patterns, whitelist, Tailwind config, and cwd
- Cache invalidates automatically when configuration changes
- The registry is shared across all lint runs with the same configuration

**Pattern Matching**:

- Supports glob-style wildcards in whitelist and ignore patterns
- Literal classes use Set for O(1) lookup
- Wildcard patterns are checked sequentially only after literal lookup fails

**Tailwind Integration**:

- Generates static utilities based on theme configuration
- Flattens nested theme objects (e.g., `colors.blue.500` → `blue-500`)
- Handles negative values for spacing utilities (margin, inset, etc.)
- Detects and warns about theme collisions (e.g., fontWeight and fontFamily with same keys)

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
    tailwind: true,                  // or { config: 'path/to/tailwind.config.js' }
    cssModules: false                // Not yet implemented
  },
  validation: {
    whitelist: ['custom-*'],         // Always valid patterns (supports wildcards)
    blacklist: [],                   // Not yet implemented
    ignorePatterns: ['dynamic-*']    // Skip validation for these patterns
  }
}
```

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
│   └── tailwind-loader.ts         # Tailwind class loading
├── parsers/
│   ├── css-parser.ts              # CSS/SCSS parsing
│   └── tailwind-parser.ts         # Tailwind config parsing and utility generation
├── rules/
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
- Tailwind class loading is synchronous and blocks during initial load (by design, due to ESLint constraints)
- The rule currently only validates static string literals in className attributes
- Dynamic class names (template literals, variables, etc.) are skipped
