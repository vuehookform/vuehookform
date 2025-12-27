<template>
  <slot />
</template>

<script setup lang="ts" generic="TSchema extends ZodType">
import { provide } from 'vue'
import type { ZodType } from 'zod'
import type { UseFormReturn } from '../../lib'

const props = defineProps<{
  form: UseFormReturn<TSchema>
}>()

// Provide form methods to child components
provide('formRegister', props.form.register)
provide('formState', props.form.formState)
provide('formSetValue', props.form.setValue)
provide('formGetValues', props.form.getValues)
provide('formWatch', props.form.watch)
provide('formValidate', props.form.validate)
provide('formReset', props.form.reset)
provide('formFields', props.form.fields)
provide('formUnregister', props.form.unregister)
</script>
