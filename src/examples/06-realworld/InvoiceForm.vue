<template>
  <ExampleLayout
    title="Invoice Form"
    description="A complete invoice form with dynamic line items, automatic calculations, and professional formatting. Demonstrates fields() for arrays with watch() for computed totals."
    :features="['fields() arrays', 'watch() for totals', 'Computed values', 'Business logic']"
    :code-snippets="codeSnippets"
  >
    <div class="invoice-container">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(onSubmit)" class="invoice-form">
          <!-- Invoice Header -->
          <div class="invoice-header">
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <div class="field-inline">
                <label>#</label>
                <input
                  v-bind="register('invoiceNumber')"
                  class="invoice-number"
                  placeholder="INV-0001"
                />
              </div>
            </div>
            <div class="invoice-dates">
              <div class="field-compact">
                <label>Issue Date</label>
                <input v-bind="register('issueDate')" type="date" class="input-sm" />
              </div>
              <div class="field-compact">
                <label>Due Date</label>
                <input v-bind="register('dueDate')" type="date" class="input-sm" />
              </div>
            </div>
          </div>

          <!-- Client Info -->
          <div class="client-section">
            <h3>Bill To</h3>
            <FormField
              name="client.name"
              label="Client Name"
              required
              placeholder="Acme Corporation"
            />
            <FormField
              name="client.email"
              label="Email"
              type="email"
              required
              placeholder="billing@acme.com"
            />
            <FormField
              name="client.address"
              label="Address"
              placeholder="123 Business St, City, ST 12345"
            />
          </div>

          <!-- Line Items -->
          <div class="items-section">
            <div class="items-header">
              <span class="col-desc">Description</span>
              <span class="col-qty">Qty</span>
              <span class="col-price">Price</span>
              <span class="col-total">Total</span>
              <span class="col-action" />
            </div>

            <div v-for="(field, idx) in itemFields.value" :key="field.key" class="item-row">
              <input
                v-bind="register(`items.${idx}.description`)"
                class="input-desc"
                placeholder="Service or product..."
              />
              <input
                v-bind="register(`items.${idx}.quantity`)"
                type="number"
                min="1"
                class="input-qty"
                placeholder="1"
              />
              <div class="price-input">
                <span class="currency">$</span>
                <input
                  v-bind="register(`items.${idx}.price`)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-price"
                  placeholder="0.00"
                />
              </div>
              <span class="item-total">${{ formatNumber(getLineTotal(idx)) }}</span>
              <button
                v-if="itemFields.value.length > 1"
                type="button"
                @click="field.remove()"
                class="remove-item"
              >
                x
              </button>
              <span v-else class="remove-placeholder" />
            </div>

            <button type="button" @click="addItem" class="add-item-btn">+ Add Line Item</button>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <div class="totals-row">
              <span class="totals-label">Subtotal</span>
              <span class="totals-value">${{ formatNumber(subtotal) }}</span>
            </div>

            <div class="totals-row discount-row">
              <span class="totals-label">
                Discount
                <input
                  v-bind="register('discount')"
                  type="number"
                  min="0"
                  max="100"
                  class="discount-input"
                  placeholder="0"
                />
                %
              </span>
              <span class="totals-value discount">-${{ formatNumber(discountAmount) }}</span>
            </div>

            <div class="totals-row tax-row">
              <span class="totals-label">
                Tax
                <input
                  v-bind="register('taxRate')"
                  type="number"
                  min="0"
                  max="100"
                  class="tax-input"
                  placeholder="0"
                />
                %
              </span>
              <span class="totals-value">${{ formatNumber(taxAmount) }}</span>
            </div>

            <div class="totals-row total-row">
              <span class="totals-label">Total Due</span>
              <span class="totals-value total">${{ formatNumber(grandTotal) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="notes-section">
            <label>Notes / Payment Terms</label>
            <textarea
              v-bind="register('notes') as any"
              rows="3"
              placeholder="Payment due within 30 days. Please include invoice number with payment."
            />
          </div>

          <div class="form-actions">
            <button type="button" @click="previewInvoice" class="preview-btn">Preview</button>
            <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
              {{ formState.isSubmitting ? 'Saving...' : 'Save Invoice' }}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number required'),
  issueDate: z.string().min(1, 'Issue date required'),
  dueDate: z.string().min(1, 'Due date required'),
  client: z.object({
    name: z.string().min(1, 'Client name required'),
    email: z.email('Invalid email'),
    address: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description required'),
        quantity: z.string().min(1),
        price: z.string().min(1),
      }),
    )
    .min(1, 'At least one item required'),
  discount: z.string().optional(),
  taxRate: z.string().optional(),
  notes: z.string().optional(),
})

const today = new Date().toISOString().split('T')[0]
const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const form = useForm({
  schema,
  defaultValues: {
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    issueDate: today,
    dueDate: dueDate,
    client: { name: '', email: '', address: '' },
    items: [{ description: '', quantity: '1', price: '' }],
    discount: '0',
    taxRate: '0',
    notes: '',
  },
  mode: 'onSubmit',
})

const { register, handleSubmit, formState, fields, watch, getValues } = form

interface InvoiceItem {
  description: string
  quantity: string
  price: string
}

const itemFields = fields('items')

// Watch items for calculations
const itemsWatch = watch('items')
const discountWatch = watch('discount')
const taxRateWatch = watch('taxRate')

// Get line total for a specific item
function getLineTotal(idx: number): number {
  const items = (itemsWatch.value as InvoiceItem[]) || []
  const item = items[idx]
  if (!item) return 0
  const qty = parseFloat(item.quantity) || 0
  const price = parseFloat(item.price) || 0
  return qty * price
}

// Calculate totals
const subtotal = computed(() => {
  const items = (itemsWatch.value as InvoiceItem[]) || []
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.price) || 0
    return sum + qty * price
  }, 0)
})

const discountAmount = computed(() => {
  const discount = parseFloat(discountWatch.value as string) || 0
  return subtotal.value * (discount / 100)
})

const taxAmount = computed(() => {
  const taxRate = parseFloat(taxRateWatch.value as string) || 0
  const afterDiscount = subtotal.value - discountAmount.value
  return afterDiscount * (taxRate / 100)
})

const grandTotal = computed(() => {
  return subtotal.value - discountAmount.value + taxAmount.value
})

function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function addItem() {
  itemFields.append({ description: '', quantity: '1', price: '' })
}

function previewInvoice() {
  alert(
    `Invoice Preview:\nClient: ${getValues('client.name')}\nTotal: $${formatNumber(grandTotal.value)}`,
  )
}

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Invoice saved:', data)
  alert(`Invoice ${data.invoiceNumber} saved!\nTotal: $${formatNumber(grandTotal.value)}`)
}

const codeSnippets = [
  {
    title: 'Line Items Array',
    language: 'typescript' as const,
    code: `const { fields, watch } = useForm({ schema })

const itemFields = fields('items')

// Add new line item
function addItem() {
  itemFields.append({
    description: '',
    quantity: '1',
    price: ''
  })
}

// Watch items for calculations
const itemsWatch = watch('items')`,
  },
  {
    title: 'Computed Totals',
    language: 'typescript' as const,
    code: `const subtotal = computed(() => {
  const items = itemsWatch.value || []
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.price) || 0
    return sum + qty * price
  }, 0)
})

const discountAmount = computed(() => {
  const discount = parseFloat(discountWatch.value) || 0
  return subtotal.value * (discount / 100)
})

const grandTotal = computed(() => {
  return subtotal.value - discountAmount.value + taxAmount.value
})`,
  },
]
</script>

<style scoped>
.invoice-container {
  max-width: 800px;
  margin: 0 auto;
}

.invoice-form {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.invoice-title h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.75rem;
}

.field-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-inline label {
  font-weight: 600;
  color: #666;
}

.invoice-number {
  width: 150px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.invoice-dates {
  display: flex;
  gap: 1rem;
}

.field-compact {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-compact label {
  font-size: 0.8rem;
  color: #666;
}

.input-sm {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.client-section {
  margin-bottom: 2rem;
}

.client-section h3 {
  margin: 0 0 1rem 0;
  color: #42b883;
  font-size: 1rem;
}

.items-section {
  margin-bottom: 2rem;
}

.items-header {
  display: grid;
  grid-template-columns: 1fr 80px 120px 100px 40px;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 2px solid #2c3e50;
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr 80px 120px 100px 40px;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.input-desc {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-qty {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.price-input {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.currency {
  padding: 0.5rem;
  background: #f5f5f5;
  color: #666;
}

.input-price {
  flex: 1;
  padding: 0.5rem;
  border: none;
  text-align: right;
}

.input-price:focus {
  outline: none;
}

.item-total {
  text-align: right;
  font-weight: 500;
}

.remove-item {
  width: 28px;
  height: 28px;
  border: none;
  background: #ffebee;
  color: #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.remove-item:hover {
  background: #e74c3c;
  color: white;
}

.remove-placeholder {
  width: 28px;
}

.add-item-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: 2px dashed #42b883;
  color: #42b883;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.add-item-btn:hover {
  background: #e8f5e9;
}

.totals-section {
  margin-left: auto;
  width: 300px;
  margin-bottom: 2rem;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.totals-label {
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.totals-value {
  font-weight: 500;
}

.totals-value.discount {
  color: #e74c3c;
}

.discount-input,
.tax-input {
  width: 50px;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.total-row {
  border-top: 2px solid #2c3e50;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.totals-value.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #42b883;
}

.notes-section {
  margin-bottom: 2rem;
}

.notes-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.notes-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.preview-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #42b883;
  color: #42b883;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.preview-btn:hover {
  background: #e8f5e9;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  border: none;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
