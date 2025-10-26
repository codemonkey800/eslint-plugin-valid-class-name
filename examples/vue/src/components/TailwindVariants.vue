<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-6">Tailwind Variant Modifiers</h1>
    <p class="text-lg text-gray-600 mb-8">
      This component tests Tailwind variant modifiers (hover, focus, active, etc.).
    </p>

    <!-- Hover variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Hover Variants</h2>
      <div class="space-y-4">
        <button class="bg-blue-500 hover:bg-blue-700 text-white p-4 rounded">
          Hover: Background color change
        </button>
        <div class="text-gray-600 hover:text-gray-900 p-4">
          Hover: Text color change
        </div>
        <div class="scale-100 hover:scale-110 transition p-4 bg-gray-100">
          Hover: Scale transform
        </div>
      </div>
    </section>

    <!-- Focus variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Focus Variants</h2>
      <div class="space-y-4">
        <input
          type="text"
          class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded"
          placeholder="Focus: Border and ring"
        />
        <textarea
          class="border border-gray-300 focus:outline-none focus:border-green-500 p-2 rounded w-full"
          placeholder="Focus: Outline removed, border green"
        ></textarea>
      </div>
    </section>

    <!-- Active variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Active Variants</h2>
      <div class="space-y-4">
        <button class="bg-purple-500 active:bg-purple-700 text-white p-4 rounded">
          Active: Click me
        </button>
      </div>
    </section>

    <!-- Group hover variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Group Hover</h2>
      <div class="group p-6 bg-white border rounded-lg hover:bg-gray-50">
        <h3 class="text-xl font-semibold group-hover:text-blue-500">
          Group hover title
        </h3>
        <p class="text-gray-600 group-hover:text-gray-900">
          Hover over the card to see the effect
        </p>
      </div>
    </section>

    <!-- Responsive variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Responsive Variants</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="bg-blue-500 text-white p-4">Responsive grid</div>
        <div class="bg-green-500 text-white p-4">Responsive grid</div>
        <div class="bg-red-500 text-white p-4">Responsive grid</div>
        <div class="bg-yellow-500 text-white p-4">Responsive grid</div>
      </div>
      <div class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mt-4">
        Responsive text size
      </div>
    </section>

    <!-- Dark mode variants (if supported) -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Dark Mode Variants</h2>
      <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded">
        Dark mode support
      </div>
    </section>

    <!-- First, last, odd, even variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Positional Variants</h2>
      <ul class="space-y-2">
        <li class="first:font-bold p-2 bg-gray-100">First item (bold)</li>
        <li class="p-2 bg-gray-100">Second item</li>
        <li class="p-2 bg-gray-100">Third item</li>
        <li class="last:font-bold p-2 bg-gray-100">Last item (bold)</li>
      </ul>
      <div class="grid grid-cols-2 gap-2 mt-4">
        <div class="odd:bg-blue-100 even:bg-green-100 p-2">Item 1 (odd)</div>
        <div class="odd:bg-blue-100 even:bg-green-100 p-2">Item 2 (even)</div>
        <div class="odd:bg-blue-100 even:bg-green-100 p-2">Item 3 (odd)</div>
        <div class="odd:bg-blue-100 even:bg-green-100 p-2">Item 4 (even)</div>
      </div>
    </section>

    <!-- Disabled variant -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Disabled Variant</h2>
      <button
        disabled
        class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded"
      >
        Disabled button
      </button>
    </section>

    <!-- Combined variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Combined Variants</h2>
      <button class="bg-blue-500 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 active:bg-blue-800 text-white p-4 rounded transition">
        Hover + Focus + Active
      </button>
      <div class="mt-4 text-gray-600 hover:text-gray-900 sm:text-lg md:text-xl lg:hover:text-blue-500">
        Responsive + Hover combined
      </div>
    </section>

    <!-- Stacked variants -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Stacked Variants</h2>
      <div class="hover:first:bg-blue-500 hover:last:bg-red-500 p-4 bg-gray-100 mb-2">
        Hover + First
      </div>
      <button class="sm:hover:bg-blue-500 md:hover:bg-green-500 lg:hover:bg-red-500 text-white p-4 bg-gray-400 rounded">
        Responsive + Hover stacked
      </button>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TailwindVariants',
})
</script>
