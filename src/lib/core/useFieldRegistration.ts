import { computed, ref } from 'vue'
import type { FormContext } from './formContext'
import type {
  RegisterOptions,
  RegisterReturn,
  FieldErrors,
  Path,
} from '../types'
import { get, set, unset } from '../utils/paths'

/**
 * Create field registration functions
 */
export function createFieldRegistration<FormValues>(
  ctx: FormContext<FormValues>,
  validate: (fieldPath?: string) => Promise<boolean>,
) {
  /**
   * Register an input field
   */
  function register<TPath extends Path<FormValues>>(
    name: TPath,
    registerOptions?: RegisterOptions,
  ): RegisterReturn {
    const fieldRef = ref<HTMLInputElement | null>(null)
    ctx.fieldRefs.set(name, fieldRef)

    if (registerOptions) {
      ctx.fieldOptions.set(name, registerOptions)
    }

    // Initialize field value if not set
    if (get(ctx.formData, name) === undefined) {
      const defaultValue = get(ctx.defaultValues, name)
      if (defaultValue !== undefined) {
        set(ctx.formData, name, defaultValue)
      }
    }

    /**
     * Run custom field validation with optional debouncing
     */
    const runCustomValidation = async (fieldName: string, value: unknown, requestId: number) => {
      const fieldOpts = ctx.fieldOptions.get(fieldName)
      if (!fieldOpts?.validate || fieldOpts.disabled) {
        return
      }

      const error = await fieldOpts.validate(value)

      // Check if this is still the latest request (race condition handling)
      const latestRequestId = ctx.validationRequestIds.get(fieldName)
      if (requestId !== latestRequestId) {
        return // Stale request, ignore result
      }

      if (error) {
        ctx.errors.value = { ...ctx.errors.value, [fieldName]: error } as FieldErrors<FormValues>
      } else {
        // Clear the error if validation passes
        const newErrors = { ...ctx.errors.value }
        delete newErrors[fieldName as keyof typeof newErrors]
        ctx.errors.value = newErrors as FieldErrors<FormValues>
      }
    }

    /**
     * Handle field input (fires on every keystroke)
     */
    const onInput = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const value = target.type === 'checkbox' ? target.checked : target.value

      // Update form data
      set(ctx.formData, name, value)

      // Mark as dirty using Record
      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      // Validate based on mode
      if (
        ctx.options.mode === 'onChange' ||
        (ctx.options.mode === 'onTouched' && ctx.touchedFields.value[name]) ||
        (ctx.touchedFields.value[name] && ctx.options.reValidateMode === 'onChange')
      ) {
        await validate(name)
      }

      // Custom validation with optional debouncing
      const fieldOpts = ctx.fieldOptions.get(name)
      if (fieldOpts?.validate && !fieldOpts.disabled) {
        // Generate a new request ID for race condition handling
        const requestId = Date.now() + Math.random()
        ctx.validationRequestIds.set(name, requestId)

        const debounceMs = fieldOpts.validateDebounce || 0

        if (debounceMs > 0) {
          // Cancel any existing debounce timer
          const existingTimer = ctx.debounceTimers.get(name)
          if (existingTimer) {
            clearTimeout(existingTimer)
          }

          // Set new debounce timer
          const timer = setTimeout(() => {
            ctx.debounceTimers.delete(name)
            runCustomValidation(name, value, requestId)
          }, debounceMs)

          ctx.debounceTimers.set(name, timer)
        } else {
          // No debounce, run immediately
          await runCustomValidation(name, value, requestId)
        }
      }
    }

    /**
     * Handle field blur
     */
    const onBlur = async (_e: Event) => {
      // Mark as touched using Record
      ctx.touchedFields.value = { ...ctx.touchedFields.value, [name]: true }

      // Validate based on mode
      if (
        ctx.options.mode === 'onBlur' ||
        ctx.options.mode === 'onTouched' ||
        (ctx.submitCount.value > 0 && ctx.options.reValidateMode === 'onBlur')
      ) {
        await validate(name)
      }
    }

    /**
     * Ref callback to store element reference
     */
    const refCallback = (el: unknown) => {
      const previousEl = fieldRef.value
      fieldRef.value = el as HTMLInputElement | null

      // Set initial value for uncontrolled inputs
      if (el && !registerOptions?.controlled && el instanceof HTMLInputElement) {
        const value = get(ctx.formData, name)
        if (value !== undefined) {
          if (el.type === 'checkbox') {
            el.checked = value as boolean
          } else {
            el.value = value as string
          }
        }
      }

      // Handle shouldUnregister when element is removed (ref becomes null)
      if (previousEl && !el) {
        const shouldUnreg =
          registerOptions?.shouldUnregister ?? ctx.options.shouldUnregister ?? false

        if (shouldUnreg) {
          // Clear form data for this field
          unset(ctx.formData, name)

          // Clear errors for this field
          const newErrors = { ...ctx.errors.value }
          delete newErrors[name as keyof typeof newErrors]
          ctx.errors.value = newErrors as FieldErrors<FormValues>

          // Clear touched/dirty state
          const newTouched = { ...ctx.touchedFields.value }
          delete newTouched[name]
          ctx.touchedFields.value = newTouched

          const newDirty = { ...ctx.dirtyFields.value }
          delete newDirty[name]
          ctx.dirtyFields.value = newDirty

          // Clean up refs and options
          ctx.fieldRefs.delete(name)
          ctx.fieldOptions.delete(name)

          // Clean up debounce timers
          const timer = ctx.debounceTimers.get(name)
          if (timer) {
            clearTimeout(timer)
            ctx.debounceTimers.delete(name)
          }
          ctx.validationRequestIds.delete(name)
        }
      }
    }

    return {
      name,
      ref: refCallback,
      onInput,
      onBlur,
      ...(registerOptions?.controlled && {
        value: computed({
          get: () => get(ctx.formData, name),
          set: (val) => {
            set(ctx.formData, name, val)
            ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }
          },
        }),
      }),
    }
  }

  /**
   * Unregister a field to clean up refs and options
   */
  function unregister<TPath extends Path<FormValues>>(name: TPath): void {
    ctx.fieldRefs.delete(name)
    ctx.fieldOptions.delete(name)

    // Clean up debounce timers
    const timer = ctx.debounceTimers.get(name)
    if (timer) {
      clearTimeout(timer)
      ctx.debounceTimers.delete(name)
    }
    ctx.validationRequestIds.delete(name)
  }

  return { register, unregister }
}
