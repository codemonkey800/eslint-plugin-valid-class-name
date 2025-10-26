<template>
  <div class="container mb-4">
    <!-- Header with CSS classes -->
    <header class="header">
      <div class="nav">
        <a href="#" class="nav-link">Home</a>
        <a href="#" class="nav-link">About</a>
        <a href="#" class="nav-link">Contact</a>
      </div>
    </header>

    <!-- Main content with mixed CSS/SCSS/Tailwind -->
    <main class="main-content">
      <h1 class="title text-brand-500">Valid Vue Component</h1>
      <p class="text-lg text-gray-700 mb-4">
        This component demonstrates valid class names from CSS, SCSS, and Tailwind.
      </p>

      <!-- Section with Tailwind utilities -->
      <section class="section">
        <h2 class="subtitle">Tailwind Utilities</h2>
        <div class="flex gap-4 items-center justify-between">
          <div class="bg-blue-500 text-white p-4 rounded">Box 1</div>
          <div class="bg-green-500 text-white p-4 rounded">Box 2</div>
          <div class="bg-red-500 text-white p-4 rounded">Box 3</div>
        </div>
      </section>

      <!-- Card with CSS classes -->
      <section class="section">
        <div class="card">
          <h3 class="subtitle">Card Example</h3>
          <p>This card uses CSS classes from app.css</p>
        </div>
      </section>

      <!-- Buttons using SCSS -->
      <section class="section">
        <h2 class="subtitle">Buttons (SCSS)</h2>
        <div class="flex gap-4">
          <button class="button-primary">Primary Button</button>
          <button class="button-secondary">Secondary Button</button>
        </div>
      </section>

      <!-- Alerts from SCSS -->
      <section class="section">
        <h2 class="subtitle">Alerts (SCSS)</h2>
        <div class="alert alert-info">This is an info alert</div>
        <div class="alert alert-warning">This is a warning alert</div>
        <div class="alert alert-success">This is a success alert</div>
      </section>

      <!-- Badge utilities -->
      <section class="section">
        <h2 class="subtitle">Badges</h2>
        <div class="flex gap-4">
          <span class="badge badge-success">Success</span>
          <span class="badge badge-error">Error</span>
        </div>
      </section>

      <!-- Ignored patterns - should not error -->
      <div class="dynamic-loader">This class matches ignore pattern dynamic-*</div>
      <div class="custom-widget">This class matches ignore pattern custom-*</div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p class="text-center text-gray-500">© 2024 Vue Example</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ValidComponent',
})
</script>
