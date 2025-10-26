<template>
  <div class="container">
    <h1 class="title">Object Syntax for :class</h1>
    <p class="subtitle">
      This component tests :class with object syntax where keys are class names.
    </p>

    <!-- Simple object syntax with boolean values -->
    <div :class="{ 'card': true }">
      <p>Single class with boolean true</p>
    </div>

    <div :class="{ 'hidden': false }">
      <p>Single class with boolean false (not applied)</p>
    </div>

    <!-- Multiple classes in object -->
    <div :class="{ 'flex': true, 'gap-4': true, 'items-center': true }">
      <p>Multiple classes as object keys</p>
    </div>

    <!-- Object syntax with reactive data -->
    <div :class="{ 'button-primary': isActive, 'button-secondary': !isActive }">
      <p>Conditional classes with reactive data</p>
    </div>

    <!-- Mixed CSS, SCSS, and Tailwind in object -->
    <div :class="{ 'container': true, 'alert': hasAlert, 'bg-blue-500': true, 'text-white': true }">
      <p>Mixed source classes in object syntax</p>
    </div>

    <!-- Object syntax with ignored patterns -->
    <div :class="{ 'dynamic-loader': true, 'custom-widget': showWidget }">
      <p>Ignored pattern classes in object</p>
    </div>

    <!-- Object syntax with quoted keys -->
    <div :class="{ 'text-center': true, 'mb-4': true }">
      <p>Quoted keys in object</p>
    </div>

    <!-- Object syntax mixed with static class -->
    <div class="section" :class="{ 'card': true, 'badge': false }">
      <p>Static class + object syntax</p>
    </div>

    <!-- Nested conditions -->
    <div :class="{ 'button-primary': isActive && isEnabled, 'button-secondary': !isActive || !isEnabled }">
      <p>Complex conditions in object</p>
    </div>

    <!-- Object with computed property values -->
    <div :class="{ 'alert-success': isSuccess, 'alert-danger': isError, 'alert-warning': isWarning }">
      <p>Multiple mutually exclusive classes</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'ObjectSyntax',
  setup() {
    const isActive = ref(true)
    const hasAlert = ref(false)
    const showWidget = ref(true)
    const isEnabled = ref(true)
    const isSuccess = ref(true)
    const isError = ref(false)
    const isWarning = ref(false)

    return {
      isActive,
      hasAlert,
      showWidget,
      isEnabled,
      isSuccess,
      isError,
      isWarning,
    }
  },
})
</script>
