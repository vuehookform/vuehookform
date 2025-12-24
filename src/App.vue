<template>
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <h1 class="title">Vue Hook Form</h1>
      <p class="subtitle">TypeScript-first form library for Vue 3</p>
      <div class="features">
        <span class="feature">Zero Config</span>
        <span class="feature">Type Safe</span>
        <span class="feature">Performant</span>
        <span class="feature">Zod Native</span>
      </div>
    </div>
  </header>

  <!-- Category Navigation -->
  <nav class="category-nav">
    <button
      v-for="category in categories"
      :key="category.id"
      :class="['category-btn', { active: activeCategory === category.id }]"
      @click="navigateToCategory(category.id)"
    >
      {{ category.label }}
      <span class="example-count">{{ category.examples.length }}</span>
    </button>
  </nav>

  <!-- Main Content -->
  <div class="main-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>{{ currentCategory.label }}</h3>
        <p>{{ currentCategory.description }}</p>
      </div>
      <ul class="example-list">
        <li
          v-for="example in currentCategory.examples"
          :key="example.id"
          :class="['example-item', { active: activeExample === example.id }]"
          @click="navigateToExample(example.id)"
        >
          {{ example.name }}
        </li>
      </ul>
    </aside>

    <!-- Content -->
    <main class="content">
      <RouterView />
    </main>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <p>{{ totalExamples }} interactive examples | Built with Vue 3 + TypeScript + Zod</p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { categories, findCategoryById, totalExamples } from '@/data/categories'

const route = useRoute()
const router = useRouter()

// Derive active states from route meta
const activeCategory = computed(() => (route.meta.categoryId as string) ?? categories[0]!.id)
const activeExample = computed(
  () => (route.meta.exampleId as string) ?? categories[0]!.examples[0]!.id,
)

const currentCategory = computed(() => findCategoryById(activeCategory.value) ?? categories[0]!)

function navigateToCategory(categoryId: string) {
  const category = findCategoryById(categoryId)
  if (category && category.examples.length > 0) {
    router.push(`/examples/${categoryId}/${category.examples[0]!.id}`)
  }
}

function navigateToExample(exampleId: string) {
  router.push(`/examples/${activeCategory.value}/${exampleId}`)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 1.5rem;
}

#app {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>

<style scoped>
.header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.features {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.feature {
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.category-nav {
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  position: sticky;
  top: 1.5rem;
  z-index: 100;
}

.category-btn {
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.category-btn:hover {
  background: #f5f5f5;
  color: #2c3e50;
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.example-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.category-btn.active .example-count {
  background: rgba(255, 255, 255, 0.2);
}

.main-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  min-height: 600px;
  scroll-margin-top: 5.5rem;
}

.sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 7rem;
}

.sidebar-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  color: #42b883;
  margin-bottom: 0.5rem;
}

.sidebar-header p {
  color: #888;
  font-size: 0.85rem;
  line-height: 1.4;
}

.example-list {
  list-style: none;
}

.example-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  color: #666;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.example-item:hover {
  background: #f5f5f5;
  color: #2c3e50;
}

.example-item.active {
  background: #42b883;
  color: white;
  font-weight: 600;
}

.content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
}

.footer {
  text-align: center;
  color: white;
  font-size: 0.9rem;
  padding: 1rem;
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .category-nav {
    flex-wrap: nowrap;
    position: static;
  }

  .category-btn {
    flex: none;
  }
}

@media (max-width: 600px) {
  body {
    padding: 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .content {
    padding: 1rem;
  }
}
</style>
