import React from 'react'

/**
 * DynamicClassNamesValid - Demonstrates valid dynamic class name patterns
 *
 * This component showcases various ways to use dynamic class names that will
 * pass validation with the eslint-plugin-valid-class-name plugin.
 *
 * All class names used are either:
 * - Defined in CSS files (container, header, main-content from app.css)
 * - Defined in SCSS files (button-primary, card from components.scss)
 * - Tailwind utilities (flex, items-center, bg-blue-500, etc.)
 * - Whitelist patterns (custom-*)
 *
 * The plugin will extract and validate class names from:
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
  size?: 'small' | 'large'
}

export const DynamicClassNamesValid: React.FC<Props> = ({
  isActive = false,
  isDisabled = false,
  variant = 'primary',
  size = 'small',
}) => {
  const customClass = 'custom-override'

  return (
    <div className="container">
      <header className="header">
        <h1>Dynamic Class Names - Valid Examples</h1>
      </header>

      <main className="main-content">
        {/* ===== Ternary Operator (ConditionalExpression) ===== */}
        <section className="card">
          <h2>Ternary Operator Examples</h2>

          {/* Simple ternary with valid classes */}
          <div className={isActive ? 'bg-blue-500' : 'bg-gray-300'}>
            Simple ternary: Active changes background color
          </div>

          {/* Ternary with Tailwind utilities */}
          <div className={isDisabled ? 'opacity-50' : 'opacity-100'}>
            Disabled state with opacity
          </div>

          {/* Nested ternary */}
          <div
            className={
              variant === 'primary' ? (size === 'small' ? 'p-2' : 'p-4') : 'p-6'
            }
          >
            Nested ternary: Padding based on variant and size
          </div>

          {/* Ternary with multiple classes in string */}
          <div
            className={
              isActive ? 'flex items-center gap-2' : 'block text-center'
            }
          >
            Multiple classes per branch
          </div>
        </section>

        {/* ===== Logical Expressions ===== */}
        <section className="card">
          <h2>Logical Expression Examples</h2>

          {/* Logical AND - conditionally add class */}
          <div className={isDisabled ? 'opacity-50' : undefined}>
            Logical AND: Shows opacity-50 only when disabled
          </div>

          {/* Logical OR - fallback class */}
          <div className={customClass || 'flex'}>
            Logical OR: Uses custom class or falls back to flex
          </div>

          {/* Multiple AND operators */}
          <div className={isActive && !isDisabled ? 'bg-green-500' : undefined}>
            Multiple conditions with AND
          </div>

          {/* Combining with other classes */}
          <button className={isDisabled ? 'opacity-50' : undefined}>
            Button with conditional opacity
          </button>
        </section>

        {/* ===== Function Calls (cns, clsx, classnames) ===== */}
        <section className="card">
          <h2>Function Call Examples</h2>

          {/* cns() with static classes */}
          <div className={cns('flex', 'items-center', 'gap-4')}>
            cns() with multiple static classes
          </div>

          {/* cns() with logical expression */}
          <div className={cns('button-primary', isDisabled && 'opacity-50')}>
            cns() with conditional class
          </div>

          {/* clsx() with ternary */}
          <div
            className={clsx(
              'p-4',
              'rounded',
              isActive ? 'bg-blue-500' : 'bg-gray-300',
            )}
          >
            clsx() with ternary operator
          </div>

          {/* classnames() with multiple conditions */}
          <div
            className={classnames(
              'mt-2',
              isActive && 'bg-blue-500',
              isDisabled && 'opacity-50',
            )}
          >
            classnames() with multiple conditions
          </div>

          {/* Multiple classes in one string argument */}
          <div className={cns('flex items-center justify-between')}>
            Multiple classes in single string
          </div>

          {/* Nested function calls */}
          <div className={cns('card', clsx('p-4', isActive && 'bg-blue-500'))}>
            Nested function calls
          </div>

          {/* Complex combination */}
          <div
            className={classnames(
              'button-primary',
              size === 'small' ? 'p-2 text-sm' : 'p-4 text-base',
              isDisabled && 'opacity-50',
              isActive && 'ring-2',
            )}
          >
            Complex combination of patterns
          </div>
        </section>

        {/* ===== Template Literals ===== */}
        <section className="card">
          <h2>Template Literal Examples</h2>

          {/* Template literal without interpolation (static) */}
          <div className={`flex`}>Template literal without interpolation</div>

          {/* Template literal in ternary */}
          <div className={isActive ? `bg-blue-500` : 'bg-gray-300'}>
            Template literal in ternary
          </div>

          {/* Note: Template literals WITH interpolation are skipped */}
          {/* This is intentional - dynamic values can't be validated */}
          <div className={`flex-${variant}`}>
            Template with interpolation (validation skipped)
          </div>
        </section>

        {/* ===== Edge Cases ===== */}
        <section className="card">
          <h2>Edge Case Examples</h2>

          {/* Empty function call */}
          <div className={cns()}>Empty function call (no classes)</div>

          {/* Non-string values (null, undefined) - validation skipped */}
          <div className={isDisabled ? undefined : 'flex'}>
            Null values are skipped
          </div>

          {/* Variables - validation skipped for dynamic values */}
          <div className={isActive ? customClass : 'flex'}>
            Variable values are skipped, but "flex" is validated
          </div>

          {/* Mixed static and dynamic */}
          <div
            className={cns(
              'container', // validated
              isActive && 'bg-blue-500', // validated
              customClass, // skipped (variable)
            )}
          >
            Mix of static (validated) and dynamic (skipped)
          </div>

          {/* Whitelist patterns */}
          <div className={isActive ? 'custom-button' : 'custom-link'}>
            Whitelist patterns (custom-*) are always valid
          </div>

          {/* Ignore patterns */}
          <div className={isActive ? 'dynamic-loader' : undefined}>
            Ignore patterns (dynamic-*) skip validation
          </div>
        </section>
      </main>
    </div>
  )
}
