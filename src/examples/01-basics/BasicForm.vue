<template>
  <ExampleLayout
    title="Basic Form Example"
    description="Demonstrates basic form handling with Zod validation and TypeScript inference. The simplest way to get started with Vue Hook Form."
    :features="['register()', 'handleSubmit()', 'formState', 'Zod validation']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit, onError)" class="form">
        <FormField name="name" label="Name" required placeholder="John Doe" />
        <FormField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="john@example.com"
        />
        <FormField name="age" label="Age" type="number" required placeholder="18" />
        <FormCheckbox name="acceptTerms" label="I accept the terms and conditions" required />

        <FormStateDebug :form-state="formState" />

        <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
          {{ formState.isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm, type FieldErrors } from '../../lib'
import { FormProvider, FormField, FormCheckbox, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

// Define form schema with Zod
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  age: z.string().refine((val) => !val || Number(val) >= 18, {
    message: 'Must be 18 or older',
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
})

// Initialize form
const form = useForm({
  schema: userSchema,
  defaultValues: {
    name: '',
    email: '',
    age: '',
    acceptTerms: false,
  },
  mode: 'onBlur', // Validate on blur
})

const { handleSubmit, formState } = form

// Handle successful submission
const onSubmit = (data: z.infer<typeof userSchema>) => {
  console.log('Form submitted:', data)
  alert(`Welcome, ${data.name}!`)
}

// Handle validation errors
const onError = (errors: FieldErrors<z.infer<typeof userSchema>>) => {
  console.log('Validation errors:', errors)
}

const codeSnippets = [
  {
    title: 'Schema',
    language: 'typescript' as const,
    code: `const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  age: z.string().refine((val) => !val || Number(val) >= 18, {
    message: 'Must be 18 or older',
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
})`,
  },
  {
    title: 'Setup',
    language: 'typescript' as const,
    code: `const form = useForm({
  schema: userSchema,
  defaultValues: {
    name: '',
    email: '',
    age: '',
    acceptTerms: false,
  },
  mode: 'onBlur', // Validate on blur
})

const { handleSubmit, formState } = form`,
  },
  {
    title: 'Template',
    language: 'vue' as const,
    code: `<FormProvider :form="form">
  <form @submit.prevent="handleSubmit(onSubmit, onError)">
    <FormField name="name" label="Name" required />
    <FormField name="email" label="Email" type="email" required />
    <FormField name="age" label="Age" type="number" required />
    <FormCheckbox name="acceptTerms" label="I accept the terms" required />

    <button type="submit" :disabled="formState.isSubmitting">
      Submit
    </button>
  </form>
</FormProvider>`,
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
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
