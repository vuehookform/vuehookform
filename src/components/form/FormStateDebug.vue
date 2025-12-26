<template>
  <div class="form-state-debug" :class="{ 'form-state-debug--compact': compact }">
    <div class="form-state-debug__items">
      <span
        v-for="item in stateItems"
        :key="item.key"
        class="form-state-debug__item"
        :class="{ 'form-state-debug__item--active': item.active }"
      >
        <span class="form-state-debug__icon">{{ item.icon }}</span>
        {{ item.label }}
      </span>
      <span class="form-state-debug__item">
        <span class="form-state-debug__icon">#</span>
        Submits: {{ state.submitCount }}
      </span>
    </div>

    <div v-if="showErrors && hasErrors" class="form-state-debug__section">
      <strong>Errors:</strong>
      <pre class="form-state-debug__pre">{{ JSON.stringify(state.errors, null, 2) }}</pre>
    </div>

    <div v-if="showTouched && touchedList.length" class="form-state-debug__section">
      <strong>Touched:</strong>
      <span class="form-state-debug__list">{{ touchedList.join(', ') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, isRef } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { FormState } from '../../lib'

interface Props {
  /** The formState computed ref from useForm() */
  formState: ComputedRef<FormState<unknown>> | Ref<FormState<unknown>> | FormState<unknown>
  /** Show expanded error details */
  showErrors?: boolean
  /** Show touched fields list */
  showTouched?: boolean
  /** Compact single-line mode */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showErrors: false,
  showTouched: false,
  compact: false,
})

const state = computed(() => (isRef(props.formState) ? props.formState.value : props.formState))

const stateItems = computed(() => [
  {
    key: 'dirty',
    label: state.value.isDirty ? 'Modified' : 'Pristine',
    active: state.value.isDirty,
    icon: state.value.isDirty ? '~' : '-',
  },
  {
    key: 'valid',
    label: state.value.isValid ? 'Valid' : 'Invalid',
    active: state.value.isValid,
    icon: state.value.isValid ? '+' : 'x',
  },
  {
    key: 'submitting',
    label: state.value.isSubmitting ? 'Submitting...' : 'Ready',
    active: state.value.isSubmitting || state.value.isValid,
    icon: state.value.isSubmitting ? '>' : '-',
  },
])

const hasErrors = computed(() => Object.keys(state.value.errors).length > 0)
const touchedList = computed(() =>
  Object.keys(state.value.touchedFields).filter((k) => state.value.touchedFields[k]),
)
</script>

<style scoped>
.form-state-debug {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.85rem;
}

.form-state-debug--compact {
  padding: 0.5rem 1rem;
}

.form-state-debug--compact .form-state-debug__items {
  flex-wrap: nowrap;
}

.form-state-debug__items {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-state-debug__item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6c757d;
}

.form-state-debug__item--active {
  color: #42b883;
  font-weight: 600;
}

.form-state-debug__icon {
  font-family: monospace;
  font-weight: bold;
}

.form-state-debug__section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #dee2e6;
}

.form-state-debug__section strong {
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
}

.form-state-debug__pre {
  margin: 0;
  padding: 0.5rem;
  background: #fff;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
}

.form-state-debug__list {
  color: #495057;
}
</style>
