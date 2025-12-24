<template>
  <div class="example-layout" :class="{ 'example-layout--side-by-side': sideBySide }">
    <header class="example-layout__header">
      <h2 class="example-layout__title">{{ title }}</h2>
      <p class="example-layout__description">{{ description }}</p>
      <div v-if="features?.length" class="example-layout__features">
        <span v-for="feature in features" :key="feature" class="example-layout__feature">
          {{ feature }}
        </span>
      </div>
    </header>

    <!-- Tab navigation for mobile/stacked view -->
    <nav v-if="!sideBySide && codeSnippets?.length" class="example-layout__tabs">
      <button
        :class="['example-layout__tab', { active: activeTab === 'demo' }]"
        @click="activeTab = 'demo'"
      >
        Live Demo
      </button>
      <button
        :class="['example-layout__tab', { active: activeTab === 'code' }]"
        @click="activeTab = 'code'"
      >
        Code
      </button>
    </nav>

    <div class="example-layout__content">
      <!-- Demo Panel -->
      <div v-show="sideBySide || activeTab === 'demo'" class="example-layout__demo">
        <slot />
      </div>

      <!-- Code Panel -->
      <div
        v-if="codeSnippets?.length"
        v-show="sideBySide || activeTab === 'code'"
        class="example-layout__code"
      >
        <slot name="code">
          <!-- Snippet tabs if multiple -->
          <div v-if="codeSnippets.length > 1" class="example-layout__snippet-tabs">
            <button
              v-for="(snippet, idx) in codeSnippets"
              :key="idx"
              :class="['example-layout__snippet-tab', { active: activeSnippetIndex === idx }]"
              @click="activeSnippetIndex = idx"
            >
              {{ snippet.title }}
            </button>
          </div>

          <CodeSnippet
            v-for="(snippet, idx) in codeSnippets"
            v-show="activeSnippetIndex === idx"
            :key="idx"
            :code="snippet.code"
            :language="snippet.language"
            :title="codeSnippets.length === 1 ? snippet.title : undefined"
          />
        </slot>
      </div>
    </div>

    <footer v-if="$slots.footer" class="example-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CodeSnippet from './CodeSnippet.vue'

interface CodeSnippetDef {
  title: string
  code: string
  language?: 'typescript' | 'vue' | 'html' | 'json'
}

interface Props {
  /** Example title */
  title: string
  /** Description text */
  description: string
  /** Features demonstrated (for tags) */
  features?: string[]
  /** Code snippets to display */
  codeSnippets?: CodeSnippetDef[]
  /** Show form and code side-by-side on large screens */
  sideBySide?: boolean
}

withDefaults(defineProps<Props>(), {
  sideBySide: false,
})

const activeTab = ref<'demo' | 'code'>('demo')
const activeSnippetIndex = ref(0)
</script>

<style scoped>
.example-layout {
  max-width: 100%;
}

.example-layout__header {
  margin-bottom: 1.5rem;
}

.example-layout__title {
  color: #42b883;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.example-layout__description {
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.example-layout__features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.example-layout__feature {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.example-layout__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.example-layout__tab {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.example-layout__tab:hover {
  border-color: #42b883;
  color: #42b883;
}

.example-layout__tab.active {
  background: #42b883;
  border-color: #42b883;
  color: white;
}

.example-layout__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.example-layout--side-by-side .example-layout__content {
  flex-direction: row;
  align-items: flex-start;
}

.example-layout--side-by-side .example-layout__demo,
.example-layout--side-by-side .example-layout__code {
  flex: 1;
  min-width: 0;
}

.example-layout__demo {
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.example-layout__code {
  min-width: 0;
}

.example-layout__snippet-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.example-layout__snippet-tab {
  padding: 0.5rem 1rem;
  background: #2d2d2d;
  border: none;
  color: #888;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
}

.example-layout__snippet-tab:hover {
  color: #e0e0e0;
}

.example-layout__snippet-tab.active {
  background: #1e1e1e;
  color: #e0e0e0;
}

.example-layout__footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 900px) {
  .example-layout--side-by-side .example-layout__content {
    flex-direction: column;
  }
}
</style>
