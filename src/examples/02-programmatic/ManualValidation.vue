<template>
  <ExampleLayout
    title="Manual Validation"
    description="Trigger validation on-demand with validate(). Useful for multi-step forms, confirming before API calls, or validating specific fields."
    :features="['validate()', 'validate(field)', 'Step validation', 'Pre-action checks']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Email with manual check -->
        <div class="field-with-action">
          <FormField
            name="email"
            label="Email"
            type="email"
            required
            placeholder="john@example.com"
          />
          <button
            type="button"
            @click="validateEmail"
            class="validate-btn"
            :disabled="validatingEmail"
          >
            {{ validatingEmail ? 'Checking...' : 'Check Email' }}
          </button>
          <span
            v-if="emailCheckResult"
            :class="['check-result', emailCheckResult.valid ? 'valid' : 'invalid']"
          >
            {{ emailCheckResult.message }}
          </span>
        </div>

        <!-- Username with manual check -->
        <div class="field-with-action">
          <FormField name="username" label="Username" required placeholder="johndoe" />
          <button
            type="button"
            @click="validateUsername"
            class="validate-btn"
            :disabled="validatingUsername"
          >
            {{ validatingUsername ? 'Checking...' : 'Check Username' }}
          </button>
          <span
            v-if="usernameCheckResult"
            :class="['check-result', usernameCheckResult.valid ? 'valid' : 'invalid']"
          >
            {{ usernameCheckResult.message }}
          </span>
        </div>

        <FormField
          name="password"
          label="Password"
          type="password"
          required
          placeholder="Min 8 characters"
        />
        <FormField name="bio" label="Bio (optional)" placeholder="Tell us about yourself" />

        <FormStateDebug :form-state="formState" />

        <!-- Validation Actions -->
        <div class="validation-actions">
          <button type="button" @click="validateAll" class="action-btn" :disabled="validatingAll">
            {{ validatingAll ? 'Validating...' : 'Validate All Fields' }}
          </button>
          <span
            v-if="allValidResult !== null"
            :class="['check-result', allValidResult ? 'valid' : 'invalid']"
          >
            {{ allValidResult ? 'All fields are valid!' : 'Some fields have errors' }}
          </span>
        </div>

        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const schema = z.object({
  email: z.email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().optional(),
})

const form = useForm({
  schema,
  defaultValues: {
    email: '',
    username: '',
    password: '',
    bio: '',
  },
  mode: 'onSubmit', // No automatic validation - we'll do it manually
})

const { handleSubmit, formState, validate, getValues } = form

// Validation state
const validatingEmail = ref(false)
const validatingUsername = ref(false)
const validatingAll = ref(false)

const emailCheckResult = ref<{ valid: boolean; message: string } | null>(null)
const usernameCheckResult = ref<{ valid: boolean; message: string } | null>(null)
const allValidResult = ref<boolean | null>(null)

// Validate email field only
async function validateEmail() {
  validatingEmail.value = true
  emailCheckResult.value = null

  try {
    const isValid = await validate('email')

    if (isValid) {
      // Simulate API check for email availability
      await new Promise((resolve) => setTimeout(resolve, 500))
      const email = getValues('email')
      const isTaken = email === 'taken@example.com'

      emailCheckResult.value = isTaken
        ? { valid: false, message: 'Email is already registered' }
        : { valid: true, message: 'Email is available!' }
    } else {
      emailCheckResult.value = { valid: false, message: 'Please fix the email format' }
    }
  } finally {
    validatingEmail.value = false
  }
}

// Validate username field only
async function validateUsername() {
  validatingUsername.value = true
  usernameCheckResult.value = null

  try {
    const isValid = await validate('username')

    if (isValid) {
      // Simulate API check for username availability
      await new Promise((resolve) => setTimeout(resolve, 500))
      const username = getValues('username')
      const isTaken = username === 'admin' || username === 'root'

      usernameCheckResult.value = isTaken
        ? { valid: false, message: 'Username is taken' }
        : { valid: true, message: 'Username is available!' }
    } else {
      usernameCheckResult.value = { valid: false, message: 'Please fix the username' }
    }
  } finally {
    validatingUsername.value = false
  }
}

// Validate all fields
async function validateAll() {
  validatingAll.value = true
  allValidResult.value = null

  try {
    const isValid = await validate()
    allValidResult.value = isValid
  } finally {
    validatingAll.value = false
  }
}

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert('Form submitted successfully!')
}

const codeSnippets = [
  {
    title: 'Validate Field',
    language: 'typescript' as const,
    code: `const { validate, getValues } = useForm({ schema })

// Validate a specific field
async function checkEmail() {
  const isValid = await validate('email')

  if (isValid) {
    // Field passed validation - do additional checks
    const email = getValues('email')
    const available = await checkEmailAvailability(email)
  } else {
    // Field has errors - they're now in formState.errors
  }
}`,
  },
  {
    title: 'Validate All',
    language: 'typescript' as const,
    code: `// Validate entire form
async function validateBeforeProceeding() {
  const isValid = await validate()

  if (isValid) {
    // All fields valid - proceed to next step
    goToNextStep()
  } else {
    // Form has errors - user sees them automatically
    showNotification('Please fix the errors')
  }
}`,
  },
  {
    title: 'Multi-Step Pattern',
    language: 'typescript' as const,
    code: `// Common pattern for wizard/multi-step forms
const stepFields = {
  1: ['email', 'password'],
  2: ['firstName', 'lastName'],
  3: ['address', 'city', 'zip'],
}

async function goToNextStep() {
  // Validate only current step's fields
  const fields = stepFields[currentStep]
  let allValid = true

  for (const field of fields) {
    const valid = await validate(field)
    if (!valid) allValid = false
  }

  if (allValid) {
    currentStep++
  }
}`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-with-action {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.validate-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.validate-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.validate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.check-result {
  font-size: 0.85rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.check-result.valid {
  background: #e8f5e9;
  color: #2e7d32;
}

.check-result.invalid {
  background: #ffebee;
  color: #c62828;
}

.validation-actions {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #f57c00;
}

.action-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn {
  padding: 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:hover {
  background: #35a372;
}
</style>
