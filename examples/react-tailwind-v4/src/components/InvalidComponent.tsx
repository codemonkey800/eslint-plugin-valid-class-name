import React from 'react'

/**
 * InvalidComponent - This component uses invalid class names that should trigger ESLint errors
 *
 * Invalid classes used:
 * - does-not-exist: Not defined in any CSS/SCSS file, not a Tailwind utility
 * - missing-class: Not defined anywhere
 * - typo-flx: Likely a typo of "flex" Tailwind utility
 * - non-existent-button: Not defined in any stylesheet
 */
export const InvalidComponent: React.FC = () => {
  return (
    <div className="does-not-exist mb-2">
      <header className="missing-class">
        <h1 className="typo-flx">Invalid Component</h1>
        <button className="non-existent-button">Click Me</button>
      </header>
    </div>
  )
}
