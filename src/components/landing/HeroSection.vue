<template>
  <section class="pt-20 lg:pt-32 pb-12 text-center px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Title -->
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
        Vue Hook Form
      </h1>

      <!-- Tagline -->
      <p class="mt-6 text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
        TypeScript-first form library for Vue 3, <br />
        inspired by React Hook Form
      </p>

      <!-- Feature Pills -->
      <div class="flex flex-wrap justify-center gap-3 mt-8">
        <span
          v-for="feature in features"
          :key="feature"
          class="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20"
        >
          {{ feature }}
        </span>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 mt-12">
        <RouterLink
          to="/docs"
          class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
        >
          Get Started
          <span
            class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform"
          >
            arrow_forward
          </span>
        </RouterLink>

        <a
          href="https://github.com/vuehookform/core"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const features = ['Zero Config', 'Type Safe', 'Performant', 'Zod Native']
</script>
