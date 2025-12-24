<template>
  <div class="form-select" :class="{ 'has-error': error }">
    <label :for="id" class="form-select__label">
      {{ label }}
      <span v-if="required" class="form-select__required">*</span>
    </label>

    <slot :field="field" :id="id" :error="error">
      <select :id="id" v-bind="field" class="form-select__input">
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </slot>

    <span v-if="error" class="form-select__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import type { ComputedRef } from 'vue'
import type { FormState, RegisterReturn } from '../../lib'
import { get } from '../../lib/utils/paths'

interface Option {
  value: string
  label: string
}

interface Props {
  /** Field name/path for register() */
  name: string
  /** Label text to display */
  label: string
  /** Select options */
  options: Option[]
  /** Whether field is required (shows asterisk) */
  required?: boolean
  /** Placeholder text (first disabled option) */
  placeholder?: string
  /** Whether to use controlled mode */
  controlled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  controlled: false,
})

// Inject form context
const register =
  inject<(name: string, options?: { controlled?: boolean }) => RegisterReturn>('formRegister')
const formState = inject<ComputedRef<FormState<unknown>>>('formState')

if (!register || !formState) {
  throw new Error('FormSelect must be used within a FormProvider')
}

const id = useId()
const field = computed(() => register(props.name, { controlled: props.controlled }))

const error = computed(() => {
  const errors = formState.value.errors as Record<string, unknown>
  const err = get(errors, props.name)
  return typeof err === 'string' ? err : undefined
})
</script>

<style scoped>
.form-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-select__label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-select__required {
  color: #e74c3c;
  margin-left: 2px;
}

.form-select__input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select__input:focus {
  outline: none;
  border-color: #42b883;
}

.form-select.has-error .form-select__input {
  border-color: #e74c3c;
}

.form-select__error {
  color: #e74c3c;
  font-size: 0.85rem;
}
</style>
