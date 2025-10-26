# Vue Example for eslint-plugin-valid-class-name

This project demonstrates the Vue support for the `eslint-plugin-valid-class-name` ESLint plugin. It validates CSS class names in Vue Single File Components (`.vue` files) against CSS/SCSS files and Tailwind configuration.

## Project Structure

```
vue-example/
├── src/
│   ├── styles/
│   │   ├── app.css              # Layout and structural CSS classes
│   │   ├── utilities.css        # Utility CSS classes
│   │   └── components.scss      # SCSS component classes
│   └── components/
│       ├── ValidComponent.vue          # ✅ All valid classes (should pass)
│       ├── InvalidComponent.vue        # ❌ Invalid classes (should fail)
│       ├── StaticClasses.vue           # Tests static class attributes
│       ├── DynamicClasses.vue          # Tests :class with string literals
│       ├── ObjectSyntax.vue            # Tests :class="{ ... }" syntax
│       ├── ArraySyntax.vue             # Tests :class="[...]" syntax
│       ├── TernaryExpressions.vue      # Tests ternary and logical operators
│       ├── MixedClasses.vue            # Tests mixed CSS/SCSS/Tailwind
│       ├── TailwindUtilities.vue       # Tests Tailwind utility classes
│       ├── TailwindVariants.vue        # Tests Tailwind variants (hover:, etc.)
│       ├── ArbitraryValues.vue         # Tests arbitrary values (w-[100px])
│       └── EdgeCases.vue               # Tests edge cases and special scenarios
├── eslint.config.js             # ESLint configuration with the plugin
├── tailwind.config.js           # Tailwind config with custom theme
└── package.json                 # Dependencies and test scripts
```

## Vue Class Validation Features

The plugin validates class names in Vue components:

### 1. Static `class` Attributes
```vue
<div class="container flex gap-4">
  <!-- Validates: container, flex, gap-4 -->
</div>
```

### 2. Dynamic `:class` Bindings

**String Literal:**
```vue
<div :class="'button-primary'">
  <!-- Validates: button-primary -->
</div>
```

**Object Syntax:**
```vue
<div :class="{ 'active': isActive, 'disabled': !isEnabled }">
  <!-- Validates: active, disabled -->
</div>
```

**Array Syntax:**
```vue
<div :class="['flex', 'gap-4', { 'items-center': true }]">
  <!-- Validates: flex, gap-4, items-center -->
</div>
```

**Ternary Expressions:**
```vue
<div :class="isActive ? 'bg-green-500' : 'bg-red-500'">
  <!-- Validates: bg-green-500, bg-red-500 -->
</div>
```

### 3. What Gets Skipped (Not Validated)

- Variables: `:class="dynamicClass"`
- Template literals: `:class="\`btn-${variant}\`"`
- Computed properties: `:class="computedClass"`
- Method calls: `:class="getClasses()"`

## Setup

Install dependencies:

```bash
pnpm install
```

## Usage

### Run ESLint on all Vue files

```bash
pnpm run lint
```

### Test Individual Components

**Valid components (should pass with no errors):**

```bash
pnpm run test:valid              # ValidComponent.vue
pnpm run test:static             # StaticClasses.vue
pnpm run test:dynamic            # DynamicClasses.vue
pnpm run test:object-syntax      # ObjectSyntax.vue
pnpm run test:array-syntax       # ArraySyntax.vue
pnpm run test:ternary            # TernaryExpressions.vue
pnpm run test:mixed              # MixedClasses.vue
pnpm run test:tailwind-utilities # TailwindUtilities.vue
pnpm run test:tailwind-variants  # TailwindVariants.vue
pnpm run test:arbitrary-values   # ArbitraryValues.vue
pnpm run test:edge-cases         # EdgeCases.vue
```

**Invalid component (should fail with errors):**

```bash
pnpm run test:invalid            # InvalidComponent.vue
```

**Run all valid tests:**

```bash
pnpm run test:all-valid
```

**Run all invalid tests:**

```bash
pnpm run test:all-invalid
```

## ESLint Configuration

The project is configured to validate:

- **CSS files**: `src/styles/**/*.css`
- **SCSS files**: `src/styles/**/*.scss`
- **Tailwind**: Enabled with `tailwind.config.js`
- **Ignore patterns**: `dynamic-*`, `custom-*` (classes matching these patterns won't be validated)

See [eslint.config.js](eslint.config.js) for the full configuration.

## What Each Component Tests

| Component | Description |
|-----------|-------------|
| `ValidComponent.vue` | Complete valid example with CSS, SCSS, and Tailwind classes |
| `InvalidComponent.vue` | Component with intentionally invalid class names |
| `StaticClasses.vue` | Static `class="..."` attribute validation |
| `DynamicClasses.vue` | Dynamic `:class="'...'"` string literal binding |
| `ObjectSyntax.vue` | Object syntax `:class="{ active: true }"` |
| `ArraySyntax.vue` | Array syntax `:class="['foo', 'bar']"` |
| `TernaryExpressions.vue` | Ternary and logical operators in `:class` |
| `MixedClasses.vue` | Combining CSS, SCSS, and Tailwind in various ways |
| `TailwindUtilities.vue` | Standard Tailwind utility classes across categories |
| `TailwindVariants.vue` | Tailwind variants (hover:, focus:, responsive, etc.) |
| `ArbitraryValues.vue` | Arbitrary values with square brackets (w-[100px], bg-[#hex]) |
| `EdgeCases.vue` | Edge cases, empty classes, whitespace, duplicates, etc. |

## Expected Results

### ✅ Valid Components (No Errors)
- `ValidComponent.vue`
- `StaticClasses.vue`
- `DynamicClasses.vue`
- `ObjectSyntax.vue`
- `ArraySyntax.vue`
- `TernaryExpressions.vue`
- `MixedClasses.vue`
- `TailwindUtilities.vue`
- `TailwindVariants.vue`
- `ArbitraryValues.vue`
- `EdgeCases.vue`

### ❌ Invalid Components (Should Report Errors)
- `InvalidComponent.vue` - Reports multiple invalid class names

## Notes

- The plugin uses `vue-eslint-parser` to parse Vue Single File Components
- Both static and dynamic class bindings are validated
- Variable references, template literals, and computed properties are skipped
- Ignore patterns (`dynamic-*`, `custom-*`) can be used to exclude certain class names from validation
- Supports Vue 3 with Composition API and Options API

## Learn More

- [ESLint Plugin Repository](../../README.md)
- [Vue ESLint Parser](https://github.com/vuejs/vue-eslint-parser)
- [Tailwind CSS](https://tailwindcss.com/)
