<template>
  <ExampleLayout
    title="Validation Modes"
    description="Compare all four validation modes: onSubmit, onBlur, onChange, and onTouched. Each mode triggers validation at different times during user interaction."
    :features="['mode: onSubmit', 'mode: onBlur', 'mode: onChange', 'mode: onTouched']"
    :code-snippets="codeSnippets"
  >
    <div class="modes-container">
      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button
          v-for="mode in modes"
          :key="mode.value"
          :class="['mode-tab', { active: activeMode === mode.value }]"
          @click="activeMode = mode.value"
        >
          {{ mode.label }}
        </button>
      </div>

      <!-- Mode Description -->
      <div class="mode-description">
        <strong>{{ currentModeInfo.label }}:</strong> {{ currentModeInfo.description }}
      </div>

      <!-- onSubmit Form -->
      <div v-show="activeMode === 'onSubmit'" class="form-panel">
        <form @submit="submitForm.handleSubmit(onSubmit)" class="form">
          <div class="field">
            <label>Email *</label>
            <input v-bind="submitForm.register('email')" type="email" placeholder="Enter email" />
            <span v-if="submitForm.formState.value.errors.email" class="error">
              {{ submitForm.formState.value.errors.email }}
            </span>
          </div>
          <div class="field">
            <label>Password *</label>
            <input
              v-bind="submitForm.register('password')"
              type="password"
              placeholder="Min 8 characters"
            />
            <span v-if="submitForm.formState.value.errors.password" class="error">
              {{ submitForm.formState.value.errors.password }}
            </span>
          </div>
          <FormStateDebug :form-state="submitForm.formState" compact />
          <button type="submit" class="submit-btn">Submit to Validate</button>
        </form>
      </div>

      <!-- onBlur Form -->
      <div v-show="activeMode === 'onBlur'" class="form-panel">
        <form @submit="blurForm.handleSubmit(onSubmit)" class="form">
          <div class="field">
            <label>Email *</label>
            <input v-bind="blurForm.register('email')" type="email" placeholder="Enter email" />
            <span v-if="blurForm.formState.value.errors.email" class="error">
              {{ blurForm.formState.value.errors.email }}
            </span>
          </div>
          <div class="field">
            <label>Password *</label>
            <input
              v-bind="blurForm.register('password')"
              type="password"
              placeholder="Min 8 characters"
            />
            <span v-if="blurForm.formState.value.errors.password" class="error">
              {{ blurForm.formState.value.errors.password }}
            </span>
          </div>
          <FormStateDebug :form-state="blurForm.formState" compact />
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>

      <!-- onChange Form -->
      <div v-show="activeMode === 'onChange'" class="form-panel">
        <form @submit="changeForm.handleSubmit(onSubmit)" class="form">
          <div class="field">
            <label>Email *</label>
            <input v-bind="changeForm.register('email')" type="email" placeholder="Enter email" />
            <span v-if="changeForm.formState.value.errors.email" class="error">
              {{ changeForm.formState.value.errors.email }}
            </span>
          </div>
          <div class="field">
            <label>Password *</label>
            <input
              v-bind="changeForm.register('password')"
              type="password"
              placeholder="Min 8 characters"
            />
            <span v-if="changeForm.formState.value.errors.password" class="error">
              {{ changeForm.formState.value.errors.password }}
            </span>
          </div>
          <FormStateDebug :form-state="changeForm.formState" compact />
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>

      <!-- onTouched Form -->
      <div v-show="activeMode === 'onTouched'" class="form-panel">
        <form @submit="touchedForm.handleSubmit(onSubmit)" class="form">
          <div class="field">
            <label>Email *</label>
            <input v-bind="touchedForm.register('email')" type="email" placeholder="Enter email" />
            <span v-if="touchedForm.formState.value.errors.email" class="error">
              {{ touchedForm.formState.value.errors.email }}
            </span>
          </div>
          <div class="field">
            <label>Password *</label>
            <input
              v-bind="touchedForm.register('password')"
              type="password"
              placeholder="Min 8 characters"
            />
            <span v-if="touchedForm.formState.value.errors.password" class="error">
              {{ touchedForm.formState.value.errors.password }}
            </span>
          </div>
          <FormStateDebug :form-state="touchedForm.formState" compact />
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm, type ValidationMode } from '../../lib'
import { FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const defaultValues = { email: '', password: '' }

// Create separate form instances for each mode
const submitForm = useForm({ schema, defaultValues, mode: 'onSubmit' })
const blurForm = useForm({ schema, defaultValues, mode: 'onBlur' })
const changeForm = useForm({ schema, defaultValues, mode: 'onChange' })
const touchedForm = useForm({ schema, defaultValues, mode: 'onTouched' })

const activeMode = ref<ValidationMode>('onSubmit')

const modes = [
  {
    value: 'onSubmit' as const,
    label: 'onSubmit',
    description: 'Validation only runs when you submit the form. Best for simple forms.',
  },
  {
    value: 'onBlur' as const,
    label: 'onBlur',
    description: 'Validation runs when a field loses focus. Good balance of UX and feedback.',
  },
  {
    value: 'onChange' as const,
    label: 'onChange',
    description: 'Validation runs on every keystroke. Immediate feedback but can be overwhelming.',
  },
  {
    value: 'onTouched' as const,
    label: 'onTouched',
    description:
      'Validation runs after first blur, then on change. Progressive disclosure of errors.',
  },
]

const currentModeInfo = computed(() => modes.find((m) => m.value === activeMode.value)!)

const onSubmit = (data: z.infer<typeof schema>) => {
  alert(`Success! Email: ${data.email}`)
}

const codeSnippets = [
  {
    title: 'Modes',
    language: 'typescript' as const,
    code: `// onSubmit - Default, validates only on form submission
const submitForm = useForm({ schema, mode: 'onSubmit' })

// onBlur - Validates when field loses focus
const blurForm = useForm({ schema, mode: 'onBlur' })

// onChange - Validates on every input change
const changeForm = useForm({ schema, mode: 'onChange' })

// onTouched - Validates after field touched, then on change
const touchedForm = useForm({ schema, mode: 'onTouched' })`,
  },
  {
    title: 'reValidateMode',
    language: 'typescript' as const,
    code: `// reValidateMode controls validation behavior after first submit
const form = useForm({
  schema,
  mode: 'onSubmit',      // First validation on submit
  reValidateMode: 'onChange'  // After submit, validate on change
})`,
  },
]
</script>

<style scoped>
.modes-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mode-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mode-tab {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab:hover {
  border-color: #42b883;
}

.mode-tab.active {
  background: #42b883;
  border-color: #42b883;
  color: white;
}

.mode-description {
  padding: 1rem;
  background: #e8f5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #2e7d32;
}

.form-panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.field input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.field input:focus {
  outline: none;
  border-color: #42b883;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #35a372;
}
</style>
