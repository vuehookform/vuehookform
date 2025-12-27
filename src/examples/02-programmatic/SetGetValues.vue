<template>
  <ExampleLayout
    title="Set & Get Values"
    description="Programmatically read and write form values with setValue() and getValues(). Useful for loading data from APIs, copying between fields, or implementing presets."
    :features="['setValue()', 'getValues()', 'Programmatic control']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Preset Buttons -->
        <div class="presets">
          <span class="presets-label">Load Preset:</span>
          <button type="button" @click="loadPreset('john')" class="preset-btn">John Doe</button>
          <button type="button" @click="loadPreset('jane')" class="preset-btn">Jane Smith</button>
          <button type="button" @click="clearForm" class="preset-btn clear">Clear All</button>
        </div>

        <div class="form-grid">
          <!-- Shipping Address -->
          <fieldset class="fieldset">
            <legend>Shipping Address</legend>
            <FormField name="shipping.name" label="Name" placeholder="Full name" />
            <FormField name="shipping.street" label="Street" placeholder="123 Main St" />
            <FormField name="shipping.city" label="City" placeholder="New York" />
            <FormField name="shipping.zip" label="Zip Code" placeholder="10001" />
          </fieldset>

          <!-- Billing Address -->
          <fieldset class="fieldset">
            <legend>
              Billing Address
              <button type="button" @click="copyShippingToBilling" class="copy-btn">
                Copy from Shipping
              </button>
            </legend>
            <FormField name="billing.name" label="Name" placeholder="Full name" />
            <FormField name="billing.street" label="Street" placeholder="123 Main St" />
            <FormField name="billing.city" label="City" placeholder="New York" />
            <FormField name="billing.zip" label="Zip Code" placeholder="10001" />
          </fieldset>
        </div>

        <!-- Current Values Display -->
        <div class="values-panel">
          <h4>Current Values (via getValues):</h4>
          <div class="values-grid">
            <div>
              <strong>Shipping:</strong>
              <pre>{{ shippingValues }}</pre>
            </div>
            <div>
              <strong>Billing:</strong>
              <pre>{{ billingValues }}</pre>
            </div>
          </div>
        </div>

        <FormStateDebug :form-state="formState" />
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const addressSchema = z.object({
  name: z.string().min(1, 'Name required'),
  street: z.string().min(1, 'Street required'),
  city: z.string().min(1, 'City required'),
  zip: z.string().min(5, 'Zip required'),
})

const schema = z.object({
  shipping: addressSchema,
  billing: addressSchema,
})

const form = useForm({
  schema,
  defaultValues: {
    shipping: { name: '', street: '', city: '', zip: '' },
    billing: { name: '', street: '', city: '', zip: '' },
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, setValue, getValues, reset } = form

// Presets data
const presets = {
  john: {
    shipping: { name: 'John Doe', street: '123 Main St', city: 'New York', zip: '10001' },
    billing: { name: 'John Doe', street: '456 Oak Ave', city: 'Brooklyn', zip: '11201' },
  },
  jane: {
    shipping: { name: 'Jane Smith', street: '789 Pine Rd', city: 'Los Angeles', zip: '90001' },
    billing: { name: 'Jane Smith', street: '789 Pine Rd', city: 'Los Angeles', zip: '90001' },
  },
}

function loadPreset(preset: 'john' | 'jane') {
  const data = presets[preset]

  // Using setValue to programmatically set each field
  setValue('shipping.name', data.shipping.name)
  setValue('shipping.street', data.shipping.street)
  setValue('shipping.city', data.shipping.city)
  setValue('shipping.zip', data.shipping.zip)

  setValue('billing.name', data.billing.name)
  setValue('billing.street', data.billing.street)
  setValue('billing.city', data.billing.city)
  setValue('billing.zip', data.billing.zip)
}

function copyShippingToBilling() {
  // Using getValues to read shipping values
  const shippingName = getValues('shipping.name')
  const shippingStreet = getValues('shipping.street')
  const shippingCity = getValues('shipping.city')
  const shippingZip = getValues('shipping.zip')

  // Using setValue to write to billing
  setValue('billing.name', shippingName ?? '')
  setValue('billing.street', shippingStreet ?? '')
  setValue('billing.city', shippingCity ?? '')
  setValue('billing.zip', shippingZip ?? '')
}

function clearForm() {
  reset()
}

// Display current values
const shippingValues = computed(() =>
  JSON.stringify(
    {
      name: getValues('shipping.name'),
      street: getValues('shipping.street'),
      city: getValues('shipping.city'),
      zip: getValues('shipping.zip'),
    },
    null,
    2,
  ),
)

const billingValues = computed(() =>
  JSON.stringify(
    {
      name: getValues('billing.name'),
      street: getValues('billing.street'),
      city: getValues('billing.city'),
      zip: getValues('billing.zip'),
    },
    null,
    2,
  ),
)

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert('Form submitted! Check console.')
}

const codeSnippets = [
  {
    title: 'setValue',
    language: 'typescript' as const,
    code: `const { setValue } = useForm({ schema })

// Set a simple field
setValue('email', 'john@example.com')

// Set nested fields
setValue('shipping.city', 'New York')
setValue('addresses.0.street', '123 Main St')

// setValue triggers validation if mode is 'onChange'
// or if field has been touched`,
  },
  {
    title: 'getValues',
    language: 'typescript' as const,
    code: `const { getValues } = useForm({ schema })

// Get a simple field value
const email = getValues('email')

// Get nested field value
const city = getValues('shipping.city')

// Returns undefined if path doesn't exist
const unknown = getValues('nonexistent') // undefined`,
  },
  {
    title: 'Copy Pattern',
    language: 'typescript' as const,
    code: `// Common pattern: copy data between field groups
function copyShippingToBilling() {
  const fields = ['name', 'street', 'city', 'zip']

  for (const field of fields) {
    const value = getValues(\`shipping.\${field}\`)
    setValue(\`billing.\${field}\`, value ?? '')
  }
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

.presets {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.presets-label {
  font-weight: 600;
  color: #2c3e50;
}

.preset-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.preset-btn:hover {
  background: #5a67d8;
}

.preset-btn.clear {
  background: #e74c3c;
}

.preset-btn.clear:hover {
  background: #c0392b;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
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
  display: flex;
  align-items: center;
  gap: 1rem;
}

.copy-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid #42b883;
  color: #42b883;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #42b883;
  color: white;
}

.values-panel {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.values-panel h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.values-grid pre {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
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
