<template>
  <footer class="py-12 border-t border-white/10">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-6">
        <!-- Logo -->
        <div class="text-white font-bold text-lg">
          Vue Hook Form
        </div>

        <!-- Links -->
        <div class="flex items-center gap-6">
          <RouterLink
            to="/docs"
            class="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Documentation
          </RouterLink>
          <a
            href="https://github.com/vuehookform/core"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@vuehookform/core"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            npm
          </a>
        </div>

        <!-- Copyright -->
        <div class="text-white/50 text-sm">
          MIT License
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
