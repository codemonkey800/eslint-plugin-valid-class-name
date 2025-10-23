import React from 'react'

/**
 * ArbitraryVariantsValid - Tests Tailwind arbitrary variant syntax
 *
 * This component tests:
 * - Arbitrary selectors ([&:selector])
 * - Arbitrary child selectors ([&>*], [&_p])
 * - Arbitrary attribute selectors ([&[data-*]])
 * - Arbitrary pseudo-selectors ([&:nth-child(n)])
 * - Arbitrary at-rules ([@media], [@supports])
 * - Combined arbitrary variants with regular variants
 * - Nested arbitrary selectors
 */
export const ArbitraryVariantsValid: React.FC = () => {
  return (
    <div className="container">
      {/* Arbitrary Pseudo-selectors */}
      <section className="mb-4">
        <h2>Arbitrary Pseudo-selectors</h2>
        <div className="[&:nth-child(3)]:bg-blue-500">Nth-child selector</div>
        <div className="[&:nth-child(odd)]:bg-gray-100">Nth-child odd</div>
        <div className="[&:nth-child(even)]:bg-gray-200">Nth-child even</div>
        <div className="[&:nth-of-type(2)]:text-red-500">Nth-of-type</div>
        <div className="[&:not(:first-child)]:mt-4">Not first child</div>
        <div className="[&:not(:last-child)]:mb-4">Not last child</div>
        <div className="[&:is(a,button)]:font-bold">Is selector</div>
        <div className="[&:where(div,span)]:block">Where selector</div>
        <div className="[&:has(>img)]:p-4">Has selector</div>
      </section>

      {/* Arbitrary Child Selectors */}
      <section className="mb-4">
        <h2>Arbitrary Child Selectors</h2>
        <div className="[&>*]:p-4">Direct children spacing</div>
        <div className="[&>*]:border-b">Direct children borders</div>
        <div className="[&>*:not(:last-child)]:mb-4">
          All but last child margin
        </div>
        <div className="[&_p]:text-gray-600">Descendant p elements</div>
        <div className="[&_a]:text-blue-500">Descendant links</div>
        <div className="[&_li]:font-normal">Descendant list items</div>
        <div className="[&>div]:flex">Direct div children</div>
        <div className="[&>span]:inline-block">Direct span children</div>
      </section>

      {/* Arbitrary Attribute Selectors */}
      <section className="mb-4">
        <h2>Arbitrary Attribute Selectors</h2>
        <div className="[&[data-active]]:bg-blue-500">Data attribute</div>
        <div className="[&[data-state='open']]:block">Data state open</div>
        <div className="[&[data-state='closed']]:hidden">Data state closed</div>
        <div className="[&[aria-expanded='true']]:rotate-180">
          Aria expanded
        </div>
        <div className="[&[aria-selected='true']]:bg-blue-100">
          Aria selected
        </div>
        <div className="[&[disabled]]:opacity-50">Disabled attribute</div>
        <div className="[&[readonly]]:bg-gray-100">Readonly attribute</div>
        <div className="[&[type='checkbox']]:w-4">Type attribute</div>
      </section>

      {/* Arbitrary Complex Selectors */}
      <section className="mb-4">
        <h2>Arbitrary Complex Selectors</h2>
        <div className="[&:hover:not(:disabled)]:bg-blue-500">
          Hover not disabled
        </div>
        <div className="[&:focus-within:not(:focus)]:ring-2">
          Focus within not focus
        </div>
        <div className="[&>*:first-child]:mt-0">First direct child</div>
        <div className="[&>*:last-child]:mb-0">Last direct child</div>
        <div className="[&_*::before]:content-['→']">All before content</div>
        <div className="[&_*::after]:content-['←']">All after content</div>
      </section>

      {/* Arbitrary At-rules (Media Queries) */}
      <section className="mb-4">
        <h2>Arbitrary At-rules (Media Queries)</h2>
        <div className="[@media(min-width:900px)]:flex">Custom breakpoint</div>
        <div className="[@media(max-width:500px)]:hidden">Max-width query</div>
        <div className="[@media(min-width:640px)_and_(max-width:768px)]:block">
          Range query
        </div>
        <div className="[@media(orientation:landscape)]:grid-cols-2">
          Orientation query
        </div>
        <div className="[@media(hover:hover)]:hover:opacity-75">Hover capability</div>
        <div className="[@media(prefers-reduced-motion:reduce)]:transition-none">
          Motion preference
        </div>
        <div className="[@media(prefers-color-scheme:dark)]:bg-gray-800">
          Color scheme
        </div>
        <div className="[@media_print]:hidden">Print media</div>
      </section>

      {/* Arbitrary At-rules (Supports) */}
      <section className="mb-4">
        <h2>Arbitrary At-rules (Supports)</h2>
        <div className="[@supports(display:grid)]:grid">Supports grid</div>
        <div className="[@supports(display:flex)]:flex">Supports flex</div>
        <div className="[@supports(backdrop-filter:blur(10px))]:backdrop-blur-lg">
          Supports backdrop-filter
        </div>
        <div className="[@supports(aspect-ratio:1/1)]:aspect-square">
          Supports aspect-ratio
        </div>
        <div className="[@supports(not(display:grid))]:block">
          Supports not grid
        </div>
      </section>

      {/* Combined Arbitrary Variants with Regular Variants */}
      <section className="mb-4">
        <h2>Combined with Regular Variants</h2>
        <div className="hover:[&:nth-child(3)]:bg-blue-500">
          Hover + arbitrary
        </div>
        <div className="md:[&>*]:gap-4">Responsive + arbitrary</div>
        <div className="dark:[&_p]:text-white">Dark mode + arbitrary</div>
        <div className="group-hover:[&>*]:opacity-100">
          Group hover + arbitrary
        </div>
        <div className="focus:[&[data-active]]:ring-2">
          Focus + arbitrary attribute
        </div>
        <div className="sm:[@media(min-width:700px)]:block">
          Responsive + arbitrary media
        </div>
      </section>

      {/* Multiple Arbitrary Variants */}
      <section className="mb-4">
        <h2>Multiple Arbitrary Variants</h2>
        <div className="[&:nth-child(3)]:[&:hover]:bg-blue-500">
          Two arbitrary variants
        </div>
        <div className="hover:focus:[&:not(:disabled)]:scale-105">
          Regular + arbitrary combination
        </div>
        <div className="dark:md:[&>*]:text-white">
          Dark + responsive + arbitrary
        </div>
        <div className="[@media(min-width:900px)]:[&>*]:grid-cols-3">
          Arbitrary media + child
        </div>
      </section>

      {/* Arbitrary Siblings */}
      <section className="mb-4">
        <h2>Arbitrary Sibling Selectors</h2>
        <div className="[&+*]:mt-4">Adjacent sibling</div>
        <div className="[&~*]:opacity-50">General sibling</div>
        <div className="[&+div]:border-t">Adjacent div sibling</div>
        <div className="[&~p]:text-gray-600">General p siblings</div>
      </section>

      {/* Arbitrary Parent/Ancestor Selectors */}
      <section className="mb-4">
        <h2>Arbitrary Context Selectors</h2>
        <div className="[.dark_&]:text-white">Dark mode context</div>
        <div className="[.sidebar_&]:text-sm">Sidebar context</div>
        <div className="[body.mobile_&]:w-full">Body class context</div>
      </section>

      {/* Arbitrary Pseudo-elements with Variants */}
      <section className="mb-4">
        <h2>Arbitrary Pseudo-elements</h2>
        <div className="[&::before]:content-['★']">Before pseudo-element</div>
        <div className="[&::after]:content-['☆']">After pseudo-element</div>
        <div className="[&::first-line]:font-bold">First-line pseudo</div>
        <div className="[&::first-letter]:text-2xl">First-letter pseudo</div>
        <div className="[&::selection]:bg-blue-200">Selection pseudo</div>
        <div className="[&::placeholder]:text-gray-400">Placeholder pseudo</div>
      </section>

      {/* Edge Cases with Arbitrary Variants */}
      <section className="mb-4">
        <h2>Edge Cases</h2>
        <div className="[&]:mt-4">Self selector</div>
        <div className="[&:is(:hover,:focus)]:ring-2">Multiple states</div>
        <div className="[&:not(.excluded)]:block">Not class</div>
        <div className="[@media(width>=900px)]:flex">Modern range syntax</div>
        <div className="[&[open]]:bg-gray-50">Open attribute</div>
        <div className="[&::-webkit-scrollbar]:hidden">Webkit scrollbar</div>
        <div className="[&::-moz-focus-inner]:border-0">Mozilla specific</div>
      </section>
    </div>
  )
}
