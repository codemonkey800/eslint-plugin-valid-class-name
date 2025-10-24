/**
 * Jest setup file
 * This file is automatically loaded before running tests
 */

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./matchers/matchers.d.ts" />

import { registerCustomMatchers } from './matchers/custom-matchers'

// Register custom matchers globally
registerCustomMatchers()
