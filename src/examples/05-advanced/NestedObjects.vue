<template>
  <ExampleLayout
    title="Nested Objects"
    description="Handle deeply nested form structures with dot-notation paths. Access nested errors and build complex data structures with full type safety."
    :features="['Deep paths', 'Nested errors', 'Complex structures', 'Type-safe paths']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Personal Section -->
        <fieldset class="fieldset">
          <legend>Personal Information</legend>
          <div class="row">
            <FormField
              name="user.personal.firstName"
              label="First Name"
              required
              placeholder="John"
            />
            <FormField name="user.personal.lastName" label="Last Name" required placeholder="Doe" />
          </div>
          <FormField name="user.personal.dateOfBirth" label="Date of Birth" type="date" />
        </fieldset>

        <!-- Contact Section -->
        <fieldset class="fieldset">
          <legend>Contact Information</legend>
          <FormField
            name="user.contact.email"
            label="Email"
            type="email"
            required
            placeholder="john@example.com"
          />
          <FormField
            name="user.contact.phone"
            label="Phone"
            type="tel"
            placeholder="(555) 123-4567"
          />

          <!-- Nested Address -->
          <div class="nested-section">
            <h4>Address</h4>
            <FormField
              name="user.contact.address.street"
              label="Street"
              required
              placeholder="123 Main St"
            />
            <div class="row">
              <FormField
                name="user.contact.address.city"
                label="City"
                required
                placeholder="New York"
              />
              <FormField
                name="user.contact.address.state"
                label="State"
                required
                placeholder="NY"
              />
            </div>
            <div class="row">
              <FormField
                name="user.contact.address.zipCode"
                label="Zip Code"
                required
                placeholder="10001"
              />
              <FormField
                name="user.contact.address.country"
                label="Country"
                required
                placeholder="USA"
              />
            </div>
          </div>
        </fieldset>

        <!-- Preferences Section -->
        <fieldset class="fieldset">
          <legend>Preferences</legend>
          <FormCheckbox name="preferences.newsletter" label="Subscribe to newsletter" />
          <FormCheckbox name="preferences.smsNotifications" label="Receive SMS notifications" />

          <div class="field-group">
            <label class="field-label">Theme</label>
            <select v-bind="register('preferences.theme')" class="select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Language</label>
            <select v-bind="register('preferences.language')" class="select">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </fieldset>

        <!-- Data Preview -->
        <div class="data-preview">
          <h4>Form Data Structure</h4>
          <pre>{{ JSON.stringify(watchAll, null, 2) }}</pre>
        </div>

        <FormStateDebug :form-state="formState" show-errors />
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormCheckbox, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  user: z.object({
    personal: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      dateOfBirth: z.string().optional(),
    }),
    contact: z.object({
      email: z.email('Invalid email address'),
      phone: z.string().optional(),
      address: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
        country: z.string().min(1, 'Country is required'),
      }),
    }),
  }),
  preferences: z.object({
    newsletter: z.boolean(),
    smsNotifications: z.boolean(),
    theme: z.enum(['light', 'dark', 'system']),
    language: z.enum(['en', 'es', 'fr', 'de']),
  }),
})

const form = useForm({
  schema,
  defaultValues: {
    user: {
      personal: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
      },
      contact: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
      },
    },
    preferences: {
      newsletter: false,
      smsNotifications: false,
      theme: 'system' as const,
      language: 'en' as const,
    },
  },
  mode: 'onBlur',
})

const { register, handleSubmit, formState, watch } = form

const watchAllRef = watch()
const watchAll = computed(() => watchAllRef.value)

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert(`Welcome, ${data.user.personal.firstName} ${data.user.personal.lastName}!`)
}

const codeSnippets = [
  {
    title: 'Nested Schema',
    language: 'typescript' as const,
    code: `const schema = z.object({
  user: z.object({
    personal: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
    }),
    contact: z.object({
      email: z.email(),
      address: z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        // ... more fields
      }),
    }),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
  }),
})`,
  },
  {
    title: 'Dot-Notation Paths',
    language: 'vue' as const,
    code: `<!-- Register deeply nested fields -->
<input v-bind="register('user.personal.firstName')" />
<input v-bind="register('user.contact.address.city')" />
<select v-bind="register('preferences.theme')">
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>

<!-- All paths are type-checked! -->
<!-- register('user.invalid') // TypeScript error -->`,
  },
  {
    title: 'Nested Errors',
    language: 'typescript' as const,
    code: `// Errors mirror the data structure
formState.errors.user?.personal?.firstName // string | undefined
formState.errors.user?.contact?.address?.city // string | undefined

// Or use useFormErrors for path-based access
const { getError } = useFormErrors(formState)
getError('user.contact.address.city') // string | undefined`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fieldset {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.fieldset legend {
  font-weight: 600;
  color: #42b883;
  padding: 0 0.5rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.nested-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.nested-section h4 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.select:focus {
  outline: none;
  border-color: #42b883;
}

.data-preview {
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 8px;
  color: #d4d4d4;
}

.data-preview h4 {
  margin: 0 0 0.5rem 0;
  color: #42b883;
  font-size: 0.9rem;
}

.data-preview pre {
  margin: 0;
  font-size: 0.7rem;
  max-height: 250px;
  overflow: auto;
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
}

.submit-btn:hover {
  background: #35a372;
}
</style>
