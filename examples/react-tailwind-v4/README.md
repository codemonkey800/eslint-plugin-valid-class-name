# Test Project for eslint-plugin-valid-class-name (Tailwind CSS v4)

This project serves as an integration test for the `eslint-plugin-valid-class-name` ESLint plugin with **Tailwind CSS v4**. It demonstrates how the plugin validates CSS class names against CSS/SCSS files and Tailwind v4's CSS-based configuration.

## What's New in v4

Tailwind CSS v4 introduces a **CSS-first configuration approach**:

- ✨ **@theme directive**: Define custom colors, spacing, typography in CSS instead of JavaScript
- ✨ **@utility directive**: Create custom utilities directly in CSS
- ✨ **oklch() colors**: New default color space for better color accuracy
- ✨ **Simplified setup**: No JavaScript config file required (optional)
- ✨ **Worker thread support**: The plugin uses synckit to handle v4's async configuration loading

## Project Structure

```
test-project-tailwind-v4/
├── src/
│   ├── styles/
│   │   ├── tailwind.css          # v4 CSS-based config (@theme, @utility)
│   │   ├── app.css               # Regular CSS classes
│   │   ├── components.scss       # SCSS classes
│   │   └── utilities.css         # Custom @layer utilities
│   └── components/
│       ├── TailwindV4Features.tsx   # v4-specific features (NEW)
│       ├── ValidComponent.tsx       # Uses only valid class names (should pass)
│       ├── InvalidComponent.tsx     # Uses invalid class names (should fail)
│       └── ...                      # All other test components from v3 example
├── eslint.config.js                 # ESLint configuration with the plugin
├── tailwind.config.js               # Minimal config for plugin discovery
└── package.json                     # Dependencies (tailwindcss v4.x)
```

## Setup

Install dependencies:

```bash
pnpm install
```

## Usage

### Run ESLint on all files

```bash
pnpm run lint
```

### Test v4-specific features (should pass with no errors)

```bash
pnpm run test:tailwind-v4-features
```

Expected result: ✅ No ESLint errors

This tests:

- Custom theme colors from @theme directive
- Custom utilities from @utility directive
- oklch() color function
- Backwards compatibility with v3 utilities

### Test all valid components

```bash
pnpm run test:all-valid
```

### Test all invalid components

```bash
pnpm run test:all-invalid
```

## Tailwind CSS v4 Configuration

### CSS-Based Configuration (src/styles/tailwind.css)

Instead of a JavaScript config file, v4 uses CSS directives:

```css
@import 'tailwindcss';

@theme {
  /* Custom colors */
  --color-brand-500: #6366f1;
  --color-custom-blue: oklch(0.5 0.2 250);

  /* Custom spacing */
  --spacing-huge: 10rem;

  /* Custom typography */
  --font-display: 'Inter', sans-serif;
}

@utility v4-custom-utility {
  color: var(--color-brand-500);
  font-weight: bold;
}
```

### How the Plugin Validates v4 Classes

The plugin automatically detects Tailwind v4 and uses a **worker thread** to handle async configuration loading:

1. **Detects v4**: Checks `tailwindcss` package version
2. **Uses synckit**: Spawns a worker thread for async operations
3. **Validates classes**: Uses `tailwind-api-utils` to validate against v4 config
4. **Transparent to ESLint**: Appears synchronous to ESLint rules

## What the Plugin Validates

The plugin is configured to validate class names against:

1. **CSS files**: `src/styles/**/*.css`
2. **SCSS files**: `src/styles/**/*.scss`
3. **Tailwind v4 config**: Custom theme and utilities from @theme and @utility
4. **Ignore patterns**: `dynamic-*` and `custom-*` (skips validation)

### Tailwind v4 Features Supported

The plugin fully supports:

- ✅ **@theme variables** (colors, spacing, typography, etc.)
- ✅ **@utility directive** (custom utilities defined in CSS)
- ✅ **oklch() colors** (arbitrary values with oklch)
- ✅ **All standard utilities** (same as v3)
- ✅ **All variants** (hover, focus, responsive, dark mode, etc.)
- ✅ **Arbitrary values** (`w-[100px]`, `bg-[oklch(0.5_0.2_250)]`, etc.)
- ✅ **Arbitrary variants** (`[&:nth-child(3)]:mt-2`, etc.)
- ✅ **Plugin-generated classes** (from Tailwind plugins)
- ✅ **@layer utilities and components** (custom utilities and components)

## Test Cases

### New v4-Specific Test

#### TailwindV4Features.tsx

Tests Tailwind CSS v4 specific features:

- Custom theme colors (@theme directive)
- Custom utilities (@utility directive)
- oklch() color function
- Custom spacing and typography from @theme
- Backwards compatibility with v3 utilities
- Mixed v3/v4 class usage

Run: `pnpm run test:tailwind-v4-features`

### All Other Tests (Same as v3 Example)

All test components from the v3 example are included to ensure backwards compatibility:

- **ValidComponent.tsx**: Basic valid classes
- **InvalidComponent.tsx**: Basic invalid classes
- **TailwindUtilitiesValid.tsx**: Comprehensive Tailwind utilities
- **TailwindVariantsValid.tsx**: All Tailwind variants
- **ArbitraryValuesValid.tsx**: Arbitrary value syntax
- **ArbitraryVariantsValid.tsx**: Arbitrary variant syntax
- **EdgeCasesValid.tsx**: Edge cases
- **CustomClassesComponent.tsx**: @layer utilities and components
- **ComprehensiveInvalid.tsx**: Comprehensive invalid cases
- And more...

See the [v3 example README](../react/README.md) for details on each test case.

## v4 vs v3 Differences

| Feature          | v3                                | v4                         |
| ---------------- | --------------------------------- | -------------------------- |
| Configuration    | JavaScript (`tailwind.config.js`) | CSS (`@theme`, `@utility`) |
| Custom colors    | `theme.extend.colors` in JS       | `--color-*` in @theme      |
| Custom utilities | `addUtilities()` in plugins       | `@utility` directive       |
| Color space      | RGB/HSL                           | oklch (default)            |
| Config loading   | Synchronous                       | Asynchronous               |
| Plugin support   | Worker thread (synckit)           | Native async               |

## How the Plugin Handles v4

The plugin uses a **worker thread approach** to handle v4's async requirements:

1. **tailwind-loader.ts**: Detects v4 via `isV4` property
2. **tailwind-worker.ts**: Worker thread that loads config and validates
3. **synckit**: Bridges async worker with synchronous ESLint rules
4. **tailwind-api-utils**: Provides validation API for both v3 and v4

This allows the plugin to work with both v3 and v4 transparently.

## Making Changes

To test changes to the main plugin:

1. Make changes in the parent directory
2. Rebuild the plugin: `cd ../.. && pnpm run build`
3. Reinstall in test project: `pnpm install`
4. Run tests again

## Plugin Configuration

The plugin is configured in [eslint.config.js](eslint.config.js):

```javascript
rules: {
  'valid-class-name/valid-class-name': [
    'error',
    {
      sources: {
        css: ['src/styles/**/*.css'],
        scss: ['src/styles/**/*.scss'],
        tailwind: true, // Auto-detects v4 config
      },
      validation: {
        ignorePatterns: ['dynamic-*', 'custom-*'],
        objectStyleAttributes: ['classes', 'classNames'],
      },
    },
  ],
}
```

## Troubleshooting

### Plugin not detecting v4 config

- Ensure `tailwindcss` v4.x is installed
- Check that `tailwind.config.js` exists (even if minimal)
- The plugin auto-discovers CSS config via `@import 'tailwindcss'`

### Classes not validating correctly

- Check the worker thread is running (look for synckit logs)
- Verify your @theme variables are correctly defined
- Ensure @utility directives have valid CSS

### Performance issues

- The worker thread caches loaded configs
- Multiple validations reuse the same worker
- No performance impact after initial load
