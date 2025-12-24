<template>
  <ExampleLayout
    title="Multiple Independent Forms"
    description="Handle multiple forms on a single page. Each form wrapper creates its own isolated context - changes in one form don't affect the other. Great for pages with login + signup, or multiple data entry forms."
    :features="[
      'Multiple forms',
      'Isolated contexts',
      'Different validation modes',
      'Independent state',
      'Event coordination',
    ]"
    :code-snippets="codeSnippets"
  >
    <div class="page-layout">
      <div class="forms-grid">
        <!-- Each wrapper creates its own isolated context -->
        <LoginFormWrapper @submit="onLoginSubmit" />
        <FeedbackFormWrapper @submit="onFeedbackSubmit" />
      </div>

      <div class="submissions-panel">
        <h4 class="submissions-title">Submissions Log</h4>
        <div v-if="submissions.length === 0" class="submissions-empty">
          No submissions yet. Try submitting either form!
        </div>
        <div v-else class="submissions-list">
          <div
            v-for="(sub, idx) in submissions"
            :key="idx"
            :class="['submission-item', 'submission-item--' + sub.type]"
          >
            <span class="submission-type">{{ sub.type }}</span>
            <pre class="submission-data">{{ JSON.stringify(sub.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ExampleLayout } from '../../../components/showcase'
import LoginFormWrapper from './LoginFormWrapper.vue'
import FeedbackFormWrapper from './FeedbackFormWrapper.vue'

// Track submissions from both forms
const submissions = ref<{ type: string; data: unknown }[]>([])

const onLoginSubmit = (data: unknown) => {
  submissions.value.unshift({ type: 'login', data })
}

const onFeedbackSubmit = (data: unknown) => {
  submissions.value.unshift({ type: 'feedback', data })
}

const codeSnippets = [
  {
    title: 'Isolated Contexts',
    language: 'typescript' as const,
    code: `// Each form wrapper creates its OWN isolated context
// They use the same Symbol key but are isolated by component boundary

const LoginFormWrapper = defineComponent({
  setup() {
    const form = useForm({
      schema: loginSchema,
      mode: 'onBlur',
    })
    provideForm(form)  // Context 1 - for login descendants
    // ...
  },
})

const FeedbackFormWrapper = defineComponent({
  setup() {
    const form = useForm({
      schema: feedbackSchema,
      mode: 'onChange',
    })
    provideForm(form)  // Context 2 - for feedback descendants
    // ...
  },
})`,
  },
  {
    title: 'Page Layout',
    language: 'vue' as const,
    code:
      `<!-- Parent page coordinates submissions via events -->
<template>
  <div class="forms-grid">
    <LoginFormWrapper @submit="onLoginSubmit" />
    <FeedbackFormWrapper @submit="onFeedbackSubmit" />
  </div>
</template>

<script setup>
// Forms emit their data - parent doesn't access their context
const onLoginSubmit = (data) => {
  console.log('Login:', data)
}
const onFeedbackSubmit = (data) => {
  console.log('Feedback:', data)
}
<` + `/script>`,
  },
  {
    title: 'Different Modes',
    language: 'typescript' as const,
    code: `// Each form can use different validation strategies!

// Login: validates on blur (less intrusive)
const loginForm = useForm({
  schema: loginSchema,
  mode: 'onBlur',
})

// Feedback: validates on change (real-time feedback)
const feedbackForm = useForm({
  schema: feedbackSchema,
  mode: 'onChange',
})

// State is completely independent:
// - loginForm.formState.submitCount doesn't affect feedbackForm
// - Errors in one don't appear in the other
// - Resetting one doesn't touch the other`,
  },
]
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.submissions-panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
}

.submissions-title {
  margin: 0 0 0.75rem 0;
  color: #374151;
  font-size: 0.95rem;
}

.submissions-empty {
  color: #9ca3af;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.submission-item {
  padding: 0.75rem;
  border-radius: 6px;
  background: white;
  border-left: 3px solid;
}

.submission-item--login {
  border-left-color: #3b82f6;
}

.submission-item--feedback {
  border-left-color: #f59e0b;
}

.submission-type {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.submission-data {
  margin: 0;
  font-size: 0.8rem;
  color: #4b5563;
  overflow-x: auto;
}
</style>
