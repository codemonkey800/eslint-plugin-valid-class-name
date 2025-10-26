<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-6">Arbitrary Values in Tailwind</h1>
    <p class="text-lg text-gray-600 mb-8">
      This component tests Tailwind's arbitrary value syntax with square brackets.
    </p>

    <!-- Arbitrary sizing -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Sizing</h2>
      <div class="space-y-4">
        <div class="w-[100px] h-[50px] bg-blue-500">Width 100px, Height 50px</div>
        <div class="w-[250px] h-[75px] bg-green-500">Width 250px, Height 75px</div>
        <div class="w-[50%] h-[100px] bg-red-500">Width 50%, Height 100px</div>
        <div class="w-[calc(100%-2rem)] h-[80px] bg-purple-500">Calc width</div>
        <div class="min-w-[200px] max-w-[400px] bg-yellow-500 p-4">Min/Max width</div>
        <div class="min-h-[100px] max-h-[200px] bg-pink-500 p-4">Min/Max height</div>
      </div>
    </section>

    <!-- Arbitrary colors -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Colors</h2>
      <div class="space-y-4">
        <div class="bg-[#1da1f2] text-white p-4">Hex color: #1da1f2</div>
        <div class="bg-[rgb(255,0,0)] text-white p-4">RGB color</div>
        <div class="bg-[rgba(0,255,0,0.5)] text-white p-4">RGBA color with alpha</div>
        <div class="bg-[hsl(200,100%,50%)] text-white p-4">HSL color</div>
        <div class="text-[#ff6600] text-2xl p-4">Text color: #ff6600</div>
        <div class="border-[#3b82f6] border-4 p-4">Border color</div>
      </div>
    </section>

    <!-- Arbitrary spacing -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Spacing</h2>
      <div class="space-y-4">
        <div class="p-[13px] bg-gray-100">Padding: 13px</div>
        <div class="m-[25px] bg-gray-200">Margin: 25px</div>
        <div class="px-[30px] py-[15px] bg-gray-300">Padding X/Y</div>
        <div class="mt-[2.5rem] mb-[1.5rem] bg-gray-400">Margin with rem</div>
        <div class="gap-[18px] flex bg-gray-100">
          <div>Gap 18px</div>
          <div>Item 2</div>
        </div>
      </div>
    </section>

    <!-- Arbitrary borders -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Borders</h2>
      <div class="space-y-4">
        <div class="border-[3px] border-gray-400 p-4">Border: 3px</div>
        <div class="rounded-[25px] bg-blue-100 p-4">Border radius: 25px</div>
        <div class="border-t-[5px] border-red-500 p-4">Top border: 5px</div>
      </div>
    </section>

    <!-- Arbitrary font sizes and line heights -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Typography</h2>
      <div class="space-y-4">
        <p class="text-[14px]">Font size: 14px</p>
        <p class="text-[18px]">Font size: 18px</p>
        <p class="text-[24px]/[32px]">Font size 24px, line-height 32px</p>
        <p class="text-[1.125rem]/[1.75rem]">Font with rem units</p>
        <p class="tracking-[0.5em]">Letter spacing: 0.5em</p>
      </div>
    </section>

    <!-- Arbitrary transforms -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Transforms</h2>
      <div class="space-y-4">
        <div class="rotate-[17deg] bg-green-200 p-4 inline-block">Rotate 17deg</div>
        <div class="scale-[1.15] bg-blue-200 p-4 inline-block ml-4">Scale 1.15</div>
        <div class="translate-x-[50px] bg-red-200 p-4">Translate X 50px</div>
        <div class="skew-y-[3deg] bg-yellow-200 p-4">Skew Y 3deg</div>
      </div>
    </section>

    <!-- Arbitrary shadows -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Shadows</h2>
      <div class="space-y-4">
        <div class="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-4 bg-white">
          Custom shadow
        </div>
        <div class="shadow-[0_20px_50px_rgba(8,112,184,0.7)] p-4 bg-white">
          Colored shadow
        </div>
      </div>
    </section>

    <!-- Arbitrary variants with arbitrary values -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Variants with Arbitrary Values</h2>
      <div class="space-y-4">
        <div class="hover:w-[300px] w-[200px] bg-purple-500 text-white p-4 transition-all">
          Hover to expand width
        </div>
        <button class="bg-blue-500 hover:bg-[#1e40af] text-white p-4 rounded">
          Hover: Arbitrary color
        </button>
      </div>
    </section>

    <!-- Arbitrary properties (CSS variables) -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Arbitrary Properties</h2>
      <div class="space-y-4">
        <div class="[mask-type:luminance] bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
          Arbitrary CSS property
        </div>
      </div>
    </section>

    <!-- Grid with arbitrary values -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Grid with Arbitrary Values</h2>
      <div class="grid grid-cols-[200px_1fr_100px] gap-4">
        <div class="bg-blue-100 p-4">200px</div>
        <div class="bg-green-100 p-4">1fr (flexible)</div>
        <div class="bg-red-100 p-4">100px</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ArbitraryValues',
})
</script>
