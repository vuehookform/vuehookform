<template>
  <nav class="p-4">
    <div v-for="category in categories" :key="category.id" class="mb-6 last:mb-0">
      <!-- Category Header -->
      <h3 class="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
        {{ category.label }}
      </h3>

      <!-- Example Links -->
      <ul class="mt-1 space-y-1">
        <li v-for="example in category.examples" :key="example.id">
          <RouterLink
            :to="`/docs/${category.id}/${example.id}`"
            class="block px-3 py-2 text-sm rounded-lg transition-all duration-150"
            :class="[
              activeExampleId === example.id
                ? 'bg-emerald-500 text-white font-semibold shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            ]"
            @click="emit('navigate', example.id)"
          >
            {{ example.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { categories } from '@/data/categories'

const route = useRoute()

const activeExampleId = computed(() => route.meta.exampleId as string | undefined)

const emit = defineEmits<{
  navigate: [exampleId: string]
}>()
</script>
