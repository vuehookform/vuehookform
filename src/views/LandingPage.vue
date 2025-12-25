<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700">
    <HeroSection />
    <FeatureGrid />
    <CodeShowcase />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '@/components/landing/HeroSection.vue'
import FeatureGrid from '@/components/landing/FeatureGrid.vue'
import CodeShowcase from '@/components/landing/CodeShowcase.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>
