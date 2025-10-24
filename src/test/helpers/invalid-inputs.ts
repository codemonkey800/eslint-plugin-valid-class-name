/**
 * Type-safe invalid input values for testing runtime behavior
 * Use these instead of `as any` to maintain type safety in tests
 */

export const INVALID_INPUTS = {
  null: null,
  undefined: undefined,
  number: 123,
  boolean: true,
  object: {},
  array: [],
  emptyString: '',
  whitespace: '   \t\n  ',
} as const

export type InvalidInput = (typeof INVALID_INPUTS)[keyof typeof INVALID_INPUTS]

/**
 * Get all invalid inputs as an array for parameterized tests
 */
export function getAllInvalidInputs(): InvalidInput[] {
  return Object.values(INVALID_INPUTS)
}
