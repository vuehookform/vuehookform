<template>
  <div class="form-checkbox" :class="{ 'has-error': error }">
    <label :for="id" class="form-checkbox__label">
      <input :id="id" v-bind="field" type="checkbox" class="form-checkbox__input" />
      <span class="form-checkbox__text">
        {{ label }}
        <span v-if="required" class="form-checkbox__required">*</span>
      </span>
    </label>
    <span v-if="error" class="form-checkbox__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import type { ComputedRef } from 'vue'
import type { FormState, RegisterReturn } from '../../lib'
import { get } from '../../lib/utils/paths'

interface Props {
  /** Field name/path for register() */
  name: string
  /** Label text to display */
  label: string
  /** Whether field is required (shows asterisk) */
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
})

// Inject form context
const register = inject<(name: string) => RegisterReturn>('formRegister')
const formState = inject<ComputedRef<FormState<unknown>>>('formState')

if (!register || !formState) {
  throw new Error('FormCheckbox must be used within a FormProvider')
}

const id = useId()
const field = computed(() => register(props.name))

const error = computed(() => {
  const errors = formState.value.errors as Record<string, unknown>
  const err = get(errors, props.name)
  return typeof err === 'string' ? err : undefined
})
</script>

<style scoped>
.form-checkbox {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-checkbox__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox__input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #42b883;
}

.form-checkbox__text {
  font-size: 0.95rem;
  color: #2c3e50;
}

.form-checkbox__required {
  color: #e74c3c;
  margin-left: 2px;
}

.form-checkbox__error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-left: 26px;
}
</style>
