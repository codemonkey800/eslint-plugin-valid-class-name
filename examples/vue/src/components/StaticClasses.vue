<template>
  <div class="container">
    <h1 class="title">Static Class Attributes</h1>
    <p class="subtitle">
      This component tests static class attribute validation (standard HTML class attribute).
    </p>

    <!-- Single class -->
    <div class="card">
      <p>Single static class</p>
    </div>

    <!-- Multiple classes -->
    <div class="flex gap-4 items-center">
      <span>Multiple static classes</span>
    </div>

    <!-- CSS classes from app.css -->
    <div class="container header footer">
      <p>CSS layout classes</p>
    </div>

    <!-- SCSS classes from components.scss -->
    <div class="button-primary button-secondary alert">
      <p>SCSS component classes</p>
    </div>

    <!-- Utility classes from utilities.css -->
    <div class="text-center mb-4 badge badge-success">
      <p>Utility classes</p>
    </div>

    <!-- Tailwind utilities -->
    <div class="bg-blue-500 text-white p-4 rounded shadow-lg">
      <p>Tailwind utility classes</p>
    </div>

    <!-- Tailwind custom theme -->
    <div class="text-brand-500 bg-brand-100">
      <p>Tailwind custom theme colors</p>
    </div>

    <!-- Mixed sources -->
    <div class="container flex gap-4 button-primary text-center">
      <p>Mixed classes from all sources</p>
    </div>

    <!-- Empty class attribute (valid) -->
    <div class="">
      <p>Empty class attribute</p>
    </div>

    <!-- Classes with ignore patterns -->
    <div class="dynamic-loader custom-widget">
      <p>Classes matching ignore patterns</p>
    </div>

    <!-- Long class list -->
    <div class="container header main-content section card nav nav-link title subtitle text-center mb-4 flex gap-4 bg-blue-500 text-white p-4 rounded">
      <p>Many valid classes</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StaticClasses',
})
</script>
