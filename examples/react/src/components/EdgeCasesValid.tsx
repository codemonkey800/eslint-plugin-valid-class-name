import React from 'react'

/**
 * EdgeCasesValid - Tests edge cases that should still pass validation
 *
 * This component tests:
 * - Important modifier (!)
 * - Zero values
 * - Auto values
 * - Full/screen values
 * - Fractional values
 * - Special keywords
 * - Min/max constraints
 * - Negative values
 * - Arbitrary values with special cases
 */
export const EdgeCasesValid: React.FC = () => {
  return (
    <div className="container">
      {/* Important Modifier - Currently not supported */}
      <section className="mb-4">
        <h2>Important Modifier</h2>
        {/* Important modifier (!) is not currently validated by the plugin */}
        <div className="bg-blue-500 text-white">Standard classes</div>
        <div className="mt-4 p-8">Standard spacing</div>
        <div className="flex items-center">Standard layout</div>
      </section>

      {/* Zero Values */}
      <section className="mb-4">
        <h2>Zero Values</h2>
        <div className="m-0 p-0">Zero spacing</div>
        <div className="w-0 h-0">Zero dimensions</div>
        <div className="top-0 left-0 right-0 bottom-0">Zero positioning</div>
        <div className="inset-0">Zero inset</div>
        <div className="border-0 rounded-none">Zero border</div>
        <div className="opacity-0 z-0">Zero opacity and z-index</div>
        <div className="rotate-0 scale-0">Zero transforms</div>
        <div className="delay-0 duration-0">Zero timing</div>
      </section>

      {/* Auto Values */}
      <section className="mb-4">
        <div className="m-auto mt-auto mb-auto">Auto margins</div>
        <div className="mx-auto my-auto">Auto margin x/y</div>
        <div className="w-auto h-auto">Auto dimensions</div>
        <div className="col-auto row-auto">Auto grid</div>
        <div className="self-auto">Auto self alignment</div>
        <div className="overflow-auto">Auto overflow</div>
      </section>

      {/* Full Values */}
      <section className="mb-4">
        <h2>Full Values</h2>
        <div className="w-full h-full">Full dimensions</div>
        <div className="min-w-full max-w-full">Full min/max width</div>
        <div className="min-h-full max-h-full">Full min/max height</div>
        <div className="inset-full">Full inset</div>
      </section>

      {/* Screen Values */}
      <section className="mb-4">
        <h2>Screen Values</h2>
        <div className="w-screen h-screen">Screen dimensions</div>
        <div className="min-w-full max-w-full">
          Full min/max width (screen not available)
        </div>
        <div className="min-h-screen max-h-screen">Screen min/max height</div>
        <div className="max-w-screen-sm max-w-screen-md max-w-screen-lg max-w-screen-xl max-w-screen-2xl">
          Screen breakpoint widths
        </div>
      </section>

      {/* Fractional Values */}
      <section className="mb-4">
        <h2>Fractional Values</h2>
        <div className="w-1/2 w-1/3 w-2/3 w-1/4 w-3/4">Width fractions</div>
        <div className="w-1/5 w-2/5 w-3/5 w-4/5">Width fifths</div>
        <div className="w-1/6 w-5/6">Width sixths</div>
        <div className="w-1/12 w-5/12 w-7/12 w-11/12">Width twelfths</div>
        <div className="h-1/2 h-1/3 h-2/3 h-1/4 h-3/4">Height fractions</div>
        <div className="h-full">Full height</div>
      </section>

      {/* Special Keywords */}
      <section className="mb-4">
        <h2>Special Keywords</h2>
        <div className="bg-transparent text-transparent">Transparent</div>
        <div className="bg-current text-current border-current">
          Current color
        </div>
        <div className="bg-inherit text-inherit">Inherit</div>
        <div className="w-fit h-fit">Fit content</div>
        <div className="w-min h-min">Min content</div>
        <div className="w-max h-max">Max content</div>
      </section>

      {/* Negative Values */}
      <section className="mb-4">
        <h2>Negative Values</h2>
        <div className="-m-1 -m-2 -m-4 -m-8">Negative margins</div>
        <div className="-mt-1 -mr-2 -mb-4 -ml-8">Negative margin sides</div>
        <div className="-mx-4 -my-2">Negative margin x/y</div>
        <div className="-top-4 -left-2 -right-8 -bottom-1">
          Negative positioning
        </div>
        <div className="-inset-4 -inset-x-2 -inset-y-1">Negative insets</div>
        <div className="-translate-x-4 -translate-y-2">Negative translate</div>
        <div className="-rotate-45 -rotate-90 -rotate-180">Negative rotate</div>
        <div className="-skew-x-3 -skew-y-6">Negative skew</div>
        <div className="-space-x-4 -space-y-2">Negative space</div>
      </section>

      {/* Min/Max Constraints */}
      <section className="mb-4">
        <h2>Min/Max Constraints</h2>
        <div className="min-w-0 min-w-full min-w-min min-w-max min-w-fit">
          Min width variants
        </div>
        <div className="max-w-0 max-w-full max-w-min max-w-max max-w-fit">
          Max width variants
        </div>
        <div className="max-w-xs max-w-sm max-w-md max-w-lg max-w-xl max-w-2xl max-w-3xl max-w-4xl max-w-5xl max-w-6xl max-w-7xl">
          Max width sizes
        </div>
        <div className="min-h-0 min-h-full min-h-screen min-h-min min-h-max min-h-fit">
          Min height variants
        </div>
        <div className="max-h-0 max-h-full max-h-screen max-h-min max-h-max max-h-fit">
          Max height variants
        </div>
      </section>

      {/* Arbitrary Edge Cases */}
      <section className="mb-4">
        <h2>Arbitrary Edge Cases</h2>
        <div className="w-[0px] h-[0px]">Zero arbitrary</div>
        <div className="w-[1px] h-[1px]">One pixel arbitrary</div>
        <div className="w-[100%] h-[100%]">Percentage arbitrary</div>
        <div className="w-[100vw] h-[100vh]">Viewport arbitrary</div>
        <div className="bg-[transparent] text-[currentColor]">
          Keyword arbitrary
        </div>
        <div className="w-[calc(100%-2rem)] h-[calc(100vh-4rem)]">
          Calc arbitrary
        </div>
        <div className="w-[min(100%,500px)] h-[max(200px,50vh)]">
          Min/max functions
        </div>
        <div className="w-[clamp(200px,50%,600px)]">Clamp function</div>
      </section>

      {/* Container Queries */}
      <section className="mb-4">
        <h2>Container Utilities</h2>
        <div className="container">Container class (from CSS)</div>
        {/* @container not currently supported */}
      </section>

      {/* Aspect Ratio */}
      <section className="mb-4">
        <h2>Aspect Ratio</h2>
        <div className="aspect-auto aspect-square aspect-video">
          Standard aspects
        </div>
        <div className="aspect-[16/9] aspect-[4/3] aspect-[21/9]">
          Arbitrary aspects
        </div>
      </section>

      {/* Columns */}
      <section className="mb-4">
        <h2>Columns</h2>
        <div className="columns-1 columns-2 columns-3 columns-4">
          Column count
        </div>
        <div className="columns-auto columns-3xs columns-2xs columns-xs columns-sm columns-md columns-lg columns-xl columns-2xl columns-3xl columns-4xl columns-5xl columns-6xl columns-7xl">
          Column widths
        </div>
      </section>

      {/* Break */}
      <section className="mb-4">
        <h2>Break Utilities</h2>
        <div className="break-before-auto break-before-avoid break-before-all break-before-avoid-page break-before-page break-before-left break-before-right break-before-column">
          Break before
        </div>
        <div className="break-inside-auto break-inside-avoid break-inside-avoid-page break-inside-avoid-column">
          Break inside
        </div>
        <div className="break-after-auto break-after-avoid break-after-all break-after-avoid-page break-after-page break-after-left break-after-right break-after-column">
          Break after
        </div>
      </section>

      {/* Box Decoration Break */}
      <section className="mb-4">
        <h2>Box Decoration Break</h2>
        <div className="box-decoration-clone box-decoration-slice">
          Decoration break
        </div>
      </section>

      {/* Mix Blend Mode and Isolation */}
      <section className="mb-4">
        <h2>Mix Blend and Isolation</h2>
        <div className="mix-blend-normal mix-blend-multiply mix-blend-screen mix-blend-overlay mix-blend-darken mix-blend-lighten mix-blend-color-dodge mix-blend-color-burn mix-blend-hard-light mix-blend-soft-light mix-blend-difference mix-blend-exclusion mix-blend-hue mix-blend-saturation mix-blend-color mix-blend-luminosity">
          Blend modes
        </div>
        <div className="isolate isolation-auto">Isolation</div>
      </section>

      {/* Object Fit and Position */}
      <section className="mb-4">
        <h2>Object Utilities</h2>
        <div className="object-contain object-cover object-fill object-none object-scale-down">
          Object fit
        </div>
        <div className="object-bottom object-center object-left object-left-bottom object-left-top object-right object-right-bottom object-right-top object-top">
          Object position
        </div>
      </section>
    </div>
  )
}
