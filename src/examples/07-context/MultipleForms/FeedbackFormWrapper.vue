<template>
  <div class="form-card form-card--feedback">
    <div class="form-header">
      <h3 class="form-title">Feedback</h3>
      <span class="form-badge form-badge--warning">onChange</span>
    </div>
    <form class="form" @submit.prevent="handleSubmit(onSubmit)">
      <FeedbackFormFields />
      <div class="form-meta">
        <span>Submit count: {{ formState.submitCount }}</span>
        <span>{{ formState.isValid ? 'Valid' : 'Invalid' }}</span>
      </div>
      <button
        type="submit"
        class="submit-btn submit-btn--feedback"
        :disabled="formState.isSubmitting"
      >
        {{ formState.isSubmitting ? 'Sending...' : 'Send Feedback' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm, provideForm } from '../../../lib'
import FeedbackFormFields from './FeedbackFormFields.vue'
import { feedbackSchema, type FeedbackForm } from './schema'

const emit = defineEmits<{
  submit: [data: FeedbackForm]
}>()

const form = useForm({
  schema: feedbackSchema,
  defaultValues: { rating: 0, comment: '', category: '' },
  mode: 'onChange', // Real-time validation
})

// Separate context - completely isolated from login form
provideForm(form)

const { handleSubmit, formState, reset } = form

const onSubmit = (data: FeedbackForm) => {
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

.form-card--feedback {
  border-top: 3px solid #f59e0b;
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

.form-badge--warning {
  background: #fef3c7;
  color: #b45309;
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

.submit-btn--feedback {
  background: #f59e0b;
}

.submit-btn--feedback:hover:not(:disabled) {
  background: #d97706;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
