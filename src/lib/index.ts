/**
 * Vue Hook Form - TypeScript-first form library for Vue 3
 *
 * @example
 * ```ts
 * import { useForm } from './lib'
 * import { z } from 'zod'
 *
 * const schema = z.object({
 *   email: z.email(),
 *   name: z.string().min(2)
 * })
 *
 * const { register, handleSubmit, formState } = useForm({ schema })
 * ```
 */

export { useForm } from './useForm'
export { provideForm, useFormContext, FormContextKey } from './context'
export { useWatch, type UseWatchOptions } from './useWatch'
export { useController, type UseControllerOptions, type UseControllerReturn, type ControllerFieldProps } from './useController'
export { useFormState, type UseFormStateOptions, type FormStateKey } from './useFormState'

export type {
  UseFormOptions,
  UseFormReturn,
  RegisterOptions,
  RegisterReturn,
  FormState,
  FieldState,
  FieldErrors,
  FieldError,
  FieldErrorValue,
  FieldArray,
  FieldArrayItem,
  ValidationMode,
  InferSchema,
  Path,
  PathValue,
  ErrorOption,
  SetFocusOptions,
  ResetOptions,
  AsyncDefaultValues,
} from './types'
