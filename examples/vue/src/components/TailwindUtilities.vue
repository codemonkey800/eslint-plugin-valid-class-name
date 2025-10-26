<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-6">Tailwind Utility Classes</h1>
    <p class="text-lg text-gray-600 mb-8">
      This component tests standard Tailwind utility classes across different categories.
    </p>

    <!-- Layout utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Layout</h2>
      <div class="flex flex-col gap-4">
        <div class="block">Block</div>
        <div class="inline-block">Inline Block</div>
        <div class="flex items-center justify-between">Flex</div>
        <div class="grid grid-cols-3 gap-4">
          <div>Grid 1</div>
          <div>Grid 2</div>
          <div>Grid 3</div>
        </div>
        <div class="hidden sm:block">Responsive</div>
      </div>
    </section>

    <!-- Spacing utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Spacing</h2>
      <div class="p-4 m-2 px-6 py-8 mx-auto my-4">
        <div class="mt-2 mb-4 ml-1 mr-3">Margin & Padding</div>
        <div class="space-x-4 space-y-2">Space utilities</div>
      </div>
    </section>

    <!-- Typography utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Typography</h2>
      <div class="space-y-2">
        <p class="text-xs">Extra small text</p>
        <p class="text-sm">Small text</p>
        <p class="text-base">Base text</p>
        <p class="text-lg">Large text</p>
        <p class="text-xl">Extra large text</p>
        <p class="text-2xl font-light">Light weight</p>
        <p class="text-2xl font-normal">Normal weight</p>
        <p class="text-2xl font-medium">Medium weight</p>
        <p class="text-2xl font-semibold">Semibold weight</p>
        <p class="text-2xl font-bold">Bold weight</p>
        <p class="italic">Italic</p>
        <p class="underline">Underline</p>
        <p class="line-through">Line through</p>
        <p class="uppercase">Uppercase</p>
        <p class="lowercase">Lowercase</p>
        <p class="capitalize">Capitalize</p>
      </div>
    </section>

    <!-- Color utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Colors</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-red-500 text-white p-4">Red 500</div>
        <div class="bg-blue-500 text-white p-4">Blue 500</div>
        <div class="bg-green-500 text-white p-4">Green 500</div>
        <div class="bg-yellow-500 text-black p-4">Yellow 500</div>
        <div class="bg-purple-500 text-white p-4">Purple 500</div>
        <div class="bg-pink-500 text-white p-4">Pink 500</div>
        <div class="bg-gray-100 text-gray-900 p-4">Gray scale</div>
        <div class="bg-gray-900 text-gray-100 p-4">Gray scale dark</div>
      </div>
    </section>

    <!-- Border utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Borders & Rounding</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="border border-gray-300 p-4">Border</div>
        <div class="border-2 border-blue-500 p-4">Border 2</div>
        <div class="border-4 border-red-500 p-4">Border 4</div>
        <div class="rounded p-4 bg-gray-100">Rounded</div>
        <div class="rounded-md p-4 bg-gray-100">Rounded MD</div>
        <div class="rounded-lg p-4 bg-gray-100">Rounded LG</div>
        <div class="rounded-xl p-4 bg-gray-100">Rounded XL</div>
        <div class="rounded-2xl p-4 bg-gray-100">Rounded 2XL</div>
        <div class="rounded-full p-4 bg-gray-100">Rounded Full</div>
      </div>
    </section>

    <!-- Shadow utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Shadows</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="shadow p-4 bg-white">Shadow</div>
        <div class="shadow-md p-4 bg-white">Shadow MD</div>
        <div class="shadow-lg p-4 bg-white">Shadow LG</div>
        <div class="shadow-xl p-4 bg-white">Shadow XL</div>
        <div class="shadow-2xl p-4 bg-white">Shadow 2XL</div>
      </div>
    </section>

    <!-- Custom theme colors -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Custom Theme</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-brand-500 text-white p-4">Brand 500</div>
        <div class="bg-brand-600 text-white p-4">Brand 600</div>
        <div class="text-brand-500 p-4 bg-brand-50">Brand text</div>
        <div class="text-brand-700 p-4 bg-brand-100">Brand dark text</div>
      </div>
    </section>

    <!-- Opacity utilities -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Opacity</h2>
      <div class="space-y-2">
        <div class="bg-blue-500 text-white p-4 opacity-100">Opacity 100</div>
        <div class="bg-blue-500 text-white p-4 opacity-75">Opacity 75</div>
        <div class="bg-blue-500 text-white p-4 opacity-50">Opacity 50</div>
        <div class="bg-blue-500 text-white p-4 opacity-25">Opacity 25</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TailwindUtilities',
})
</script>
