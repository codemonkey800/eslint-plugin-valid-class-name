/**
 * TypeScript type declarations for custom Jest matchers
 * This file is automatically included by TypeScript
 */

declare module '@jest/expect' {
  interface Matchers<R = void> {
    /**
     * Check if a class name is valid in the registry
     * @example
     * expect(registry).toBeValidClassName('btn')
     */
    toBeValidClassName(className: string): R

    /**
     * Check if registry contains all specified classes
     * @example
     * expect(registry).toHaveClasses('btn', 'card', 'header')
     */
    toHaveClasses(...classNames: string[]): R

    /**
     * Check if class is a Tailwind class
     * @example
     * expect(registry).toBeTailwindClass('flex')
     */
    toBeTailwindClass(className: string): R

    /**
     * Check if class is a CSS class (not Tailwind)
     * @example
     * expect(registry).toBeCssClass('btn')
     */
    toBeCssClass(className: string): R

    /**
     * Check if registry has exactly the specified number of classes
     * @example
     * expect(registry).toHaveClassCount(10)
     */
    toHaveClassCount(count: number): R
  }
}
