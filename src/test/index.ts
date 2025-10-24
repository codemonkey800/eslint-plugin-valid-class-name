/**
 * Test utilities - central export point
 * Import everything you need from this single file
 */

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./matchers/matchers.d.ts" />

// AST Builders
export { ast } from './builders/ast-nodes'

// Test Data Factories
export { testData } from './factories/test-data'

// Helpers
export {
  getAllInvalidInputs,
  INVALID_INPUTS,
  type InvalidInput,
} from './helpers/invalid-inputs'
export {
  measureAndExpect,
  measurePerformance,
  performanceThresholds,
} from './helpers/performance'
export { TempDir, useTempDir } from './helpers/temp-dir'

// Mocks
export { asTailwindUtils, MockTailwindUtils } from './mocks/tailwind'

// Matchers
export { registerCustomMatchers } from './matchers/custom-matchers'
