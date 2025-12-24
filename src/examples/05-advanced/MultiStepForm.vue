<template>
  <ExampleLayout
    title="Multi-Step Form (Wizard)"
    description="Build wizard-style forms with step-by-step validation. Use validate() to check specific fields before allowing navigation to the next step."
    :features="['Step validation', 'Progress tracking', 'validate(field)', 'Step navigation']"
    :code-snippets="codeSnippets"
  >
    <div class="wizard-container">
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          :class="['progress-step', { completed: idx < currentStep, active: idx === currentStep }]"
          @click="goToStep(idx)"
        >
          <span class="step-number">{{ idx + 1 }}</span>
          <span class="step-label">{{ step.title }}</span>
        </div>
        <div class="progress-line">
          <div
            class="progress-fill"
            :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
          />
        </div>
      </div>

      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(onSubmit)" class="wizard-form">
          <!-- Step 1: Account -->
          <div v-show="currentStep === 0" class="step-content">
            <h3>{{ steps[0]!.title }}</h3>
            <p class="step-description">{{ steps[0]!.description }}</p>

            <FormField
              name="email"
              label="Email Address"
              type="email"
              required
              placeholder="john@example.com"
            />
            <FormField
              name="password"
              label="Password"
              type="password"
              required
              placeholder="Min 8 characters"
            />
            <FormField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              required
              placeholder="Repeat password"
            />
          </div>

          <!-- Step 2: Profile -->
          <div v-show="currentStep === 1" class="step-content">
            <h3>{{ steps[1]!.title }}</h3>
            <p class="step-description">{{ steps[1]!.description }}</p>

            <div class="row">
              <FormField name="firstName" label="First Name" required placeholder="John" />
              <FormField name="lastName" label="Last Name" required placeholder="Doe" />
            </div>
            <FormField name="phone" label="Phone Number" type="tel" placeholder="(555) 123-4567" />
            <FormField name="dateOfBirth" label="Date of Birth" type="date" />
          </div>

          <!-- Step 3: Preferences -->
          <div v-show="currentStep === 2" class="step-content">
            <h3>{{ steps[2]!.title }}</h3>
            <p class="step-description">{{ steps[2]!.description }}</p>

            <FormCheckbox name="newsletter" label="Subscribe to our newsletter" />
            <FormCheckbox name="marketing" label="Receive marketing emails" />
            <FormCheckbox name="terms" label="I agree to the terms and conditions" required />

            <div class="field-group">
              <label class="field-label">How did you hear about us?</label>
              <select v-bind="register('referralSource')" class="select">
                <option value="">Select an option...</option>
                <option value="google">Google Search</option>
                <option value="social">Social Media</option>
                <option value="friend">Friend/Referral</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div v-show="currentStep === 3" class="step-content">
            <h3>{{ steps[3]!.title }}</h3>
            <p class="step-description">{{ steps[3]!.description }}</p>

            <div class="review-section">
              <h4>Account</h4>
              <div class="review-item">
                <span class="review-label">Email:</span>
                <span class="review-value">{{ getValue('email') }}</span>
              </div>
            </div>

            <div class="review-section">
              <h4>Profile</h4>
              <div class="review-item">
                <span class="review-label">Name:</span>
                <span class="review-value"
                  >{{ getValue('firstName') }} {{ getValue('lastName') }}</span
                >
              </div>
              <div class="review-item">
                <span class="review-label">Phone:</span>
                <span class="review-value">{{ getValue('phone') || 'Not provided' }}</span>
              </div>
            </div>

            <div class="review-section">
              <h4>Preferences</h4>
              <div class="review-item">
                <span class="review-label">Newsletter:</span>
                <span class="review-value">{{ getValue('newsletter') ? 'Yes' : 'No' }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Terms Accepted:</span>
                <span class="review-value">{{ getValue('terms') ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="wizard-nav">
            <button
              v-if="currentStep > 0"
              type="button"
              @click="prevStep"
              class="nav-btn secondary"
            >
              Previous
            </button>
            <div class="nav-spacer" />
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="nextStep"
              :disabled="validating"
              class="nav-btn primary"
            >
              {{ validating ? 'Validating...' : 'Next' }}
            </button>
            <button
              v-if="currentStep === steps.length - 1"
              type="submit"
              :disabled="formState.isSubmitting"
              class="nav-btn submit"
            >
              {{ formState.isSubmitting ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormCheckbox } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const steps = [
  { title: 'Account', description: 'Set up your login credentials' },
  { title: 'Profile', description: 'Tell us about yourself' },
  { title: 'Preferences', description: 'Customize your experience' },
  { title: 'Review', description: 'Review and confirm your details' },
]

// Fields to validate per step
const stepFields = [
  ['email', 'password', 'confirmPassword'],
  ['firstName', 'lastName'],
  ['terms'],
  [], // Review step - no validation needed
]

const schema = z
  .object({
    // Step 1: Account
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    // Step 2: Profile
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    // Step 3: Preferences
    newsletter: z.boolean().optional(),
    marketing: z.boolean().optional(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
    referralSource: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const form = useForm({
  schema,
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    newsletter: false,
    marketing: false,
    terms: false,
    referralSource: '',
  },
  mode: 'onSubmit', // Validate on step navigation instead
})

const { register, handleSubmit, formState, validate, getValue } = form

type WizardFieldPath = keyof z.infer<typeof schema>

const currentStep = ref(0)
const validating = ref(false)

async function nextStep() {
  validating.value = true

  try {
    // Validate only current step's fields
    const fields = stepFields[currentStep.value] || []
    let allValid = true

    for (const field of fields) {
      const isValid = await validate(field as WizardFieldPath)
      if (!isValid) allValid = false
    }

    if (allValid) {
      currentStep.value++
    }
  } finally {
    validating.value = false
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function goToStep(idx: number) {
  // Only allow going to completed steps or current step
  if (idx <= currentStep.value) {
    currentStep.value = idx
  }
}

const onSubmit = async (data: z.infer<typeof schema>) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))
  console.log('Account created:', data)
  alert(`Welcome, ${data.firstName}! Your account has been created.`)
}

const codeSnippets = [
  {
    title: 'Step Validation',
    language: 'typescript' as const,
    code: `const stepFields = [
  ['email', 'password', 'confirmPassword'],
  ['firstName', 'lastName'],
  ['terms'],
  [], // Review - no validation
]

async function nextStep() {
  const fields = stepFields[currentStep]
  let allValid = true

  for (const field of fields) {
    const isValid = await validate(field)
    if (!isValid) allValid = false
  }

  if (allValid) {
    currentStep++
  }
}`,
  },
  {
    title: 'Review Step',
    language: 'vue' as const,
    code: `<!-- Use getValue to display entered data -->
<div class="review-section">
  <h4>Account</h4>
  <span>Email: {{ getValue('email') }}</span>
</div>

<div class="review-section">
  <h4>Profile</h4>
  <span>Name: {{ getValue('firstName') }} {{ getValue('lastName') }}</span>
</div>`,
  },
  {
    title: 'Navigation Logic',
    language: 'typescript' as const,
    code: `// Allow going back freely
function prevStep() {
  if (currentStep > 0) currentStep--
}

// Only allow clicking completed steps
function goToStep(idx: number) {
  if (idx <= currentStep) {
    currentStep = idx
  }
}

// Validate before proceeding
// mode: 'onSubmit' prevents auto-validation
// We call validate() manually on nextStep()`,
  },
]
</script>

<style scoped>
.wizard-container {
  max-width: 600px;
  margin: 0 auto;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.progress-line {
  position: absolute;
  top: 16px;
  left: 10%;
  right: 10%;
  height: 3px;
  background: #e0e0e0;
  z-index: 0;
}

.progress-fill {
  height: 100%;
  background: #42b883;
  transition: width 0.3s ease;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  cursor: pointer;
}

.step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s;
}

.progress-step.completed .step-number,
.progress-step.active .step-number {
  background: #42b883;
  color: white;
}

.step-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888;
}

.progress-step.active .step-label {
  color: #42b883;
  font-weight: 600;
}

.wizard-form {
  background: white;
}

.step-content {
  padding: 1.5rem 0;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.step-description {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.review-section {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.review-section h4 {
  margin: 0 0 0.75rem 0;
  color: #42b883;
  font-size: 0.9rem;
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.review-label {
  color: #666;
}

.review-value {
  font-weight: 500;
  color: #2c3e50;
}

.wizard-nav {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.nav-spacer {
  flex: 1;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.nav-btn.secondary:hover {
  background: #e0e0e0;
}

.nav-btn.primary {
  background: #667eea;
  color: white;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #5a67d8;
}

.nav-btn.submit {
  background: #42b883;
  color: white;
}

.nav-btn.submit:hover:not(:disabled) {
  background: #35a372;
}

.nav-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
