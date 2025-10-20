import fs from 'fs'
import path from 'path'
import type { TailwindConfig } from 'src/types/options'

/**
 * Resolved Tailwind configuration structure
 */
export interface ResolvedTailwindConfig {
  safelist: Array<string | SafelistPattern>
  theme: Record<string, unknown>
  content: string[]
  [key: string]: unknown
}

/**
 * Safelist pattern object (for future pattern matching support)
 */
interface SafelistPattern {
  pattern: RegExp
  variants?: string[]
}

/**
 * Type representing a value in the Tailwind theme
 * Can be a primitive or nested object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThemeValue = string | number | Record<string, any>

/**
 * Type representing a scale in the Tailwind theme (e.g., colors, spacing)
 */
type ThemeScale = Record<string, ThemeValue>

/**
 * Type guard to check if a value is a valid theme scale
 */
function isThemeScale(value: unknown): value is ThemeScale {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Default Tailwind config file names to search for
 */
const CONFIG_FILE_NAMES = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
]

/**
 * Finds the Tailwind configuration file
 * @param configPath - Explicit path to config file (optional)
 * @param cwd - Current working directory
 * @returns Absolute path to config file, or null if not found
 */
export function findTailwindConfigPath(
  configPath: string | undefined,
  cwd: string,
): string | null {
  // If explicit path provided, resolve and check if it exists
  if (configPath) {
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(cwd, configPath)

    if (fs.existsSync(absolutePath)) {
      return absolutePath
    }

    console.warn(`Warning: Tailwind config file not found at "${configPath}"`)
    return null
  }

  // Auto-detect: search for common config file names
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.resolve(cwd, fileName)
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  // Not found
  return null
}

/**
 * Loads and resolves a Tailwind configuration file
 * @param configPath - Absolute path to the config file
 * @returns Resolved Tailwind config, or null if loading fails
 */
export async function loadTailwindConfig(
  configPath: string,
): Promise<ResolvedTailwindConfig | null> {
  try {
    // Dynamic import to support both ESM and CJS
    const configModule = await import(configPath)
    const userConfig = configModule.default || configModule

    // Import Tailwind's resolveConfig
    const { default: resolveConfig } = await import('tailwindcss/resolveConfig')

    // Resolve the config with Tailwind defaults
    const resolved = resolveConfig(userConfig) as ResolvedTailwindConfig

    return resolved
  } catch (error) {
    console.warn(
      `Warning: Failed to load Tailwind config from "${configPath}":`,
      error,
    )
    return null
  }
}

/**
 * Extracts class names from Tailwind safelist
 * Currently only extracts string literals; pattern objects are stored for future use
 * @param safelist - Array of safelist entries from Tailwind config
 * @returns Set of class names from safelist
 */
export function extractSafelistClasses(
  safelist: Array<string | SafelistPattern> | undefined | null,
): Set<string> {
  const classes = new Set<string>()

  // Handle undefined or null safelist
  if (!safelist || !Array.isArray(safelist)) {
    return classes
  }

  for (const entry of safelist) {
    // Skip null/undefined entries
    if (entry === null || entry === undefined) {
      continue
    }

    if (typeof entry === 'string') {
      // Direct string literal class name
      classes.add(entry)
    }
    // Pattern objects (e.g., { pattern: /bg-.*-500/ }) are not handled yet
    // This will be implemented in Phase 4.2: Generate utility classes from config
  }

  return classes
}

/**
 * Flattens a nested theme object into a map of class suffixes to values
 * Handles edge cases: circular references, functions, and invalid values
 * @param themeSection - Theme section (e.g., colors, spacing)
 * @param prefix - Optional prefix for nested keys
 * @param visited - Set tracking visited objects to prevent circular references
 * @returns Map of flattened keys to values
 */
function flattenThemeObject(
  themeSection: Record<string, unknown> | undefined,
  prefix = '',
  visited: WeakSet<object> = new WeakSet(),
): Map<string, ThemeValue> {
  const result = new Map<string, ThemeValue>()

  if (!isThemeScale(themeSection)) {
    return result
  }

  // Check for circular reference
  if (visited.has(themeSection)) {
    console.warn(
      `Warning: Circular reference detected in theme section${prefix ? ` at key '${prefix}'` : ''}. Skipping to prevent infinite loop.`,
    )
    return result
  }

  // Return early for empty objects
  if (Object.keys(themeSection).length === 0) {
    return result
  }

  // Mark this object as visited
  visited.add(themeSection)

  for (const [key, value] of Object.entries(themeSection)) {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue
    }

    // Skip function values (not valid theme values)
    if (typeof value === 'function') {
      console.warn(
        `Warning: Function value detected in theme at key '${prefix ? prefix + '-' : ''}${key}'. Functions are not valid theme values and will be skipped.`,
      )
      continue
    }

    const fullKey = prefix ? `${prefix}-${key}` : key

    // Handle nested objects (like colors.blue.500)
    // Explicitly check it's an object and not an array
    if (typeof value === 'object' && !Array.isArray(value)) {
      // If key is 'DEFAULT', add without suffix
      if (key === 'DEFAULT') {
        result.set(prefix || 'DEFAULT', value)
      } else {
        // Recursively flatten nested objects, passing visited set
        const nested = flattenThemeObject(value as ThemeScale, fullKey, visited)
        for (const [nestedKey, nestedValue] of nested) {
          result.set(nestedKey, nestedValue)
        }
      }
    } else {
      // Primitive value or array (arrays are valid for some theme values like fontFamily)
      result.set(fullKey, value)
    }
  }

  return result
}

/**
 * Generates color utility classes from theme colors
 * @param colors - Theme colors configuration
 * @returns Set of generated color utility classes
 */
function generateColorUtilities(
  colors: Record<string, unknown> | undefined,
): Set<string> {
  const utilities = new Set<string>()

  if (!colors) {
    return utilities
  }

  const flatColors = flattenThemeObject(colors)
  const colorPrefixes = [
    'bg',
    'text',
    'border',
    'ring',
    'divide',
    'placeholder',
    'from',
    'via',
    'to',
    'decoration',
    'outline',
    'accent',
    'caret',
  ]

  for (const [colorKey] of flatColors) {
    for (const prefix of colorPrefixes) {
      utilities.add(`${prefix}-${colorKey}`)
    }
  }

  return utilities
}

/**
 * Set of spacing prefixes that support negative values
 * These include margin, inset, positioning, and space utilities
 */
const NEGATIVE_SPACING_PREFIXES = new Set([
  // Margin utilities
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  // Inset utilities
  'inset',
  'inset-x',
  'inset-y',
  // Positioning utilities
  'top',
  'right',
  'bottom',
  'left',
  'start',
  'end',
  // Space utilities
  'space-x',
  'space-y',
  // Scroll margin utilities
  'scroll-m',
  'scroll-mx',
  'scroll-my',
  'scroll-mt',
  'scroll-mr',
  'scroll-mb',
  'scroll-ml',
  'scroll-ms',
  'scroll-me',
])

/**
 * Checks if a spacing prefix supports negative values
 * @param prefix - The spacing utility prefix to check
 * @returns True if the prefix supports negative values
 */
function supportsNegativeSpacing(prefix: string): boolean {
  return NEGATIVE_SPACING_PREFIXES.has(prefix)
}

/**
 * Generates spacing utility classes from theme spacing
 * @param spacing - Theme spacing configuration
 * @returns Set of generated spacing utility classes
 */
function generateSpacingUtilities(
  spacing: Record<string, unknown> | undefined,
): Set<string> {
  const utilities = new Set<string>()

  if (!spacing) {
    return utilities
  }

  const flatSpacing = flattenThemeObject(spacing)
  const spacingPrefixes = [
    // Padding
    'p',
    'px',
    'py',
    'pt',
    'pr',
    'pb',
    'pl',
    'ps',
    'pe',
    // Margin
    'm',
    'mx',
    'my',
    'mt',
    'mr',
    'mb',
    'ml',
    'ms',
    'me',
    // Gap
    'gap',
    'gap-x',
    'gap-y',
    // Space
    'space-x',
    'space-y',
    // Inset
    'inset',
    'inset-x',
    'inset-y',
    'top',
    'right',
    'bottom',
    'left',
    'start',
    'end',
    // Scroll
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
  ]

  for (const [spacingKey] of flatSpacing) {
    for (const prefix of spacingPrefixes) {
      utilities.add(`${prefix}-${spacingKey}`)

      // Also generate negative versions for utilities that support them
      if (supportsNegativeSpacing(prefix)) {
        utilities.add(`-${prefix}-${spacingKey}`)
      }
    }
  }

  return utilities
}

/**
 * Generates sizing utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated sizing utility classes
 */
function generateSizingUtilities(theme: Record<string, unknown>): Set<string> {
  const utilities = new Set<string>()

  // Width utilities
  const width = theme.width as Record<string, unknown> | undefined
  if (width) {
    const flatWidth = flattenThemeObject(width)
    for (const [key] of flatWidth) {
      utilities.add(`w-${key}`)
    }
  }

  // Height utilities
  const height = theme.height as Record<string, unknown> | undefined
  if (height) {
    const flatHeight = flattenThemeObject(height)
    for (const [key] of flatHeight) {
      utilities.add(`h-${key}`)
    }
  }

  // Min-width utilities
  const minWidth = theme.minWidth as Record<string, unknown> | undefined
  if (minWidth) {
    const flatMinWidth = flattenThemeObject(minWidth)
    for (const [key] of flatMinWidth) {
      utilities.add(`min-w-${key}`)
    }
  }

  // Max-width utilities
  const maxWidth = theme.maxWidth as Record<string, unknown> | undefined
  if (maxWidth) {
    const flatMaxWidth = flattenThemeObject(maxWidth)
    for (const [key] of flatMaxWidth) {
      utilities.add(`max-w-${key}`)
    }
  }

  // Min-height utilities
  const minHeight = theme.minHeight as Record<string, unknown> | undefined
  if (minHeight) {
    const flatMinHeight = flattenThemeObject(minHeight)
    for (const [key] of flatMinHeight) {
      utilities.add(`min-h-${key}`)
    }
  }

  // Max-height utilities
  const maxHeight = theme.maxHeight as Record<string, unknown> | undefined
  if (maxHeight) {
    const flatMaxHeight = flattenThemeObject(maxHeight)
    for (const [key] of flatMaxHeight) {
      utilities.add(`max-h-${key}`)
    }
  }

  // Size utilities (both width and height)
  const size = theme.size as Record<string, unknown> | undefined
  if (size) {
    const flatSize = flattenThemeObject(size)
    for (const [key] of flatSize) {
      utilities.add(`size-${key}`)
    }
  }

  return utilities
}

/**
 * Generates typography utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated typography utility classes
 */
function generateTypographyUtilities(
  theme: Record<string, unknown>,
): Set<string> {
  const utilities = new Set<string>()

  // Font size utilities
  const fontSize = theme.fontSize as Record<string, unknown> | undefined
  if (fontSize) {
    const flatFontSize = flattenThemeObject(fontSize)
    for (const [key] of flatFontSize) {
      utilities.add(`text-${key}`)
    }
  }

  // Font weight utilities
  // Note: Both fontWeight and fontFamily use the 'font-' prefix, which matches
  // Tailwind's design (e.g., font-bold vs font-sans). In practice, Tailwind's
  // default theme doesn't have overlapping keys, but custom themes could cause
  // conflicts if users define custom theme values with the same key names.
  const fontWeight = theme.fontWeight as Record<string, unknown> | undefined
  const fontWeightKeys = new Set<string>()

  if (fontWeight) {
    const flatFontWeight = flattenThemeObject(fontWeight)
    for (const [key] of flatFontWeight) {
      utilities.add(`font-${key}`)
      fontWeightKeys.add(key)
    }
  }

  // Font family utilities
  const fontFamily = theme.fontFamily as Record<string, unknown> | undefined
  if (fontFamily) {
    const flatFontFamily = flattenThemeObject(fontFamily)
    for (const [key] of flatFontFamily) {
      // Detect and warn about collisions with fontWeight keys
      if (fontWeightKeys.has(key)) {
        console.warn(
          `Warning: Theme collision detected - fontFamily key '${key}' conflicts with fontWeight key '${key}'. Both generate 'font-${key}' utility. The fontFamily value will overwrite fontWeight in the generated class set.`,
        )
      }
      utilities.add(`font-${key}`)
    }
  }

  // Line height utilities
  const lineHeight = theme.lineHeight as Record<string, unknown> | undefined
  if (lineHeight) {
    const flatLineHeight = flattenThemeObject(lineHeight)
    for (const [key] of flatLineHeight) {
      utilities.add(`leading-${key}`)
    }
  }

  // Letter spacing utilities
  const letterSpacing = theme.letterSpacing as
    | Record<string, unknown>
    | undefined
  if (letterSpacing) {
    const flatLetterSpacing = flattenThemeObject(letterSpacing)
    for (const [key] of flatLetterSpacing) {
      utilities.add(`tracking-${key}`)
    }
  }

  return utilities
}

/**
 * Generates layout-related static utilities
 * @returns Set of layout utility classes
 */
function generateLayoutUtilities(): Set<string> {
  return new Set([
    // Display
    'block',
    'inline-block',
    'inline',
    'flex',
    'inline-flex',
    'table',
    'inline-table',
    'table-caption',
    'table-cell',
    'table-column',
    'table-column-group',
    'table-footer-group',
    'table-header-group',
    'table-row-group',
    'table-row',
    'flow-root',
    'grid',
    'inline-grid',
    'contents',
    'list-item',
    'hidden',
    // Position
    'static',
    'fixed',
    'absolute',
    'relative',
    'sticky',
    // Visibility
    'visible',
    'invisible',
    'collapse',
    // Isolation
    'isolate',
    'isolation-auto',
    // Z-index
    'z-0',
    'z-10',
    'z-20',
    'z-30',
    'z-40',
    'z-50',
    'z-auto',
    // Box sizing
    'box-border',
    'box-content',
  ])
}

/**
 * Generates overflow-related static utilities
 * @returns Set of overflow utility classes
 */
function generateOverflowUtilities(): Set<string> {
  return new Set([
    'overflow-auto',
    'overflow-hidden',
    'overflow-clip',
    'overflow-visible',
    'overflow-scroll',
    'overflow-x-auto',
    'overflow-y-auto',
    'overflow-x-hidden',
    'overflow-y-hidden',
    'overflow-x-clip',
    'overflow-y-clip',
    'overflow-x-visible',
    'overflow-y-visible',
    'overflow-x-scroll',
    'overflow-y-scroll',
  ])
}

/**
 * Generates flexbox-related static utilities
 * @returns Set of flexbox utility classes
 */
function generateFlexboxStaticUtilities(): Set<string> {
  return new Set([
    'flex-row',
    'flex-row-reverse',
    'flex-col',
    'flex-col-reverse',
    'flex-wrap',
    'flex-wrap-reverse',
    'flex-nowrap',
    'flex-1',
    'flex-auto',
    'flex-initial',
    'flex-none',
    'grow',
    'grow-0',
    'shrink',
    'shrink-0',
    'justify-normal',
    'justify-start',
    'justify-end',
    'justify-center',
    'justify-between',
    'justify-around',
    'justify-evenly',
    'justify-stretch',
    'justify-items-start',
    'justify-items-end',
    'justify-items-center',
    'justify-items-stretch',
    'justify-self-auto',
    'justify-self-start',
    'justify-self-end',
    'justify-self-center',
    'justify-self-stretch',
    'items-start',
    'items-end',
    'items-center',
    'items-baseline',
    'items-stretch',
    'content-normal',
    'content-center',
    'content-start',
    'content-end',
    'content-between',
    'content-around',
    'content-evenly',
    'content-baseline',
    'content-stretch',
    'self-auto',
    'self-start',
    'self-end',
    'self-center',
    'self-stretch',
    'self-baseline',
  ])
}

/**
 * Generates grid-related utilities, both static and theme-based
 * @param theme - Resolved theme configuration
 * @returns Set of grid utility classes
 */
function generateGridUtilities(theme: Record<string, unknown>): Set<string> {
  const utilities = new Set<string>()

  // Static grid utilities (always included)
  const staticGridUtils = [
    'grid-flow-row',
    'grid-flow-col',
    'grid-flow-dense',
    'grid-flow-row-dense',
    'grid-flow-col-dense',
    'auto-cols-auto',
    'auto-cols-min',
    'auto-cols-max',
    'auto-cols-fr',
    'auto-rows-auto',
    'auto-rows-min',
    'auto-rows-max',
    'auto-rows-fr',
  ]
  staticGridUtils.forEach(util => utilities.add(util))

  // Default ranges for grid utilities (matching Tailwind's defaults)
  const DEFAULT_GRID_COLS_RANGE = 12
  const DEFAULT_GRID_ROWS_RANGE = 6
  const DEFAULT_GRID_COL_START_END_RANGE = 13
  const DEFAULT_GRID_ROW_START_END_RANGE = 7

  // Grid template columns utilities (grid-cols-*)
  const gridTemplateColumns = theme.gridTemplateColumns as
    | Record<string, unknown>
    | undefined
  if (gridTemplateColumns) {
    const flatGridCols = flattenThemeObject(gridTemplateColumns)
    for (const [key] of flatGridCols) {
      utilities.add(`grid-cols-${key}`)
    }
  } else {
    // Fallback to default range
    for (let i = 1; i <= DEFAULT_GRID_COLS_RANGE; i++) {
      utilities.add(`grid-cols-${i}`)
    }
    utilities.add('grid-cols-none')
  }

  // Grid template rows utilities (grid-rows-*)
  const gridTemplateRows = theme.gridTemplateRows as
    | Record<string, unknown>
    | undefined
  if (gridTemplateRows) {
    const flatGridRows = flattenThemeObject(gridTemplateRows)
    for (const [key] of flatGridRows) {
      utilities.add(`grid-rows-${key}`)
    }
  } else {
    // Fallback to default range
    for (let i = 1; i <= DEFAULT_GRID_ROWS_RANGE; i++) {
      utilities.add(`grid-rows-${i}`)
    }
    utilities.add('grid-rows-none')
  }

  // Grid column utilities (col-span-*, col-start-*, col-end-*)
  const gridColumn = theme.gridColumn as Record<string, unknown> | undefined
  if (gridColumn) {
    const flatGridColumn = flattenThemeObject(gridColumn)
    for (const [key] of flatGridColumn) {
      utilities.add(`col-${key}`)
    }
  } else {
    // Fallback to default ranges
    utilities.add('col-auto')
    for (let i = 1; i <= DEFAULT_GRID_COLS_RANGE; i++) {
      utilities.add(`col-span-${i}`)
    }
    utilities.add('col-span-full')
  }

  // Grid column start utilities
  const gridColumnStart = theme.gridColumnStart as
    | Record<string, unknown>
    | undefined
  if (gridColumnStart) {
    const flatGridColStart = flattenThemeObject(gridColumnStart)
    for (const [key] of flatGridColStart) {
      utilities.add(`col-start-${key}`)
    }
  } else {
    // Fallback to default range
    for (let i = 1; i <= DEFAULT_GRID_COL_START_END_RANGE; i++) {
      utilities.add(`col-start-${i}`)
    }
    utilities.add('col-start-auto')
  }

  // Grid column end utilities
  const gridColumnEnd = theme.gridColumnEnd as
    | Record<string, unknown>
    | undefined
  if (gridColumnEnd) {
    const flatGridColEnd = flattenThemeObject(gridColumnEnd)
    for (const [key] of flatGridColEnd) {
      utilities.add(`col-end-${key}`)
    }
  } else {
    // Fallback to default range
    for (let i = 1; i <= DEFAULT_GRID_COL_START_END_RANGE; i++) {
      utilities.add(`col-end-${i}`)
    }
    utilities.add('col-end-auto')
  }

  // Grid row utilities (row-span-*, row-start-*, row-end-*)
  const gridRow = theme.gridRow as Record<string, unknown> | undefined
  if (gridRow) {
    const flatGridRow = flattenThemeObject(gridRow)
    for (const [key] of flatGridRow) {
      utilities.add(`row-${key}`)
    }
  } else {
    // Fallback to default ranges
    utilities.add('row-auto')
    for (let i = 1; i <= DEFAULT_GRID_ROWS_RANGE; i++) {
      utilities.add(`row-span-${i}`)
    }
    utilities.add('row-span-full')
  }

  // Grid row start utilities
  const gridRowStart = theme.gridRowStart as Record<string, unknown> | undefined
  if (gridRowStart) {
    const flatGridRowStart = flattenThemeObject(gridRowStart)
    for (const [key] of flatGridRowStart) {
      utilities.add(`row-start-${key}`)
    }
  } else {
    // Fallback to default range
    for (let i = 1; i <= DEFAULT_GRID_ROW_START_END_RANGE; i++) {
      utilities.add(`row-start-${i}`)
    }
    utilities.add('row-start-auto')
  }

  // Grid row end utilities
  const gridRowEnd = theme.gridRowEnd as Record<string, unknown> | undefined
  if (gridRowEnd) {
    const flatGridRowEnd = flattenThemeObject(gridRowEnd)
    for (const [key] of flatGridRowEnd) {
      utilities.add(`row-end-${key}`)
    }
  } else {
    // Fallback to default range
    for (let i = 1; i <= DEFAULT_GRID_ROW_START_END_RANGE; i++) {
      utilities.add(`row-end-${i}`)
    }
    utilities.add('row-end-auto')
  }

  return utilities
}

/**
 * Generates float and clear static utilities
 * @returns Set of float/clear utility classes
 */
function generateFloatClearUtilities(): Set<string> {
  return new Set([
    'float-start',
    'float-end',
    'float-right',
    'float-left',
    'float-none',
    'clear-start',
    'clear-end',
    'clear-left',
    'clear-right',
    'clear-both',
    'clear-none',
  ])
}

/**
 * Generates object-fit and object-position static utilities
 * @returns Set of object utility classes
 */
function generateObjectFitUtilities(): Set<string> {
  return new Set([
    'object-contain',
    'object-cover',
    'object-fill',
    'object-none',
    'object-scale-down',
    'object-bottom',
    'object-center',
    'object-left',
    'object-left-bottom',
    'object-left-top',
    'object-right',
    'object-right-bottom',
    'object-right-top',
    'object-top',
  ])
}

/**
 * Generates static utility classes that don't depend on theme values
 * Combines all static utility categories (excludes grid utilities which are now theme-based)
 * @returns Set of static utility classes
 */
function generateStaticUtilities(): Set<string> {
  const utilities = new Set<string>()

  // Combine all static utility categories
  const layoutUtils = generateLayoutUtilities()
  const overflowUtils = generateOverflowUtilities()
  const flexboxUtils = generateFlexboxStaticUtilities()
  const floatClearUtils = generateFloatClearUtilities()
  const objectUtils = generateObjectFitUtilities()

  for (const util of layoutUtils) utilities.add(util)
  for (const util of overflowUtils) utilities.add(util)
  for (const util of flexboxUtils) utilities.add(util)
  for (const util of floatClearUtils) utilities.add(util)
  for (const util of objectUtils) utilities.add(util)

  return utilities
}

/**
 * Generates border utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated border utility classes
 */
function generateBorderUtilities(theme: Record<string, unknown>): Set<string> {
  const utilities = new Set<string>()

  // Border width utilities
  const borderWidth = theme.borderWidth as Record<string, unknown> | undefined
  if (borderWidth) {
    const flatBorderWidth = flattenThemeObject(borderWidth)
    for (const [key] of flatBorderWidth) {
      utilities.add(`border-${key}`)
      utilities.add(`border-x-${key}`)
      utilities.add(`border-y-${key}`)
      utilities.add(`border-t-${key}`)
      utilities.add(`border-r-${key}`)
      utilities.add(`border-b-${key}`)
      utilities.add(`border-l-${key}`)
      utilities.add(`border-s-${key}`)
      utilities.add(`border-e-${key}`)
    }
  }

  // Add default border (no width specified)
  utilities.add('border')
  utilities.add('border-x')
  utilities.add('border-y')
  utilities.add('border-t')
  utilities.add('border-r')
  utilities.add('border-b')
  utilities.add('border-l')
  utilities.add('border-s')
  utilities.add('border-e')

  // Border radius utilities
  const borderRadius = theme.borderRadius as Record<string, unknown> | undefined
  if (borderRadius) {
    const flatBorderRadius = flattenThemeObject(borderRadius)
    for (const [key] of flatBorderRadius) {
      utilities.add(`rounded-${key}`)
      utilities.add(`rounded-t-${key}`)
      utilities.add(`rounded-r-${key}`)
      utilities.add(`rounded-b-${key}`)
      utilities.add(`rounded-l-${key}`)
      utilities.add(`rounded-s-${key}`)
      utilities.add(`rounded-e-${key}`)
      utilities.add(`rounded-tl-${key}`)
      utilities.add(`rounded-tr-${key}`)
      utilities.add(`rounded-br-${key}`)
      utilities.add(`rounded-bl-${key}`)
      utilities.add(`rounded-ss-${key}`)
      utilities.add(`rounded-se-${key}`)
      utilities.add(`rounded-ee-${key}`)
      utilities.add(`rounded-es-${key}`)
    }
  }

  // Border style utilities
  utilities.add('border-solid')
  utilities.add('border-dashed')
  utilities.add('border-dotted')
  utilities.add('border-double')
  utilities.add('border-hidden')
  utilities.add('border-none')

  // Divide width utilities
  if (borderWidth) {
    const flatBorderWidth = flattenThemeObject(borderWidth)
    for (const [key] of flatBorderWidth) {
      utilities.add(`divide-x-${key}`)
      utilities.add(`divide-y-${key}`)
    }
  }
  utilities.add('divide-x')
  utilities.add('divide-y')

  // Divide style utilities
  utilities.add('divide-solid')
  utilities.add('divide-dashed')
  utilities.add('divide-dotted')
  utilities.add('divide-double')
  utilities.add('divide-none')

  // Ring width utilities
  const ringWidth = theme.ringWidth as Record<string, unknown> | undefined
  if (ringWidth) {
    const flatRingWidth = flattenThemeObject(ringWidth)
    for (const [key] of flatRingWidth) {
      utilities.add(`ring-${key}`)
      utilities.add(`ring-inset-${key}`)
    }
  }
  utilities.add('ring')
  utilities.add('ring-inset')

  // Ring offset width
  const ringOffsetWidth = theme.ringOffsetWidth as
    | Record<string, unknown>
    | undefined
  if (ringOffsetWidth) {
    const flatRingOffsetWidth = flattenThemeObject(ringOffsetWidth)
    for (const [key] of flatRingOffsetWidth) {
      utilities.add(`ring-offset-${key}`)
    }
  }

  // Outline width
  const outlineWidth = theme.outlineWidth as Record<string, unknown> | undefined
  if (outlineWidth) {
    const flatOutlineWidth = flattenThemeObject(outlineWidth)
    for (const [key] of flatOutlineWidth) {
      utilities.add(`outline-${key}`)
    }
  }

  // Outline style
  utilities.add('outline-none')
  utilities.add('outline')
  utilities.add('outline-dashed')
  utilities.add('outline-dotted')
  utilities.add('outline-double')

  // Outline offset
  const outlineOffset = theme.outlineOffset as
    | Record<string, unknown>
    | undefined
  if (outlineOffset) {
    const flatOutlineOffset = flattenThemeObject(outlineOffset)
    for (const [key] of flatOutlineOffset) {
      utilities.add(`outline-offset-${key}`)
    }
  }

  return utilities
}

/**
 * Generates effect utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated effect utility classes
 */
function generateEffectUtilities(theme: Record<string, unknown>): Set<string> {
  const utilities = new Set<string>()

  // Box shadow utilities
  const boxShadow = theme.boxShadow as Record<string, unknown> | undefined
  if (boxShadow) {
    const flatBoxShadow = flattenThemeObject(boxShadow)
    for (const [key] of flatBoxShadow) {
      utilities.add(`shadow-${key}`)
    }
  }

  // Opacity utilities
  const opacity = theme.opacity as Record<string, unknown> | undefined
  if (opacity) {
    const flatOpacity = flattenThemeObject(opacity)
    for (const [key] of flatOpacity) {
      utilities.add(`opacity-${key}`)
    }
  }

  // Mix blend mode
  utilities.add('mix-blend-normal')
  utilities.add('mix-blend-multiply')
  utilities.add('mix-blend-screen')
  utilities.add('mix-blend-overlay')
  utilities.add('mix-blend-darken')
  utilities.add('mix-blend-lighten')
  utilities.add('mix-blend-color-dodge')
  utilities.add('mix-blend-color-burn')
  utilities.add('mix-blend-hard-light')
  utilities.add('mix-blend-soft-light')
  utilities.add('mix-blend-difference')
  utilities.add('mix-blend-exclusion')
  utilities.add('mix-blend-hue')
  utilities.add('mix-blend-saturation')
  utilities.add('mix-blend-color')
  utilities.add('mix-blend-luminosity')
  utilities.add('mix-blend-plus-lighter')

  // Background blend mode
  utilities.add('bg-blend-normal')
  utilities.add('bg-blend-multiply')
  utilities.add('bg-blend-screen')
  utilities.add('bg-blend-overlay')
  utilities.add('bg-blend-darken')
  utilities.add('bg-blend-lighten')
  utilities.add('bg-blend-color-dodge')
  utilities.add('bg-blend-color-burn')
  utilities.add('bg-blend-hard-light')
  utilities.add('bg-blend-soft-light')
  utilities.add('bg-blend-difference')
  utilities.add('bg-blend-exclusion')
  utilities.add('bg-blend-hue')
  utilities.add('bg-blend-saturation')
  utilities.add('bg-blend-color')
  utilities.add('bg-blend-luminosity')

  return utilities
}

/**
 * Generates transform utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated transform utility classes
 */
function generateTransformUtilities(
  theme: Record<string, unknown>,
): Set<string> {
  const utilities = new Set<string>()

  // Static transform utilities
  utilities.add('transform')
  utilities.add('transform-none')
  utilities.add('transform-cpu')
  utilities.add('transform-gpu')

  // Translate utilities
  const translate = theme.translate as Record<string, unknown> | undefined
  if (translate) {
    const flatTranslate = flattenThemeObject(translate)
    for (const [key] of flatTranslate) {
      utilities.add(`translate-x-${key}`)
      utilities.add(`translate-y-${key}`)
      utilities.add(`-translate-x-${key}`)
      utilities.add(`-translate-y-${key}`)
    }
  }

  // Rotate utilities
  const rotate = theme.rotate as Record<string, unknown> | undefined
  if (rotate) {
    const flatRotate = flattenThemeObject(rotate)
    for (const [key] of flatRotate) {
      utilities.add(`rotate-${key}`)
      utilities.add(`-rotate-${key}`)
    }
  }

  // Scale utilities
  const scale = theme.scale as Record<string, unknown> | undefined
  if (scale) {
    const flatScale = flattenThemeObject(scale)
    for (const [key] of flatScale) {
      utilities.add(`scale-${key}`)
      utilities.add(`scale-x-${key}`)
      utilities.add(`scale-y-${key}`)
    }
  }

  // Skew utilities
  const skew = theme.skew as Record<string, unknown> | undefined
  if (skew) {
    const flatSkew = flattenThemeObject(skew)
    for (const [key] of flatSkew) {
      utilities.add(`skew-x-${key}`)
      utilities.add(`skew-y-${key}`)
      utilities.add(`-skew-x-${key}`)
      utilities.add(`-skew-y-${key}`)
    }
  }

  return utilities
}

/**
 * Generates filter utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated filter utility classes
 */
function generateFilterUtilities(theme: Record<string, unknown>): Set<string> {
  const utilities = new Set<string>()

  // Static filter utilities
  utilities.add('filter')
  utilities.add('filter-none')

  // Blur utilities
  const blur = theme.blur as Record<string, unknown> | undefined
  if (blur) {
    const flatBlur = flattenThemeObject(blur)
    for (const [key] of flatBlur) {
      utilities.add(`blur-${key}`)
    }
  }

  // Brightness utilities
  const brightness = theme.brightness as Record<string, unknown> | undefined
  if (brightness) {
    const flatBrightness = flattenThemeObject(brightness)
    for (const [key] of flatBrightness) {
      utilities.add(`brightness-${key}`)
    }
  }

  // Contrast utilities
  const contrast = theme.contrast as Record<string, unknown> | undefined
  if (contrast) {
    const flatContrast = flattenThemeObject(contrast)
    for (const [key] of flatContrast) {
      utilities.add(`contrast-${key}`)
    }
  }

  // Grayscale utilities
  const grayscale = theme.grayscale as Record<string, unknown> | undefined
  if (grayscale) {
    const flatGrayscale = flattenThemeObject(grayscale)
    for (const [key] of flatGrayscale) {
      utilities.add(`grayscale-${key}`)
    }
  }

  // Hue rotate utilities
  const hueRotate = theme.hueRotate as Record<string, unknown> | undefined
  if (hueRotate) {
    const flatHueRotate = flattenThemeObject(hueRotate)
    for (const [key] of flatHueRotate) {
      utilities.add(`hue-rotate-${key}`)
      utilities.add(`-hue-rotate-${key}`)
    }
  }

  // Invert utilities
  const invert = theme.invert as Record<string, unknown> | undefined
  if (invert) {
    const flatInvert = flattenThemeObject(invert)
    for (const [key] of flatInvert) {
      utilities.add(`invert-${key}`)
    }
  }

  // Saturate utilities
  const saturate = theme.saturate as Record<string, unknown> | undefined
  if (saturate) {
    const flatSaturate = flattenThemeObject(saturate)
    for (const [key] of flatSaturate) {
      utilities.add(`saturate-${key}`)
    }
  }

  // Sepia utilities
  const sepia = theme.sepia as Record<string, unknown> | undefined
  if (sepia) {
    const flatSepia = flattenThemeObject(sepia)
    for (const [key] of flatSepia) {
      utilities.add(`sepia-${key}`)
    }
  }

  // Drop shadow utilities
  const dropShadow = theme.dropShadow as Record<string, unknown> | undefined
  if (dropShadow) {
    const flatDropShadow = flattenThemeObject(dropShadow)
    for (const [key] of flatDropShadow) {
      utilities.add(`drop-shadow-${key}`)
    }
  }

  return utilities
}

/**
 * Generates backdrop filter utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated backdrop filter utility classes
 */
function generateBackdropFilterUtilities(
  theme: Record<string, unknown>,
): Set<string> {
  const utilities = new Set<string>()

  // Static backdrop filter utilities
  utilities.add('backdrop-filter')
  utilities.add('backdrop-filter-none')

  // Backdrop blur utilities
  const blur = theme.blur as Record<string, unknown> | undefined
  if (blur) {
    const flatBlur = flattenThemeObject(blur)
    for (const [key] of flatBlur) {
      utilities.add(`backdrop-blur-${key}`)
    }
  }

  // Backdrop brightness utilities
  const brightness = theme.brightness as Record<string, unknown> | undefined
  if (brightness) {
    const flatBrightness = flattenThemeObject(brightness)
    for (const [key] of flatBrightness) {
      utilities.add(`backdrop-brightness-${key}`)
    }
  }

  // Backdrop contrast utilities
  const contrast = theme.contrast as Record<string, unknown> | undefined
  if (contrast) {
    const flatContrast = flattenThemeObject(contrast)
    for (const [key] of flatContrast) {
      utilities.add(`backdrop-contrast-${key}`)
    }
  }

  // Backdrop grayscale utilities
  const grayscale = theme.grayscale as Record<string, unknown> | undefined
  if (grayscale) {
    const flatGrayscale = flattenThemeObject(grayscale)
    for (const [key] of flatGrayscale) {
      utilities.add(`backdrop-grayscale-${key}`)
    }
  }

  // Backdrop hue rotate utilities
  const hueRotate = theme.hueRotate as Record<string, unknown> | undefined
  if (hueRotate) {
    const flatHueRotate = flattenThemeObject(hueRotate)
    for (const [key] of flatHueRotate) {
      utilities.add(`backdrop-hue-rotate-${key}`)
      utilities.add(`-backdrop-hue-rotate-${key}`)
    }
  }

  // Backdrop invert utilities
  const invert = theme.invert as Record<string, unknown> | undefined
  if (invert) {
    const flatInvert = flattenThemeObject(invert)
    for (const [key] of flatInvert) {
      utilities.add(`backdrop-invert-${key}`)
    }
  }

  // Backdrop saturate utilities
  const saturate = theme.saturate as Record<string, unknown> | undefined
  if (saturate) {
    const flatSaturate = flattenThemeObject(saturate)
    for (const [key] of flatSaturate) {
      utilities.add(`backdrop-saturate-${key}`)
    }
  }

  // Backdrop sepia utilities
  const sepia = theme.sepia as Record<string, unknown> | undefined
  if (sepia) {
    const flatSepia = flattenThemeObject(sepia)
    for (const [key] of flatSepia) {
      utilities.add(`backdrop-sepia-${key}`)
    }
  }

  // Backdrop opacity utilities
  const opacity = theme.opacity as Record<string, unknown> | undefined
  if (opacity) {
    const flatOpacity = flattenThemeObject(opacity)
    for (const [key] of flatOpacity) {
      utilities.add(`backdrop-opacity-${key}`)
    }
  }

  return utilities
}

/**
 * Generates transition utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated transition utility classes
 */
function generateTransitionUtilities(
  theme: Record<string, unknown>,
): Set<string> {
  const utilities = new Set<string>()

  // Static transition utilities
  utilities.add('transition')
  utilities.add('transition-none')
  utilities.add('transition-all')
  utilities.add('transition-colors')
  utilities.add('transition-opacity')
  utilities.add('transition-shadow')
  utilities.add('transition-transform')

  // Transition property utilities
  const transitionProperty = theme.transitionProperty as
    | Record<string, unknown>
    | undefined
  if (transitionProperty) {
    const flatTransitionProperty = flattenThemeObject(transitionProperty)
    for (const [key] of flatTransitionProperty) {
      // Skip default static ones already added
      if (
        key !== 'none' &&
        key !== 'all' &&
        key !== 'colors' &&
        key !== 'opacity' &&
        key !== 'shadow' &&
        key !== 'transform'
      ) {
        utilities.add(`transition-${key}`)
      }
    }
  }

  // Duration utilities
  const transitionDuration = theme.transitionDuration as
    | Record<string, unknown>
    | undefined
  if (transitionDuration) {
    const flatDuration = flattenThemeObject(transitionDuration)
    for (const [key] of flatDuration) {
      utilities.add(`duration-${key}`)
    }
  }

  // Delay utilities
  const transitionDelay = theme.transitionDelay as
    | Record<string, unknown>
    | undefined
  if (transitionDelay) {
    const flatDelay = flattenThemeObject(transitionDelay)
    for (const [key] of flatDelay) {
      utilities.add(`delay-${key}`)
    }
  }

  // Timing function (ease) utilities
  const transitionTimingFunction = theme.transitionTimingFunction as
    | Record<string, unknown>
    | undefined
  if (transitionTimingFunction) {
    const flatTimingFunction = flattenThemeObject(transitionTimingFunction)
    for (const [key] of flatTimingFunction) {
      utilities.add(`ease-${key}`)
    }
  }

  return utilities
}

/**
 * Generates animation utility classes from theme configuration
 * @param theme - Resolved theme configuration
 * @returns Set of generated animation utility classes
 */
function generateAnimationUtilities(
  theme: Record<string, unknown>,
): Set<string> {
  const utilities = new Set<string>()

  // Static animation utilities (Tailwind defaults)
  utilities.add('animate-none')
  utilities.add('animate-spin')
  utilities.add('animate-ping')
  utilities.add('animate-pulse')
  utilities.add('animate-bounce')

  // Animation utilities from theme
  const animation = theme.animation as Record<string, unknown> | undefined
  if (animation) {
    const flatAnimation = flattenThemeObject(animation)
    for (const [key] of flatAnimation) {
      // Skip defaults already added
      if (
        key !== 'none' &&
        key !== 'spin' &&
        key !== 'ping' &&
        key !== 'pulse' &&
        key !== 'bounce'
      ) {
        utilities.add(`animate-${key}`)
      }
    }
  }

  return utilities
}

/**
 * Generates all utility classes from resolved Tailwind configuration
 * @param resolvedConfig - Resolved Tailwind configuration
 * @returns Set of all generated utility classes
 */
export function generateUtilityClasses(
  resolvedConfig: ResolvedTailwindConfig,
): Set<string> {
  const allUtilities = new Set<string>()

  // Get theme from resolved config
  const theme = resolvedConfig.theme as Record<string, unknown>

  // Generate utilities from different theme sections
  const colorUtilities = generateColorUtilities(
    theme.colors as Record<string, unknown> | undefined,
  )
  const spacingUtilities = generateSpacingUtilities(
    theme.spacing as Record<string, unknown> | undefined,
  )
  const sizingUtilities = generateSizingUtilities(theme)
  const typographyUtilities = generateTypographyUtilities(theme)
  const staticUtilities = generateStaticUtilities()
  const gridUtilities = generateGridUtilities(theme)
  const borderUtilities = generateBorderUtilities(theme)
  const effectUtilities = generateEffectUtilities(theme)
  const transformUtilities = generateTransformUtilities(theme)
  const filterUtilities = generateFilterUtilities(theme)
  const backdropFilterUtilities = generateBackdropFilterUtilities(theme)
  const transitionUtilities = generateTransitionUtilities(theme)
  const animationUtilities = generateAnimationUtilities(theme)

  // Combine all utilities
  for (const utility of colorUtilities) allUtilities.add(utility)
  for (const utility of spacingUtilities) allUtilities.add(utility)
  for (const utility of sizingUtilities) allUtilities.add(utility)
  for (const utility of typographyUtilities) allUtilities.add(utility)
  for (const utility of staticUtilities) allUtilities.add(utility)
  for (const utility of gridUtilities) allUtilities.add(utility)
  for (const utility of borderUtilities) allUtilities.add(utility)
  for (const utility of effectUtilities) allUtilities.add(utility)
  for (const utility of transformUtilities) allUtilities.add(utility)
  for (const utility of filterUtilities) allUtilities.add(utility)
  for (const utility of backdropFilterUtilities) allUtilities.add(utility)
  for (const utility of transitionUtilities) allUtilities.add(utility)
  for (const utility of animationUtilities) allUtilities.add(utility)

  return allUtilities
}

/**
 * Gets Tailwind classes from configuration
 * Main entry point for Tailwind class extraction
 *
 * Note: This function generates static utility classes based on the theme configuration.
 * It does NOT generate arbitrary value utilities (e.g., w-[100px], bg-[#ff0000], p-[2.5rem])
 * or JIT (Just-In-Time) dynamic utilities. These arbitrary values are validated at runtime
 * by Tailwind's JIT compiler and should be handled separately if needed.
 *
 * @param tailwindConfig - Tailwind configuration from rule options
 * @param cwd - Current working directory
 * @returns Promise resolving to Set of valid Tailwind class names
 */
export async function getTailwindClasses(
  tailwindConfig: boolean | TailwindConfig,
  cwd: string,
): Promise<Set<string>> {
  // If Tailwind is disabled, return empty set
  if (!tailwindConfig) {
    return new Set()
  }

  // Determine config path
  const configPath =
    typeof tailwindConfig === 'object' ? tailwindConfig.config : undefined

  // Find the config file
  const resolvedConfigPath = findTailwindConfigPath(configPath, cwd)

  if (!resolvedConfigPath) {
    console.warn(
      'Warning: Tailwind config file not found, skipping Tailwind validation',
    )
    return new Set()
  }

  // Load and resolve the config
  const resolved = await loadTailwindConfig(resolvedConfigPath)

  if (!resolved) {
    return new Set()
  }

  // Extract classes from safelist
  const safelistClasses = extractSafelistClasses(resolved.safelist || [])

  // Generate utility classes from theme configuration
  const utilityClasses = generateUtilityClasses(resolved)

  // Combine safelist and generated utilities
  const allClasses = new Set<string>([...safelistClasses, ...utilityClasses])

  return allClasses
}
