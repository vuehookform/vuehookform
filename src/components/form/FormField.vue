<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label :for="id" class="form-field__label">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>

    <slot :field="field" :id="id" :error="error">
      <input
        :id="id"
        v-bind="field"
        :type="type"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :step="step"
        class="form-field__input"
        :class="inputClass"
      />
    </slot>

    <slot name="error" :error="error">
      <span v-if="error" class="form-field__error">{{ error }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import type { ComputedRef } from 'vue'
import type { FormState, RegisterReturn } from '../../lib'
import { get } from '../../lib/utils/paths'

interface Props {
  /** Field name/path for register() - e.g., 'email' or 'addresses.0.street' */
  name: string
  /** Label text to display */
  label: string
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Input type - defaults to 'text' */
  type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url' | 'date'
  /** Placeholder text */
  placeholder?: string
  /** Minimum value (for number inputs) */
  min?: string | number
  /** Maximum value (for number inputs) */
  max?: string | number
  /** Step value (for number inputs) */
  step?: string | number
  /** Additional CSS classes for the input */
  inputClass?: string
  /** Whether to use controlled mode */
  controlled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  controlled: false,
})

// Inject form context (provided by parent FormProvider)
const register =
  inject<(name: string, options?: { controlled?: boolean }) => RegisterReturn>('formRegister')
const formState = inject<ComputedRef<FormState<unknown>>>('formState')

if (!register || !formState) {
  throw new Error('FormField must be used within a FormProvider')
}

const id = useId()
const field = computed(() => register(props.name, { controlled: props.controlled }))

// Use path utility to get nested errors
const error = computed(() => {
  const errors = formState.value.errors as Record<string, unknown>
  const err = get(errors, props.name)
  return typeof err === 'string' ? err : undefined
})
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field__label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-field__required {
  color: #e74c3c;
  margin-left: 2px;
}

.form-field__input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-field__input:focus {
  outline: none;
  border-color: #42b883;
}

.form-field.has-error .form-field__input {
  border-color: #e74c3c;
}

.form-field__error {
  color: #e74c3c;
  font-size: 0.85rem;
}
</style>
