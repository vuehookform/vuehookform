# Vue Hook Form

A TypeScript-first form library for Vue 3, inspired by React Hook Form.

[![npm version](https://img.shields.io/npm/v/@vuehookform/core)](https://www.npmjs.com/package/@vuehookform/core) [![CI](https://img.shields.io/github/actions/workflow/status/vuehookform/core/ci.yml?branch=main&label=CI)](https://github.com/vuehookform/core/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Coverage](https://img.shields.io/badge/coverage-90%25+-brightgreen)](https://github.com/vuehookform/core)

## Features

- **TypeScript First** - Perfect type inference with zero manual typing
- **Zero Config** - Works out of the box with sensible defaults
- **Performant** - Minimal re-renders using uncontrolled inputs
- **Zod Native** - First-class Zod integration for validation
- **Tiny Bundle** - < 5kb gzipped, tree-shakable
- **UI Agnostic** - Works with any UI library or custom components

## Quick Start

```bash
npm install @vuehookform/core zod
```

```vue
<script setup lang="ts">
import { useForm } from '@vuehookform/core'
import { z } from 'zod'

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

const { register, handleSubmit, formState } = useForm({
  schema,
  mode: 'onBlur',
})

const onSubmit = (data) => {
  console.log(data) // Fully typed: { email: string, password: string }
}
</script>

<template>
  <form @submit="handleSubmit(onSubmit)">
    <input v-bind="register('email')" type="email" />
    <span v-if="formState.errors.email">{{ formState.errors.email }}</span>

    <input v-bind="register('password')" type="password" />
    <span v-if="formState.errors.password">{{ formState.errors.password }}</span>

    <button type="submit" :disabled="formState.isSubmitting">Submit</button>
  </form>
</template>
```

## Key Concepts

### Schema as Source of Truth

```typescript
const userSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  age: z.number().min(18),
})

type UserForm = z.infer<typeof userSchema>
// { name: string; email: string; age: number }
```

### Dynamic Arrays

```vue
<script setup>
const { register, fields } = useForm({ schema })
const addresses = fields('addresses')
</script>

<template>
  <div v-for="field in addresses.value" :key="field.key">
    <input v-bind="register(`addresses.${field.index}.street`)" />
    <button @click="field.remove()">Remove</button>
  </div>
  <button @click="addresses.append({ street: '', city: '' })">Add Address</button>
</template>
```

### Validation Modes

```typescript
useForm({
  schema,
  mode: 'onSubmit', // Only validate on submit (default)
  // mode: 'onBlur',    // Validate when field loses focus
  // mode: 'onChange',  // Validate on every keystroke
  // mode: 'onTouched', // Validate after field is touched
})
```

## API Reference

### `useForm(options)`

```typescript
const {
  register, // Register input field
  handleSubmit, // Create submit handler with validation
  formState, // Reactive form state (errors, isSubmitting, etc.)
  fields, // Manage dynamic field arrays
  setValue, // Programmatically set field value
  getValue, // Get current field value
  reset, // Reset form to default values
  watch, // Watch field value changes
  validate, // Manually trigger validation
} = useForm({
  schema, // Zod schema for validation
  defaultValues: {}, // Initial form values
  mode: 'onSubmit', // When to validate
})
```

### `fields(name)`

```typescript
const addresses = fields('addresses')

addresses.append({ street: '', city: '' })
addresses.remove(0)
addresses.insert(1, value)
addresses.swap(0, 1)
addresses.move(0, 2)
```

## Contributing

Contributions welcome! Feel free to report bugs, suggest features, or submit PRs.

## License

MIT
