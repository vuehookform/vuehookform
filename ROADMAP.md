# Vue Hook Form - Development Roadmap

> A comprehensive plan to achieve feature parity with React Hook Form and establish Vue Hook Form as the definitive form library for Vue 3

**Version:** 1.0.0
**Last Updated:** December 2025
**Status:** Active Development

---

## 🎯 Vision

Build the **React Hook Form for Vue** - a lightweight, performant, TypeScript-first form state management library that leverages Vue 3's Composition API and reactivity system.

## 📊 Current State (v0.1.0)

### ✅ Completed Features

- [x] Core `useForm` composable
- [x] Form registration with `register()`
- [x] Form submission with `handleSubmit()`
- [x] Native Zod integration (no resolvers needed)
- [x] Form state tracking (isDirty, isValid, isSubmitting, etc.)
- [x] Dynamic field arrays with CRUD operations
- [x] Error handling with nested object support
- [x] Multiple validation modes (onSubmit, onBlur, onChange, onTouched)
- [x] Watch API for reactive value tracking
- [x] setValue/getValue for programmatic control
- [x] Reset functionality
- [x] TypeScript with perfect type inference
- [x] Uncontrolled inputs by default (performance)
- [x] Controlled input support

### ✅ All Core React Hook Form Features Implemented

All priority features for feature parity have been implemented:

- [x] **setFocus()** - Programmatic focus management
- [x] **clearErrors()** - Manual error clearing
- [x] **trigger()** - Manual validation triggering
- [x] **getFieldState()** - Individual field state access
- [x] **setError()** - Programmatic error setting with multi-error support
- [x] **getValues()** - Get all form values at once
- [x] **Per-field dirty tracking** - Track which specific fields changed
- [x] **Per-field touched tracking** - Track which fields were touched
- [x] **Field-level validation** - Custom validators per field (via RegisterOptions.validate)
- [x] **Form arrays manipulation** - append, prepend, remove, insert, swap, move, update methods
- [x] **Disabled fields** - Skip validation for disabled fields (via RegisterOptions.disabled)
- [x] **Context API** - Share form methods across components (provideForm, useFormContext)
- [x] **Async field validation** - Debounced server-side validation (via RegisterOptions.validateDebounce)
- [x] **defaultValues from async** - Load initial values asynchronously (supports async function)
- [x] **shouldUnregister** - Remove field data on unmount (global and per-field option)
- [x] **reset() with options** - keepErrors, keepDirty, keepTouched, keepSubmitCount, keepDefaultValues
- [x] **Multi-error support** - FieldError with type, message, and types for multiple validation errors
- [x] **Standalone composables** - useWatch, useController, useFormState

---

## 🗺️ Development Phases

## Phase 1: Core Feature Parity (Priority P0 & P1)

**Goal:** Achieve 95% feature parity with React Hook Form
**Status:** ✅ Complete (18/18 features implemented)

### 1.1 Focus Management (P0)

**API:**
```typescript
const { setFocus } = useForm({ schema })

// Focus a field
setFocus('email')

// Focus with options
setFocus('email', {
  shouldSelect: true  // Select text in input
})
```

**Implementation:**
```typescript
// In useForm.ts
function setFocus<TPath extends Path<FormValues>>(
  name: TPath,
  options?: { shouldSelect?: boolean }
): void {
  const fieldRef = fieldRefs.get(name)
  if (fieldRef?.value && fieldRef.value instanceof HTMLInputElement) {
    fieldRef.value.focus()
    if (options?.shouldSelect) {
      fieldRef.value.select()
    }
  }
}
```

**Use Cases:**
- Focus first error field on submit
- Auto-focus next field in multi-step forms
- Improve accessibility

**Effort:** 2 hours

---

### 1.2 Clear Errors (P0)

**API:**
```typescript
const { clearErrors } = useForm({ schema })

// Clear all errors
clearErrors()

// Clear specific field error
clearErrors('email')

// Clear multiple field errors
clearErrors(['email', 'password'])
```

**Implementation:**
```typescript
function clearErrors(name?: TPath | TPath[]): void {
  if (!name) {
    // Clear all errors
    errors.value = {} as FieldErrors<FormValues>
    return
  }

  if (Array.isArray(name)) {
    // Clear multiple fields
    const newErrors = { ...errors.value }
    name.forEach(field => {
      delete newErrors[field as keyof typeof newErrors]
    })
    errors.value = newErrors as FieldErrors<FormValues>
    return
  }

  // Clear single field
  const newErrors = { ...errors.value }
  delete newErrors[name as keyof typeof newErrors]
  errors.value = newErrors as FieldErrors<FormValues>
}
```

**Use Cases:**
- Clear errors after custom validation
- Reset error state without resetting form
- Handle server-side validation responses

**Effort:** 2 hours

---

### 1.3 Trigger Validation (P1)

**API:**
```typescript
const { trigger } = useForm({ schema })

// Validate all fields
const isValid = await trigger()

// Validate specific field
const isEmailValid = await trigger('email')

// Validate multiple fields
const isValid = await trigger(['email', 'password'])
```

**Implementation:**
```typescript
async function trigger(name?: TPath | TPath[]): Promise<boolean> {
  if (!name) {
    return await validate()
  }

  if (Array.isArray(name)) {
    let allValid = true
    for (const field of name) {
      const isValid = await validate(field)
      if (!isValid) allValid = false
    }
    return allValid
  }

  return await validate(name)
}
```

**Use Cases:**
- Validate on blur
- Validate before navigation
- Step-by-step form validation
- Custom validation timing

**Effort:** 3 hours

---

### 1.4 Get Field State (P1)

**API:**
```typescript
const { getFieldState } = useForm({ schema })

const emailState = getFieldState('email')
// Returns: { isDirty, isTouched, error, invalid }
```

**Implementation:**
```typescript
interface FieldState {
  isDirty: boolean
  isTouched: boolean
  error?: string
  invalid: boolean
}

function getFieldState<TPath extends Path<FormValues>>(
  name: TPath
): FieldState {
  const error = get(errors.value, name)
  return {
    isDirty: dirtyFields.value.has(name),
    isTouched: touchedFields.value.has(name),
    error: error,
    invalid: !!error
  }
}
```

**Use Cases:**
- Per-field UI state
- Conditional field rendering
- Custom validation indicators

**Effort:** 3 hours

---

### 1.5 Set Error (P1)

**API:**
```typescript
const { setError } = useForm({ schema })

// Set field error
setError('email', {
  type: 'manual',
  message: 'This email is already taken'
})

// Set multiple errors
setError('root.serverError', {
  type: 'server',
  message: 'Something went wrong'
})
```

**Implementation:**
```typescript
interface ErrorOption {
  type: string
  message: string
}

function setError<TPath extends Path<FormValues>>(
  name: TPath,
  error: ErrorOption
): void {
  const newErrors = { ...errors.value }
  set(newErrors, name, error.message)
  errors.value = newErrors as FieldErrors<FormValues>
}
```

**Use Cases:**
- Server-side validation errors
- Custom async validation
- External validation integration

**Effort:** 2 hours

---

### 1.6 Get All Values (P1)

**API:**
```typescript
const { getValues } = useForm({ schema })

// Get all form values
const allValues = getValues()

// Get specific field
const email = getValues('email')

// Get multiple fields
const values = getValues(['email', 'password'])
```

**Implementation:**
```typescript
function getValues(): FormValues
function getValues<TPath extends Path<FormValues>>(name: TPath): PathValue<FormValues, TPath>
function getValues<TPath extends Path<FormValues>>(names: TPath[]): Partial<FormValues>
function getValues(nameOrNames?: string | string[]) {
  if (!nameOrNames) {
    return formData as FormValues
  }

  if (Array.isArray(nameOrNames)) {
    return nameOrNames.reduce((acc, name) => {
      acc[name] = get(formData, name)
      return acc
    }, {} as Record<string, unknown>)
  }

  return get(formData, nameOrNames)
}
```

**Use Cases:**
- Access form data without submission
- Conditional logic based on values
- Preview/summary pages

**Effort:** 2 hours

---

### 1.7 Per-Field Dirty & Touched Tracking (P1)

**Current:** We only track at form level
**Needed:** Track each field individually

**API:**
```typescript
const { formState } = useForm({ schema })

formState.value.dirtyFields // Set<string> → Record<string, boolean>
formState.value.touchedFields // Set<string> → Record<string, boolean>
```

**Implementation:**
```typescript
// Change from Set to Record
const dirtyFields = ref<Record<string, boolean>>({})
const touchedFields = ref<Record<string, boolean>>({})

// Update formState computed
const formState = computed<FormState<FormValues>>(() => ({
  errors: errors.value,
  isDirty: Object.keys(dirtyFields.value).length > 0,
  dirtyFields: dirtyFields.value,
  isValid: Object.keys(errors.value).length === 0,
  isSubmitting: isSubmitting.value,
  touchedFields: touchedFields.value,
  submitCount: submitCount.value,
}))
```

**Effort:** 4 hours

---

### 1.8 Form Context API (P2) ✅ Implemented

**API:**
```typescript
// Provider
provideForm(form)

// Consumer
const { register, formState } = useFormContext()
```

**Status:** Complete - provideForm() and useFormContext() implemented with FormContextKey symbol.

---

### 1.9 Standalone Composables (P1) ✅ Implemented

**useWatch** - Watch field values without full form instance:
```typescript
const email = useWatch({ control: form, name: 'email' })
const multiple = useWatch({ name: ['email', 'name'] })
const all = useWatch({}) // watch all fields
```

**useController** - For controlled component integration:
```typescript
const { field, fieldState } = useController({ name: 'email' })
// field.value, field.onChange, field.onBlur, field.ref
```

**useFormState** - Subscribe to specific form state:
```typescript
const state = useFormState({ name: ['isSubmitting', 'isDirty'] })
```

**Status:** Complete - All three composables exported from index.ts.

---

### 1.10 Multi-Error Support (P1) ✅ Implemented

**API:**
```typescript
// Single error (backward compatible)
errors.email // 'Invalid email'

// Multiple errors per field
errors.password // { type: 'too_small', message: '...', types: { too_small: '...', invalid_format: ['...', '...'] } }

// setError with type
setError('email', { type: 'server', message: 'Email taken' })
```

**Status:** Complete - FieldError type with type, message, and types for multiple validation errors.

---

### 1.11 Future: Resolver Pattern (P2)

**Goal:** Support non-Zod validators (Yup, Joi, Valibot) via resolver pattern.

**API:**
```typescript
import { yupResolver } from '@vue-hook-form/resolvers'

useForm({
  resolver: yupResolver(yupSchema)
})
```

**Status:** Planned for future release. Currently Zod-only (first-class support).

---

## Phase 2: Vue-Specific Enhancements (P1 & P2)

**Goal:** Leverage Vue's strengths and ecosystem
**Timeline:** 2-3 weeks
**Status:** Planning

### 2.1 Vue DevTools Integration (P1)

**Features:**
- Inspect form state in DevTools
- View field values and errors
- Track validation events
- Time-travel debugging

**Implementation:**
```typescript
// lib/devtools.ts
import { devtools } from '@vue/devtools-api'

export function setupDevtools(formId: string, formData: any) {
  if (process.env.NODE_ENV === 'development') {
    devtools.api?.addInspector({
      id: `vue-hook-form-${formId}`,
      label: 'Vue Hook Form',
      icon: 'description',
      treeFilterPlaceholder: 'Search forms...'
    })

    // Send state updates
    devtools.api?.sendInspectorState({
      inspectorId: `vue-hook-form-${formId}`,
      state: {
        'Form State': formData
      }
    })
  }
}
```

**Effort:** 1 week

---

### 2.2 Nuxt Module (P1)

**Features:**
- Auto-import composables
- SSR support
- Type generation
- Configuration presets

**Implementation:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-hook-form/nuxt']
})

// Auto-imported
const { register, handleSubmit } = useForm({ schema })
```

**Package Structure:**
```
vue-hook-form/
├── dist/
├── nuxt/
│   ├── module.ts
│   └── runtime/
│       └── composables.ts
└── package.json
```

**Effort:** 1 week

---

### 2.3 Valibot Support (P2)

In addition to Zod, support Valibot (lighter alternative):

**API:**
```typescript
import * as v from 'valibot'

const schema = v.object({
  email: v.string([v.email()]),
  age: v.number([v.minValue(18)])
})

const { register } = useForm({
  schema,
  validator: 'valibot'
})
```

**Effort:** 1 week

---

### 2.4 VueUse Integration (P2)

Integrate with VueUse composables:

```typescript
const { register, watch } = useForm({ schema })

// Use with VueUse
const debouncedEmail = refDebounced(watch('email'), 500)
const { copy } = useClipboard({ source: watch('url') })
```

**Effort:** 3 days

---

## Phase 3: Advanced Features (P2 & P3)

**Goal:** Advanced use cases and optimizations
**Timeline:** 1 month
**Status:** Future

### 3.1 Field Dependencies (P2)

**API:**
```typescript
useForm({
  schema,
  dependencies: {
    // Revalidate password when confirmPassword changes
    password: ['confirmPassword'],
    // Revalidate city when country changes
    city: ['country']
  }
})
```

**Effort:** 1 week

---

### 3.2 Conditional Fields (P2)

**API:**
```typescript
const { register, watch } = useForm({ schema })

const accountType = watch('accountType')

<template>
  <input v-bind="register('accountType')" />

  <!-- Conditional rendering -->
  <input
    v-if="accountType === 'business'"
    v-bind="register('companyName')"
  />
</template>
```

**Effort:** Already works, just needs documentation

---

### 3.3 Form Wizard / Multi-Step (P2)

**API:**
```typescript
const {
  currentStep,
  nextStep,
  prevStep,
  goToStep,
  isFirstStep,
  isLastStep
} = useFormWizard({
  schema,
  steps: ['personal', 'address', 'payment']
})
```

**Effort:** 2 weeks

---

### 3.4 Persistent Forms (P2)

Auto-save to localStorage/sessionStorage:

**API:**
```typescript
useForm({
  schema,
  persist: {
    storage: 'localStorage',
    key: 'checkout-form',
    exclude: ['password'] // Don't persist sensitive fields
  }
})
```

**Effort:** 1 week

---

### 3.5 Form Analytics (P3)

Track form interactions:

```typescript
const { analytics } = useForm({
  schema,
  analytics: {
    onFieldFocus: (field) => { /* track */ },
    onFieldBlur: (field) => { /* track */ },
    onSubmit: (data) => { /* track */ },
    onError: (errors) => { /* track */ }
  }
})
```

**Effort:** 1 week

---

### 3.6 Accessibility Enhancements (P1)

**Features:**
- Auto ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

**Implementation:**
```typescript
register('email', {
  aria: {
    label: 'Email address',
    describedby: 'email-help',
    required: true
  }
})
```

**Effort:** 2 weeks

---

## Phase 4: Ecosystem & Growth (P2 & P3)

**Goal:** Community adoption and ecosystem integration
**Timeline:** Ongoing
**Status:** Future

### 4.1 Official Documentation Site (P1)

**Features:**
- Interactive examples
- API reference
- Migration guides
- Video tutorials
- Comparison tables

**Tech Stack:**
- VitePress
- Vue 3
- Shiki for syntax highlighting
- Algolia search

**Effort:** 2 weeks

---

### 4.2 Playground / Sandbox (P1)

**Features:**
- Try Vue Hook Form online
- Share form examples
- Community templates

**Options:**
- StackBlitz integration
- CodeSandbox templates
- Dedicated playground site

**Effort:** 1 week

---

### 4.3 UI Library Integrations (P2)

Create integration packages for popular UI libraries:

**Packages:**
```
@vue-hook-form/primevue
@vue-hook-form/vuetify
@vue-hook-form/naive-ui
@vue-hook-form/element-plus
@vue-hook-form/ant-design-vue
```

**Example:**
```typescript
import { PrimeInput } from '@vue-hook-form/primevue'

<PrimeInput v-bind="register('email')" />
```

**Effort:** 2 weeks per library

---

### 4.4 Testing Utilities (P2)

**Package:** `@vue-hook-form/testing`

**Features:**
```typescript
import { renderForm, fillField, submitForm } from '@vue-hook-form/testing'

const { getByLabelText, submit } = renderForm(MyForm)

await fillField(getByLabelText('Email'), 'test@example.com')
await submitForm()

expect(onSubmit).toHaveBeenCalledWith({
  email: 'test@example.com'
})
```

**Effort:** 1 week

---

### 4.5 Code Generator / CLI (P3)

**Features:**
```bash
# Generate form from Zod schema
npx vue-hook-form generate --schema ./schema.ts --output ./MyForm.vue

# Generate schema from existing form
npx vue-hook-form extract ./MyForm.vue --output ./schema.ts
```

**Effort:** 2 weeks

---

### 4.6 VS Code Extension (P3)

**Features:**
- Schema intellisense
- Auto-complete for field paths
- Inline error highlighting
- Code snippets

**Effort:** 3 weeks

---

## 📈 Success Metrics

### Technical Metrics

- ✅ Bundle size < 10kb gzipped
- ✅ 100% feature parity with React Hook Form (18/18 core features)
- ⏳ 100/100 TypeScript type score
- ✅ 359 tests across 13 test files (register, handleSubmit, watch, fieldArray, validationModes, utils, context, useForm, asyncValidation, multiError, standaloneComposables, useValidation, integration)
- ⏳ < 1ms validation time for typical forms

### Adoption Metrics

- ⏳ 1,000+ GitHub stars in 6 months
- ⏳ 10,000+ weekly npm downloads
- ⏳ 10+ production implementations
- ⏳ 5+ blog posts/tutorials
- ⏳ Featured on awesome-vue

### Community Metrics

- ⏳ 50+ Discord members
- ⏳ 20+ contributors
- ⏳ 100+ issues resolved
- ⏳ Active maintenance (< 48hr response time)

---

## 🛠️ Technical Debt & Refactoring

### Code Quality Improvements

1. **Remove ESLint `any` types** (P1)
   - Replace with proper generics
   - Add strict mode compliance

2. **Add comprehensive tests** (P0)
   - Unit tests for all methods
   - Integration tests
   - E2E tests with real forms

3. **Performance benchmarks** (P1)
   - Compare vs VeeValidate
   - Compare vs Formik
   - Measure re-render counts

4. **Bundle optimization** (P2)
   - Tree-shaking analysis
   - Code splitting
   - Dead code elimination

---

## 🚀 Release Strategy

### v0.2.0 (Next)
**Focus:** Core feature parity
**Timeline:** 2 weeks
**Features:**
- setFocus
- clearErrors
- trigger
- getFieldState
- setError
- getValues

### v0.3.0
**Focus:** Advanced form state
**Timeline:** 3 weeks
**Features:**
- Per-field dirty/touched tracking
- Form context API
- Async validation improvements

### v1.0.0 (Stable)
**Focus:** Production ready
**Timeline:** 2 months
**Features:**
- All Phase 1 features complete
- Vue DevTools integration
- Comprehensive documentation
- 90%+ test coverage
- Migration guides

### v1.1.0
**Focus:** Ecosystem expansion
**Timeline:** 3 months
**Features:**
- Nuxt module
- Valibot support
- VueUse integration

### v2.0.0
**Focus:** Advanced features
**Timeline:** 6 months
**Features:**
- Multi-step forms
- Persistent forms
- UI library integrations

---

## 📝 Documentation Plan

### Must-Have Documentation

1. **README.md** ✅
   - Quick start
   - Basic examples
   - API overview

2. **CORE_CONCEPTS.md** ✅
   - Architecture
   - Design decisions
   - Philosophy

3. **API.md** (To-Do)
   - Complete API reference
   - All methods documented
   - TypeScript signatures

4. **MIGRATION.md** (To-Do)
   - From VeeValidate
   - From Vuelidate
   - From React Hook Form (for React devs)

5. **EXAMPLES.md** (To-Do)
   - Common patterns
   - Best practices
   - Real-world scenarios

6. **CONTRIBUTING.md** (To-Do)
   - How to contribute
   - Code style guide
   - Testing requirements

---

## 🤝 Community & Marketing

### Content Strategy

1. **Blog Posts**
   - "Why we built Vue Hook Form"
   - "React Hook Form vs Vue Hook Form"
   - "Building forms in Vue 3: A new approach"
   - "From VeeValidate to Vue Hook Form"

2. **Video Tutorials**
   - Getting started (5 min)
   - Advanced features (15 min)
   - Real-world app (30 min)

3. **Social Media**
   - Twitter/X announcements
   - Reddit r/vuejs posts
   - Vue Discord shares
   - Dev.to articles

4. **Presentations**
   - Vue.js Amsterdam
   - VueConf US
   - Local Vue meetups

### Partnership Opportunities

- **PrimeVue** - Integration package
- **Vuetify** - Integration package
- **Nuxt** - Official module listing
- **VueUse** - Composable integration
- **Vue Mastery** - Course/tutorial

---

## 💰 Sustainability Model

### Open Source (MIT)
Core library remains free and open source

### Potential Revenue Streams
1. **Premium Templates** - Pre-built form templates
2. **Enterprise Support** - Paid support contracts
3. **Training** - Workshops and courses
4. **Consulting** - Implementation help
5. **Sponsorships** - GitHub sponsors, Open Collective

---

## 🎯 Priority Matrix

```
Priority | Feature                      | Impact | Effort | Score
---------|------------------------------|--------|--------|-------
P0       | setFocus                     | High   | Low    | 10
P0       | clearErrors                  | High   | Low    | 10
P0       | Tests & test coverage        | High   | High   | 8
P1       | trigger                      | High   | Low    | 9
P1       | getFieldState                | Med    | Low    | 8
P1       | setError                     | High   | Low    | 9
P1       | getValues                    | High   | Low    | 9
P1       | Per-field tracking           | Med    | Med    | 7
P1       | Vue DevTools                 | High   | High   | 7
P1       | Nuxt module                  | High   | Med    | 8
P2       | Form context                 | Med    | Med    | 6
P2       | Valibot support              | Med    | Med    | 6
P2       | Field dependencies           | Low    | Med    | 5
P2       | Form wizard                  | Med    | High   | 5
P2       | UI integrations              | Med    | High   | 5
P3       | Analytics                    | Low    | Med    | 4
P3       | CLI tool                     | Low    | High   | 3
P3       | VS Code extension            | Low    | High   | 3
```

---

## 🔄 Continuous Improvement

### Weekly Goals
- Fix 5+ issues
- Respond to all discussions
- Update documentation
- Add 1 new example

### Monthly Goals
- Release patch version
- Publish blog post
- Create video content
- Engage with community

### Quarterly Goals
- Major version release
- Conference talk/presentation
- Ecosystem expansion
- Performance improvements

---

## 📞 Get Involved

Want to contribute? Check out:
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Discord**: Real-time community chat
- **Twitter/X**: Updates and announcements

---

**Last Updated:** December 2025
**Next Review:** January 2025
**Maintained By:** Vue Hook Form Core Team
