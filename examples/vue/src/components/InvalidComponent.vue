<template>
  <div class="container">
    <!-- Invalid CSS class names - these should trigger ESLint errors -->
    <header class="invalid-header">
      <h1 class="nonexistent-title">Invalid Component</h1>
    </header>

    <main class="main-content">
      <!-- Mix of valid and invalid classes -->
      <div class="card fake-class">
        <p class="text-lg invalid-text">
          This component contains invalid class names that should be caught by ESLint.
        </p>
      </div>

      <!-- Invalid Tailwind utilities -->
      <div class="invalid-tailwind-class bg-invalid-500">
        Invalid Tailwind classes
      </div>

      <!-- Invalid SCSS classes -->
      <button class="button-invalid">Invalid Button</button>
      <div class="alert-invalid">Invalid Alert</div>

      <!-- Invalid utility classes -->
      <div class="badge-invalid">Invalid Badge</div>
      <div class="nonexistent-utility">Invalid Utility</div>

      <!-- Multiple invalid classes -->
      <div class="fake-one fake-two fake-three">
        Multiple invalid classes
      </div>

      <!-- Valid class mixed with invalid -->
      <div class="container invalid-container-modifier">
        Valid + Invalid
      </div>
    </main>

    <footer class="invalid-footer">
      <p class="nonexistent-class">Footer content</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InvalidComponent',
})
</script>
