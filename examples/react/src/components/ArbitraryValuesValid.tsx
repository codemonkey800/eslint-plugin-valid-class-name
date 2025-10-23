import React from 'react'

/**
 * ArbitraryValuesValid - Tests Tailwind arbitrary value syntax
 *
 * This component tests:
 * - Arbitrary spacing values (px, rem, em, vh, vw, etc.)
 * - Arbitrary color values (hex, rgb, hsl)
 * - Arbitrary URLs for backgrounds
 * - Arbitrary content values
 * - Arbitrary values with variants
 * - Negative arbitrary values
 * - Complex arbitrary expressions
 */
export const ArbitraryValuesValid: React.FC = () => {
  return (
    <div className="container">
      {/* Arbitrary Spacing Values */}
      <section className="mb-4">
        <h2>Arbitrary Spacing</h2>
        <div className="w-[100px] h-[50px]">Fixed pixel dimensions</div>
        <div className="w-[50vh] h-[50vw]">Viewport-based dimensions</div>
        <div className="m-[2rem] p-[1.5em]">Relative unit spacing</div>
        <div className="gap-[20px] space-x-[15px]">Arbitrary gaps</div>
        <div className="px-[3rem] py-[2.5rem]">Arbitrary padding</div>
        <div className="mx-[10%] my-[5vh]">Percentage and vh margins</div>
        <div className="top-[10px] left-[20px] right-[30px] bottom-[40px]">
          Arbitrary positioning
        </div>
        <div className="inset-[15px] inset-x-[25px] inset-y-[35px]">
          Arbitrary insets
        </div>
      </section>

      {/* Negative Arbitrary Spacing */}
      <section className="mb-4">
        <h2>Negative Arbitrary Spacing</h2>
        <div className="-mt-[10px] -ml-[2rem]">Negative margins</div>
        <div className="-top-[5px] -left-[1rem]">Negative positioning</div>
        <div className="-translate-x-[50px] -translate-y-[25px]">
          Negative transforms
        </div>
        <div className="-inset-[10px] -inset-x-[20px]">Negative insets</div>
      </section>

      {/* Arbitrary Color Values */}
      <section className="mb-4">
        <h2>Arbitrary Colors</h2>
        <div className="bg-[#ff0000] text-[#ffffff]">Hex colors</div>
        <div className="bg-[#1da1f2] border-[#f00]">Hex short and long</div>
        <div className="bg-[rgb(255,0,0)] text-[rgb(0,255,0)]">RGB colors</div>
        <div className="bg-[rgba(255,0,0,0.5)] text-[rgba(0,0,0,0.8)]">
          RGBA colors
        </div>
        <div className="bg-[hsl(200,50%,50%)] text-[hsl(0,100%,50%)]">
          HSL colors
        </div>
        <div className="bg-[hsla(200,50%,50%,0.5)]">HSLA colors</div>
        <div className="border-[#e5e7eb] ring-[#3b82f6]">Arbitrary borders</div>
        <div className="text-[#334155] placeholder-[#9ca3af]">
          Arbitrary text colors
        </div>
      </section>

      {/* Arbitrary Dimensions */}
      <section className="mb-4">
        <h2>Arbitrary Dimensions</h2>
        <div className="min-w-[200px] max-w-[800px]">Min/max width</div>
        <div className="min-h-[100px] max-h-[600px]">Min/max height</div>
        <div className="w-[calc(100%-2rem)] h-[calc(100vh-4rem)]">
          Calc expressions
        </div>
        <div className="w-[clamp(200px,50%,600px)]">Clamp function</div>
      </section>

      {/* Arbitrary Background URLs */}
      <section className="mb-4">
        <h2>Arbitrary Background URLs</h2>
        <div className="bg-[url('/images/hero.jpg')]">Background URL</div>
        {/* Note: URLs with protocols in arbitrary values may not parse correctly */}
        <div className="bg-cover bg-center">
          External URL (using standard classes)
        </div>
        <div className="bg-[url('/img.png')]">URL with path</div>
      </section>

      {/* Arbitrary Content */}
      <section className="mb-4">
        <h2>Arbitrary Content</h2>
        <p className="before:content-['→'] after:content-['←']">
          Arbitrary content arrows
        </p>
        <p className="before:content-['★'] after:content-['☆']">
          Special characters
        </p>
        <div className="after:content-['Read_more_→']">Underscore spaces</div>
        <div className="before:content-['']">Empty content</div>
      </section>

      {/* Arbitrary Values with Variants */}
      <section className="mb-4">
        <h2>Arbitrary Values with Variants</h2>
        <div className="hover:w-[200px] hover:h-[200px]">Hover dimensions</div>
        <div className="md:bg-[#00ff00] lg:text-[#ff00ff]">
          Responsive colors
        </div>
        <div className="dark:bg-[#1a1a1a] dark:text-[#e5e7eb]">
          Dark mode arbitrary
        </div>
        <div className="focus:ring-[3px] focus:ring-[#3b82f6]">
          Focus with arbitrary
        </div>
        <div className="hover:translate-x-[50px] active:scale-[1.1]">
          Transform arbitrary
        </div>
        <div className="sm:p-[1rem] md:p-[2rem] lg:p-[3rem]">
          Responsive spacing
        </div>
      </section>

      {/* Arbitrary Values for Special Properties */}
      <section className="mb-4">
        <h2>Arbitrary Special Properties</h2>
        <div className="opacity-[0.67]">Arbitrary opacity</div>
        <div className="z-[100] z-[999]">Arbitrary z-index</div>
        <div className="delay-[350ms] duration-[450ms]">Arbitrary timing</div>
        <div className="rotate-[17deg] skew-x-[5deg]">Arbitrary rotation</div>
        <div className="scale-[1.15] scale-x-[0.95]">Arbitrary scale</div>
        <div className="border-[3px] border-t-[5px]">
          Arbitrary border width
        </div>
        <div className="rounded-[12px] rounded-tl-[8px]">Arbitrary radius</div>
        <div className="blur-[2px] brightness-[1.15]">Arbitrary filters</div>
        <div className="backdrop-blur-[4px] backdrop-brightness-[0.85]">
          Arbitrary backdrop
        </div>
      </section>

      {/* Complex Arbitrary Expressions */}
      <section className="mb-4">
        <h2>Complex Arbitrary Expressions</h2>
        <div className="grid-cols-[200px_1fr_100px]">Grid template columns</div>
        <div className="grid-rows-[auto_1fr_auto]">Grid template rows</div>
        <div className="aspect-[16/9] aspect-[4/3]">Aspect ratios</div>
        <div className="leading-[1.75] tracking-[0.05em]">
          Typography values
        </div>
        <div className="shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
          Custom shadow
        </div>
        <div className="ring-offset-[3px] outline-offset-[4px]">
          Arbitrary offsets
        </div>
      </section>

      {/* Multiple Arbitrary Values */}
      <section className="mb-4">
        <h2>Multiple Arbitrary Values</h2>
        <div className="w-[300px] h-[200px] p-[2rem] m-[1rem] bg-[#f3f4f6] text-[#1f2937] rounded-[8px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
          Multiple arbitrary values combined
        </div>
        <div className="hover:w-[350px] hover:h-[250px] hover:bg-[#e5e7eb] transition-all duration-[300ms]">
          Multiple arbitrary with hover
        </div>
      </section>

      {/* Edge Cases */}
      <section className="mb-4">
        <h2>Edge Cases</h2>
        <div className="w-[0px] h-[0px]">Zero dimensions</div>
        <div className="w-[1px] h-[1px]">One pixel</div>
        <div className="bg-[transparent] text-[currentColor]">
          Special keywords
        </div>
        <div className="w-[100%] h-[100%]">Percentage values</div>
        <div className="translate-x-[calc(100%+1rem)]">
          Calc with percentage
        </div>
      </section>
    </div>
  )
}
