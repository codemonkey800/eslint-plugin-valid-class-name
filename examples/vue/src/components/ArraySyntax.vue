<template>
  <div class="container">
    <h1 class="title">Array Syntax for :class</h1>
    <p class="subtitle">
      This component tests :class with array syntax containing string literals.
    </p>

    <!-- Simple array with single class -->
    <div :class="['card']">
      <p>Single class in array</p>
    </div>

    <!-- Array with multiple classes -->
    <div :class="['flex', 'gap-4', 'items-center']">
      <p>Multiple classes in array</p>
    </div>

    <!-- Array with CSS classes -->
    <div :class="['container', 'header', 'section']">
      <p>CSS classes in array</p>
    </div>

    <!-- Array with SCSS classes -->
    <div :class="['button-primary', 'alert', 'alert-success']">
      <p>SCSS classes in array</p>
    </div>

    <!-- Array with Tailwind utilities -->
    <div :class="['bg-blue-500', 'text-white', 'p-4', 'rounded']">
      <p>Tailwind utilities in array</p>
    </div>

    <!-- Array with mixed sources -->
    <div :class="['container', 'button-primary', 'flex', 'gap-4']">
      <p>Mixed source classes in array</p>
    </div>

    <!-- Array with ignored patterns -->
    <div :class="['dynamic-loader', 'custom-widget']">
      <p>Ignored pattern classes in array</p>
    </div>

    <!-- Array mixed with static class -->
    <div class="section" :class="['card', 'text-center']">
      <p>Static class + array syntax</p>
    </div>

    <!-- Array with nested object (Vue feature) -->
    <div :class="['container', { 'button-primary': isActive }]">
      <p>Array with nested object</p>
    </div>

    <!-- Array with nested object containing multiple classes -->
    <div :class="['flex', 'gap-4', { 'bg-blue-500': true, 'text-white': true }]">
      <p>Array with string literals and nested object</p>
    </div>

    <!-- Array with variables (should be skipped) -->
    <div :class="['card', dynamicClass]">
      <p>Array with variable (variable skipped)</p>
    </div>

    <!-- Empty array -->
    <div :class="[]">
      <p>Empty array</p>
    </div>

    <!-- Long array -->
    <div :class="['container', 'flex', 'gap-4', 'items-center', 'bg-blue-500', 'text-white', 'p-4', 'rounded', 'card', 'section']">
      <p>Many classes in array</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ArraySyntax',
  setup() {
    const isActive = ref(true)
    const dynamicClass = ref('some-dynamic-class')

    return {
      isActive,
      dynamicClass,
    }
  },
})
</script>
