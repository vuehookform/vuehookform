<template>
  <ExampleLayout
    title="Login & Register Forms"
    description="Complete authentication forms with tab switching, password confirmation, async email validation, and password strength indicator. A real-world example combining multiple features."
    :features="['Tab switching', 'Password match', 'Async validation', 'reset()']"
    :code-snippets="codeSnippets"
  >
    <div class="auth-container">
      <!-- Tab Switcher -->
      <div class="auth-tabs">
        <button
          :class="['auth-tab', { active: activeTab === 'login' }]"
          @click="switchTab('login')"
        >
          Sign In
        </button>
        <button
          :class="['auth-tab', { active: activeTab === 'register' }]"
          @click="switchTab('register')"
        >
          Create Account
        </button>
      </div>

      <!-- Login Form -->
      <div v-show="activeTab === 'login'" class="auth-form">
        <FormProvider :form="loginForm">
          <form @submit="loginForm.handleSubmit(onLogin)" class="form">
            <FormField
              name="email"
              label="Email"
              type="email"
              required
              placeholder="john@example.com"
            />
            <FormField
              name="password"
              label="Password"
              type="password"
              required
              placeholder="Enter password"
            />

            <div class="form-options">
              <label class="remember-me">
                <input v-bind="loginForm.register('rememberMe')" type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <button
              type="submit"
              :disabled="loginForm.formState.value.isSubmitting"
              class="submit-btn"
            >
              {{ loginForm.formState.value.isSubmitting ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </FormProvider>
      </div>

      <!-- Register Form -->
      <div v-show="activeTab === 'register'" class="auth-form">
        <FormProvider :form="registerForm">
          <form @submit="registerForm.handleSubmit(onRegister)" class="form">
            <div class="field-with-status">
              <FormField
                name="email"
                label="Email"
                type="email"
                required
                placeholder="john@example.com"
              />
              <span v-if="checkingEmail" class="status checking">Checking...</span>
              <span v-else-if="emailAvailable === true" class="status available">Available</span>
              <span v-else-if="emailAvailable === false" class="status taken"
                >Already registered</span
              >
            </div>

            <FormField name="username" label="Username" required placeholder="Choose a username" />

            <div class="field-group">
              <FormField
                name="password"
                label="Password"
                type="password"
                required
                placeholder="Min 8 characters"
              />
              <!-- Password Strength -->
              <div class="strength-meter">
                <div
                  class="strength-bar"
                  :style="{ width: `${passwordStrength}%` }"
                  :class="strengthClass"
                />
              </div>
              <div class="strength-hints">
                <span :class="{ valid: hasMinLength }">8+ characters</span>
                <span :class="{ valid: hasUppercase }">Uppercase</span>
                <span :class="{ valid: hasNumber }">Number</span>
              </div>
            </div>

            <FormField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              required
              placeholder="Repeat password"
            />

            <FormCheckbox
              name="terms"
              label="I agree to the Terms of Service and Privacy Policy"
              required
            />

            <button
              type="submit"
              :disabled="registerForm.formState.value.isSubmitting"
              class="submit-btn register"
            >
              {{
                registerForm.formState.value.isSubmitting ? 'Creating account...' : 'Create Account'
              }}
            </button>
          </form>
        </FormProvider>
      </div>

      <!-- Social Login -->
      <div class="social-divider">
        <span>or continue with</span>
      </div>

      <div class="social-buttons">
        <button type="button" class="social-btn google">Google</button>
        <button type="button" class="social-btn github">GitHub</button>
      </div>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormCheckbox } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const activeTab = ref<'login' | 'register'>('login')

// Login Schema
const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

// Register Schema with password confirmation
const registerSchema = z
  .object({
    email: z.email('Please enter a valid email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Login Form
const loginForm = useForm({
  schema: loginSchema,
  defaultValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
  mode: 'onBlur',
})

// Register Form
const registerForm = useForm({
  schema: registerSchema,
  defaultValues: {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    terms: false,
  },
  mode: 'onBlur',
})

// Email availability check
const checkingEmail = ref(false)
const emailAvailable = ref<boolean | null>(null)

// Override email register with async validation
registerForm.register('email', {
  validate: async (value) => {
    if (!value || typeof value !== 'string') return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      emailAvailable.value = null
      return 'Invalid email format'
    }

    checkingEmail.value = true
    emailAvailable.value = null

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const taken = value.toLowerCase() === 'taken@example.com'
      emailAvailable.value = !taken
      return taken ? 'This email is already registered' : undefined
    } finally {
      checkingEmail.value = false
    }
  },
})

// Password strength
const passwordValue = registerForm.watch('password')

const hasMinLength = computed(() => {
  const pw = (passwordValue.value as string) || ''
  return pw.length >= 8
})

const hasUppercase = computed(() => {
  const pw = (passwordValue.value as string) || ''
  return /[A-Z]/.test(pw)
})

const hasNumber = computed(() => {
  const pw = (passwordValue.value as string) || ''
  return /[0-9]/.test(pw)
})

const passwordStrength = computed(() => {
  let strength = 0
  if (hasMinLength.value) strength += 33
  if (hasUppercase.value) strength += 33
  if (hasNumber.value) strength += 34
  return strength
})

const strengthClass = computed(() => {
  if (passwordStrength.value < 40) return 'weak'
  if (passwordStrength.value < 70) return 'medium'
  return 'strong'
})

// Tab switching resets forms
function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
  if (tab === 'login') {
    loginForm.reset()
  } else {
    registerForm.reset()
    emailAvailable.value = null
  }
}

// Submit handlers
const onLogin = async (data: z.infer<typeof loginSchema>) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Login:', data)
  alert(`Welcome back! Logged in as ${data.email}`)
}

const onRegister = async (data: z.infer<typeof registerSchema>) => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  console.log('Register:', data)
  alert(`Account created! Welcome, ${data.username}`)
}

const codeSnippets = [
  {
    title: 'Tab Switching',
    language: 'typescript' as const,
    code: `const activeTab = ref<'login' | 'register'>('login')

function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
  // Reset form when switching
  if (tab === 'login') {
    loginForm.reset()
  } else {
    registerForm.reset()
  }
}`,
  },
  {
    title: 'Password Match',
    language: 'typescript' as const,
    code: `const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
})
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)`,
  },
  {
    title: 'Async Email Check',
    language: 'typescript' as const,
    code: `registerForm.register('email', {
  validate: async (value) => {
    if (!isValidEmail(value)) return 'Invalid email'

    checkingEmail.value = true
    try {
      const taken = await checkEmailExists(value)
      emailAvailable.value = !taken
      return taken ? 'Email already registered' : undefined
    } finally {
      checkingEmail.value = false
    }
  },
})`,
  },
]
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.auth-tab {
  flex: 1;
  padding: 1rem;
  border: none;
  background: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.auth-tab.active {
  background: #42b883;
  color: white;
}

.auth-tab:not(.active):hover {
  background: #f5f5f5;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-with-status {
  position: relative;
}

.status {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status.checking {
  color: #ff9800;
}

.status.available {
  color: #4caf50;
}

.status.taken {
  color: #f44336;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strength-meter {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s;
}

.strength-bar.weak {
  background: #f44336;
}

.strength-bar.medium {
  background: #ff9800;
}

.strength-bar.strong {
  background: #4caf50;
}

.strength-hints {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #999;
}

.strength-hints span.valid {
  color: #4caf50;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.submit-btn {
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.submit-btn.register {
  background: #42b883;
}

.submit-btn.register:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-divider {
  text-align: center;
  position: relative;
  margin: 1.5rem 0;
}

.social-divider::before,
.social-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e0e0e0;
}

.social-divider::before {
  left: 0;
}

.social-divider::after {
  right: 0;
}

.social-divider span {
  background: white;
  padding: 0 1rem;
  color: #888;
  font-size: 0.85rem;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  border-color: #ccc;
  background: #f9f9f9;
}
</style>
