<template>
  <ExampleLayout
    title="Watch Fields"
    description="Reactively watch form field values with watch(). Use it for conditional rendering, computed values, and real-time UI updates."
    :features="['watch(field)', 'watch([fields])', 'watch()', 'Conditional UI']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Account Type -->
        <FormSelect
          name="accountType"
          label="Account Type"
          :options="accountTypeOptions"
          placeholder="Select account type..."
          required
          controlled
        />

        <!-- Conditional Fields based on account type -->
        <div v-if="accountType === 'business'" class="conditional-section">
          <h4>Business Information</h4>
          <FormField name="companyName" label="Company Name" required placeholder="Acme Inc." />
          <FormField name="taxId" label="Tax ID" placeholder="XX-XXXXXXX" />
        </div>

        <div v-if="accountType === 'personal'" class="conditional-section personal">
          <h4>Personal Information</h4>
          <FormField name="firstName" label="First Name" required placeholder="John" />
          <FormField name="lastName" label="Last Name" required placeholder="Doe" />
        </div>

        <!-- Common Fields -->
        <FormField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="email@example.com"
        />

        <!-- Quantity and Price with computed total -->
        <div class="price-section">
          <h4>Order Details (Watch for Computed Values)</h4>
          <div class="price-row">
            <FormField name="quantity" label="Quantity" type="number" min="1" placeholder="1" />
            <FormField
              name="price"
              label="Price ($)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div class="total-display">
            <span>Total:</span>
            <strong>${{ calculatedTotal }}</strong>
          </div>
        </div>

        <!-- Watch Debug Panel -->
        <div class="watch-panel">
          <h4>Watch Values (Debug)</h4>
          <div class="watch-grid">
            <div class="watch-item">
              <label>watch('accountType'):</label>
              <code>{{ accountType || 'undefined' }}</code>
            </div>
            <div class="watch-item">
              <label>watch(['quantity', 'price']):</label>
              <code>{{ JSON.stringify({ quantity, price }) }}</code>
            </div>
            <div class="watch-item full">
              <label>watch() - All Values:</label>
              <pre>{{ JSON.stringify(allValues, null, 2) }}</pre>
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
import { FormProvider, FormField, FormSelect, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  accountType: z.enum(['personal', 'business']),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.email('Invalid email'),
  quantity: z.string().optional(),
  price: z.string().optional(),
})

const form = useForm({
  schema,
  defaultValues: {
    accountType: undefined as unknown as 'personal' | 'business',
    companyName: '',
    taxId: '',
    firstName: '',
    lastName: '',
    email: '',
    quantity: '1',
    price: '10.00',
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, watch } = form

const accountTypeOptions = [
  { value: 'personal', label: 'Personal Account' },
  { value: 'business', label: 'Business Account' },
]

// Watch single field
const accountTypeRef = watch('accountType')
const accountType = computed(() => accountTypeRef.value as string | undefined)

// Watch multiple fields for calculations
const quantityRef = watch('quantity')
const priceRef = watch('price')

const quantity = computed(() => quantityRef.value as string)
const price = computed(() => priceRef.value as string)

// Computed total from watched values
const calculatedTotal = computed(() => {
  const q = parseFloat(quantity.value) || 0
  const p = parseFloat(price.value) || 0
  return (q * p).toFixed(2)
})

// Watch all values
const allValuesRef = watch()
const allValues = computed(() => allValuesRef.value)

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert(`Account type: ${data.accountType}\nTotal: $${calculatedTotal.value}`)
}

const codeSnippets = [
  {
    title: 'Watch Single',
    language: 'typescript' as const,
    code: `const { watch } = useForm({ schema })

// Watch a single field - returns ComputedRef
const accountType = watch('accountType')

// Use in template
<div v-if="accountType === 'business'">
  <!-- Business-specific fields -->
</div>`,
  },
  {
    title: 'Watch Multiple',
    language: 'typescript' as const,
    code: `// Watch multiple fields for computed values
const quantity = watch('quantity')
const price = watch('price')

// Create computed from watched values
const total = computed(() => {
  const q = parseFloat(quantity.value) || 0
  const p = parseFloat(price.value) || 0
  return (q * p).toFixed(2)
})`,
  },
  {
    title: 'Watch All',
    language: 'typescript' as const,
    code: `// Watch entire form (useful for debugging)
const allValues = watch()

// Returns computed ref with all form data
console.log(allValues.value)
// { accountType: 'business', email: '...', ... }

// Great for:
// - Debug panels
// - Form preview
// - Auto-save functionality`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.conditional-section {
  padding: 1.5rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.conditional-section.personal {
  background: #f3e5f5;
  border-left-color: #9c27b0;
}

.conditional-section h4 {
  margin: 0 0 1rem 0;
  color: #1565c0;
}

.conditional-section.personal h4 {
  color: #7b1fa2;
}

.price-section {
  padding: 1.5rem;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.price-section h4 {
  margin: 0 0 1rem 0;
  color: #e65100;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.total-display {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
}

.total-display strong {
  color: #e65100;
}

.watch-panel {
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 8px;
  color: #d4d4d4;
}

.watch-panel h4 {
  margin: 0 0 1rem 0;
  color: #42b883;
}

.watch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.watch-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.watch-item.full {
  grid-column: 1 / -1;
}

.watch-item label {
  font-size: 0.8rem;
  color: #888;
}

.watch-item code {
  font-family: monospace;
  color: #ce9178;
}

.watch-item pre {
  margin: 0;
  font-size: 0.75rem;
  max-height: 100px;
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
