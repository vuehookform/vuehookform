<template>
  <ExampleLayout
    title="Basic Context Injection"
    description="Share form state between parent and child components using provideForm() and useFormContext(). Child components can access all form methods without prop drilling."
    :features="['provideForm()', 'useFormContext()', 'No prop drilling', 'Child components']"
    :code-snippets="codeSnippets"
  >
    <form @submit.prevent="handleSubmit(onSubmit)" class="form">
      <!-- Child component accesses form via context - no props needed! -->
      <ContactFormFields />

      <FormStateDebug :form-state="formState" />

      <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
        {{ formState.isSubmitting ? 'Sending...' : 'Send Message' }}
      </button>
    </form>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm, provideForm } from '../../../lib'
import { FormStateDebug } from '../../../components/form'
import { ExampleLayout } from '../../../components/showcase'
import ContactFormFields from './ContactFormFields.vue'
import { contactSchema, type ContactForm } from './schema'

// Initialize form in parent component
const form = useForm({
  schema: contactSchema,
  defaultValues: {
    email: '',
    message: '',
  },
  mode: 'onBlur',
})

// IMPORTANT: Call provideForm() to make form available to all descendants
// This is the key step - without this, useFormContext() will throw an error
provideForm(form)

const { handleSubmit, formState } = form

const onSubmit = (data: ContactForm) => {
  console.log('Contact form submitted:', data)
  alert(`Message sent from ${data.email}!`)
}

const codeSnippets = [
  {
    title: 'Parent Setup',
    language: 'typescript' as const,
    code: `// Parent component: create form and provide to children
const form = useForm({
  schema: contactSchema,
  defaultValues: { email: '', message: '' },
  mode: 'onBlur',
})

// Make form available to all descendant components
provideForm(form)

const { handleSubmit, formState } = form`,
  },
  {
    title: 'Child Component',
    language: 'typescript' as const,
    code: `// Child component: access form via context
// No props needed - works at any nesting depth!
const { register, formState } = useFormContext<typeof contactSchema>()

// Now use register() and formState just like in the parent
// TypeScript provides full autocomplete for field names`,
  },
  {
    title: 'Template',
    language: 'vue' as const,
    code: `<!-- Parent template - no props passed to child -->
<form @submit.prevent="handleSubmit(onSubmit)">
  <ContactFormFields />  <!-- Accesses form via context -->

  <button type="submit" :disabled="formState.isSubmitting">
    Send Message
  </button>
</form>

<!-- Compare with prop drilling (don't do this): -->
<!-- <ContactFormFields :register="register" :formState="formState" /> -->`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
