import React from 'react'

/**
 * ArrayObjectSyntaxInvalid - Demonstrates INVALID array and object class name patterns
 *
 * This component showcases various ways to use array and object syntax for class names
 * that will FAIL validation with the eslint-plugin-valid-class-name plugin.
 *
 * Each example uses class names that are NOT defined in:
 * - CSS files (app.css)
 * - SCSS files (components.scss)
 * - Tailwind configuration
 * - Whitelist patterns
 *
 * Running ESLint on this file should report errors for all invalid class names.
 *
 * EXPECTED ERRORS: Multiple "invalidClassName" errors throughout this file
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

export const ArrayObjectSyntaxInvalid: React.FC<Props> = ({
  isActive = false,
  isDisabled = false,
  variant = 'primary',
}) => {
  return (
    <div className="container">
      <header className="header">
        <h1>Array & Object Syntax - Invalid Examples</h1>
        <p>These examples should all trigger ESLint errors</p>
      </header>

      <main className="main-content">
        {/* ===== Arrays with Invalid Classes ===== */}
        <section className="card">
          <h2 className="card-header">Arrays with Invalid Classes</h2>

          {/* Array with single invalid class */}
          <div className={clsx(['nonexistent-class'])}>
            Single invalid class in array
          </div>

          {/* Array with multiple invalid classes */}
          <div
            className={clsx(['invalid-one', 'invalid-two', 'invalid-three'])}
          >
            Multiple invalid classes
          </div>

          {/* Array with mixed valid and invalid */}
          <div className={clsx(['container', 'this-class-does-not-exist'])}>
            Mixed: valid container, invalid second class
          </div>

          {/* Array with CSS-like but invalid class */}
          <div className={clsx(['btn-tertiary', 'card-sidebar'])}>
            CSS-like invalid classes
          </div>
        </section>

        {/* ===== Objects with Invalid Class Keys ===== */}
        <section className="card">
          <h2 className="card-header">Objects with Invalid Class Keys</h2>

          {/* Object with invalid literal key */}
          <div className={clsx({ 'undefined-class': true })}>
            Invalid literal key
          </div>

          {/* Object with invalid identifier key */}
          <div className={clsx({ undefinedClass: true })}>
            Invalid identifier key
          </div>

          {/* Object with multiple invalid keys */}
          <div
            className={clsx({
              'invalid-primary': variant === 'primary',
              'invalid-secondary': variant === 'secondary',
              'invalid-disabled': isDisabled,
            })}
          >
            Multiple invalid keys
          </div>

          {/* Object with mixed valid and invalid */}
          <div
            className={clsx({
              container: true,
              'this-does-not-exist': true,
            })}
          >
            Mixed: valid container, invalid second key
          </div>
        </section>

        {/* ===== Mixed Arrays & Objects with Invalid Classes ===== */}
        <section className="card">
          <h2 className="card-header">Mixed Patterns with Invalid Classes</h2>

          {/* Array with invalid object keys */}
          <div
            className={clsx([
              'container',
              {
                'nonexistent-active': isActive,
                'nonexistent-disabled': isDisabled,
              },
            ])}
          >
            Array with invalid object keys
          </div>

          {/* Multiple arguments with invalid classes */}
          <div
            className={cns('container', ['invalid-flex', 'invalid-items'], {
              'invalid-background': isActive,
            })}
          >
            Mixed arguments with invalid classes
          </div>

          {/* Complex pattern with nested invalid classes */}
          <div
            className={classnames(
              'invalid-base',
              ['header', { 'invalid-header-active': true }],
              { 'main-content': true, 'invalid-content-style': true },
            )}
          >
            Complex pattern with invalid classes
          </div>
        </section>

        {/* ===== Nested Arrays with Invalid Classes ===== */}
        <section className="card">
          <h2 className="card-header">Nested Arrays with Invalid Classes</h2>

          {/* Nested array with invalid class */}
          <div className={clsx(['container', ['header', 'invalid-nested']])}>
            Invalid class in nested array
          </div>

          {/* Deeply nested invalid classes */}
          <div
            className={clsx([
              'card',
              ['flex', ['invalid-alignment', 'invalid-spacing']],
            ])}
          >
            Multiple invalid classes in deep nesting
          </div>

          {/* Nested array with object containing invalid key */}
          <div
            className={clsx([
              'container',
              [
                'flex',
                {
                  'btn-primary': variant === 'primary',
                  'invalid-variant': variant === 'secondary',
                },
              ],
            ])}
          >
            Nested with invalid object key
          </div>
        </section>

        {/* ===== Conditionals with Invalid Classes ===== */}
        <section className="card">
          <h2 className="card-header">Conditionals with Invalid Classes</h2>

          {/* Array with conditional invalid class */}
          <div
            className={clsx(['container', isActive && 'invalid-active-state'])}
          >
            Conditional invalid class
          </div>

          {/* Array with ternary returning invalid classes */}
          <div
            className={clsx([
              'card',
              isActive ? 'invalid-when-active' : 'invalid-when-inactive',
            ])}
          >
            Ternary with both options invalid
          </div>

          {/* Multiple conditionals all invalid */}
          <div
            className={clsx([
              'flex',
              isActive && 'invalid-active',
              isDisabled && 'invalid-disabled',
            ])}
          >
            Multiple conditional invalid classes
          </div>
        </section>

        {/* ===== Tailwind-like Invalid Classes ===== */}
        <section className="card">
          <h2 className="card-header">Tailwind-like Invalid Classes</h2>

          {/* Invalid Tailwind-style utility names */}
          <div className={clsx(['invalid-flex', 'invalid-items-center'])}>
            Invalid Tailwind-style utilities
          </div>

          {/* Invalid responsive variants */}
          <div
            className={clsx(['flex', 'md:invalid-flex-row', 'lg:invalid-grid'])}
          >
            Invalid responsive variants
          </div>

          {/* Invalid state variants in object */}
          <div
            className={clsx({
              'hover:invalid-background': true,
              'focus:invalid-ring': true,
            })}
          >
            Invalid state variants
          </div>

          {/* Invalid color values */}
          <div
            className={clsx([
              'bg-purple-1000',
              'text-orange-750',
              { 'border-pink-999': true },
            ])}
          >
            Invalid Tailwind color values (out of range)
          </div>
        </section>

        {/* ===== Complex Invalid Patterns ===== */}
        <section className="card">
          <h2 className="card-header">Complex Invalid Patterns</h2>

          {/* Complex button with multiple invalid classes */}
          <button
            className={clsx([
              'btn',
              'invalid-btn-style',
              ['flex', 'invalid-alignment'],
              {
                'invalid-opacity': isDisabled,
                'invalid-error-state': true,
              },
            ])}
          >
            Complex Invalid Button
          </button>

          {/* Deeply nested with mixed valid/invalid */}
          <div
            className={clsx([
              'card',
              ['flex', ['items-start', 'invalid-flex-direction']],
              {
                'card-header': true,
                'invalid-active-card': isActive,
                'invalid-variant': variant === 'primary',
              },
            ])}
          >
            <div className={clsx(['header', { 'invalid-text-size': true }])}>
              Nested Title
            </div>
            <div className={cns(['main-content', { 'invalid-margin': true }])}>
              Nested Content
            </div>
          </div>
        </section>

        {/* ===== Typos and Common Mistakes ===== */}
        <section className="card">
          <h2 className="card-header">Typos and Common Mistakes</h2>

          {/* Common typos */}
          <div className={clsx(['contianer', 'headder'])}>
            Typos: contianer, headder
          </div>

          {/* Case sensitivity issues */}
          <div className={clsx(['Container', 'HEADER'])}>
            Wrong case: Container, HEADER
          </div>

          {/* Misspelled Tailwind utilities */}
          <div
            className={clsx({
              'flex-centre': true,
              'itms-center': true,
              'justfy-between': true,
            })}
          >
            Misspelled Tailwind utilities
          </div>

          {/* Incomplete class names */}
          <div className={clsx(['btn-', 'card-', '-primary'])}>
            Incomplete class names
          </div>
        </section>
      </main>
    </div>
  )
}
