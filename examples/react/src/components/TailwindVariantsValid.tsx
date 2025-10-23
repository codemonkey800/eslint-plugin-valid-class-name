import React from 'react'

/**
 * TailwindVariantsValid - Tests all Tailwind variant combinations
 *
 * This component tests:
 * - Interactive pseudo-classes (hover, focus, active, visited)
 * - Input pseudo-classes (disabled, checked, invalid, etc.)
 * - Child selectors (first, last, odd, even, etc.)
 * - Responsive breakpoints (sm, md, lg, xl, 2xl)
 * - Dark mode variants
 * - Group variants
 * - Peer variants
 * - Multiple variant combinations
 * - Pseudo-elements (before, after)
 */
export const TailwindVariantsValid: React.FC = () => {
  return (
    <div className="container">
      {/* Interactive Pseudo-classes */}
      <section className="mb-4">
        <h2>Interactive Pseudo-classes</h2>
        <button className="hover:bg-blue-500 hover:text-white hover:scale-105">
          Hover effects
        </button>
        <input className="focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <button className="active:scale-95 active:bg-blue-700">
          Active effects
        </button>
        <a className="visited:text-purple-600">Visited link</a>
        <button className="focus-within:ring-2 focus-visible:outline-2">
          Focus variants
        </button>
        <div className="target:bg-yellow-200">Target element</div>
      </section>

      {/* Input Pseudo-classes */}
      <section className="mb-4">
        <h2>Input Pseudo-classes</h2>
        <input className="disabled:opacity-50 disabled:cursor-not-allowed" />
        <input className="enabled:border-green-500" />
        <input
          type="checkbox"
          className="checked:bg-blue-600 checked:border-transparent"
        />
        <input className="indeterminate:bg-gray-400" />
        <input className="required:border-red-500 invalid:border-red-500" />
        <input className="valid:border-green-500 in-range:border-blue-500" />
        <input className="out-of-range:border-red-500" />
        <input className="placeholder-shown:border-gray-300" />
        <input className="autofill:bg-yellow-50 read-only:bg-gray-100" />
        <input className="default:ring-2" />
      </section>

      {/* Child Selectors */}
      <section className="mb-4">
        <h2>Child Selectors</h2>
        <ul>
          <li className="first:mt-0 first:font-bold">First item</li>
          <li className="last:mb-0 last:border-b-0">Middle item</li>
          <li className="last:mb-0 last:border-b-0">Last item</li>
          <li className="only:mx-auto">Only item</li>
        </ul>
        <div>
          <p className="odd:bg-gray-100 even:bg-white">Item 1</p>
          <p className="odd:bg-gray-100 even:bg-white">Item 2</p>
          <p className="odd:bg-gray-100 even:bg-white">Item 3</p>
        </div>
        <div>
          <span className="first-of-type:font-bold">First span</span>
          <span className="last-of-type:font-light">Last span</span>
          <span className="only-of-type:font-semibold">Only span</span>
        </div>
      </section>

      {/* Other Pseudo-classes */}
      <section className="mb-4">
        <h2>Other Pseudo-classes</h2>
        <div className="empty:hidden">
          <p>Content</p>
        </div>
        <details className="open:bg-gray-50">
          <summary>Click to open</summary>
          <p>Content</p>
        </details>
      </section>

      {/* Pseudo-elements */}
      <section className="mb-4">
        <h2>Pseudo-elements</h2>
        <p className="before:content-['→'] before:mr-2">Before content</p>
        <p className="after:content-['←'] after:ml-2">After content</p>
        <p className="first-letter:text-2xl first-letter:font-bold">
          First letter styled
        </p>
        <p className="first-line:tracking-wide">
          First line styled with some longer text to demonstrate
        </p>
        <ul className="marker:text-blue-500">
          <li>Styled markers</li>
          <li>For list items</li>
        </ul>
        <p className="selection:bg-blue-200 selection:text-blue-900">
          Selection styled
        </p>
        <input
          type="file"
          className="file:mr-4 file:py-2 file:px-4 file:border-0"
        />
        <div className="backdrop:bg-black backdrop:opacity-50">Modal</div>
        <input className="placeholder:text-gray-400" />
      </section>

      {/* Responsive Breakpoints */}
      <section className="mb-4">
        <h2>Responsive Breakpoints</h2>
        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
          Responsive text sizing
        </div>
        <div className="block sm:flex md:grid lg:inline-flex xl:inline-block">
          Responsive layout
        </div>
        <div className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          Responsive grid
        </div>
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
          Responsive spacing
        </div>
      </section>

      {/* Dark Mode */}
      <section className="mb-4">
        <h2>Dark Mode</h2>
        <div className="bg-white text-black dark:bg-gray-800 dark:text-white">
          Dark mode aware
        </div>
        <button className="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800">
          Dark mode button
        </button>
        <div className="border-gray-200 dark:border-gray-700">
          Dark mode borders
        </div>
      </section>

      {/* Print */}
      <section className="mb-4 print:hidden">
        <h2 className="print:text-black print:text-lg">Print Variants</h2>
        <p className="text-blue-500 print:text-black">Colored on screen</p>
      </section>

      {/* Motion Preferences */}
      <section className="mb-4">
        <h2>Motion Preferences</h2>
        <div className="motion-safe:animate-spin motion-reduce:animate-none">
          Respects motion preferences
        </div>
        <div className="transition-all motion-reduce:transition-none">
          Conditional transitions
        </div>
      </section>

      {/* Contrast Preferences */}
      <section className="mb-4">
        <h2>Contrast Preferences</h2>
        <div className="text-gray-600 contrast-more:text-black contrast-less:text-gray-400">
          Contrast aware text
        </div>
      </section>

      {/* Direction */}
      <section className="mb-4">
        <h2>Direction</h2>
        <div className="ltr:ml-2 rtl:mr-2">Directional spacing</div>
        <div className="ltr:ml-4 rtl:mr-4">Directional spacing</div>
      </section>

      {/* Orientation */}
      <section className="mb-4">
        <h2>Orientation</h2>
        <div className="portrait:hidden landscape:block">
          Landscape only content
        </div>
        <div className="portrait:grid-cols-1 landscape:grid-cols-2">
          Orientation-aware grid
        </div>
      </section>

      {/* Group Variants */}
      <section className="mb-4">
        <h2>Group Variants</h2>
        <div className="group">
          <p>Hover over this group</p>
          <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
            Group hover reveal
          </div>
          <button className="bg-gray-200 group-focus:bg-blue-500">
            Group focus
          </button>
          <div className="group-active:scale-95">Group active</div>
        </div>
      </section>

      {/* Peer Variants */}
      <section className="mb-4">
        <h2>Peer Variants</h2>
        <input type="checkbox" className="peer" />
        <div className="peer-checked:bg-blue-500 peer-checked:text-white">
          Shown when checkbox is checked
        </div>
        <input type="text" className="peer" />
        <p className="peer-invalid:visible peer-valid:hidden peer-disabled:opacity-50">
          Peer state aware
        </p>
        <input className="peer" />
        <div className="peer-focus:ring-2">Peer focus indicator</div>
      </section>

      {/* Multiple Variants - 2 Variants */}
      <section className="mb-4">
        <h2>Multiple Variants (2 combined)</h2>
        <div className="hover:first:mt-2 hover:last:mb-2">
          Hover + child selector
        </div>
        <div className="md:hover:bg-blue-500 lg:focus:ring-2">
          Responsive + interaction
        </div>
        <div className="dark:md:text-white dark:lg:text-2xl">
          Dark mode + responsive
        </div>
        <div className="group-hover:first:opacity-100">
          Group hover + child selector
        </div>
        <div className="peer-checked:md:block">Peer + responsive</div>
      </section>

      {/* Multiple Variants - 3+ Variants */}
      <section className="mb-4">
        <h2>Multiple Variants (3+ combined)</h2>
        <div className="dark:md:hover:bg-blue-700">
          Dark mode + responsive + hover
        </div>
        <div className="group-hover:first:md:scale-110">
          Group hover + child + responsive
        </div>
        <div className="dark:lg:group-hover:opacity-75">
          Dark + responsive + group
        </div>
        <div className="peer-checked:dark:md:block">Peer + dark + responsive</div>
        <div className="hover:focus:active:scale-95">
          Hover + focus + active
        </div>
      </section>

      {/* Stacked Pseudo-classes */}
      <section className="mb-4">
        <h2>Stacked Pseudo-classes</h2>
        <ul>
          <li className="first:hover:font-bold">First + hover</li>
          <li className="odd:hover:bg-gray-200">Odd + hover</li>
          <li className="last:focus:outline-2">Last + focus</li>
        </ul>
      </section>
    </div>
  )
}
