<template>
  <ExampleLayout
    title="Deeply Nested Components"
    description="Form context flows through the entire component tree. Grandchild components can access form methods without any intermediate prop passing. The intermediate wrapper component has zero form awareness."
    :features="[
      'Deep nesting',
      'No prop drilling',
      'Intermediate wrappers',
      'fields() via context',
      'Nested paths',
    ]"
    :code-snippets="codeSnippets"
  >
    <form @submit.prevent="handleSubmit(onSubmit)" class="form">
      <!-- OrderSections is an intermediate component with NO form props -->
      <!-- It simply renders the section components -->
      <OrderSections />

      <FormStateDebug :form-state="formState" />

      <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
        {{ formState.isSubmitting ? 'Processing...' : 'Place Order' }}
      </button>
    </form>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm, provideForm } from '../../../lib'
import { FormStateDebug } from '../../../components/form'
import { ExampleLayout } from '../../../components/showcase'
import OrderSections from './OrderSections.vue'
import { orderSchema, type OrderForm } from './schema'

// Initialize form at the root
const form = useForm({
  schema: orderSchema,
  defaultValues: {
    customer: { name: '', email: '' },
    shipping: { address: '', city: '', express: false },
    items: [{ name: '', quantity: 1 }],
  },
  mode: 'onBlur',
})

// Provide form context to ALL descendants
provideForm(form)

const { handleSubmit, formState } = form

const onSubmit = (data: OrderForm) => {
  console.log('Order submitted:', data)
  const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0)
  alert(`Order placed! ${itemCount} items shipping to ${data.shipping.city}`)
}

const codeSnippets = [
  {
    title: 'Parent Provider',
    language: 'typescript' as const,
    code: `// Root component: create form and provide context
const form = useForm({
  schema: orderSchema,
  defaultValues: {
    customer: { name: '', email: '' },
    shipping: { address: '', city: '', express: false },
    items: [{ name: '', quantity: 1 }],
  },
})

provideForm(form)  // Available to ALL descendants`,
  },
  {
    title: 'Intermediate Component',
    language: 'typescript' as const,
    code: `// OrderSections - ZERO form awareness!
// Just renders children - no props, no context access needed
const OrderSections = defineComponent({
  setup() {
    // No useFormContext() here
    return () => h('div', { class: 'sections' }, [
      h(CustomerSection),   // grandchild
      h(ShippingSection),   // grandchild
      h(ItemsSection),      // grandchild
    ])
  },
})`,
  },
  {
    title: 'Grandchild Access',
    language: 'typescript' as const,
    code: `// Grandchild: accesses context directly - no props from parent!
const CustomerSection = defineComponent({
  setup() {
    // Works at ANY depth in the component tree
    const { register, formState } = useFormContext<typeof orderSchema>()

    // Use nested paths for nested schema
    return () => h('fieldset', [
      h('input', { ...register('customer.name') }),
      h('input', { ...register('customer.email') }),
    ])
  },
})

// Even fields() works via context
const ItemsSection = defineComponent({
  setup() {
    const { register, fields } = useFormContext<typeof orderSchema>()
    const itemFields = fields('items')

    // Full field array API available
    itemFields.append({ name: '', quantity: 1 })
    itemFields.remove(0)
  },
})`,
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
