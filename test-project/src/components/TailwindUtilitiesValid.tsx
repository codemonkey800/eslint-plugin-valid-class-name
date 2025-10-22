import React from 'react'

/**
 * TailwindUtilitiesValid - Tests comprehensive Tailwind utility classes generated from theme
 *
 * This component tests utilities across all categories:
 * - Colors (bg, text, border, ring, fill, stroke)
 * - Spacing (margin, padding, gap, space, inset)
 * - Negative spacing (-m, -mt, -ml, etc.)
 * - Sizing (width, height, min/max variants)
 * - Typography (text size, font, leading, tracking)
 * - Layout (display, position, visibility, z-index)
 * - Flexbox and Grid utilities
 * - Borders (width, radius, style, divide, ring, outline)
 * - Effects (shadow, opacity, blend modes)
 * - Transitions and animations
 * - Custom theme extensions (brand colors)
 */
export const TailwindUtilitiesValid: React.FC = () => {
  return (
    <div className="container">
      {/* Color Utilities */}
      <section className="bg-blue-500 text-white border-green-400 ring-purple-300 mb-4">
        <h2 className="text-red-600 bg-gray-100 border-indigo-500">Color Utilities</h2>
        <div className="bg-slate-200 text-gray-900 border-zinc-300">
          <span className="text-emerald-500 bg-cyan-50">Various colors</span>
        </div>
        <svg className="fill-gray-200 stroke-indigo-500">
          <rect />
        </svg>
      </section>

      {/* Custom Theme Colors */}
      <section className="text-brand-500 bg-brand-600 mb-4">
        <h2>Custom Brand Colors from Extended Theme</h2>
      </section>

      {/* Spacing Utilities - Positive */}
      <section className="m-4 p-8 px-2 py-6 mb-4">
        <div className="mt-2 mr-4 mb-6 ml-8">Margin utilities</div>
        <div className="pt-1 pr-2 pb-3 pl-4">Padding utilities</div>
        <div className="mx-auto my-4 px-6 py-8">Combined spacing</div>
        <div className="flex gap-3 space-x-4">
          <span>Gap</span>
          <span>Space</span>
        </div>
        <div className="space-y-2">
          <p>Vertical spacing</p>
          <p>Between items</p>
        </div>
        <div className="inset-0 inset-x-4 inset-y-2">Inset utilities</div>
        <div className="top-0 right-4 bottom-8 left-12">Position utilities</div>
      </section>

      {/* Spacing Utilities - Negative */}
      <section className="-m-4 -mt-2 -ml-8 mb-4">
        <div className="-mx-2 -my-4">Negative margins</div>
        <div className="-top-4 -left-2 -inset-4">Negative positioning</div>
      </section>

      {/* Sizing Utilities */}
      <section className="w-64 h-32 min-w-0 max-h-screen mb-4">
        <div className="w-full h-full">Full size</div>
        <div className="w-1/2 h-1/3">Fractional sizes</div>
        <div className="w-auto h-auto">Auto sizes</div>
        <div className="min-h-0 max-w-full">Min/max constraints</div>
        <div className="w-screen h-screen">Screen dimensions</div>
      </section>

      {/* Typography Utilities */}
      <section className="text-sm font-bold leading-tight tracking-wide mb-4">
        <h2 className="text-lg font-semibold">Typography</h2>
        <p className="text-base font-normal leading-relaxed tracking-normal">
          Normal text
        </p>
        <p className="text-xl font-light leading-loose tracking-wider">
          Large light text
        </p>
        <p className="text-2xl font-extrabold leading-none tracking-tighter">
          Extra bold
        </p>
        <p className="font-thin font-extralight font-medium font-black">
          Font weights
        </p>
      </section>

      {/* Layout Utilities */}
      <section className="block mb-4">
        <div className="flex">Flex</div>
        <div className="grid">Grid</div>
        <div className="inline-block">Inline block</div>
        <div className="inline">Inline</div>
        <div className="hidden">Hidden</div>
        <div className="invisible">Invisible</div>
        <div className="visible">Visible</div>
        <div className="relative z-10">Relative with z-index</div>
        <div className="absolute z-50">Absolute</div>
        <div className="fixed z-0">Fixed</div>
        <div className="sticky">Sticky</div>
      </section>

      {/* Flexbox Utilities */}
      <section className="flex flex-row items-center justify-between mb-4">
        <div className="flex-col items-start justify-start">Column layout</div>
        <div className="flex-wrap items-end justify-end">Wrapped flex</div>
        <div className="flex-1 flex-auto flex-initial flex-none">Flex sizing</div>
        <div className="items-stretch justify-center">Stretch and center</div>
        <div className="content-center content-start content-end">Content alignment</div>
        <div className="self-auto self-start self-end self-center">Self alignment</div>
      </section>

      {/* Grid Utilities */}
      <section className="grid grid-cols-3 grid-rows-2 gap-4 mb-4">
        <div className="col-span-2 row-start-1">Grid item 1</div>
        <div className="col-start-1 col-end-3">Grid item 2</div>
        <div className="row-span-2">Grid item 3</div>
        <div className="col-auto row-auto">Auto placement</div>
      </section>

      {/* Border Utilities */}
      <section className="border border-2 border-t-4 rounded rounded-lg mb-4">
        <div className="border-solid border-dashed border-dotted">Border styles</div>
        <div className="rounded-none rounded-sm rounded-md rounded-full">
          Border radius
        </div>
        <div className="border-x-2 border-y-4">Directional borders</div>
        <div className="divide-x-2 divide-y">
          <span>Divide</span>
          <span>Utilities</span>
        </div>
        <div className="ring ring-2 ring-offset-2">Ring utilities</div>
        <div className="outline outline-1 outline-offset-2">Outline utilities</div>
      </section>

      {/* Effect Utilities */}
      <section className="shadow-md shadow-lg opacity-50 mb-4">
        <div className="shadow-sm shadow-xl shadow-2xl">Shadows</div>
        <div className="opacity-0 opacity-25 opacity-75 opacity-100">Opacity</div>
        <div className="mix-blend-multiply mix-blend-screen">Blend modes</div>
      </section>

      {/* Transition Utilities */}
      <section className="transition transition-all duration-300 ease-in-out mb-4">
        <div className="transition-colors duration-150 ease-in">Color transition</div>
        <div className="transition-opacity duration-500 ease-out">
          Opacity transition
        </div>
        <div className="delay-100 delay-300 delay-500">Transition delays</div>
      </section>

      {/* Transform Utilities */}
      <section className="transform scale-100 rotate-0 translate-x-0 mb-4">
        <div className="scale-50 scale-75 scale-90 scale-110 scale-125">Scale</div>
        <div className="rotate-45 rotate-90 rotate-180 -rotate-45">Rotate</div>
        <div className="translate-x-4 translate-y-2 -translate-x-2">Translate</div>
        <div className="skew-x-3 skew-y-6 -skew-x-12">Skew</div>
      </section>

      {/* Filter Utilities */}
      <section className="filter blur-sm brightness-50 mb-4">
        <div className="blur-none blur-md blur-lg">Blur</div>
        <div className="brightness-75 brightness-100 brightness-125">Brightness</div>
        <div className="contrast-50 contrast-100 contrast-200">Contrast</div>
        <div className="grayscale saturate-50 sepia hue-rotate-15">Other filters</div>
      </section>

      {/* Backdrop Filter Utilities */}
      <section className="backdrop-filter backdrop-blur-sm backdrop-brightness-100 mb-4">
        <div className="backdrop-blur-md backdrop-contrast-125">
          Backdrop filters
        </div>
      </section>

      {/* Background Utilities */}
      <section className="bg-cover bg-center bg-no-repeat mb-4">
        <div className="bg-contain bg-fixed bg-local">Background size</div>
        <div className="bg-repeat bg-repeat-x bg-repeat-y">Background repeat</div>
        <div className="bg-top bg-bottom bg-left bg-right">Background position</div>
      </section>

      {/* Interactivity Utilities */}
      <section className="cursor-pointer select-none resize overflow-auto mb-4">
        <div className="cursor-default cursor-not-allowed">Cursors</div>
        <div className="select-text select-all">Selection</div>
        <div className="resize-none resize-x resize-y">Resize</div>
        <div className="overflow-hidden overflow-visible overflow-scroll">
          Overflow
        </div>
        <div className="pointer-events-none pointer-events-auto">Pointer events</div>
        <div className="scroll-smooth snap-start snap-center">Scroll utilities</div>
      </section>

      {/* Accessibility */}
      <section className="sr-only">Screen reader only content</section>
    </div>
  )
}
