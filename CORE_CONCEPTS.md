# Vue Hook Form - Core Concepts

A TypeScript-first form library for Vue 3, inspired by React Hook Form but built for Vue's strengths.

## Vision

Build a form library that makes form handling in Vue.js feel like a superpower through:
- Perfect TypeScript inference without manual typing
- Minimal boilerplate code
- Maximum performance with minimal re-renders
- Zero-config common patterns
- Composable-first architecture

## The Problem We're Solving

Current Vue form libraries (VeeValidate, FormKit, Vuelidate, Formwerk) struggle with:

1. **Complex cross-field validation** - Validating one field based on another's value
2. **Nested/dynamic form arrays** - Adding/removing form sections dynamically
3. **Type-safe form schemas** - Getting TypeScript to infer types correctly
4. **Async validation patterns** - Server-side validation with proper UX
5. **Excessive boilerplate** - Too much code for simple forms
6. **Performance issues** - Unnecessary re-renders on every keystroke

## Our Differentiators

### 1. Form-Level vs Field-Level Management

**Other libraries** (VeeValidate, Formwerk):
```vue
<!-- You manage each field separately -->
<input v-model="name" />
<input v-model="email" />
<!-- Validation happens per-field -->
```

**Vue Hook Form**:
```vue
<!-- One composable manages the entire form -->
const { register, handleSubmit, errors } = useForm({ schema })
<!-- All state centralized -->
```

### 2. Schema as Source of Truth

We use **Zod** (or other schema libraries) as the single source of truth:

```typescript
// 1. Define schema (with validation rules)
const schema = z.object({
  name: z.string().min(2),
  email: z.email()
})

// 2. TypeScript types are automatically inferred
type FormValues = z.infer<typeof schema> // { name: string; email: string }

// 3. Runtime validation uses the same schema
// No duplication, no manual typing
```

**Benefits**:
- ✅ Single source of truth
- ✅ Perfect TypeScript inference
- ✅ Compile-time AND runtime safety
- ✅ Portable schemas (can use in backend too)

### 3. Performance-First Architecture

**Uncontrolled inputs by default**:
```typescript
// We use refs to access DOM directly (like React Hook Form)
// This avoids Vue reactivity overhead for every keystroke
const inputRef = ref<HTMLInputElement>()
const value = inputRef.value?.value // Direct DOM access
```

**Minimal re-renders**:
```typescript
// Only re-render what changed
const errors = shallowRef<FormErrors>({})
const touchedFields = shallowRef<Set<string>>(new Set())

// Targeted updates instead of full form re-render
errors.value = { ...errors.value, email: 'Invalid email' }
```

**Validation strategies**:
- `onSubmit` - Only validate when submitting (default, fastest)
- `onBlur` - Validate when field loses focus
- `onChange` - Validate on every change (after first error)
- `onTouched` - Validate after field is touched

### 4. Zero-Boilerplate Nested Forms

**The Challenge**:
```vue
<!-- Current libraries make this painful -->
<div v-for="(address, i) in addresses" :key="i">
  <input v-model="addresses[i].street" />
  <!-- Managing keys, validation, removal is complex -->
</div>
```

**Our Solution**:
```vue
<!-- One method call, fully typed -->
const { fields } = useForm({ schema })

<div v-for="field in fields('addresses')" :key="field.key">
  <input v-bind="register(`addresses.${field.index}.street`)" />
  <button @click="field.remove()">Remove</button>
</div>

<button @click="fields('addresses').append({})">Add</button>
```

**Features**:
- Automatic stable keys for Vue's reconciliation
- Type-safe paths (TypeScript knows `addresses[0].street` exists)
- Built-in CRUD: append, remove, insert, swap, move
- Automatic cleanup when items removed

## Core API Design

### `useForm(options)`

The main composable that manages entire form state.

```typescript
const {
  // Register inputs
  register: (name: Path<TSchema>) => RegisterReturn

  // Submit handler
  handleSubmit: (onValid: (data: TSchema) => void) => (e: Event) => Promise<void>

  // Form state
  formState: {
    errors: FieldErrors<TSchema>
    isDirty: boolean
    isValid: boolean
    isSubmitting: boolean
    touchedFields: Set<Path<TSchema>>
  }

  // Dynamic arrays
  fields: (name: Path<TSchema>) => FieldArray

  // Programmatic control
  setValue: (name: Path<TSchema>, value: any) => void
  getValue: (name: Path<TSchema>) => any
  reset: (values?: Partial<TSchema>) => void

  // Watching values
  watch: (name?: Path<TSchema>) => ComputedRef<any>
} = useForm({
  schema: zodSchema,
  defaultValues: {},
  mode: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched'
})
```

### `register(name)`

Returns reactive bindings for inputs:

```typescript
// For native inputs
<input v-bind="register('email')" />

// Returns:
{
  name: 'email',
  ref: (el) => void,
  onChange: (e) => void,
  onBlur: (e) => void
}

// For custom components (controlled mode)
const email = register('email', { controlled: true })
<CustomInput v-model="email.value" />
```

### `fields(name)`

Manages dynamic field arrays:

```typescript
const addressFields = fields('addresses')

// Returns array of field objects
addressFields.value.forEach((field) => {
  field.key      // Stable key for v-for
  field.index    // Current index
  field.remove() // Remove this item
})

// Array operations
addressFields.append({ street: '', city: '' })
addressFields.remove(index)
addressFields.insert(index, value)
addressFields.swap(indexA, indexB)
addressFields.move(from, to)
```

## Technical Architecture

### Project Structure

```
src/
├── lib/                    # Library code
│   ├── index.ts           # Public exports
│   ├── useForm.ts         # Main composable
│   ├── types.ts           # TypeScript types
│   ├── validation.ts      # Validation logic
│   ├── fieldArray.ts      # Dynamic arrays
│   └── utils/
│       ├── paths.ts       # Path helpers
│       └── reactivity.ts  # Performance helpers
├── examples/              # Demo apps
│   ├── BasicForm.vue
│   ├── NestedArrays.vue
│   └── AsyncValidation.vue
└── main.ts                # Dev server entry
```

### Type System

**Path generation**:
```typescript
// Zod schema
const schema = z.object({
  user: z.object({
    addresses: z.array(z.object({
      street: z.string()
    }))
  })
})

// Auto-generated valid paths
type Paths =
  | 'user'
  | 'user.addresses'
  | `user.addresses.${number}`
  | `user.addresses.${number}.street`

// TypeScript errors for invalid paths
register('user.addresses.0.street')  // ✅
register('user.addresses.0.invalid') // ❌ Type error
```

**Error types**:
```typescript
type FieldErrors<T> = {
  [K in keyof T]?: T[K] extends object
    ? FieldErrors<T[K]>
    : string
}

// Usage
errors.value.email // string | undefined
errors.value.user.addresses[0].street // string | undefined
```

### Performance Optimizations

1. **Shallow refs for form state**
   ```typescript
   const errors = shallowRef<FieldErrors>({})
   // Only triggers re-render when object reference changes
   ```

2. **Batch validations**
   ```typescript
   queueMicrotask(() => {
     // Validate all changed fields in one batch
   })
   ```

3. **Memoized validators**
   ```typescript
   const validator = computed(() => {
     return zodSchema.parse
   })
   ```

4. **Lazy error object creation**
   ```typescript
   // Only create error object structure when needed
   if (hasErrors) {
     errors.value = buildErrorObject(validationResult)
   }
   ```

5. **Uncontrolled inputs by default**
   ```typescript
   // Avoid Vue's reactivity for form values during typing
   // Only sync to reactive state on blur/submit
   ```

## Development Roadmap

### Phase 1: MVP (Week 1-2)
- [ ] Core `useForm` composable
- [ ] Basic `register` method
- [ ] Zod integration
- [ ] Error handling
- [ ] `handleSubmit` with validation
- [ ] Simple demo app

### Phase 2: Advanced Features (Week 3-4)
- [ ] Dynamic field arrays
- [ ] Async validation with debouncing
- [ ] Watch API
- [ ] Form state (isDirty, isValid, etc.)
- [ ] setValue/getValue/reset methods
- [ ] Multiple validation modes

### Phase 3: Polish & DX (Week 5-6)
- [ ] DevTools browser extension
- [ ] Performance benchmarks
- [ ] Complete TypeScript coverage
- [ ] Interactive documentation site
- [ ] Migration guides from other libraries

### Phase 4: Ecosystem (Week 7-8)
- [ ] Valibot adapter
- [ ] Yup adapter
- [ ] Custom validators
- [ ] Integration examples (Vuetify, PrimeVue, etc.)
- [ ] Testing utilities

## Design Decisions & Trade-offs

### Why Uncontrolled by Default?

**Pros**:
- ⚡ Massive performance gains (no reactivity overhead)
- 🎯 Native HTML validation works
- 🔋 Less memory usage

**Cons**:
- 🤔 Less intuitive for Vue developers
- 🎨 Harder to build custom components

**Solution**: Support both modes
```typescript
register('email') // Uncontrolled (performance)
register('email', { controlled: true }) // Controlled (flexibility)
```

### Why Zod First?

**Pros**:
- 🎯 Best TypeScript inference in ecosystem
- 📦 Most popular schema validator
- 🔌 Works everywhere (backend, frontend)
- 🚀 Active development

**Cons**:
- 📚 Learning curve for new users
- 📦 Adds bundle size

**Solution**: Zod is default but adapters for Valibot, Yup, custom validators

### Why Form-Level vs Field-Level?

**Form-level** (our approach):
```typescript
const form = useForm({ schema })
// One source of truth, centralized state
```

**Field-level** (VeeValidate/Formwerk):
```typescript
const email = useField('email', rules)
const name = useField('name', rules)
// Each field manages itself
```

**Why form-level is better**:
1. ✅ Easier cross-field validation
2. ✅ Better performance (batched updates)
3. ✅ Simpler mental model
4. ✅ Easier to serialize/restore form state
5. ✅ Better TypeScript inference

## Success Metrics

### Bundle Size
- **Target**: < 10kb gzipped
- **Strategy**: Tree-shakable, minimal dependencies

### Developer Experience
- **Target**: 50% less code than VeeValidate
- **Measure**: Lines of code for common patterns

### TypeScript
- **Target**: 100/100 type score
- **Measure**: `tsc --noEmit` with strict mode

### Performance
- **Target**: 2x faster than VeeValidate
- **Measure**: Benchmarks for renders, validation

### Adoption
- **Target**: 100+ GitHub stars in 3 months
- **Target**: 5+ companies using in production

## Competitive Analysis

| Feature | VeeValidate | FormKit | Formwerk | **Vue Hook Form** |
|---------|-------------|---------|----------|------------------|
| Bundle (gzip) | ~15kb | ~50kb | ~12kb | **< 10kb** |
| TypeScript | Good | Good | Good | **Perfect** |
| API Style | Field-level | Component | Component | **Form-level** |
| Nested Arrays | Verbose | Complex | Component | **Simple** |
| Boilerplate | Medium | Low | Low | **Minimal** |
| Performance | Good | Good | Good | **Excellent** |
| Zod Support | Adapter | Limited | Adapter | **Native** |
| Learning Curve | Medium | High | Medium | **Low** |

## Resources & Inspiration

### Similar Libraries
- [React Hook Form](https://react-hook-form.com/) - Main inspiration
- [TanStack Form](https://tanstack.com/form) - Another React alternative
- [Formik](https://formik.org/) - Classic React form library

### Vue Form Libraries
- [VeeValidate](https://vee-validate.logaretm.com/)
- [FormKit](https://formkit.com/)
- [Vuelidate](https://vuelidate.js.org/)
- [Formwerk](https://formwerk.dev/)

### Schema Validators
- [Zod](https://zod.dev/) - TypeScript-first validation
- [Valibot](https://valibot.dev/) - Lighter alternative
- [Yup](https://github.com/jquense/yup) - Classic validator

## Future Ideas

- **AI-powered form generation**: Describe form in natural language
- **Visual form builder**: Drag-and-drop form designer
- **Accessibility scanner**: Automatic ARIA validation
- **Form analytics**: Track field completion rates, abandonment
- **Multi-step forms**: Built-in wizard pattern
- **Conditional fields**: Show/hide based on other fields
- **Internationalization**: Built-in i18n support

## Contributing

When working on this project:

1. **Keep it simple** - Resist feature creep
2. **TypeScript first** - Types are not optional
3. **Performance matters** - Benchmark everything
4. **DX is priority #1** - Developer experience over everything
5. **Document as you go** - Code without docs is incomplete

## License

MIT - Build something awesome with it.
