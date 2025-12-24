<template>
  <ExampleLayout
    title="TypeScript Type Inference"
    description="Leverage TypeScript for full type safety with form context. Get autocomplete for field names, catch invalid paths at compile time, and enjoy complete IntelliSense support in child components."
    :features="[
      'Path<T> type',
      'Typed useFormContext()',
      'Schema inference',
      'Autocomplete',
      'Compile-time safety',
    ]"
    :code-snippets="codeSnippets"
  >
    <form @submit.prevent="handleSubmit(onSubmit)" class="form">
      <div class="info-banner">
        <strong>TypeScript Benefits:</strong> All field names below have full autocomplete. Try
        changing a field name to something invalid - TypeScript will catch it!
      </div>

      <!-- Typed child components accessing context -->
      <ProfileSection />
      <NotificationSection />

      <!-- Show available paths for this schema -->
      <div class="paths-panel">
        <h4 class="paths-title">Available Paths (from TypeScript)</h4>
        <div class="paths-grid">
          <code v-for="path in availablePaths" :key="path" class="path-item">{{ path }}</code>
        </div>
      </div>

      <FormStateDebug :form-state="formState" />

      <button type="submit" :disabled="formState.isSubmitting" class="submit-btn">
        {{ formState.isSubmitting ? 'Saving...' : 'Save Settings' }}
      </button>
    </form>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm, provideForm, type Path } from '../../../lib'
import { FormStateDebug } from '../../../components/form'
import { ExampleLayout } from '../../../components/showcase'
import ProfileSection from './ProfileSection.vue'
import NotificationSection from './NotificationSection.vue'
import { settingsSchema, type SettingsData } from './schema'

// Extract all valid paths using Path<T> - this gives full autocomplete!
type SettingsPath = Path<SettingsData>

// These are all the valid paths TypeScript knows about:
const availablePaths: SettingsPath[] = [
  'profile',
  'profile.displayName',
  'profile.bio',
  'profile.avatarUrl',
  'notifications',
  'notifications.email',
  'notifications.push',
  'notifications.frequency',
]

// =============================================================================
// FORM SETUP
// =============================================================================

const form = useForm({
  schema: settingsSchema,
  defaultValues: {
    profile: {
      displayName: '',
      bio: '',
      avatarUrl: '',
    },
    notifications: {
      email: true,
      push: false,
      frequency: 'daily' as const,
    },
  },
  mode: 'onBlur',
})

provideForm(form)

const { handleSubmit, formState } = form

const onSubmit = (data: SettingsData) => {
  console.log('Settings saved:', data)
  alert(`Settings saved for ${data.profile.displayName}!`)
}

// =============================================================================
// CODE SNIPPETS
// =============================================================================

const codeSnippets = [
  {
    title: 'Typed Context Access',
    language: 'typescript' as const,
    code: `// Define schema as source of truth
const settingsSchema = z.object({
  profile: z.object({
    displayName: z.string().min(2),
    bio: z.string().max(160),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
})

// In child component - pass schema type for full inference
const { register, formState, watch } = useFormContext<typeof settingsSchema>()

// Now TypeScript knows ALL valid paths:
register('profile.displayName')     // ✓ autocomplete works
register('profile.bio')             // ✓ autocomplete works
register('notifications.email')     // ✓ autocomplete works

// TypeScript ERROR - invalid paths caught at compile time:
register('profile.invalid')         // ✗ Type error!
register('notAField')               // ✗ Type error!`,
  },
  {
    title: 'Path Type Extraction',
    language: 'typescript' as const,
    code: `import { type Path, type InferSchema } from 'vue-hook-form'

// Extract schema type
type SettingsSchema = typeof settingsSchema

// Extract data type
type SettingsData = z.infer<SettingsSchema>
// = { profile: { displayName: string, bio: string }, ... }

// Extract ALL valid paths as a union type
type SettingsPath = Path<SettingsData>
// = 'profile' | 'profile.displayName' | 'profile.bio' | 'notifications' | ...

// Use in props for type-safe field components
interface FieldProps {
  name: SettingsPath  // Only valid paths allowed!
  label: string
}`,
  },
  {
    title: 'Factory Pattern',
    language: 'typescript' as const,
    code: `// Create a typed context hook for specific forms
// Useful when you have many components using the same schema

function createFormContext<TSchema extends ZodType>() {
  return () => useFormContext<TSchema>()
}

// Create typed hooks for your forms
const useSettingsForm = createFormContext<typeof settingsSchema>()
const useCheckoutForm = createFormContext<typeof checkoutSchema>()

// Usage in components - full type safety!
const SettingsField = defineComponent({
  setup() {
    const { register } = useSettingsForm()
    // register() has full autocomplete for settings fields
  },
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

.info-banner {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border: 1px solid #667eea30;
  border-radius: 8px;
  color: #4c1d95;
  font-size: 0.9rem;
  line-height: 1.5;
}

.paths-panel {
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 8px;
}

.paths-title {
  margin: 0 0 0.75rem 0;
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 500;
}

.paths-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.path-item {
  padding: 0.25rem 0.5rem;
  background: #2d2d2d;
  color: #42b883;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'SF Mono', Monaco, monospace;
}

.submit-btn {
  padding: 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
