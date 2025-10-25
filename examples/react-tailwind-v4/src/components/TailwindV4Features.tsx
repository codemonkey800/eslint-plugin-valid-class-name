import React from 'react'

/**
 * TailwindV4Features - Tests Tailwind CSS v4 specific features
 *
 * This component validates v4-specific functionality:
 * - Custom theme variables defined via @theme directive
 * - Custom utilities defined via @utility directive
 * - oklch() color function (v4's default color space)
 * - CSS-first configuration approach
 * - Backwards compatibility with v3 utilities
 *
 * All classes in this component should pass validation.
 */
export const TailwindV4Features: React.FC = () => {
  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-6">Tailwind CSS v4 Features Test</h1>

      {/* Custom Theme Colors from @theme directive */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Custom Theme Colors (@theme)
        </h2>
        <div className="space-y-2">
          <div className="text-brand-500 p-2">
            Brand 500 color (hex via @theme)
          </div>
          <div className="bg-brand-600 text-white p-2">
            Brand 600 background (hex via @theme)
          </div>
          <div className="text-custom-blue p-2">
            Custom blue (oklch via @theme)
          </div>
          <div className="bg-accent text-white p-2">
            Accent color (oklch via @theme)
          </div>
        </div>
      </section>

      {/* Custom Utilities from @utility directive */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Custom Utilities (@utility directive)
        </h2>
        <div className="space-y-2">
          <div className="v4-custom-utility p-2">
            Custom utility with brand color and bold
          </div>
          <div className="v4-text-shadow p-2">
            Text with custom shadow utility
          </div>
          <div className="v4-gradient-border p-4">Gradient border utility</div>
        </div>
      </section>

      {/* Custom Spacing from @theme */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Custom Spacing (@theme)</h2>
        <div className="mt-huge">Huge top margin (10rem from @theme)</div>
      </section>

      {/* Custom Typography from @theme */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Custom Typography (@theme)
        </h2>
        <div className="font-display text-lg">
          Display font family from @theme
        </div>
      </section>

      {/* Backwards Compatibility - v3 utilities should still work */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Backwards Compatibility (v3 utilities)
        </h2>
        <div className="flex items-center justify-between gap-4 p-4 bg-blue-500 text-white rounded">
          <span>Flex layout</span>
          <span className="hover:scale-110 transition-transform">Hover me</span>
        </div>
      </section>

      {/* oklch() Arbitrary Values */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">oklch() Arbitrary Values</h2>
        <div className="space-y-2">
          <div className="bg-[oklch(0.6_0.3_200)] text-white p-2">
            Arbitrary oklch background
          </div>
          <div className="text-[oklch(0.4_0.25_350)] p-2">
            Arbitrary oklch text color
          </div>
        </div>
      </section>

      {/* Mixed v3 and v4 Features */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mixed v3 and v4 Features</h2>
        <div className="flex flex-col gap-4">
          <button className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded transition-colors">
            v4 theme + v3 utilities
          </button>
          <div className="v4-custom-utility hover:scale-105 transition-transform p-4 border rounded">
            v4 utility + v3 hover effect
          </div>
        </div>
      </section>

      {/* Standard Tailwind Utilities (should work in both v3 and v4) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Standard Utilities</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded shadow-md">Grid item 1</div>
          <div className="bg-gray-200 p-4 rounded shadow-lg">Grid item 2</div>
        </div>
      </section>

      {/* Complex Combinations */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Complex Combinations</h2>
        <div className="v4-custom-utility bg-accent text-white p-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
          Combined: v4 utilities + custom theme + standard utilities + variants
        </div>
      </section>

      {/* CSS Layer Utilities from utilities.css */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          CSS @layer Utilities (from utilities.css)
        </h2>
        <div className="space-y-2">
          <div className="text-shadow-sm p-2">Text shadow small</div>
          <div className="text-shadow-md p-2">Text shadow medium</div>
          <div className="scrollbar-hide overflow-auto max-h-20 border p-2">
            <div>Scrollbar hidden content</div>
            <div>More content</div>
            <div>Even more content</div>
          </div>
          <div className="aspect-golden bg-gray-200">Golden ratio aspect</div>
        </div>
      </section>
    </div>
  )
}
