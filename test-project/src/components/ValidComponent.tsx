import React from 'react'

/**
 * ValidComponent - All class names used here should pass validation
 *
 * This component uses:
 * - CSS classes from app.css: container, header, main-content
 * - SCSS classes from components.scss: button-primary, card, alert
 * - Tailwind utilities: flex, items-center, justify-between, gap-4, bg-blue-500, text-white, p-4, rounded
 * - Tailwind custom theme: text-brand-500
 * - Whitelist pattern: custom-widget (matches custom-*)
 * - Ignored pattern: dynamic-loader (matches dynamic-*, should not error even though it doesn't exist)
 */
export const ValidComponent: React.FC = () => {
  return (
    <div className="container mb-2">
      <header className="header flex items-center justify-between">
        <h1 className="text-brand-500">Valid Component</h1>
        <nav className="flex gap-4">
          <button className="button-primary">Primary</button>
        </nav>
      </header>

      <main className="main-content">
        <div className="card">
          <h2 className="text-white bg-blue-500 p-4 rounded">Card Title</h2>
          <div className="alert">This is an alert message</div>
        </div>

        {/* Whitelist pattern - should be valid */}
        <div className="custom-widget">Custom widget content</div>

        {/* Ignored pattern - should not error even though it doesn't exist */}
        <div className="dynamic-loader">Dynamic loader</div>
      </main>
    </div>
  )
}
