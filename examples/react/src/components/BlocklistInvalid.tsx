/**
 * Component that demonstrates BLOCKED class names that violate the blocklist.
 * This component should produce ESLint errors for each blocked class.
 *
 * Expected errors: ~10 errors
 *
 * The blocklist configuration forbids:
 * - legacy-* (any class starting with "legacy-")
 * - deprecated-* (any class starting with "deprecated-")
 * - old-* (any class starting with "old-")
 * - forbidden-class (exact match)
 *
 * Note: These classes exist in components.scss but are intentionally blocked
 * to demonstrate preventing use of deprecated/legacy patterns.
 */
export function BlocklistInvalid() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Blocklist Invalid Component</h1>

        {/* ERROR: Exact match - forbidden-class */}
        <p className="forbidden-class mb-4">
          This class is explicitly forbidden by exact match
        </p>

        {/* ERROR: Pattern match - legacy-* */}
        <button className="legacy-button">
          Legacy Button (blocked - matches legacy-*)
        </button>

        {/* ERROR: Pattern match - legacy-* */}
        <div className="legacy-card p-4">
          Legacy Card (blocked - matches legacy-*)
        </div>

        {/* ERROR: Pattern match - legacy-* */}
        <div className="legacy-layout">
          Legacy Layout (blocked - matches legacy-*)
        </div>

        {/* ERROR: Pattern match - deprecated-* */}
        <div className="deprecated-flex gap-4">
          Deprecated Flex (blocked - matches deprecated-*)
        </div>

        {/* ERROR: Pattern match - deprecated-* */}
        <div className="deprecated-grid">
          Deprecated Grid (blocked - matches deprecated-*)
        </div>

        {/* ERROR: Pattern match - old-* */}
        <div className="old-container">
          Old Container (blocked - matches old-*)
        </div>

        {/* ERROR: Pattern match - old-* */}
        <div className="old-wrapper">Old Wrapper (blocked - matches old-*)</div>

        {/* Valid class mixed in - should NOT error */}
        <p className="text-sm text-gray-600">
          This paragraph uses valid Tailwind classes
        </p>

        {/* ERROR: Multiple blocked classes in one className */}
        <div className="legacy-button old-container deprecated-flex">
          Multiple blocked classes (3 errors expected)
        </div>

        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mt-4">
          <p className="font-bold">Note:</p>
          <p>
            Even though these classes exist in components.scss, they are blocked
            by the blocklist configuration and should not be used. Use modern
            alternatives like Tailwind utilities or non-legacy CSS classes
            instead.
          </p>
        </div>
      </div>
    </div>
  )
}
