<template>
  <div class="form-fields">
    <div class="field-group">
      <label class="label">Email</label>
      <input
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
      <label class="label">Password</label>
      <input
        type="password"
        placeholder="Enter password"
        :class="['input', formState.errors.password && 'input--error']"
        v-bind="register('password')"
      />
      <span v-if="formState.errors.password" class="error">
        {{ formState.errors.password }}
      </span>
    </div>

    <div class="field-group field-group--checkbox">
      <input type="checkbox" id="remember" v-bind="register('rememberMe')" />
      <label for="remember" class="checkbox-label">Remember me</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormContext } from '../../../lib'
import type { LoginSchema } from './schema'

const { register, formState } = useFormContext<LoginSchema>()
</script>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-group--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
}

.input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
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

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}
</style>
