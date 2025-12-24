<template>
  <ExampleLayout
    title="Async Validation"
    description="Validate fields asynchronously with server-side checks. Common use cases include checking username availability, email uniqueness, or validating against external APIs."
    :features="['Async validate', 'Server-side checks', 'Loading states', 'Debouncing']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Email with async availability check -->
        <div class="field-group">
          <label class="field-label">Email Address *</label>
          <div class="input-with-status">
            <input v-bind="emailField" type="email" placeholder="Enter your email" class="input" />
            <span v-if="checkingEmail" class="status checking">Checking...</span>
            <span v-else-if="emailAvailable === true" class="status available">Available</span>
            <span v-else-if="emailAvailable === false" class="status taken">Taken</span>
          </div>
          <span v-if="getError('email')" class="error">{{ getError('email') }}</span>
          <p class="hint">Try: taken@example.com (simulated taken email)</p>
        </div>

        <!-- Username with async check -->
        <div class="field-group">
          <label class="field-label">Username *</label>
          <div class="input-with-status">
            <input
              v-bind="usernameField"
              type="text"
              placeholder="Choose a username"
              class="input"
            />
            <span v-if="checkingUsername" class="status checking">Checking...</span>
            <span v-else-if="usernameAvailable === true" class="status available">Available</span>
            <span v-else-if="usernameAvailable === false" class="status taken">Taken</span>
          </div>
          <span v-if="getError('username')" class="error">{{ getError('username') }}</span>
          <p class="hint">Reserved usernames: admin, root, system</p>
        </div>

        <!-- Promo Code with async validation -->
        <div class="field-group">
          <label class="field-label">Promo Code (optional)</label>
          <div class="input-with-status">
            <input v-bind="promoField" type="text" placeholder="Enter promo code" class="input" />
            <span v-if="checkingPromo" class="status checking">Validating...</span>
            <span v-else-if="promoValid === true" class="status available">Valid! 20% off</span>
            <span v-else-if="promoValid === false" class="status taken">Invalid code</span>
          </div>
          <span v-if="getError('promoCode')" class="error">{{ getError('promoCode') }}</span>
          <p class="hint">Valid codes: SAVE20, WELCOME10</p>
        </div>

        <FormField
          name="password"
          label="Password"
          type="password"
          required
          placeholder="Min 8 characters"
        />

        <FormStateDebug :form-state="formState" />
        <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
          Create Account
        </button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { useFormErrors } from '../../composables'
import { z } from 'zod'

// Simulated API functions
const simulateApiCall = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const checkEmailAvailability = async (email: string): Promise<boolean> => {
  await simulateApiCall(800)
  const takenEmails = ['taken@example.com', 'admin@example.com', 'test@example.com']
  return !takenEmails.includes(email.toLowerCase())
}

const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  await simulateApiCall(600)
  const reservedUsernames = ['admin', 'root', 'system', 'administrator']
  return !reservedUsernames.includes(username.toLowerCase())
}

const validatePromoCode = async (code: string): Promise<{ valid: boolean; discount?: number }> => {
  await simulateApiCall(500)
  const validCodes: Record<string, number> = {
    SAVE20: 20,
    WELCOME10: 10,
    SPECIAL50: 50,
  }
  const discount = validCodes[code.toUpperCase()]
  return { valid: !!discount, discount }
}

// Schema
const schema = z.object({
  email: z.email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  promoCode: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const form = useForm({
  schema,
  defaultValues: {
    email: '',
    username: '',
    promoCode: '',
    password: '',
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, register } = form
const { getError } = useFormErrors(formState)

// Async validation state
const checkingEmail = ref(false)
const emailAvailable = ref<boolean | null>(null)

const checkingUsername = ref(false)
const usernameAvailable = ref<boolean | null>(null)

const checkingPromo = ref(false)
const promoValid = ref<boolean | null>(null)

// Email field with async validation
const emailField = register('email', {
  validate: async (value) => {
    if (!value || typeof value !== 'string') return 'Email is required'

    // Basic format check first
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      emailAvailable.value = null
      return 'Invalid email format'
    }

    // Async availability check
    checkingEmail.value = true
    emailAvailable.value = null

    try {
      const available = await checkEmailAvailability(value)
      emailAvailable.value = available
      return available ? undefined : 'This email is already registered'
    } finally {
      checkingEmail.value = false
    }
  },
})

// Username field with async validation
const usernameField = register('username', {
  validate: async (value) => {
    if (!value || typeof value !== 'string') return 'Username is required'
    if (value.length < 3) {
      usernameAvailable.value = null
      return 'Username must be at least 3 characters'
    }

    checkingUsername.value = true
    usernameAvailable.value = null

    try {
      const available = await checkUsernameAvailability(value)
      usernameAvailable.value = available
      return available ? undefined : 'This username is already taken'
    } finally {
      checkingUsername.value = false
    }
  },
})

// Promo code with async validation
const promoField = register('promoCode', {
  validate: async (value) => {
    if (!value || typeof value !== 'string' || value === '') {
      promoValid.value = null
      return undefined // Optional field
    }

    checkingPromo.value = true
    promoValid.value = null

    try {
      const result = await validatePromoCode(value)
      promoValid.value = result.valid
      return result.valid ? undefined : 'Invalid promo code'
    } finally {
      checkingPromo.value = false
    }
  },
})

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert('Account created successfully!')
}

const codeSnippets = [
  {
    title: 'Async Validation',
    language: 'typescript' as const,
    code: `const emailField = register('email', {
  validate: async (value) => {
    // Sync validation first
    if (!value) return 'Email is required'
    if (!isValidEmail(value)) return 'Invalid format'

    // Then async check
    const available = await checkEmailApi(value)
    return available ? undefined : 'Email already registered'
  }
})`,
  },
  {
    title: 'With Loading State',
    language: 'typescript' as const,
    code: `const checking = ref(false)
const available = ref<boolean | null>(null)

const field = register('username', {
  validate: async (value) => {
    checking.value = true
    available.value = null

    try {
      const result = await checkAvailability(value)
      available.value = result
      return result ? undefined : 'Already taken'
    } finally {
      checking.value = false
    }
  }
})

// In template:
<span v-if="checking">Checking...</span>
<span v-else-if="available">Available!</span>`,
  },
  {
    title: 'Debounced Version',
    language: 'typescript' as const,
    code: `// For onChange mode, consider debouncing
// npm install @vueuse/core
// i]mport { useDebounceFn } from '@vueuse/core'

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

const debouncedCheck = debounce(
  async (value: string) => checkApi(value),
  500
)`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.input-with-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #42b883;
}

.status {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
}

.status.checking {
  background: #fff3e0;
  color: #e65100;
  animation: pulse 1s infinite;
}

.status.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.status.taken {
  background: #ffebee;
  color: #c62828;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.hint {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
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

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
