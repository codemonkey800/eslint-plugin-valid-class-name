<template>
  <div class="container">
    <h1 class="title">Ternary Expressions in :class</h1>
    <p class="subtitle">
      This component tests :class with ternary conditional expressions.
    </p>

    <!-- Simple ternary with string literals -->
    <div :class="isActive ? 'button-primary' : 'button-secondary'">
      <p>Simple ternary: active ? primary : secondary</p>
    </div>

    <!-- Ternary with Tailwind classes -->
    <div :class="isSuccess ? 'bg-green-500' : 'bg-red-500'">
      <p>Tailwind ternary: success ? green : red</p>
    </div>

    <!-- Ternary with CSS classes -->
    <div :class="showCard ? 'card' : 'section'">
      <p>CSS ternary: showCard ? card : section</p>
    </div>

    <!-- Ternary with SCSS classes -->
    <div :class="isPrimary ? 'alert-success' : 'alert-danger'">
      <p>SCSS ternary: success or danger alert</p>
    </div>

    <!-- Nested ternary -->
    <div :class="status === 'success' ? 'alert-success' : status === 'error' ? 'alert-danger' : 'alert-warning'">
      <p>Nested ternary: success, error, or warning</p>
    </div>

    <!-- Ternary with multiple classes as strings -->
    <div :class="isActive ? 'flex gap-4 items-center' : 'hidden'">
      <p>Ternary with multiple classes</p>
    </div>

    <!-- Ternary mixed with static class -->
    <div class="container" :class="isLarge ? 'text-lg' : 'text-sm'">
      <p>Static + ternary</p>
    </div>

    <!-- Ternary with logical AND -->
    <div :class="isActive && isEnabled ? 'button-primary' : 'button-secondary'">
      <p>Ternary with AND condition</p>
    </div>

    <!-- Ternary with logical OR -->
    <div :class="isError || isWarning ? 'alert-danger' : 'alert-success'">
      <p>Ternary with OR condition</p>
    </div>

    <!-- Ternary with ignored patterns -->
    <div :class="showDynamic ? 'dynamic-loader' : 'custom-widget'">
      <p>Ternary with ignored patterns</p>
    </div>

    <!-- Logical AND operator (short circuit) -->
    <div :class="isActive && 'button-primary'">
      <p>Logical AND: isActive && 'button-primary'</p>
    </div>

    <!-- Logical OR operator (short circuit) -->
    <div :class="customClass || 'button-secondary'">
      <p>Logical OR: customClass || 'button-secondary'</p>
    </div>

    <!-- Complex expression with parentheses -->
    <div :class="(isActive && isEnabled) ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-900'">
      <p>Complex expression with parentheses</p>
    </div>

    <!-- Ternary with nullish coalescing -->
    <div :class="className ?? 'card'">
      <p>Nullish coalescing: className ?? 'card'</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'TernaryExpressions',
  setup() {
    const isActive = ref(true)
    const isSuccess = ref(true)
    const showCard = ref(false)
    const isPrimary = ref(true)
    const status = ref('success')
    const isLarge = ref(true)
    const isEnabled = ref(true)
    const isError = ref(false)
    const isWarning = ref(false)
    const showDynamic = ref(true)
    const customClass = ref('')
    const className = ref(null)

    return {
      isActive,
      isSuccess,
      showCard,
      isPrimary,
      status,
      isLarge,
      isEnabled,
      isError,
      isWarning,
      showDynamic,
      customClass,
      className,
    }
  },
})
</script>
