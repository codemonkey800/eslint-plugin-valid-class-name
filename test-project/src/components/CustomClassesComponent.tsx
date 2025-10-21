/**
 * Component that tests custom classes from:
 * - @layer utilities (utilities.css)
 * - @layer components (app.css)
 * - Tailwind plugins (tailwind.config.cjs)
 */
export function CustomClassesComponent() {
  return (
    <div className="container">
      {/* Card component from @layer components */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-shadow-lg">Custom Classes Demo</h2>
        </div>

        {/* Button components from @layer components */}
        <div className="flex gap-4 mb-4">
          <button className="btn btn-primary text-shadow-sm">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
        </div>

        {/* Badge components from @layer components */}
        <div className="flex gap-2 mb-4">
          <span className="badge badge-success">Success</span>
          <span className="badge badge-error">Error</span>
        </div>

        {/* 3D transform utilities from plugin */}
        <div className="perspective-1000 mb-4">
          <div className="preserve-3d rotate-y-180 backface-hidden">
            <p className="text-shadow-md">Flipped 3D Content</p>
          </div>
        </div>

        {/* Custom scrollbar utility from @layer utilities */}
        <div className="scrollbar-hide overflow-auto max-h-32 mb-4">
          <p>
            This content has a hidden scrollbar. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
          </p>
        </div>

        {/* Safe area inset utilities from @layer utilities */}
        <div className="pt-safe pb-safe">
          <p>Content with safe area insets for mobile devices</p>
        </div>

        {/* Aspect ratio utility from @layer utilities */}
        <div className="aspect-golden bg-gray-200">
          <p className="flex items-center justify-center h-full">Golden Ratio</p>
        </div>

        <div className="card-footer">
          <p className="text-sm">All custom classes should be recognized as valid</p>
        </div>
      </div>
    </div>
  )
}
