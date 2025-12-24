<template>
  <ExampleLayout
    title="Dynamic Field Arrays"
    description="Manage dynamic form arrays with the fields() API. Add, remove, and iterate over array items with stable keys for Vue's reconciliation."
    :features="['fields()', 'append()', 'remove()', 'Stable keys', 'Nested validation']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <FormField name="name" label="Your Name" required placeholder="John Doe" />

        <!-- Addresses Section -->
        <div class="array-section">
          <div class="section-header">
            <h3>Addresses</h3>
            <button
              type="button"
              @click="addressFields.append({ street: '', city: '', zipCode: '' })"
              class="add-btn"
            >
              + Add Address
            </button>
          </div>

          <!-- Address Items -->
          <div v-for="(field, idx) in addressFields.value" :key="field.key" class="array-card">
            <div class="card-header">
              <span class="card-title">Address {{ idx + 1 }}</span>
              <span class="card-key">key: {{ field.key }}</span>
              <button
                v-if="addressFields.value.length > 1"
                type="button"
                @click="field.remove()"
                class="remove-btn"
              >
                Remove
              </button>
            </div>

            <div class="card-body">
              <div class="field-group">
                <label>Street *</label>
                <input
                  v-bind="register(`addresses.${idx}.street`)"
                  placeholder="123 Main St"
                  class="input"
                />
                <span v-if="getError(`addresses.${idx}.street`)" class="error">
                  {{ getError(`addresses.${idx}.street`) }}
                </span>
              </div>

              <div class="row">
                <div class="field-group">
                  <label>City *</label>
                  <input
                    v-bind="register(`addresses.${idx}.city`)"
                    placeholder="New York"
                    class="input"
                  />
                  <span v-if="getError(`addresses.${idx}.city`)" class="error">
                    {{ getError(`addresses.${idx}.city`) }}
                  </span>
                </div>

                <div class="field-group">
                  <label>Zip Code *</label>
                  <input
                    v-bind="register(`addresses.${idx}.zipCode`)"
                    placeholder="12345"
                    maxlength="5"
                    class="input"
                  />
                  <span v-if="getError(`addresses.${idx}.zipCode`)" class="error">
                    {{ getError(`addresses.${idx}.zipCode`) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Array-level error -->
          <span v-if="typeof formState.errors.addresses === 'string'" class="error">
            {{ formState.errors.addresses }}
          </span>
        </div>

        <FormStateDebug :form-state="formState" />

        <div class="info-panel">
          <strong>Array Info:</strong>
          <span>{{ addressFields.value.length }} address(es)</span>
        </div>

        <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { useFormErrors } from '../../composables'
import { z } from 'zod'

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Must be 5 digits'),
})

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
})

const form = useForm({
  schema,
  defaultValues: {
    name: '',
    addresses: [{ street: '', city: '', zipCode: '' }],
  },
  mode: 'onSubmit',
})

const { register, handleSubmit, formState, fields } = form
const { getError } = useFormErrors(formState)

// Get the addresses field array
const addressFields = fields('addresses')

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Form data:', data)
  alert(`Success! ${data.name} has ${data.addresses.length} address(es)`)
}

const codeSnippets = [
  {
    title: 'Setup',
    language: 'typescript' as const,
    code: `const schema = z.object({
  name: z.string().min(2),
  addresses: z.array(z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().regex(/^\\d{5}$/),
  })).min(1, 'At least one address required'),
})

const { fields } = useForm({ schema, defaultValues: {
  name: '',
  addresses: [{ street: '', city: '', zipCode: '' }]
}})

// Get field array manager
const addressFields = fields('addresses')`,
  },
  {
    title: 'Template',
    language: 'vue' as const,
    code: `<div v-for="(field, idx) in addressFields.value" :key="field.key">
  <!-- Use field.key for stable v-for key -->
  <span>Address {{ idx + 1 }}</span>

  <!-- Register nested fields with index -->
  <input v-bind="register(\`addresses.\${idx}.street\`)" />
  <input v-bind="register(\`addresses.\${idx}.city\`)" />

  <!-- Remove via field.remove() -->
  <button @click="field.remove()">Remove</button>
</div>

<button @click="addressFields.append({ street: '', city: '', zipCode: '' })">
  Add Address
</button>`,
  },
  {
    title: 'API Methods',
    language: 'typescript' as const,
    code: `const addressFields = fields('addresses')

// Get current items with metadata
addressFields.value // [{ key, index, remove }, ...]

// Add new item at end
addressFields.append({ street: '', city: '', zipCode: '' })

// Remove item at index
addressFields.remove(0)

// Also available: insert, swap, move
// (see ArrayOperations example)`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.array-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.add-btn:hover {
  background: #35a372;
}

.array-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  font-weight: 600;
  color: #2c3e50;
}

.card-key {
  font-size: 0.75rem;
  color: #888;
  font-family: monospace;
}

.remove-btn {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #42b883;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.info-panel {
  padding: 0.75rem 1rem;
  background: #e3f2fd;
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
  color: #1565c0;
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

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
