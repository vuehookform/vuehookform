<!--
  PLAIN FORM EXAMPLE

  This example demonstrates vue-hook-form WITHOUT any wrapper components.
  Just useForm + register() + native HTML inputs.

  Compare this to:
  - PrimeVue Forms: Requires <Form>, <Message>, slot syntax
  - VeeValidate: Requires defineField for each field

  Here, you just spread register() onto your inputs. That's it.
-->
<template>
  <div class="plain-form-example">
    <!-- Header -->
    <header class="header">
      <h1>Plain Form Example</h1>
      <span class="badge">Zero wrapper components</span>
      <p class="subtitle">
        Just <code>useForm</code> + <code>register()</code> + native HTML inputs
      </p>
    </header>

    <!-- The Form -->
    <section class="form-section">
      <form @submit="handleSubmit(onSubmit)" class="form">
        <!-- Name Field -->
        <div class="field">
          <label for="name">Name *</label>
          <input id="name" v-bind="register('name')" placeholder="John Doe" />
          <span v-if="formState.errors.name" class="error">
            {{ formState.errors.name }}
          </span>
        </div>

        <!-- Email Field -->
        <div class="field">
          <label for="email">Email *</label>
          <input
            id="email"
            type="email"
            v-bind="register('email')"
            placeholder="john@example.com"
          />
          <span v-if="formState.errors.email" class="error">
            {{ formState.errors.email }}
          </span>
        </div>

        <!-- Password Field -->
        <div class="field">
          <label for="password">Password *</label>
          <input
            id="password"
            type="password"
            v-bind="register('password')"
            placeholder="Min 8 characters"
          />
          <span v-if="formState.errors.password" class="error">
            {{ formState.errors.password }}
          </span>
        </div>

        <!-- Confirm Password Field -->
        <div class="field">
          <label for="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            v-bind="register('confirmPassword')"
            placeholder="Repeat password"
          />
          <span v-if="formState.errors.confirmPassword" class="error">
            {{ formState.errors.confirmPassword }}
          </span>
        </div>

        <!-- Website Field (optional) -->
        <div class="field">
          <label for="website">Website <span class="optional">(optional)</span></label>
          <input
            id="website"
            type="url"
            v-bind="register('website')"
            placeholder="https://example.com"
          />
          <span v-if="formState.errors.website" class="error">
            {{ formState.errors.website }}
          </span>
        </div>

        <!-- Terms Checkbox -->
        <div class="field checkbox-field">
          <label class="checkbox-label">
            <input type="checkbox" v-bind="register('acceptTerms')" />
            <span>I accept the terms and conditions *</span>
          </label>
          <span v-if="formState.errors.acceptTerms" class="error">
            {{ formState.errors.acceptTerms }}
          </span>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
          {{ formState.isSubmitting ? 'Creating Account...' : 'Create Account' }}
        </button>

        <!-- Form State Display -->
        <div class="form-state">
          <span :class="{ active: formState.isValid }">
            {{ formState.isValid ? 'Valid' : 'Invalid' }}
          </span>
          <span :class="{ active: formState.isDirty }">
            {{ formState.isDirty ? 'Modified' : 'Pristine' }}
          </span>
          <span v-if="formState.submitCount > 0"> Submitted: {{ formState.submitCount }}x </span>
        </div>
      </form>
    </section>

    <!-- Comparison Section -->
    <section class="comparison-section">
      <h2>Compare with Other Libraries</h2>
      <p class="comparison-intro">See how the same form looks in different Vue form libraries:</p>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- vue-hook-form -->
        <div v-if="activeTab === 'vue-hook-form'" class="code-panel">
          <div class="code-header">
            <span class="lib-name">vue-hook-form</span>
            <span class="line-count">~5 lines setup</span>
          </div>
          <pre class="code-block"><code>// Setup
const { register, handleSubmit, formState } = useForm({
  schema,
  defaultValues: { email: '', password: '' }
})

// Template - just spread register() onto inputs!
&lt;input v-bind="register('email')" /&gt;
&lt;span v-if="formState.errors.email"&gt;
  &#123;&#123; formState.errors.email &#125;&#125;
&lt;/span&gt;</code></pre>
          <ul class="pros">
            <li>Minimal boilerplate</li>
            <li>Type-safe field names</li>
            <li>Direct programmatic control</li>
          </ul>
        </div>

        <!-- PrimeVue -->
        <div v-if="activeTab === 'primevue'" class="code-panel">
          <div class="code-header">
            <span class="lib-name">PrimeVue Forms</span>
            <span class="line-count">~15+ lines setup</span>
          </div>
          <pre class="code-block"><code>// Setup - need resolver wrapper
import { zodResolver } from '@primevue/forms/resolvers'
const resolver = zodResolver(schema)
const initialValues = { email: '', password: '' }

// Template - requires slot syntax everywhere
&lt;Form v-slot="$form" :resolver="resolver"
      :initialValues="initialValues" @submit="onSubmit"&gt;
  &lt;InputText name="email" placeholder="Email" /&gt;
  &lt;Message v-if="$form.email?.invalid" severity="error"&gt;
    &#123;&#123; $form.email.error?.message &#125;&#125;
  &lt;/Message&gt;
&lt;/Form&gt;

// No programmatic access to form methods!
// Must use $form slot everywhere</code></pre>
          <ul class="cons">
            <li>Requires slot syntax ($form)</li>
            <li>Limited programmatic control</li>
            <li>More verbose error display</li>
          </ul>
        </div>

        <!-- VeeValidate -->
        <div v-if="activeTab === 'veevalidate'" class="code-panel">
          <div class="code-header">
            <span class="lib-name">VeeValidate</span>
            <span class="line-count">~10+ lines setup</span>
          </div>
          <pre class="code-block"><code>// Setup - defineField for EACH field
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(schema)
})

// Must call defineField for every single field!
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
// ...repeat for each field

// Template
&lt;input v-model="email" v-bind="emailAttrs" /&gt;
&lt;span&gt;&#123;&#123; errors.email &#125;&#125;&lt;/span&gt;</code></pre>
          <ul class="cons">
            <li>defineField per field adds boilerplate</li>
            <li>Two paradigms to learn (Composition + Components)</li>
            <li>Requires v-model binding</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Key Differentiators -->
    <section class="differentiators">
      <h2>Why vue-hook-form?</h2>
      <ul class="diff-list">
        <li>
          <strong>Minimal boilerplate</strong> &mdash; Just call <code>register('field')</code> and
          spread onto any input
        </li>
        <li>
          <strong>Uncontrolled by default</strong> &mdash; Uses DOM refs for performance, no v-model
          needed
        </li>
        <li>
          <strong>Zod as single source</strong> &mdash; Schema defines both TypeScript types AND
          validation rules
        </li>
        <li><strong>Type-safe paths</strong> &mdash; Field names are checked at compile time</li>
        <li>
          <strong>Direct control</strong> &mdash; Call setValue, getValues, validate anytime from
          script
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '../../lib'
import { z } from 'zod'

// ============================================
// STEP 1: Define schema (Zod = types + validation in one place)
// ============================================
const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    website: z.url('Must be a valid URL').optional().or(z.literal('')),
    acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ============================================
// STEP 2: Create form (that's it!)
// ============================================
const { register, handleSubmit, formState } = useForm({
  schema,
  defaultValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
    acceptTerms: false,
  },
  mode: 'onBlur',
})

// ============================================
// STEP 3: Handle submission
// ============================================
const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Form submitted:', data)
  alert(`Welcome, ${data.name}! Account created successfully.`)
}

// ============================================
// Comparison tabs state
// ============================================
const activeTab = ref<'vue-hook-form' | 'primevue' | 'veevalidate'>('vue-hook-form')

const tabs = [
  { id: 'vue-hook-form' as const, label: 'vue-hook-form' },
  { id: 'primevue' as const, label: 'PrimeVue' },
  { id: 'veevalidate' as const, label: 'VeeValidate' },
]
</script>

<style scoped>
.plain-form-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.badge {
  display: inline-block;
  background: #42b883;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.subtitle {
  color: #666;
  margin-top: 0.75rem;
}

.subtitle code {
  background: #f5f5f5;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

/* Form Section */
.form-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.optional {
  color: #999;
  font-weight: 400;
}

.field input[type='text'],
.field input[type='email'],
.field input[type='password'],
.field input[type='url'] {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.field input:focus {
  outline: none;
  border-color: #42b883;
}

.checkbox-field {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #42b883;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.submit-btn {
  padding: 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Form State Display */
.form-state {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #999;
}

.form-state span.active {
  color: #42b883;
  font-weight: 500;
}

/* Comparison Section */
.comparison-section {
  margin-bottom: 2rem;
}

.comparison-section h2 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.comparison-intro {
  color: #666;
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tab:hover {
  border-color: #42b883;
}

.tab.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.code-panel {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #2d2d2d;
  color: #fff;
  font-size: 0.85rem;
}

.lib-name {
  font-weight: 600;
}

.line-count {
  color: #888;
}

.code-block {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
}

.code-block code {
  color: #d4d4d4;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

.pros,
.cons {
  margin: 0;
  padding: 1rem;
  background: #f8f8f8;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  font-size: 0.85rem;
}

.pros li::before {
  content: '+';
  color: #42b883;
  font-weight: bold;
  margin-right: 0.35rem;
}

.cons li::before {
  content: '-';
  color: #e74c3c;
  font-weight: bold;
  margin-right: 0.35rem;
}

/* Differentiators */
.differentiators h2 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.diff-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.diff-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.diff-list li:last-child {
  border-bottom: none;
}

.diff-list code {
  background: #f5f5f5;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
