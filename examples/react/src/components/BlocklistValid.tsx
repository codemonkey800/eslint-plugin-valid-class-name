/**
 * Component that demonstrates valid class names that are NOT blocked by the blocklist.
 * This component should pass ESLint validation with 0 errors.
 *
 * The blocklist configuration forbids:
 * - legacy-* (any class starting with "legacy-")
 * - deprecated-* (any class starting with "deprecated-")
 * - old-* (any class starting with "old-")
 * - forbidden-class (exact match)
 *
 * All classes used here are valid and NOT blocked.
 */
export function BlocklistValid() {
  return (
    <div className="container">
      {/* Valid CSS classes from components.scss - NOT blocked */}
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Blocklist Valid Component</h1>
        <p className="mb-4">
          All classes in this component are valid and not blocked by the
          blocklist configuration.
        </p>

        {/* Valid SCSS classes - NOT blocked */}
        <div className="flex gap-4 mb-4">
          <button className="button-primary">Primary Button</button>
          <button className="button-secondary">Secondary Button</button>
        </div>

        {/* Valid Tailwind utilities - NOT blocked */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-500 text-white p-4 rounded">
            <p>Blue box with Tailwind utilities</p>
          </div>
          <div className="bg-green-500 text-white p-4 rounded">
            <p>Green box with Tailwind utilities</p>
          </div>
        </div>

        {/* Valid alert classes from SCSS - NOT blocked */}
        <div className="alert alert-info mb-4">
          <p>This is an info alert with valid classes</p>
        </div>
        <div className="alert alert-warning mb-4">
          <p>This is a warning alert with valid classes</p>
        </div>

        {/* Allowlist pattern - always valid regardless of blocklist */}
        <div className="custom-component custom-widget">
          <p className="custom-text">
            Classes starting with "custom-" are allowlisted and always valid
          </p>
        </div>

        {/* Modern replacement classes - these are preferred over legacy ones */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <span className="text-lg font-semibold">Modern Layout</span>
          <span className="text-sm text-gray-600">
            Use this instead of legacy classes
          </span>
        </div>
      </div>
    </div>
  )
}
