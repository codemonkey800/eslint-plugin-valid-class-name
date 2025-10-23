/**
 * Memoization cache for parseClassName function
 * This cache improves performance by avoiding redundant parsing of the same class names
 */
const parseClassNameCache = new Map<string, ParsedClassName>()

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
