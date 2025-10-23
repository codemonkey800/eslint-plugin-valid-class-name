import React from 'react'

/**
 * ArrayObjectSyntaxValid - Demonstrates valid array and object class name patterns
 *
 * This component showcases various ways to use array and object syntax for class names
 * within utility functions like clsx, classnames, and cns.
 *
 * IMPORTANT: Arrays and objects only work when passed to utility functions that return strings.
 * Direct usage like className={['foo']} or className={{ foo: true }} won't work in React.
 *
 * All class names used are either:
 * - Defined in CSS files (container, header, main-content from app.css)
 * - Defined in SCSS files (button-primary, card from components.scss)
 * - Tailwind utilities (flex, items-center, bg-blue-500, etc.)
 * - Whitelist patterns (custom-*)
 *
 * The plugin will extract and validate class names from:
 * - Array expressions within function calls
 * - Object expressions within function calls
 * - Nested arrays and objects
 * - Mixed array/object patterns
 */

// Mock classname utility functions (these would normally come from libraries)
const cns = (...args: unknown[]) => args.filter(Boolean).join(' ')
const clsx = (...args: unknown[]) => args.filter(Boolean).join(' ')
const classnames = (...args: unknown[]) => args.filter(Boolean).join(' ')

interface Props {
  isActive?: boolean
  isDisabled?: boolean
  variant?: 'primary' | 'secondary'
  hasError?: boolean
}

export const ArrayObjectSyntaxValid: React.FC<Props> = ({
  isActive = false,
  isDisabled = false,
  variant = 'primary',
  hasError = false,
}) => {
  return (
    <div className="container">
      <header className="header">
        <h1>Array & Object Syntax - Valid Examples</h1>
      </header>

      <main className="main-content">
        {/* ===== Simple Array Syntax ===== */}
        <section className="card">
          <h2 className="card-header">Simple Arrays</h2>
          <p>Arrays within function calls that return strings</p>

          {/* Basic array with string literals */}
          <div className={clsx(['flex', 'items-center'])}>
            Simple array with Tailwind classes
          </div>

          {/* Array with CSS classes */}
          <div className={classnames(['card', 'badge-success'])}>
            Array with CSS classes
          </div>

          {/* Array with mixed sources */}
          <div className={cns(['container', 'flex', 'btn-primary'])}>
            Array mixing CSS and Tailwind
          </div>
        </section>

        {/* ===== Simple Object Syntax ===== */}
        <section className="card">
          <h2 className="card-header">Simple Objects</h2>
          <p>Objects within function calls where keys are class names</p>

          {/* Object with literal string keys */}
          <div
            className={clsx({
              flex: true,
              'items-center': true,
              'justify-between': false,
            })}
          >
            Object with literal keys
          </div>

          {/* Object with identifier keys */}
          <div className={clsx({ container: true, header: false })}>
            Object with identifier keys
          </div>

          {/* Object with conditional boolean values */}
          <div
            className={clsx({
              'btn-primary': variant === 'primary',
              'btn-secondary': variant === 'secondary',
              'badge-error': hasError,
            })}
          >
            Object with conditional values
          </div>
        </section>

        {/* ===== Mixed Array & Object Syntax ===== */}
        <section className="card">
          <h2 className="card-header">Mixed Arrays & Objects</h2>
          <p>Combining arrays and objects in function calls</p>

          {/* Array containing both strings and objects */}
          <div
            className={clsx([
              'card',
              {
                'badge-success': isActive,
                'badge-error': hasError,
              },
            ])}
          >
            Array with embedded object
          </div>

          {/* Multiple arguments: strings, arrays, and objects */}
          <div
            className={cns('container', ['flex', 'items-center'], {
              'bg-blue-500': isActive,
              'opacity-50': isDisabled,
            })}
          >
            Mixed arguments pattern
          </div>

          {/* Complex mixed pattern */}
          <div
            className={classnames('card', ['header', { 'card-header': true }], {
              'main-content': !isActive,
            })}
          >
            Complex mixed pattern
          </div>
        </section>

        {/* ===== Nested Arrays ===== */}
        <section className="card">
          <h2 className="card-header">Nested Arrays</h2>
          <p>Arrays containing other arrays</p>

          {/* Simple nested array */}
          <div className={clsx(['flex', ['items-center', 'justify-center']])}>
            Simple nested array
          </div>

          {/* Deeply nested arrays */}
          <div
            className={clsx(['container', ['flex', ['items-center', 'gap-4']]])}
          >
            Deeply nested arrays
          </div>

          {/* Nested arrays with objects */}
          <div
            className={clsx([
              'card',
              [
                'flex',
                {
                  'btn-primary': variant === 'primary',
                  'btn-secondary': variant === 'secondary',
                },
              ],
            ])}
          >
            Nested arrays with objects
          </div>
        </section>

        {/* ===== Arrays with Conditionals ===== */}
        <section className="card">
          <h2 className="card-header">Arrays with Conditionals</h2>
          <p>Arrays containing conditional expressions</p>

          {/* Array with logical AND */}
          <div className={clsx(['container', isActive && 'badge-success'])}>
            Array with logical AND
          </div>

          {/* Array with ternary operator */}
          <div
            className={clsx([
              'card',
              isActive ? 'badge-success' : 'badge-error',
            ])}
          >
            Array with ternary
          </div>

          {/* Array with multiple conditionals */}
          <div
            className={clsx([
              'flex',
              'items-center',
              isActive && 'bg-blue-500',
              isDisabled && 'opacity-50',
              hasError && 'badge-error',
            ])}
          >
            Array with multiple conditionals
          </div>
        </section>

        {/* ===== Complex Nested Patterns ===== */}
        <section className="card">
          <h2 className="card-header">Complex Nested Patterns</h2>
          <p>Real-world complex patterns combining all features</p>

          {/* Complex button-like component */}
          <button
            className={clsx([
              'btn',
              variant === 'primary' ? 'btn-primary' : 'btn-secondary',
              ['flex', 'items-center', 'gap-2'],
              {
                'opacity-50': isDisabled,
                'badge-error': hasError,
              },
            ])}
          >
            Complex Button
          </button>

          {/* Complex card layout */}
          <div
            className={clsx([
              'card',
              ['flex', ['items-start', 'flex-col']],
              {
                'card-header': !isActive,
                'badge-success': isActive && !hasError,
                'badge-error': hasError,
              },
            ])}
          >
            <div className={clsx(['header', { 'text-lg': true }])}>
              Card Title
            </div>
            <div className={cns(['main-content', { 'mt-4': true }])}>
              Card Content
            </div>
          </div>
        </section>

        {/* ===== Edge Cases ===== */}
        <section className="card">
          <h2 className="card-header">Edge Cases</h2>
          <p>Edge cases that should work correctly</p>

          {/* Empty array */}
          <div className={clsx([])}>Empty array (no classes)</div>

          {/* Empty object */}
          <div className={clsx({})}>Empty object (no classes)</div>

          {/* Sparse array (with holes) */}
          {/* eslint-disable-next-line no-sparse-arrays */}
          <div className={clsx(['container', , 'header'])}>
            Sparse array with holes
          </div>

          {/* Object with identifier keys and boolean values */}
          <div className={clsx({ container: true, header: false })}>
            Object with identifier keys
          </div>

          {/* Single element array */}
          <div className={clsx(['container'])}>Single element array</div>

          {/* Single property object */}
          <div className={clsx({ container: true })}>
            Single property object
          </div>
        </section>

        {/* ===== Tailwind-specific Patterns ===== */}
        <section className="card">
          <h2 className="card-header">Tailwind-specific Patterns</h2>
          <p>Common Tailwind patterns using arrays and objects</p>

          {/* Responsive utilities in array */}
          <div
            className={clsx([
              'flex',
              'flex-col',
              'md:flex-row',
              'gap-4',
              'md:gap-8',
            ])}
          >
            Responsive layout
          </div>

          {/* State variants in object */}
          <div
            className={clsx({
              'hover:bg-blue-500': true,
              'focus:ring-2': true,
              'active:scale-95': true,
            })}
          >
            State variants
          </div>

          {/* Combined responsive and state in mixed pattern */}
          <div
            className={clsx([
              'px-4',
              'py-2',
              ['rounded-md', 'shadow-sm'],
              {
                'hover:shadow-lg': true,
                'md:px-6': true,
                'md:py-3': true,
              },
            ])}
          >
            Combined responsive and state
          </div>
        </section>
      </main>
    </div>
  )
}
