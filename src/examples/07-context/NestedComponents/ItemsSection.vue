<template>
  <fieldset class="section">
    <legend class="section__title">Order Items</legend>

    <div class="items-list">
      <div v-for="(item, idx) in itemFields.value" :key="item.key" class="item-row">
        <input
          placeholder="Item name"
          class="input input--item"
          v-bind="register(`items.${idx}.name` as const)"
        />
        <input
          type="number"
          min="1"
          placeholder="Qty"
          class="input input--qty"
          v-bind="register(`items.${idx}.quantity` as const)"
        />
        <button
          type="button"
          class="btn-remove"
          :disabled="itemFields.value.length <= 1"
          @click="item.remove()"
        >
          Remove
        </button>
      </div>
    </div>

    <button type="button" class="btn-add" @click="itemFields.append({ name: '', quantity: 1 })">
      + Add Item
    </button>

    <span v-if="formState.errors.items && typeof formState.errors.items === 'string'" class="error">
      {{ formState.errors.items }}
    </span>
  </fieldset>
</template>

<script setup lang="ts">
import { useFormContext } from '../../../lib'
import type { OrderSchema } from './schema'

// fields() also works via context!
const { register, fields, formState } = useFormContext<OrderSchema>()
const itemFields = fields('items')
</script>

<style scoped>
.section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem;
  background: #fafafa;
}

.section__title {
  color: #42b883;
  font-weight: 600;
  font-size: 1rem;
  padding: 0 0.5rem;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.5rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.item-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.input--item {
  flex: 1;
}

.input--qty {
  width: 80px;
}

.btn-remove {
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-remove:hover:not(:disabled) {
  background: #fecaca;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #d1fae5;
}
</style>
