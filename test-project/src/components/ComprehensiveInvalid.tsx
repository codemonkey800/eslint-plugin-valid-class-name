import React from 'react'

/**
 * ComprehensiveInvalid - Tests comprehensive invalid class name scenarios
 *
 * This component contains ONLY invalid class names that should trigger ESLint errors:
 * - Nonexistent Tailwind utilities
 * - Invalid variant names
 * - Typos in Tailwind utilities
 * - Empty arbitrary values
 * - Malformed class names
 * - CSS/SCSS class typos
 * - Non-whitelisted custom classes
 * - Invalid variant + utility combinations
 *
 * Expected: ~20+ ESLint errors
 */
export const ComprehensiveInvalid: React.FC = () => {
  return (
    <div className="container">
      {/* Nonexistent Tailwind Utilities */}
      <section className="mb-4">
        <h2>Nonexistent Tailwind Utilities</h2>
        <div className="flx items-center">Typo: flx instead of flex</div>
        <div className="bg-ultraviolet-500">Nonexistent color</div>
        <div className="txt-lg">Typo: txt instead of text</div>
        <div className="margn-4">Typo: margn instead of m</div>
        <div className="padd-8">Typo: padd instead of p</div>
        <div className="wdth-full">Typo: wdth instead of w</div>
        <div className="hght-screen">Typo: hght instead of h</div>
      </section>

      {/* Invalid Tailwind Color Names */}
      <section className="mb-4">
        <h2>Invalid Color Names</h2>
        <div className="bg-blu-500">Typo: blu instead of blue</div>
        <div className="text-gren-600">Typo: gren instead of green</div>
        <div className="border-purpel-400">Typo: purpel instead of purple</div>
        <div className="text-brand-5000">Invalid shade number</div>
        <div className="bg-rainbow-500">Nonexistent color name</div>
      </section>

      {/* Invalid Variant Names */}
      <section className="mb-4">
        <h2>Invalid Variant Names</h2>
        <div className="hoverr:bg-blue-500">Typo: hoverr</div>
        <div className="foucus:ring-2">Typo: foucus instead of focus</div>
        <div className="activ:scale-95">Typo: activ instead of active</div>
        <div className="mediumm:flex">Typo: mediumm instead of md</div>
        <div className="larg:grid">Typo: larg instead of lg</div>
        <div className="darkmode:text-white">
          Invalid: darkmode instead of dark
        </div>
        <div className="gruppe-hover:opacity-100">
          Typo: gruppe instead of group
        </div>
      </section>

      {/* Empty Arbitrary Values */}
      <section className="mb-4">
        <h2>Empty Arbitrary Values</h2>
        <div className="w-[]">Empty width arbitrary value</div>
        <div className="bg-[]">Empty background color</div>
        <div className="text-[]">Empty text color</div>
        <div className="m-[]">Empty margin</div>
        <div className="p-[]">Empty padding</div>
      </section>

      {/* Malformed Class Names */}
      <section className="mb-4">
        <h2>Malformed Class Names</h2>
        <div className="hover::bg-blue">Double colon</div>
        <div className=":hover:bg-blue">Leading colon</div>
        <div className="bg-blue-">Trailing dash</div>
        <div className="-bg-blue">Invalid negative prefix</div>
        <div className="bg--blue-500">Double dash</div>
        <div className="text--">Incomplete class</div>
      </section>

      {/* CSS/SCSS Class Typos */}
      <section className="mb-4">
        <h2>CSS/SCSS Class Typos</h2>
        <div className="containr">Typo: containr instead of container</div>
        <div className="buton-primary">Typo: buton instead of button</div>
        <div className="crd">Typo: crd instead of card</div>
        <div className="alert-">Incomplete class name</div>
        <div className="header-primary">Nonexistent variant</div>
        <div className="footer-large">Nonexistent variant</div>
      </section>

      {/* Non-whitelisted Custom Classes */}
      <section className="mb-4">
        <h2>Non-whitelisted Custom Classes</h2>
        <div className="random-class-123">Not in any source</div>
        <div className="not-in-css">Not defined anywhere</div>
        <div className="made-up-class">Invented class name</div>
        <div className="does-not-exist-anywhere">Long nonexistent class</div>
        <div className="mystery-widget">Not in whitelist</div>
      </section>

      {/* Invalid Layout Utilities */}
      <section className="mb-4">
        <h2>Invalid Layout Utilities</h2>
        <div className="flexs">Typo: flexs</div>
        <div className="gird">Typo: gird instead of grid</div>
        <div className="blcok">Typo: blcok instead of block</div>
        <div className="inlin-block">Typo: inlin</div>
        <div className="hidde">Typo: hidde instead of hidden</div>
      </section>

      {/* Invalid Spacing Utilities */}
      <section className="mb-4">
        <h2>Invalid Spacing Utilities</h2>
        <div className="mt-100">Nonexistent spacing value</div>
        <div className="p-999">Nonexistent spacing value</div>
        <div className="gap-abc">Invalid gap value</div>
        <div className="m-auto-flex">Malformed margin</div>
        <div className="px--4">Double dash</div>
      </section>

      {/* Invalid Typography Utilities */}
      <section className="mb-4">
        <h2>Invalid Typography Utilities</h2>
        <div className="text-super-xl">Nonexistent size</div>
        <div className="font-super-bold">Nonexistent weight</div>
        <div className="leading-super-tight">Nonexistent leading</div>
        <div className="tracking-super-wide">Nonexistent tracking</div>
      </section>

      {/* Invalid Combinations */}
      <section className="mb-4">
        <h2>Invalid Combinations</h2>
        <div className="hover:container">Container doesn't work with hover</div>
        <div className="md:custom-widget-typo">
          Responsive + nonexistent class
        </div>
        <div className="dark:made-up-class">Dark mode + nonexistent class</div>
      </section>

      {/* Invalid Border Utilities */}
      <section className="mb-4">
        <h2>Invalid Border Utilities</h2>
        <div className="border-super-thick">Nonexistent border width</div>
        <div className="rounded-super">Nonexistent border radius</div>
        <div className="ring-ultra">Nonexistent ring size</div>
      </section>

      {/* Invalid Effect Utilities */}
      <section className="mb-4">
        <h2>Invalid Effect Utilities</h2>
        <div className="shadow-ultra">Nonexistent shadow</div>
        <div className="opacity-abc">Invalid opacity value</div>
        <div className="blur-super">Nonexistent blur value</div>
      </section>
    </div>
  )
}
