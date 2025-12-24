<template>
  <ExampleLayout
    title="Form Reset"
    description="Reset forms to their default values or to new values. The reset() method clears errors, touched fields, dirty state, and optionally sets new values."
    :features="['reset()', 'reset(newValues)', 'Clear errors', 'Reset state']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <FormField name="firstName" label="First Name" required placeholder="John" />
        <FormField name="lastName" label="Last Name" required placeholder="Doe" />
        <FormField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="john@example.com"
        />

        <FormStateDebug :form-state="formState" show-touched />

        <!-- Reset Options -->
        <div class="reset-options">
          <h4>Reset Options:</h4>
          <div class="reset-buttons">
            <button type="button" @click="resetToDefaults" class="reset-btn">
              Reset to Defaults
            </button>
            <button type="button" @click="resetToNewValues" class="reset-btn blue">
              Reset to "Jane Doe"
            </button>
            <button type="button" @click="clearForm" class="reset-btn red">Clear Form</button>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="submit-btn">Submit</button>
        </div>
      </form>
    </FormProvider>

    <!-- Explanation -->
    <div class="explanation">
      <h4>What reset() does:</h4>
      <ul>
        <li><strong>Clears all errors</strong> - Validation errors are removed</li>
        <li><strong>Resets dirty state</strong> - Form becomes "pristine" again</li>
        <li><strong>Clears touched fields</strong> - All fields become "untouched"</li>
        <li><strong>Resets submit count</strong> - Submit counter goes back to 0</li>
        <li><strong>Updates DOM inputs</strong> - Input elements reflect new values</li>
      </ul>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.email('Invalid email'),
})

// Initialize with default values
const form = useForm({
  schema,
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, reset } = form

// Reset to original defaults
function resetToDefaults() {
  reset()
}

// Reset to new values
function resetToNewValues() {
  reset({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
  })
}

// Clear form (empty values)
function clearForm() {
  reset({
    firstName: '',
    lastName: '',
    email: '',
  })
}

const onSubmit = (data: z.infer<typeof schema>) => {
  alert(`Submitted: ${data.firstName} ${data.lastName} (${data.email})`)
}

const codeSnippets = [
  {
    title: 'Basic Reset',
    language: 'typescript' as const,
    code: `const { reset } = useForm({
  schema,
  defaultValues: { name: 'John', email: '' }
})

// Reset to original defaultValues
reset()

// Form state after reset:
// - errors: {}
// - isDirty: false
// - touchedFields: Set()
// - submitCount: 0`,
  },
  {
    title: 'Reset with Values',
    language: 'typescript' as const,
    code: `// Reset to completely new values
reset({
  name: 'Jane',
  email: 'jane@example.com'
})

// This becomes the new "default" state
// Future calls to reset() will use these values

// Common patterns:
// 1. After successful save - reset to saved data
// 2. Switching between records - reset to new record
// 3. Clear form - reset to empty values`,
  },
  {
    title: 'Use Cases',
    language: 'typescript' as const,
    code: `// After successful form submission
const onSubmit = async (data) => {
  await saveData(data)
  reset()  // Clear form for next entry
}

// When loading existing data
const loadUser = async (id) => {
  const user = await fetchUser(id)
  reset(user)  // Populate form with fetched data
}

// Cancel editing
const onCancel = () => {
  reset()  // Revert to original values
}`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reset-options {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.reset-options h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.reset-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #35a372;
}

.reset-btn.blue {
  background: #667eea;
}

.reset-btn.blue:hover {
  background: #5a67d8;
}

.reset-btn.red {
  background: #e74c3c;
}

.reset-btn.red:hover {
  background: #c0392b;
}

.actions {
  display: flex;
  gap: 1rem;
}

.submit-btn {
  flex: 1;
  padding: 1rem;
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

.explanation {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #e8f5e9;
  border-radius: 8px;
}

.explanation h4 {
  margin: 0 0 1rem 0;
  color: #2e7d32;
}

.explanation ul {
  margin: 0;
  padding-left: 1.5rem;
}

.explanation li {
  margin-bottom: 0.5rem;
  color: #1b5e20;
}

.explanation li strong {
  color: #2e7d32;
}
</style>
