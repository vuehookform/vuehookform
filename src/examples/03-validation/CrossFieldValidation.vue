<template>
  <ExampleLayout
    title="Cross-Field Validation"
    description="Validate fields against each other using Zod's refine() method. Common patterns include password confirmation, date range validation, and conditional requirements."
    :features="['Zod refine()', 'Password confirmation', 'Date ranges', 'Conditional validation']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Password Section -->
        <fieldset class="fieldset">
          <legend>Password Setup</legend>

          <div class="field-group">
            <label class="field-label">Password *</label>
            <input
              v-bind="register('password')"
              type="password"
              placeholder="Enter password"
              class="input"
            />
            <span v-if="getError('password')" class="error">{{ getError('password') }}</span>

            <!-- Password Strength Indicator -->
            <div class="strength-meter">
              <div
                class="strength-bar"
                :style="{ width: `${passwordStrength}%` }"
                :class="strengthClass"
              />
            </div>
            <span class="strength-label">{{ strengthLabel }}</span>
          </div>

          <div class="field-group">
            <label class="field-label">Confirm Password *</label>
            <input
              v-bind="register('confirmPassword')"
              type="password"
              placeholder="Confirm password"
              class="input"
            />
            <span v-if="getError('confirmPassword')" class="error">{{
              getError('confirmPassword')
            }}</span>
            <span v-if="passwordsMatch && confirmPasswordValue" class="success"
              >Passwords match!</span
            >
          </div>
        </fieldset>

        <!-- Date Range Section -->
        <fieldset class="fieldset">
          <legend>Event Dates</legend>

          <div class="date-row">
            <div class="field-group">
              <label class="field-label">Start Date *</label>
              <input v-bind="register('startDate')" type="date" class="input" />
              <span v-if="getError('startDate')" class="error">{{ getError('startDate') }}</span>
            </div>

            <div class="field-group">
              <label class="field-label">End Date *</label>
              <input v-bind="register('endDate')" type="date" class="input" />
              <span v-if="getError('endDate')" class="error">{{ getError('endDate') }}</span>
            </div>
          </div>

          <div v-if="dateDuration" class="duration-info">Event Duration: {{ dateDuration }}</div>
        </fieldset>

        <!-- Conditional Fields Section -->
        <fieldset class="fieldset">
          <legend>Contact Preference</legend>

          <div class="field-group">
            <label class="field-label">Preferred Contact Method *</label>
            <select v-bind="contactMethodField" class="input">
              <option value="">Select method...</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="both">Both</option>
            </select>
            <span v-if="getError('contactMethod')" class="error">{{
              getError('contactMethod')
            }}</span>
          </div>

          <!-- Conditional: Email required if email/both selected -->
          <div v-if="requiresEmail" class="field-group conditional">
            <label class="field-label">Email Address *</label>
            <input
              v-bind="register('email')"
              type="email"
              placeholder="your@email.com"
              class="input"
            />
            <span v-if="getError('email')" class="error">{{ getError('email') }}</span>
          </div>

          <!-- Conditional: Phone required if phone/both selected -->
          <div v-if="requiresPhone" class="field-group conditional">
            <label class="field-label">Phone Number *</label>
            <input
              v-bind="register('phone')"
              type="tel"
              placeholder="(555) 123-4567"
              class="input"
            />
            <span v-if="getError('phone')" class="error">{{ getError('phone') }}</span>
          </div>
        </fieldset>

        <FormStateDebug :form-state="formState" />
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { useFormErrors } from '../../composables'
import { z } from 'zod'

// Schema with cross-field validation using refine()
const schema = z
  .object({
    // Password fields
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),

    // Date fields
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),

    // Conditional fields
    contactMethod: z.enum(['email', 'phone', 'both']),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  // Password confirmation validation
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  // Date range validation
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  // Conditional email validation
  .refine(
    (data) => {
      if (data.contactMethod === 'email' || data.contactMethod === 'both') {
        return data.email && data.email.includes('@')
      }
      return true
    },
    {
      message: 'Email is required when contact method includes email',
      path: ['email'],
    },
  )
  // Conditional phone validation
  .refine(
    (data) => {
      if (data.contactMethod === 'phone' || data.contactMethod === 'both') {
        return data.phone && data.phone.replace(/\D/g, '').length >= 10
      }
      return true
    },
    {
      message: 'Phone number is required when contact method includes phone',
      path: ['phone'],
    },
  )

const form = useForm({
  schema,
  defaultValues: {
    password: '',
    confirmPassword: '',
    startDate: '',
    endDate: '',
    contactMethod: '' as 'email' | 'phone' | 'both',
    email: '',
    phone: '',
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, register, watch } = form
const { getError } = useFormErrors(formState)

// Watch for computed values
const passwordValue = watch('password')
const confirmPasswordValue = watch('confirmPassword')
const startDateValue = watch('startDate')
const endDateValue = watch('endDate')
const contactMethodValue = watch('contactMethod')

// Controlled select for contact method
const contactMethodField = register('contactMethod', { controlled: true })

// Password strength calculation
const passwordStrength = computed(() => {
  const pw = (passwordValue.value as string) || ''
  let strength = 0
  if (pw.length >= 8) strength += 25
  if (/[A-Z]/.test(pw)) strength += 25
  if (/[a-z]/.test(pw)) strength += 25
  if (/[0-9]/.test(pw)) strength += 15
  if (/[^A-Za-z0-9]/.test(pw)) strength += 10
  return Math.min(strength, 100)
})

const strengthClass = computed(() => {
  if (passwordStrength.value < 40) return 'weak'
  if (passwordStrength.value < 70) return 'medium'
  return 'strong'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value === 0) return ''
  if (passwordStrength.value < 40) return 'Weak'
  if (passwordStrength.value < 70) return 'Medium'
  return 'Strong'
})

// Password match check
const passwordsMatch = computed(() => {
  const pw = passwordValue.value as string
  const confirm = confirmPasswordValue.value as string
  return pw && confirm && pw === confirm
})

// Date duration calculation
const dateDuration = computed(() => {
  const start = startDateValue.value as string
  const end = endDateValue.value as string
  if (!start || !end) return null

  const startDate = new Date(start)
  const endDate = new Date(end)
  if (endDate < startDate) return null

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  return `${days} day${days === 1 ? '' : 's'}`
})

// Conditional field visibility
const requiresEmail = computed(() => {
  const method = contactMethodValue.value as string
  return method === 'email' || method === 'both'
})

const requiresPhone = computed(() => {
  const method = contactMethodValue.value as string
  return method === 'phone' || method === 'both'
})

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert('Form submitted successfully!')
}

const codeSnippets = [
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
    path: ['confirmPassword'], // Error shows on this field
  }
)`,
  },
  {
    title: 'Date Range',
    language: 'typescript' as const,
    code: `const schema = z.object({
  startDate: z.string(),
  endDate: z.string(),
})
.refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)`,
  },
  {
    title: 'Conditional Required',
    language: 'typescript' as const,
    code: `const schema = z.object({
  contactMethod: z.enum(['email', 'phone', 'both']),
  email: z.string().optional(),
  phone: z.string().optional(),
})
.refine(
  (data) => {
    if (data.contactMethod === 'email' || data.contactMethod === 'both') {
      return !!data.email && data.email.includes('@')
    }
    return true
  },
  {
    message: 'Email required when contact method includes email',
    path: ['email'],
  }
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

.fieldset {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.fieldset legend {
  font-weight: 600;
  color: #42b883;
  padding: 0 0.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-group.conditional {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.input {
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

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.success {
  color: #2e7d32;
  font-size: 0.85rem;
}

.strength-meter {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition:
    width 0.3s,
    background 0.3s;
}

.strength-bar.weak {
  background: #e74c3c;
}

.strength-bar.medium {
  background: #ff9800;
}

.strength-bar.strong {
  background: #4caf50;
}

.strength-label {
  font-size: 0.8rem;
  color: #666;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.duration-info {
  padding: 0.75rem;
  background: #e8f5e9;
  border-radius: 4px;
  color: #2e7d32;
  font-size: 0.9rem;
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
