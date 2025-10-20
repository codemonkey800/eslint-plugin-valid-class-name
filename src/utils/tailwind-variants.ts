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
 * @param className - The class name to parse (e.g., "hover:first:mt-2")
 * @returns Parsed structure with variants and base
 * @example
 * parseClassName("hover:first:mt-2") // { variants: ["hover", "first"], base: "mt-2" }
 * parseClassName("mt-2") // { variants: [], base: "mt-2" }
 * parseClassName("[&:nth-child(3)]:mt-2") // { variants: ["[&:nth-child(3)]"], base: "mt-2" }
 */
export function parseClassName(className: string): ParsedClassName {
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

  return { variants, base }
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
  if (variant.startsWith('group-') || variant.startsWith('peer-')) {
    const suffix = variant.replace(/^(group|peer)-/, '')
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
