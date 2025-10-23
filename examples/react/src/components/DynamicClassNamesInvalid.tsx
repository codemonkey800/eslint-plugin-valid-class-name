import React from 'react'

/**
 * DynamicClassNamesInvalid - Demonstrates INVALID dynamic class name patterns
 *
 * ⚠️ WARNING: This file contains intentional errors for testing purposes!
 * ⚠️ ESLint should report errors for all invalid class names below.
 *
 * This component showcases class names that will FAIL validation because they:
 * - Are not defined in any CSS/SCSS files
 * - Are not valid Tailwind utilities
 * - Don't match whitelist patterns
 * - Don't match ignore patterns
 *
 * The plugin will detect invalid class names in:
 * - Ternary operators (ConditionalExpression)
 * - Logical expressions (&&, ||)
 * - Function calls (cns, clsx, classnames)
 * - Template literals (without interpolation)
 */

// Mock classname utility functions (these would normally come from libraries)
const cns = (...args: unknown[]) => args.filter(Boolean).join(' ')
const clsx = (...args: unknown[]) => args.filter(Boolean).join(' ')
const classnames = (...args: unknown[]) => args.filter(Boolean).join(' ')

interface Props {
  isActive?: boolean
  isDisabled?: boolean
  variant?: 'primary' | 'secondary'
}

export const DynamicClassNamesInvalid: React.FC<Props> = ({
  isActive = false,
  isDisabled = false,
  variant = 'primary',
}) => {
  return (
    <div className="container">
      <header className="header">
        <h1>Dynamic Class Names - Invalid Examples (Will Show Errors)</h1>
      </header>

      <main className="main-content">
        {/* ===== Ternary Operator - Invalid Classes ===== */}
        <section className="card">
          <h2>Ternary Operator - Invalid Examples</h2>

          {/* Invalid class in consequent branch */}
          {/* ERROR: 'invalid-bg-color' is not defined */}
          <div className={isActive ? 'invalid-bg-color' : 'bg-gray-300'}>
            Invalid class in first branch
          </div>

          {/* Invalid class in alternate branch */}
          {/* ERROR: 'nonexistent-class' is not defined */}
          <div className={isDisabled ? 'opacity-50' : 'nonexistent-class'}>
            Invalid class in second branch
          </div>

          {/* Both branches invalid */}
          {/* ERROR: 'invalid-1' and 'invalid-2' are not defined */}
          <div className={isActive ? 'invalid-1' : 'invalid-2'}>
            Both branches have invalid classes
          </div>

          {/* Nested ternary with invalid inner class */}
          {/* ERROR: 'wrong-padding' is not defined */}
          <div
            className={
              variant === 'primary'
                ? isActive
                  ? 'wrong-padding'
                  : 'p-4'
                : 'p-6'
            }
          >
            Nested ternary with invalid class
          </div>

          {/* Multiple classes with one invalid */}
          {/* ERROR: 'fake-utility' is not defined */}
          <div className={isActive ? 'flex items-center fake-utility' : 'block'}>
            Multiple classes where one is invalid
          </div>
        </section>

        {/* ===== Logical Expressions - Invalid Classes ===== */}
        <section className="card">
          <h2>Logical Expression - Invalid Examples</h2>

          {/* Invalid class with AND */}
          {/* ERROR: 'invalid-opacity' is not defined */}
          <div className={isDisabled ? 'invalid-opacity' : undefined}>
            Invalid class with logical AND
          </div>

          {/* Invalid class with OR */}
          {/* ERROR: 'fallback-invalid' is not defined */}
          <div className={!isActive ? 'fallback-invalid' : undefined}>
            Invalid fallback class with OR
          </div>

          {/* Multiple conditions with invalid class */}
          {/* ERROR: 'nonexistent-bg' is not defined */}
          <div className={isActive && !isDisabled ? 'nonexistent-bg' : undefined}>
            Invalid class in complex condition
          </div>
        </section>

        {/* ===== Function Calls - Invalid Classes ===== */}
        <section className="card">
          <h2>Function Call - Invalid Examples</h2>

          {/* cns() with invalid class */}
          {/* ERROR: 'invalid-class' is not defined */}
          <div className={cns('flex', 'invalid-class')}>
            cns() with one invalid class
          </div>

          {/* clsx() with invalid in logical expression */}
          {/* ERROR: 'wrong-bg' is not defined */}
          <div className={clsx('p-4', isActive && 'wrong-bg')}>
            clsx() with invalid conditional class
          </div>

          {/* classnames() with invalid in ternary */}
          {/* ERROR: 'fake-color' is not defined */}
          <div
            className={classnames(
              'mt-2',
              isActive ? 'fake-color' : 'bg-gray-300',
            )}
          >
            classnames() with invalid in ternary
          </div>

          {/* Multiple invalid classes */}
          {/* ERROR: 'invalid-1', 'invalid-2', and 'invalid-3' are not defined */}
          <div
            className={cns('invalid-1', 'flex', 'invalid-2', 'invalid-3')}
          >
            Multiple invalid classes
          </div>

          {/* Invalid classes in string */}
          {/* ERROR: 'fake-flex' and 'wrong-items' are not defined */}
          <div className={cns('fake-flex wrong-items')}>
            Multiple invalid classes in single string
          </div>

          {/* Complex combination with invalid */}
          {/* ERROR: 'button-wrong' and 'invalid-ring' are not defined */}
          <div
            className={classnames(
              'button-wrong',
              isActive ? 'p-2' : 'p-4',
              isDisabled && 'opacity-50',
              'invalid-ring',
            )}
          >
            Complex combination with invalid classes
          </div>
        </section>

        {/* ===== Template Literals - Invalid Classes ===== */}
        <section className="card">
          <h2>Template Literal - Invalid Examples</h2>

          {/* Template literal without interpolation but invalid class */}
          {/* ERROR: 'invalid-static' is not defined */}
          <div className={`invalid-static`}>
            Static template literal with invalid class
          </div>

          {/* Template literal in ternary with invalid */}
          {/* ERROR: 'wrong-bg-color' is not defined */}
          <div className={isActive ? `wrong-bg-color` : 'bg-gray-300'}>
            Template literal in ternary with invalid class
          </div>
        </section>

        {/* ===== Edge Cases - Invalid Classes ===== */}
        <section className="card">
          <h2>Edge Case - Invalid Examples</h2>

          {/* Typo in Tailwind utility */}
          {/* ERROR: 'bg-blu-500' is not defined (should be 'bg-blue-500') */}
          <div className={isActive ? 'bg-blu-500' : 'bg-gray-300'}>
            Typo in Tailwind class name
          </div>

          {/* Wrong Tailwind value */}
          {/* ERROR: 'opacity-150' is not defined (max is 100) */}
          <div className={isDisabled ? 'opacity-150' : undefined}>
            Invalid Tailwind value
          </div>

          {/* Non-existent variant */}
          {/* ERROR: 'hover:invalid-class' - 'invalid-class' is not defined */}
          <div className={isActive ? 'hover:invalid-class' : undefined}>
            Valid variant but invalid base class
          </div>

          {/* Almost matches whitelist pattern but doesn't */}
          {/* ERROR: 'custom' doesn't match 'custom-*' pattern */}
          <div className={isActive ? 'custom' : 'flex'}>
            Doesn't match whitelist pattern (needs hyphen)
          </div>

          {/* Mixed valid and invalid */}
          {/* ERROR: 'invalid-class' is not defined */}
          <div
            className={cns(
              'container', // valid
              isActive && 'invalid-class', // INVALID
              'flex', // valid
            )}
          >
            Mix with one invalid class
          </div>
        </section>
      </main>
    </div>
  )
}
