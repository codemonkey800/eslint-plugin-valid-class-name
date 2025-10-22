/**
 * Memoization caches for variant parsing functions
 * These caches improve performance by avoiding redundant parsing of the same class names
 */
const parseClassNameCache = new Map<string, ParsedClassName>()
const parseArbitraryValueCache = new Map<string, ParsedArbitraryValue | null>()
const isValidArbitraryValueCache = new Map<string, boolean>()

/**
 * All default Tailwind v3 variants
 * These are the built-in variants that Tailwind CSS supports out of the box
 */
export const DEFAULT_TAILWIND_VARIANTS = new Set([
  // Pseudo-classes - Interactive
  'hover',
  'focus',
  'focus-within',
  'focus-visible',
  'active',
  'visited',
  'target',

  // Pseudo-classes - Input
  'disabled',
  'enabled',
  'checked',
  'indeterminate',
  'default',
  'required',
  'valid',
  'invalid',
  'in-range',
  'out-of-range',
  'placeholder-shown',
  'autofill',
  'read-only',

  // Pseudo-classes - Child selectors
  'first',
  'last',
  'only',
  'odd',
  'even',
  'first-of-type',
  'last-of-type',
  'only-of-type',

  // Pseudo-classes - Other
  'empty',
  'open',

  // Pseudo-elements
  'before',
  'after',
  'first-letter',
  'first-line',
  'marker',
  'selection',
  'file',
  'backdrop',
  'placeholder',

  // Responsive breakpoints (default)
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',

  // Dark mode
  'dark',

  // Print
  'print',

  // Motion preferences
  'motion-safe',
  'motion-reduce',

  // Contrast preferences
  'contrast-more',
  'contrast-less',

  // Direction
  'ltr',
  'rtl',

  // Orientation
  'portrait',
  'landscape',
])

/**
 * Parsed class name structure
 */
export interface ParsedClassName {
  /**
   * Array of variant modifiers (e.g., ['hover', 'first'])
   */
  variants: string[]
  /**
   * The base utility class (e.g., 'mt-2')
   */
  base: string
}

/**
 * Result of variant validation
 */
export interface VariantValidationResult {
  /**
   * Whether all variants are valid
   */
  valid: boolean
  /**
   * The first invalid variant found, if any
   */
  invalidVariant?: string
}

/**
 * Parses a Tailwind class name into variants and base utility
 * Handles arbitrary variants like [&:nth-child(3)]:mt-2
 * Results are cached for performance
 * @param className - The class name to parse (e.g., "hover:first:mt-2")
 * @returns Parsed structure with variants and base
 * @example
 * parseClassName("hover:first:mt-2") // { variants: ["hover", "first"], base: "mt-2" }
 * parseClassName("mt-2") // { variants: [], base: "mt-2" }
 * parseClassName("[&:nth-child(3)]:mt-2") // { variants: ["[&:nth-child(3)]"], base: "mt-2" }
 */
export function parseClassName(className: string): ParsedClassName {
  // Check cache first
  const cached = parseClassNameCache.get(className)
  if (cached) {
    return cached
  }

  const variants: string[] = []
  let remaining = className

  // Extract variants from the beginning until we hit the base utility
  while (remaining.includes(':')) {
    // Check if the current part is an arbitrary variant (starts with '[')
    if (remaining.startsWith('[')) {
      // Find the closing ']' and the subsequent ':'
      const closingBracket = remaining.indexOf(']')
      if (closingBracket === -1) {
        // Malformed arbitrary variant, treat rest as base
        break
      }

      const colonAfterBracket = remaining.indexOf(':', closingBracket)
      if (colonAfterBracket === -1) {
        // No colon after bracket, treat rest as base
        break
      }

      // Extract the arbitrary variant including brackets
      const arbitraryVariant = remaining.substring(0, closingBracket + 1)
      variants.push(arbitraryVariant)
      remaining = remaining.substring(colonAfterBracket + 1)
    } else {
      // Regular variant - extract up to the first colon
      const colonIndex = remaining.indexOf(':')
      if (colonIndex === -1) {
        break
      }

      const variant = remaining.substring(0, colonIndex)
      variants.push(variant)
      remaining = remaining.substring(colonIndex + 1)
    }
  }

  // Whatever is left is the base utility
  const base = remaining

  const result = { variants, base }

  // Cache the result
  parseClassNameCache.set(className, result)

  return result
}

/**
 * Checks if a single variant is valid
 * Handles arbitrary variants, group/peer variants, and standard variants
 * @param variant - The variant to validate (e.g., "hover", "group-focus", "[&:nth-child(3)]")
 * @param validVariants - Set of known valid variants
 * @returns true if the variant is valid
 */
export function isValidVariant(
  variant: string,
  validVariants: Set<string>,
): boolean {
  // Empty variant is invalid
  if (!variant) {
    return false
  }

  // Arbitrary variants are always valid (e.g., [&:nth-child(3)])
  if (variant.startsWith('[') && variant.endsWith(']')) {
    return true
  }

  // Group and peer variants: extract suffix and validate it
  // e.g., "group-hover" -> check if "hover" is valid
  // Optimized: use substring instead of replace to avoid regex overhead and string allocation
  if (variant.startsWith('group-')) {
    const suffix = variant.substring(6) // 'group-'.length = 6
    return validVariants.has(suffix)
  }
  if (variant.startsWith('peer-')) {
    const suffix = variant.substring(5) // 'peer-'.length = 5
    return validVariants.has(suffix)
  }

  // Standard variant: check if it's in the valid set
  return validVariants.has(variant)
}

/**
 * Validates an array of variants
 * @param variants - Array of variants to validate
 * @param validVariants - Set of known valid variants
 * @returns Validation result with the first invalid variant if any
 */
export function validateVariants(
  variants: string[],
  validVariants: Set<string>,
): VariantValidationResult {
  for (const variant of variants) {
    if (!isValidVariant(variant, validVariants)) {
      return { valid: false, invalidVariant: variant }
    }
  }

  return { valid: true }
}

/**
 * Tailwind utility prefixes that support arbitrary values
 * These prefixes can be used with bracket notation (e.g., w-[100px], bg-[#1da1f2])
 */
export const ARBITRARY_VALUE_PREFIXES = new Set([
  // Spacing - Padding
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'ps',
  'pe',
  // Spacing - Margin
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  // Spacing - Gap
  'gap',
  'gap-x',
  'gap-y',
  // Spacing - Space
  'space-x',
  'space-y',
  // Spacing - Inset
  'inset',
  'inset-x',
  'inset-y',
  'top',
  'right',
  'bottom',
  'left',
  'start',
  'end',
  // Spacing - Scroll margin/padding
  'scroll-m',
  'scroll-mx',
  'scroll-my',
  'scroll-mt',
  'scroll-mr',
  'scroll-mb',
  'scroll-ml',
  'scroll-ms',
  'scroll-me',
  'scroll-p',
  'scroll-px',
  'scroll-py',
  'scroll-pt',
  'scroll-pr',
  'scroll-pb',
  'scroll-pl',
  'scroll-ps',
  'scroll-pe',
  // Sizing
  'w',
  'h',
  'size',
  'min-w',
  'max-w',
  'min-h',
  'max-h',
  // Colors
  'bg',
  'text',
  'border',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-s',
  'border-e',
  'border-x',
  'border-y',
  'ring',
  'ring-offset',
  'divide',
  'placeholder',
  'from',
  'via',
  'to',
  'decoration',
  'outline',
  'accent',
  'caret',
  'fill',
  'stroke',
  // Typography
  'text', // Also used for font-size
  'leading',
  'tracking',
  'font',
  // Border width
  'border-spacing',
  'border-spacing-x',
  'border-spacing-y',
  'rounded',
  'rounded-t',
  'rounded-r',
  'rounded-b',
  'rounded-l',
  'rounded-s',
  'rounded-e',
  'rounded-tl',
  'rounded-tr',
  'rounded-br',
  'rounded-bl',
  'rounded-ss',
  'rounded-se',
  'rounded-ee',
  'rounded-es',
  // Effects
  'shadow',
  'opacity',
  'bg-opacity',
  'text-opacity',
  'border-opacity',
  'divide-opacity',
  'placeholder-opacity',
  'ring-opacity',
  // Transforms
  'translate-x',
  'translate-y',
  'translate-z',
  'rotate',
  'skew-x',
  'skew-y',
  'scale',
  'scale-x',
  'scale-y',
  'scale-z',
  // Filters
  'blur',
  'brightness',
  'contrast',
  'grayscale',
  'hue-rotate',
  'invert',
  'saturate',
  'sepia',
  'drop-shadow',
  // Backdrop filters
  'backdrop-blur',
  'backdrop-brightness',
  'backdrop-contrast',
  'backdrop-grayscale',
  'backdrop-hue-rotate',
  'backdrop-invert',
  'backdrop-opacity',
  'backdrop-saturate',
  'backdrop-sepia',
  // Transitions and animations
  'duration',
  'delay',
  'ease',
  'transition',
  'animate',
  // Grid
  'grid-cols',
  'grid-rows',
  'col-span',
  'col-start',
  'col-end',
  'row-span',
  'row-start',
  'row-end',
  'auto-cols',
  'auto-rows',
  // Flexbox
  'flex',
  'grow',
  'shrink',
  'basis',
  'order',
  // Layout
  'z',
  'aspect',
  // Interactivity
  'cursor',
  'scroll-m',
  'scroll-p',
  'will-change',
  // SVG
  'stroke-w',
  // Content
  'content',
])

/**
 * Parsed arbitrary value structure
 */
export interface ParsedArbitraryValue {
  /**
   * The prefix before the brackets (e.g., "w" from "w-[100px]")
   */
  prefix: string
  /**
   * The value inside the brackets (e.g., "100px" from "w-[100px]")
   */
  value: string
}

/**
 * Checks if a class name uses arbitrary value syntax
 * Arbitrary values use bracket notation: prefix-[value]
 * @param className - The class name to check (e.g., "w-[100px]", "hover:bg-[#1da1f2]")
 * @returns true if the class uses arbitrary value syntax
 * @example
 * isArbitraryValue("w-[100px]") // true
 * isArbitraryValue("w-full") // false
 * isArbitraryValue("bg-[#1da1f2]") // true
 * isArbitraryValue("text-[14px]") // true
 */
export function isArbitraryValue(className: string): boolean {
  // Pattern: one or more word characters, followed by a dash, followed by brackets with content
  // Matches: w-[100px], bg-[#1da1f2], grid-cols-[200px_1fr]
  // Does not match: [&:hover]:w-full (arbitrary variant), w-full (regular class), w-[] (empty)
  const arbitraryValuePattern = /^[\w-]+-\[.+\]$/
  return arbitraryValuePattern.test(className)
}

/**
 * Parses an arbitrary value class name into prefix and value
 * Results are cached for performance
 * @param className - The class name to parse (e.g., "w-[100px]")
 * @returns Parsed structure with prefix and value, or null if not an arbitrary value
 * @example
 * parseArbitraryValue("w-[100px]") // { prefix: "w", value: "100px" }
 * parseArbitraryValue("bg-[#1da1f2]") // { prefix: "bg", value: "#1da1f2" }
 * parseArbitraryValue("w-full") // null
 */
export function parseArbitraryValue(
  className: string,
): ParsedArbitraryValue | null {
  // Check cache first
  const cached = parseArbitraryValueCache.get(className)
  if (cached !== undefined) {
    return cached
  }

  if (!isArbitraryValue(className)) {
    parseArbitraryValueCache.set(className, null)
    return null
  }

  // Find the last occurrence of "-[" to handle multi-part prefixes like "grid-cols"
  const bracketIndex = className.lastIndexOf('-[')
  if (bracketIndex === -1) {
    parseArbitraryValueCache.set(className, null)
    return null
  }

  const prefix = className.substring(0, bracketIndex)
  const valueWithBrackets = className.substring(bracketIndex + 1)

  // Extract value from brackets
  if (!valueWithBrackets.startsWith('[') || !valueWithBrackets.endsWith(']')) {
    parseArbitraryValueCache.set(className, null)
    return null
  }

  const value = valueWithBrackets.slice(1, -1)

  const result = { prefix, value }

  // Cache the result
  parseArbitraryValueCache.set(className, result)

  return result
}

/**
 * Validates an arbitrary value class name
 * Checks if the prefix is a valid Tailwind utility that supports arbitrary values
 * Results are cached for performance
 * @param className - The class name to validate (e.g., "w-[100px]")
 * @returns true if the arbitrary value is valid
 * @example
 * isValidArbitraryValue("w-[100px]") // true
 * isValidArbitraryValue("invalid-[100px]") // false
 * isValidArbitraryValue("w-full") // false (not an arbitrary value)
 */
export function isValidArbitraryValue(className: string): boolean {
  // Check cache first
  const cached = isValidArbitraryValueCache.get(className)
  if (cached !== undefined) {
    return cached
  }

  const parsed = parseArbitraryValue(className)
  if (!parsed) {
    isValidArbitraryValueCache.set(className, false)
    return false
  }

  const { prefix, value } = parsed

  // Check if prefix is valid
  if (!ARBITRARY_VALUE_PREFIXES.has(prefix)) {
    isValidArbitraryValueCache.set(className, false)
    return false
  }

  // Check if value is not empty
  if (!value || value.trim().length === 0) {
    isValidArbitraryValueCache.set(className, false)
    return false
  }

  isValidArbitraryValueCache.set(className, true)
  return true
}
