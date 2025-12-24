<template>
  <!-- INTERMEDIATE: This component knows NOTHING about the form -->
  <!-- It simply renders the sections - demonstrates zero prop drilling -->
  <div class="sections-wrapper">
    <CustomerSection />
    <ShippingSection />
    <ItemsSection />
  </div>
</template>

<script setup lang="ts">
// No useFormContext here! Just composition.
// This component has ZERO form awareness - it's just a layout wrapper.
import CustomerSection from './CustomerSection.vue'
import ShippingSection from './ShippingSection.vue'
import ItemsSection from './ItemsSection.vue'
</script>

<style scoped>
.sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
