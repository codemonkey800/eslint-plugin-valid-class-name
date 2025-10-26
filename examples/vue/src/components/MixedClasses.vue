<template>
  <div class="container">
    <h1 class="title">Mixed Classes from All Sources</h1>
    <p class="subtitle">
      This component combines CSS, SCSS, and Tailwind classes in various ways.
    </p>

    <!-- Static: Mix all sources -->
    <div class="container flex gap-4 button-primary badge badge-success">
      <p>Static: CSS + Tailwind + SCSS + Utility</p>
    </div>

    <!-- :class with string literal: Mix all sources -->
    <div :class="'card bg-blue-500 text-white alert p-4'">
      <p>:class string: CSS + Tailwind + SCSS</p>
    </div>

    <!-- :class with object: Mix all sources -->
    <div :class="{ 'section': true, 'flex': true, 'gap-4': true, 'button-secondary': isEnabled }">
      <p>:class object: CSS + Tailwind + SCSS</p>
    </div>

    <!-- :class with array: Mix all sources -->
    <div :class="['header', 'rounded', 'shadow-lg', 'alert-warning', 'text-center']">
      <p>:class array: CSS + Tailwind + SCSS + Utility</p>
    </div>

    <!-- Combined static + dynamic -->
    <div class="container flex" :class="['gap-4', 'items-center', { 'button-primary': true }]">
      <p>Static + Array with nested object</p>
    </div>

    <div class="card" :class="isActive ? 'bg-green-500 text-white' : 'bg-gray-200'">
      <p>Static + Ternary</p>
    </div>

    <div class="section" :class="{ 'flex': true, 'gap-4': showGap, 'alert-success': isSuccess }">
      <p>Static + Object</p>
    </div>

    <!-- Complex nesting -->
    <div
      class="container"
      :class="[
        'flex',
        'gap-4',
        {
          'button-primary': isActive,
          'bg-blue-500': true,
          'text-white': true
        },
        isLarge ? 'text-lg' : 'text-sm'
      ]"
    >
      <p>Static + Array + Object + Ternary</p>
    </div>

    <!-- Custom theme + standard utilities -->
    <div class="text-brand-500 bg-brand-100 p-4 rounded shadow-md">
      <p>Custom theme + standard Tailwind utilities</p>
    </div>

    <div :class="'text-brand-600 bg-brand-50 button-primary card'">
      <p>Custom Tailwind + SCSS + CSS in :class</p>
    </div>

    <!-- Everything together -->
    <div
      class="container section card"
      :class="[
        'flex',
        'gap-4',
        'items-center',
        'bg-gradient-to-r',
        'from-blue-500',
        'to-purple-500',
        'text-white',
        'p-4',
        'rounded-lg',
        'shadow-xl',
        'button-primary',
        'badge',
        {
          'alert-success': isSuccess,
          'text-center': isCentered,
          'mb-4': true
        }
      ]"
    >
      <p>Maximum mixing: Static + Array + Object + All sources</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MixedClasses',
  setup() {
    const isEnabled = ref(true)
    const isActive = ref(true)
    const showGap = ref(true)
    const isSuccess = ref(true)
    const isLarge = ref(false)
    const isCentered = ref(true)

    return {
      isEnabled,
      isActive,
      showGap,
      isSuccess,
      isLarge,
      isCentered,
    }
  },
})
</script>
