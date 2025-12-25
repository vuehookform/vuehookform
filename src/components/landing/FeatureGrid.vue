<template>
  <section class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Section Header -->
      <h2 class="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Why Vue Hook Form?</h2>
      <p class="text-white/70 text-center mb-12 max-w-2xl mx-auto">
        A form library that gets out of your way. Define once, validate everywhere.
      </p>

      <!-- Feature Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
        >
          <!-- Icon -->
          <div
            class="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
          >
            <span class="material-symbols-outlined text-3xl text-white">
              {{ feature.icon }}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold text-white mb-2">
            {{ feature.title }}
          </h3>

          <!-- Description -->
          <p class="text-white/70 text-sm leading-relaxed">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    icon: 'settings_suggest',
    title: 'Zero Config',
    description:
      "Define your schema with Zod and you're done. No wrapper components, no complex setup required.",
  },
  {
    icon: 'code',
    title: 'Type Safe',
    description:
      'TypeScript-first with full type inference. Field names are checked at compile time.',
  },
  {
    icon: 'bolt',
    title: 'Performant',
    description:
      'Uncontrolled inputs by default means no re-renders during typing. Just fast, responsive forms.',
  },
  {
    icon: 'verified',
    title: 'Zod Native',
    description: 'Your schema defines both TypeScript types AND validation rules in one place.',
  },
]
</script>
