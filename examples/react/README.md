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
4. **Allowlist patterns**: `custom-*` (any class starting with "custom-" is always valid)
5. **Blocklist patterns**: `legacy-*`, `deprecated-*`, `old-*`, `forbidden-class` (these classes are forbidden even if they exist in CSS)
6. **Ignore patterns**: `dynamic-*` (skips validation for classes starting with "dynamic-")

### Tailwind Features

The plugin fully supports:

- ✅ **Automatic utility generation** from theme configuration (colors, spacing, typography, etc.)
- ✅ **All Tailwind variants** (hover, focus, responsive, dark mode, group, peer, etc.)
- ✅ **Arbitrary values** (`w-[100px]`, `bg-[#ff0000]`, etc.)
- ✅ **Arbitrary variants** (`[&:nth-child(3)]:mt-2`, `[@media(min-width:900px)]:flex`)
- ✅ **Plugin-generated classes** (from Tailwind plugins)
- ✅ **@layer utilities and components** (custom utilities and components)
- ✅ **Safelist classes** (explicitly safelisted in config)

## Test Cases

### Valid Test Components (Should Pass - 0 Errors)

#### ValidComponent.tsx

Basic valid classes from multiple sources:

- CSS: `container`, `header`, `main-content`
- SCSS: `button-primary`, `card`, `alert`
- Tailwind utilities: `flex`, `items-center`, `justify-between`, `gap-4`, `bg-blue-500`, `text-white`, `p-4`, `rounded`, `mb-2`
- Custom theme: `text-brand-500`
- Whitelist: `custom-widget` (matches `custom-*`)
- Ignored: `dynamic-loader` (matches `dynamic-*`, skips validation)

Run: `pnpm run test:valid`

#### CustomClassesComponent.tsx

Tests custom classes from:

- @layer utilities: `text-shadow-*`, `scrollbar-hide`, `pt-safe`, `pb-safe`, `aspect-golden`
- @layer components: `card`, `card-header`, `card-footer`, `btn`, `btn-primary`, `btn-secondary`, `badge`, `badge-success`, `badge-error`
- Tailwind plugins: `rotate-y-180`, `preserve-3d`, `backface-hidden`, `perspective-1000`

Run: `pnpm run test:custom-classes`

#### TailwindUtilitiesValid.tsx

Comprehensive Tailwind utilities from theme:

- Colors (bg, text, border, ring, fill, stroke)
- Spacing (margin, padding, gap, space, inset)
- Negative spacing (-m, -mt, -ml, etc.)
- Sizing (width, height, min/max)
- Typography (text, font, leading, tracking)
- Layout (flex, grid, display, position)
- Borders, effects, transitions, transforms, filters

Run: `pnpm run test:tailwind-utilities`

#### TailwindVariantsValid.tsx

All Tailwind variant combinations:

- Interactive: `hover:`, `focus:`, `active:`, `visited:`
- Input states: `disabled:`, `checked:`, `invalid:`, `placeholder-shown:`
- Child selectors: `first:`, `last:`, `odd:`, `even:`
- Responsive: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Dark mode: `dark:`
- Group/Peer: `group-hover:`, `peer-checked:`
- Multiple variants: `hover:first:`, `md:hover:`, `dark:md:text-white`

Run: `pnpm run test:tailwind-variants`

#### ArbitraryValuesValid.tsx

Arbitrary value syntax:

- Spacing: `w-[100px]`, `h-[50vh]`, `m-[2rem]`
- Colors: `bg-[#ff0000]`, `text-[rgb(255,0,0)]`, `bg-[hsl(200,50%,50%)]`
- URLs: `bg-[url('/img.png')]`
- Content: `content-['hello']`
- With variants: `hover:w-[200px]`, `md:bg-[#00ff00]`
- Negative: `-mt-[10px]`, `-ml-[2rem]`

Run: `pnpm run test:arbitrary-values`

#### ArbitraryVariantsValid.tsx

Arbitrary variant syntax:

- Arbitrary selectors: `[&:nth-child(3)]:mt-2`, `[&>*]:p-4`
- Arbitrary at-rules: `[@media(min-width:900px)]:flex`
- Combined: `hover:[&:nth-child(3)]:bg-blue-500`
- Attribute selectors: `[&[data-active]]:bg-blue-500`

Run: `pnpm run test:arbitrary-variants`

#### EdgeCasesValid.tsx

Edge cases that should pass:

- Important modifier: `!bg-blue-500`, `!text-white`
- Zero values: `m-0`, `p-0`, `w-0`, `h-0`
- Auto values: `m-auto`, `w-auto`
- Full/screen: `w-full`, `h-screen`
- Fractions: `w-1/2`, `h-1/3`
- Negative: `-m-4`, `-mt-2`

Run: `pnpm run test:edge-cases`

#### BlocklistValid.tsx

Valid classes that are NOT blocked by blocklist:

- CSS classes: `container`, `card`, `button-primary`, `button-secondary`
- SCSS classes: `alert`, `alert-info`, `alert-warning`
- Tailwind utilities: `flex`, `grid`, `bg-blue-500`, `text-white`, `p-4`, `rounded`
- Allowlist: `custom-component`, `custom-widget`, `custom-text`
- Modern alternatives to legacy classes

Run: `pnpm run test:blocklist-valid`

### Invalid Test Components (Should Fail with Errors)

#### InvalidComponent.tsx (4 errors expected)

Basic invalid classes:

- `does-not-exist`
- `missing-class`
- `typo-flx` (typo of `flex`)
- `non-existent-button`

Run: `pnpm run test:invalid`

#### ComprehensiveInvalid.tsx (~60+ errors expected)

Comprehensive invalid cases:

- Nonexistent Tailwind utilities: `flx`, `bg-ultraviolet-500`, `txt-lg`
- Invalid variants: `hoverr:`, `foucus:`, `mediumm:`
- Typos: `bg-blu-500`, `text-gren-600`, `gird`
- Empty arbitrary values: `w-[]`, `bg-[]`
- Malformed: `hover::bg-blue`, `:hover:bg-blue`, `bg-blue-`
- CSS/SCSS typos: `containr`, `buton-primary`, `crd`
- Non-allowlisted: `random-class-123`, `not-in-css`

Run: `pnpm run test:comprehensive-invalid`

#### BlocklistInvalid.tsx (~10 errors expected)

Classes that are blocked by the blocklist configuration:

- Exact match: `forbidden-class`
- Pattern `legacy-*`: `legacy-button`, `legacy-card`, `legacy-layout`
- Pattern `deprecated-*`: `deprecated-flex`, `deprecated-grid`
- Pattern `old-*`: `old-container`, `old-wrapper`
- Note: These classes exist in components.scss but are intentionally blocked to prevent use of deprecated patterns

Run: `pnpm run test:blocklist-invalid`

### Test All Components

Run all valid components (should pass):

```bash
pnpm run test:all-valid
```

Run all invalid components (should show errors):

```bash
pnpm run test:all-invalid
```

Run everything:

```bash
pnpm lint
```

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
        allowlist: ['custom-*'],
        blocklist: ['legacy-*', 'deprecated-*', 'old-*', 'forbidden-class'],
        ignorePatterns: ['dynamic-*'],
      },
    },
  ],
}
```
