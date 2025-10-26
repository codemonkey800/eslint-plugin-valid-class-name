<template>
  <div class="container">
    <h1 class="title">Edge Cases and Special Scenarios</h1>
    <p class="subtitle">
      This component tests edge cases, boundary conditions, and special scenarios.
    </p>

    <!-- Empty class attributes -->
    <section class="section">
      <h2 class="subtitle">Empty Classes</h2>
      <div class="">Empty static class</div>
      <div :class="''">Empty :class string</div>
      <div :class="[]">Empty :class array</div>
      <div :class="{}">Empty :class object</div>
    </section>

    <!-- Whitespace handling -->
    <section class="section">
      <h2 class="subtitle">Whitespace Handling</h2>
      <div class="  container   flex   gap-4  ">Multiple spaces</div>
      <div :class="'  card   text-center  '">:class with extra spaces</div>
    </section>

    <!-- Very long class lists -->
    <section class="section">
      <h2 class="subtitle">Long Class Lists</h2>
      <div class="container header footer nav nav-link title subtitle section card badge badge-success badge-error text-center text-left text-right mb-2 mb-4 mt-4 flex gap-4 items-center justify-between bg-blue-500 bg-green-500 bg-red-500 text-white p-4 rounded shadow-lg">
        Very long static class list
      </div>
    </section>

    <!-- Special characters in ignore patterns -->
    <section class="section">
      <h2 class="subtitle">Ignore Patterns</h2>
      <div class="dynamic-class">Matches dynamic-*</div>
      <div class="dynamic-loader-spinner">Matches dynamic-*</div>
      <div class="custom-component">Matches custom-*</div>
      <div class="custom-widget-panel">Matches custom-*</div>
      <div :class="'dynamic-wrapper'">:class with ignored pattern</div>
      <div :class="{ 'custom-handler': true }">:class object with ignored pattern</div>
      <div :class="['dynamic-processor', 'custom-renderer']">:class array with ignored patterns</div>
    </section>

    <!-- Duplicate classes -->
    <section class="section">
      <h2 class="subtitle">Duplicate Classes</h2>
      <div class="card card card">Same class repeated</div>
      <div :class="'flex flex gap-4 gap-4'">:class with duplicates</div>
      <div :class="['container', 'container', 'flex']">:class array with duplicates</div>
    </section>

    <!-- Classes that should be skipped (dynamic) -->
    <section class="section">
      <h2 class="subtitle">Dynamic Classes (Skipped)</h2>
      <div :class="dynamicVar">Variable reference</div>
      <div :class="`template-${literal}`">Template literal</div>
      <div :class="computedValue">Computed property</div>
      <div :class="methodCall()">Method call</div>
      <div :class="['card', dynamicVar]">Array with variable</div>
      <div :class="{ 'card': true, [dynamicKey]: true }">Object with computed key</div>
    </section>

    <!-- Nested components -->
    <section class="section">
      <h2 class="subtitle">Nested Elements</h2>
      <div class="container">
        <div class="card">
          <div class="flex gap-4">
            <div class="button-primary">
              <span class="text-white">Deeply nested</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mixed valid and ignore patterns -->
    <section class="section">
      <h2 class="subtitle">Mixed Valid and Ignored</h2>
      <div class="container dynamic-loader flex custom-widget gap-4">
        Static + Ignored + Tailwind
      </div>
      <div :class="['card', 'dynamic-processor', 'bg-blue-500', 'custom-handler']">
        :class array: Valid + Ignored + Tailwind
      </div>
    </section>

    <!-- Conditional rendering with classes -->
    <section class="section">
      <h2 class="subtitle">Conditional Rendering</h2>
      <div v-if="showElement" class="container">v-if with class</div>
      <div v-show="isVisible" class="card">v-show with class</div>
      <div v-for="item in items" :key="item" class="badge badge-success">
        v-for with class: {{ item }}
      </div>
    </section>

    <!-- Multiple directives -->
    <section class="section">
      <h2 class="subtitle">Multiple Directives</h2>
      <div v-if="showElement" v-show="isVisible" class="flex gap-4" :class="{ 'items-center': true }">
        Multiple directives with classes
      </div>
    </section>

    <!-- Slots (if any) -->
    <section class="section">
      <h2 class="subtitle">Components with Slots</h2>
      <div class="card">
        <slot name="header" class="header">Default header</slot>
        <slot class="main-content">Default content</slot>
      </div>
    </section>

    <!-- Complex nesting with all features -->
    <section class="section">
      <h2 class="subtitle">Complex Combination</h2>
      <div
        v-if="showElement"
        class="container section"
        :class="[
          'flex',
          'gap-4',
          'items-center',
          {
            'button-primary': isActive,
            'bg-blue-500': true,
            'text-white': hasWhiteText,
            'dynamic-loader': true
          },
          isLarge ? 'text-lg' : 'text-sm',
          computedClass
        ]"
      >
        Everything combined
      </div>
    </section>

    <!-- No class attribute -->
    <section class="section">
      <h2 class="subtitle">No Class Attribute</h2>
      <div>No class attribute at all</div>
      <div id="test">Only other attributes</div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'EdgeCases',
  setup() {
    const dynamicVar = ref('some-dynamic-class')
    const literal = ref('value')
    const dynamicKey = ref('computed-key')
    const showElement = ref(true)
    const isVisible = ref(true)
    const items = ref(['A', 'B', 'C'])
    const isActive = ref(true)
    const hasWhiteText = ref(true)
    const isLarge = ref(false)

    const computedValue = computed(() => 'computed-class')
    const computedClass = computed(() => 'another-computed')

    const methodCall = () => 'method-result-class'

    return {
      dynamicVar,
      literal,
      dynamicKey,
      showElement,
      isVisible,
      items,
      isActive,
      hasWhiteText,
      isLarge,
      computedValue,
      computedClass,
      methodCall,
    }
  },
})
</script>
