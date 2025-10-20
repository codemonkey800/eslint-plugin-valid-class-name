# Test Project for eslint-plugin-valid-class-name

This project serves as an integration test for the `eslint-plugin-valid-class-name` ESLint plugin. It demonstrates how the plugin validates CSS class names against CSS/SCSS files and Tailwind configuration.

## Project Structure

```
test-project/
├── src/
│   ├── styles/
│   │   ├── app.css              # Regular CSS classes
│   │   └── components.scss      # SCSS classes
│   └── components/
│       ├── ValidComponent.tsx   # Uses only valid class names (should pass)
│       └── InvalidComponent.tsx # Uses invalid class names (should fail)
├── eslint.config.js             # ESLint configuration with the plugin
├── tailwind.config.js           # Tailwind config with custom theme
└── package.json                 # Dependencies and test scripts
```

## Setup

Install dependencies:

```bash
npm install
```

## Usage

### Run ESLint on all files

```bash
npm run lint
```

### Test valid component (should pass with no errors)

```bash
npm run test:valid
```

Expected result: ✅ No ESLint errors

### Test invalid component (should fail with errors)

```bash
npm run test:invalid
```

Expected result: ❌ ESLint errors for each invalid class name:
- `does-not-exist`
- `missing-class`
- `typo-flx`
- `non-existent-button`

## What the Plugin Validates

The plugin is configured to validate class names against:

1. **CSS files**: `src/styles/**/*.css`
2. **SCSS files**: `src/styles/**/*.scss`
3. **Tailwind safelist**: Classes explicitly added to the safelist in `tailwind.config.cjs`
4. **Whitelist patterns**: `custom-*` (any class starting with "custom-")
5. **Ignore patterns**: `dynamic-*` (skips validation for classes starting with "dynamic-")

### Tailwind Limitation

**Note**: The plugin currently only extracts classes from Tailwind's `safelist` configuration. Automatic utility generation from the theme configuration (e.g., generating `bg-blue-500` from `theme.colors.blue.500`) is not yet implemented. To use Tailwind utilities in your project, you must explicitly add them to the `safelist` in your Tailwind config.

## Test Cases

### ValidComponent.tsx

Uses valid class names from:
- CSS: `container`, `header`, `main-content`
- SCSS: `button-primary`, `card`, `alert`
- Tailwind safelist: `flex`, `items-center`, `justify-between`, `gap-4`, `bg-blue-500`, `text-white`, `p-4`, `rounded`, `text-brand-500`
- Whitelist: `custom-widget`
- Ignored: `dynamic-loader` (doesn't exist but won't error)

### InvalidComponent.tsx

Uses invalid class names that don't exist in any source:
- `does-not-exist`
- `missing-class`
- `typo-flx` (likely meant to be `flex`)
- `non-existent-button`

## Making Changes

To test changes to the main plugin:

1. Make changes in the parent directory
2. Rebuild the plugin: `cd .. && npm run build`
3. Reinstall in test-project: `npm install`
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
        tailwind: true,
      },
      validation: {
        whitelist: ['custom-*'],
        ignorePatterns: ['dynamic-*'],
      },
    },
  ],
}
```
