/**
 * Custom Jest matchers for class validation
 */

// eslint-disable-next-line n/no-unpublished-import
import { expect } from '@jest/globals'

import type { ClassRegistry } from '../../registry/class-registry'

/**
 * Custom matcher: Check if a class name is valid in the registry
 */
function toBeValidClassName(
  this: jest.MatcherContext,
  registry: ClassRegistry,
  className: string,
) {
  const pass = registry.isValid(className)

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toBeValidClassName')}\n\n` +
        `Expected class name "${className}" not to be valid in registry, but it was`
    : () =>
        `${this.utils.matcherHint('.toBeValidClassName')}\n\n` +
        `Expected class name "${className}" to be valid in registry, but it wasn't`

  return {
    pass,
    message,
  }
}

/**
 * Custom matcher: Check if registry contains all specified classes
 */
function toHaveClasses(
  this: jest.MatcherContext,
  registry: ClassRegistry,
  ...classNames: string[]
) {
  const missing = classNames.filter(cls => !registry.isValid(cls))
  const pass = missing.length === 0

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toHaveClasses')}\n\n` +
        `Expected registry not to have classes: ${classNames.join(', ')}\n` +
        `But all classes were found`
    : () =>
        `${this.utils.matcherHint('.toHaveClasses')}\n\n` +
        `Expected registry to have all classes: ${classNames.join(', ')}\n` +
        `Missing: ${missing.join(', ')}`

  return {
    pass,
    message,
  }
}

/**
 * Custom matcher: Check if class is a Tailwind class
 */
function toBeTailwindClass(
  this: jest.MatcherContext,
  registry: ClassRegistry,
  className: string,
) {
  const pass = registry.isTailwindClass(className)

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toBeTailwindClass')}\n\n` +
        `Expected class name "${className}" not to be a Tailwind class, but it was`
    : () =>
        `${this.utils.matcherHint('.toBeTailwindClass')}\n\n` +
        `Expected class name "${className}" to be a Tailwind class, but it wasn't`

  return {
    pass,
    message,
  }
}

/**
 * Custom matcher: Check if class is a CSS class (not Tailwind)
 */
function toBeCssClass(
  this: jest.MatcherContext,
  registry: ClassRegistry,
  className: string,
) {
  const pass = registry.isCssClass(className)

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toBeCssClass')}\n\n` +
        `Expected class name "${className}" not to be a CSS class, but it was`
    : () =>
        `${this.utils.matcherHint('.toBeCssClass')}\n\n` +
        `Expected class name "${className}" to be a CSS class, but it wasn't`

  return {
    pass,
    message,
  }
}

/**
 * Custom matcher: Check if registry has exactly the specified number of classes
 */
function toHaveClassCount(
  this: jest.MatcherContext,
  registry: ClassRegistry,
  expectedCount: number,
) {
  const actualCount = registry.getAllClasses().size
  const pass = actualCount === expectedCount

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toHaveClassCount')}\n\n` +
        `Expected registry not to have ${expectedCount} classes, but it did`
    : () =>
        `${this.utils.matcherHint('.toHaveClassCount')}\n\n` +
        `Expected registry to have ${expectedCount} classes\n` +
        `Actual: ${actualCount}`

  return {
    pass,
    message,
  }
}

/**
 * Register all custom matchers with Jest
 */
export function registerCustomMatchers(): void {
  expect.extend({
    toBeValidClassName,
    toHaveClasses,
    toBeTailwindClass,
    toBeCssClass,
    toHaveClassCount,
  })
}
