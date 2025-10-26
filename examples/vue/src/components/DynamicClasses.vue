<template>
  <div class="container">
    <h1 class="title">Dynamic Class Bindings (:class)</h1>
    <p class="subtitle">
      This component tests dynamic :class bindings with string literals.
    </p>

    <!-- :class with single string literal -->
    <div :class="'card'">
      <p>Single class as string literal</p>
    </div>

    <!-- :class with multiple classes as string literal -->
    <div :class="'flex gap-4 items-center'">
      <p>Multiple classes as string literal</p>
    </div>

    <!-- v-bind:class (long form) -->
    <div v-bind:class="'button-primary'">
      <p>Long form v-bind:class</p>
    </div>

    <!-- :class with Tailwind utilities -->
    <div :class="'bg-blue-500 text-white p-4 rounded'">
      <p>Tailwind classes in :class</p>
    </div>

    <!-- :class with SCSS classes -->
    <div :class="'alert alert-success'">
      <p>SCSS classes in :class</p>
    </div>

    <!-- :class with mixed sources -->
    <div :class="'container flex button-primary text-center'">
      <p>Mixed source classes in :class</p>
    </div>

    <!-- :class with ignored patterns -->
    <div :class="'dynamic-loader custom-widget'">
      <p>Ignored pattern classes in :class</p>
    </div>

    <!-- Mix static class with :class -->
    <div class="container" :class="'flex gap-4'">
      <p>Static class + :class binding</p>
    </div>

    <!-- Variables and template literals (should be skipped by validator) -->
    <div :class="dynamicClass">
      <p>Variable reference (skipped)</p>
    </div>

    <div :class="`btn-${variant}`">
      <p>Template literal (skipped)</p>
    </div>

    <!-- Computed property (should be skipped) -->
    <div :class="computedClass">
      <p>Computed property (skipped)</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'DynamicClasses',
  setup() {
    const dynamicClass = ref('some-dynamic-class')
    const variant = ref('primary')
    const computedClass = computed(() => 'computed-class')

    return {
      dynamicClass,
      variant,
      computedClass,
    }
  },
})
</script>
