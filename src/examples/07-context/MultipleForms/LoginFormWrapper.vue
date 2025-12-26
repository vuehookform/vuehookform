<template>
  <div class="form-card form-card--login">
    <div class="form-header">
      <h3 class="form-title">Login</h3>
      <span class="form-badge">onBlur</span>
    </div>
    <form class="form" @submit.prevent="handleSubmit(onSubmit)">
      <LoginFormFields />
      <div class="form-meta">
        <span>Submit count: {{ formState.submitCount }}</span>
        <span>{{ formState.isValid ? 'Valid' : 'Invalid' }}</span>
      </div>
      <button type="submit" class="submit-btn submit-btn--login" :disabled="formState.isSubmitting">
        {{ formState.isSubmitting ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm, provideForm } from '../../../lib'
import LoginFormFields from './LoginFormFields.vue'
import { loginSchema, type LoginForm } from './schema'

const emit = defineEmits<{
  submit: [data: LoginForm]
}>()

const form = useForm({
  schema: loginSchema,
  defaultValues: { email: '', password: '', rememberMe: false },
  mode: 'onBlur', // Validate on blur
})

// This provideForm() creates an ISOLATED context
// Only descendants of this component can access it
provideForm(form)

const { handleSubmit, formState, reset } = form

const onSubmit = (data: LoginForm) => {
  emit('submit', data)
  reset()
}
</script>

<style scoped>
.form-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
}

.form-card--login {
  border-top: 3px solid #3b82f6;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-title {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.form-badge {
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6b7280;
  padding: 0.5rem 0;
  border-top: 1px solid #f3f4f6;
}

.submit-btn {
  padding: 0.875rem;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn--login {
  background: #3b82f6;
}

.submit-btn--login:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
