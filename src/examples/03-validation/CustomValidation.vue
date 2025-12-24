<template>
  <ExampleLayout
    title="Custom Field Validation"
    description="Add custom validation logic per field using the validate option in register(). Perfect for business rules that go beyond Zod's built-in validators."
    :features="['validate option', 'Custom rules', 'Sync validation', 'Per-field logic']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Username with custom rules -->
        <div class="field-group">
          <label class="field-label">Username *</label>
          <input v-bind="usernameField" type="text" placeholder="Choose a username" class="input" />
          <span v-if="getError('username')" class="error">{{ getError('username') }}</span>
          <ul class="rules-list">
            <li :class="{ valid: usernameRules.minLength }">At least 3 characters</li>
            <li :class="{ valid: usernameRules.noSpaces }">No spaces allowed</li>
            <li :class="{ valid: usernameRules.validStart }">Must start with a letter</li>
            <li :class="{ valid: usernameRules.validChars }">
              Only letters, numbers, and underscores
            </li>
          </ul>
        </div>

        <!-- Discount Code with format validation -->
        <div class="field-group">
          <label class="field-label">Discount Code (optional)</label>
          <input v-bind="discountField" type="text" placeholder="e.g., SAVE20" class="input" />
          <span v-if="getError('discountCode')" class="error">{{ getError('discountCode') }}</span>
          <p class="hint">
            Format: 4-8 uppercase letters/numbers, must contain at least one letter and one number
          </p>
        </div>

        <!-- Phone with format validation -->
        <div class="field-group">
          <label class="field-label">Phone Number</label>
          <input v-bind="phoneField" type="tel" placeholder="(555) 123-4567" class="input" />
          <span v-if="getError('phone')" class="error">{{ getError('phone') }}</span>
          <p class="hint">US format: (XXX) XXX-XXXX or XXX-XXX-XXXX</p>
        </div>

        <!-- URL with custom validation -->
        <div class="field-group">
          <label class="field-label">Website URL</label>
          <input v-bind="websiteField" type="url" placeholder="https://example.com" class="input" />
          <span v-if="getError('website')" class="error">{{ getError('website') }}</span>
          <p class="hint">Must start with https:// (we require secure URLs)</p>
        </div>

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

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  discountCode: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
})

const form = useForm({
  schema,
  defaultValues: {
    username: '',
    discountCode: '',
    phone: '',
    website: '',
  },
  mode: 'onChange',
})

const { handleSubmit, formState, register, watch } = form
const { getError } = useFormErrors(formState)

// Username with custom validation
const usernameField = register('username', {
  validate: (value) => {
    if (!value || typeof value !== 'string') return 'Username is required'
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.includes(' ')) return 'Username cannot contain spaces'
    if (!/^[a-zA-Z]/.test(value)) return 'Username must start with a letter'
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores allowed'
    return undefined
  },
})

// Discount code validation
const discountField = register('discountCode', {
  validate: (value) => {
    if (!value || typeof value !== 'string' || value === '') return undefined // Optional field
    if (value.length < 4 || value.length > 8) return 'Code must be 4-8 characters'
    if (value !== value.toUpperCase()) return 'Code must be uppercase'
    if (!/[A-Z]/.test(value)) return 'Code must contain at least one letter'
    if (!/[0-9]/.test(value)) return 'Code must contain at least one number'
    return undefined
  },
})

// Phone validation
const phoneField = register('phone', {
  validate: (value) => {
    if (!value || typeof value !== 'string' || value === '') return undefined
    // Accept: (555) 123-4567 or 555-123-4567 or 5551234567
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 10) return 'Phone number must be 10 digits'
    return undefined
  },
})

// Website validation
const websiteField = register('website', {
  validate: (value) => {
    if (!value || typeof value !== 'string' || value === '') return undefined
    try {
      const url = new URL(value)
      if (url.protocol !== 'https:') return 'URL must use HTTPS (secure connection required)'
      return undefined
    } catch {
      return 'Please enter a valid URL'
    }
  },
})

// Watch username for live rules display
const usernameValue = watch('username')
const usernameRules = computed(() => {
  const value = (usernameValue.value as string) || ''
  return {
    minLength: value.length >= 3,
    noSpaces: !value.includes(' '),
    validStart: /^[a-zA-Z]/.test(value),
    validChars: /^[a-zA-Z0-9_]*$/.test(value) && value.length > 0,
  }
})

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert('Form submitted successfully!')
}

const codeSnippets = [
  {
    title: 'Basic Custom Validation',
    language: 'typescript' as const,
    code: `const { register } = useForm({ schema })

// Add custom validation via register options
const usernameField = register('username', {
  validate: (value) => {
    if (!value) return 'Username is required'
    if (value.includes(' ')) return 'No spaces allowed'
    if (!/^[a-zA-Z]/.test(value)) return 'Must start with a letter'
    return undefined // No error
  }
})`,
  },
  {
    title: 'Optional Field Validation',
    language: 'typescript' as const,
    code: `// Validate only when field has a value
const discountField = register('discountCode', {
  validate: (value) => {
    // Skip validation if empty (optional field)
    if (!value || value === '') return undefined

    // Validate only if user entered something
    if (value.length < 4) return 'Code must be at least 4 characters'
    if (!/[0-9]/.test(value)) return 'Must contain a number'
    return undefined
  }
})`,
  },
  {
    title: 'Complex Validation',
    language: 'typescript' as const,
    code: `// Validate with external logic
const websiteField = register('website', {
  validate: (value) => {
    if (!value) return undefined

    try {
      const url = new URL(value)
      if (url.protocol !== 'https:') {
        return 'HTTPS required for security'
      }
      if (blockedDomains.includes(url.hostname)) {
        return 'This domain is not allowed'
      }
      return undefined
    } catch {
      return 'Invalid URL format'
    }
  }
})`,
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

.hint {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
}

.rules-list li {
  padding: 0.25rem 0;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rules-list li::before {
  content: 'x';
  color: #e74c3c;
  font-weight: bold;
}

.rules-list li.valid {
  color: #2e7d32;
}

.rules-list li.valid::before {
  content: '+';
  color: #2e7d32;
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
