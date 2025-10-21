/**
 * Type guard utilities for runtime type validation
 * Replaces unsafe type casting with proper validation
 */

/**
 * Type guard to check if a value is a string
 * @param value - The value to check
 * @returns true if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Type guard to check if a value is a non-null object
 * @param value - The value to check
 * @returns true if the value is an object (and not null or array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard to check if a value is a valid theme value
 * Theme values can be strings, numbers, or nested objects
 * @param value - The value to check
 * @returns true if the value is a valid theme value
 */
export function isThemeValue(
  value: unknown,
): value is string | number | Record<string, unknown> {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    (typeof value === 'object' && value !== null && !Array.isArray(value))
  )
}

/**
 * Type guard to check if a value is a theme scale (object with string keys)
 * @param value - The value to check
 * @returns true if the value is a valid theme scale
 */
export function isThemeScale(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard to check if a value is a valid ResolvedTailwindConfig
 * Validates that the resolved Tailwind config has the minimum required structure
 * @param value - The value to check
 * @returns true if the value matches ResolvedTailwindConfig structure
 */
export function isResolvedTailwindConfig(
  value: unknown,
): value is Record<string, unknown> {
  if (!isObject(value)) {
    return false
  }

  // Check for required properties
  // Theme is the only truly required property for our plugin to function
  // We need theme to exist and be an object so we can extract utility classes
  const hasTheme = 'theme' in value && isObject(value.theme)

  if (!hasTheme) {
    return false
  }

  // safelist is optional but if present should be an array
  // However, we'll be lenient here - if it's not an array, we'll just treat it as empty
  const hasSafelist = 'safelist' in value
  const safelistValid =
    !hasSafelist ||
    Array.isArray(value.safelist) ||
    value.safelist === undefined ||
    value.safelist === null

  // content can be either an array (Tailwind v2) or an object (Tailwind v3+)
  // Be lenient here - accept both formats or missing
  const hasContent = 'content' in value
  const contentValid =
    !hasContent ||
    Array.isArray(value.content) ||
    isObject(value.content) ||
    value.content === undefined ||
    value.content === null

  return safelistValid && contentValid
}
