<template>
  <div class="form-fields">
    <div class="field-group">
      <label for="email" class="label">
        Email <span class="required">*</span>
      </label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        :class="['input', formState.errors.email && 'input--error']"
        v-bind="register('email')"
      />
      <span v-if="formState.errors.email" class="error">
        {{ formState.errors.email }}
      </span>
    </div>
    <div class="field-group">
      <label for="message" class="label">
        Message <span class="required">*</span>
      </label>
      <textarea
        id="message"
        rows="4"
        placeholder="Your message here..."
        :class="['input', 'textarea', formState.errors.message && 'input--error']"
        v-bind="messageBinding"
      />
      <span v-if="formState.errors.message" class="error">
        {{ formState.errors.message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormContext } from '../../../lib'
import type { ContactSchema } from './schema'

// Access form context from parent - no props required!
// The generic type parameter provides full TypeScript autocomplete
const { register, formState } = useFormContext<ContactSchema>()

// Textarea binding (cast to avoid Vue template type inference issue)
const messageBinding = computed(() => register('message') as unknown as Record<string, unknown>)
</script>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
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

.input--error {
  border-color: #e74c3c;
}

.input--error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}
</style>
