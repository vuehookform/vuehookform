<template>
  <ExampleLayout
    title="Controlled vs Uncontrolled Inputs"
    description="Compare uncontrolled inputs (default, uses DOM refs) vs controlled inputs (uses Vue reactivity). Uncontrolled inputs have better performance, while controlled inputs allow real-time value tracking."
    :features="['controlled: true', 'v-model binding', 'watch() comparison']"
    :code-snippets="codeSnippets"
  >
    <div class="comparison">
      <!-- Uncontrolled Side -->
      <div class="side">
        <h3 class="side-title">Uncontrolled (Default)</h3>
        <p class="side-desc">Values read from DOM on submit. Better performance for large forms.</p>

        <form @submit="uncontrolledForm.handleSubmit(onSubmitUncontrolled)" class="form">
          <div class="field">
            <label>Username</label>
            <input v-bind="uncontrolledForm.register('username')" placeholder="Type here..." />
          </div>
          <div class="field">
            <label>Bio</label>
            <textarea
              v-bind="uncontrolledForm.register('bio') as any"
              placeholder="Tell us about yourself..."
              rows="3"
            />
          </div>

          <div class="value-display">
            <strong>Current Values (via watch):</strong>
            <pre>{{ JSON.stringify(uncontrolledValues, null, 2) }}</pre>
          </div>

          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>

      <!-- Controlled Side -->
      <div class="side">
        <h3 class="side-title">Controlled</h3>
        <p class="side-desc">Values managed by Vue reactivity. Real-time tracking available.</p>

        <form @submit="controlledForm.handleSubmit(onSubmitControlled)" class="form">
          <div class="field">
            <label>Username</label>
            <input
              v-bind="usernameField"
              v-model="usernameField.value!.value"
              placeholder="Type here..."
            />
          </div>
          <div class="field">
            <label>Bio</label>
            <textarea
              :name="bioField.name"
              :ref="bioField.ref"
              @input="bioField.onInput"
              @blur="bioField.onBlur"
              v-model="bioField.value!.value as string"
              placeholder="Tell us about yourself..."
              rows="3"
            />
          </div>

          <div class="value-display">
            <strong>Current Values (real-time):</strong>
            <pre>{{ JSON.stringify(controlledValues, null, 2) }}</pre>
          </div>

          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
    </div>

    <!-- Character Counter Example -->
    <div class="bonus-example">
      <h3>Bonus: Character Counter with Controlled Input</h3>
      <p class="side-desc">
        Controlled inputs enable real-time UI updates like character counters.
      </p>

      <div class="field">
        <label>Tweet (max 280 chars)</label>
        <textarea
          :name="tweetField.name"
          :ref="tweetField.ref"
          @input="tweetField.onInput"
          @blur="tweetField.onBlur"
          v-model="tweetField.value!.value as string"
          placeholder="What's happening?"
          rows="3"
          :class="{ 'over-limit': tweetLength > 280 }"
        />
        <div class="char-counter" :class="{ 'over-limit': tweetLength > 280 }">
          {{ tweetLength }} / 280
        </div>
      </div>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '../../lib'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(1, 'Username required'),
  bio: z.string().optional(),
})

const tweetSchema = z.object({
  tweet: z.string().max(280, 'Tweet too long'),
})

// Uncontrolled form (default)
const uncontrolledForm = useForm({
  schema,
  defaultValues: { username: '', bio: '' },
})

// Controlled form
const controlledForm = useForm({
  schema,
  defaultValues: { username: '', bio: '' },
})

// Tweet form for bonus example
const tweetForm = useForm({
  schema: tweetSchema,
  defaultValues: { tweet: '' },
})

// Register controlled fields
const usernameField = controlledForm.register('username', { controlled: true })
const bioField = controlledForm.register('bio', { controlled: true })
const tweetField = tweetForm.register('tweet', { controlled: true })

// Watch uncontrolled form values
const uncontrolledValues = uncontrolledForm.watch()

// Computed controlled values
const controlledValues = computed(() => ({
  username: usernameField.value?.value || '',
  bio: bioField.value?.value || '',
}))

// Tweet length for character counter
const tweetLength = computed(() => {
  const value = tweetField.value?.value
  return typeof value === 'string' ? value.length : 0
})

const onSubmitUncontrolled = (data: z.infer<typeof schema>) => {
  alert(`Uncontrolled: ${data.username}`)
}

const onSubmitControlled = (data: z.infer<typeof schema>) => {
  alert(`Controlled: ${data.username}`)
}

const codeSnippets = [
  {
    title: 'Uncontrolled',
    language: 'typescript' as const,
    code: `// Default: uncontrolled (DOM refs)
const { register } = useForm({ schema })

// Just spread the register return
<input v-bind="register('username')" />

// Values read from DOM on submit`,
  },
  {
    title: 'Controlled',
    language: 'typescript' as const,
    code: `// Controlled: Vue reactivity
const { register } = useForm({ schema })

// Pass controlled: true to get a value ref
const field = register('username', { controlled: true })

// Use v-model with the value ref
<input v-bind="field" v-model="field.value.value" />

// Real-time access to value`,
  },
  {
    title: 'Use Cases',
    language: 'typescript' as const,
    code: `// When to use controlled inputs:
// 1. Character counters
// 2. Real-time validation feedback
// 3. Dependent field updates
// 4. Live preview features

// When to use uncontrolled (default):
// 1. Simple forms
// 2. Large forms (better performance)
// 3. When you don't need live values`,
  },
]
</script>

<style scoped>
.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .comparison {
    grid-template-columns: 1fr;
  }
}

.side {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.side-title {
  color: #42b883;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.side-desc {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 1rem 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.field input,
.field textarea {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #42b883;
}

.field textarea.over-limit {
  border-color: #e74c3c;
}

.value-display {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.85rem;
}

.value-display pre {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  overflow-x: auto;
}

.submit-btn {
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:hover {
  background: #35a372;
}

.bonus-example {
  padding: 1.5rem;
  border: 2px dashed #42b883;
  border-radius: 8px;
  background: #f8fff8;
}

.bonus-example h3 {
  color: #42b883;
  margin: 0 0 0.5rem 0;
}

.char-counter {
  text-align: right;
  font-size: 0.85rem;
  color: #666;
}

.char-counter.over-limit {
  color: #e74c3c;
  font-weight: 600;
}
</style>
