import { computed, type ComputedRef } from 'vue'
import type { FormState } from '../lib'
import { get } from '../lib/utils/paths'

/**
 * Composable for type-safe error access including nested paths
 *
 * @example
 * const { getError, hasError, errorFor } = useFormErrors(formState)
 *
 * // Simple field
 * getError('email') // string | undefined
 *
 * // Nested array field
 * getError(`addresses.${idx}.street`) // string | undefined
 *
 * // Reactive error for specific field
 * const emailError = errorFor('email')
 */
export function useFormErrors<T>(formState: ComputedRef<FormState<T>>) {
  /**
   * Get error message for a field path
   */
  function getError(path: string): string | undefined {
    const errors = formState.value.errors as Record<string, unknown>
    const error = get(errors, path)
    return typeof error === 'string' ? error : undefined
  }

  /**
   * Check if a field has an error
   */
  function hasError(path: string): boolean {
    return getError(path) !== undefined
  }

  /**
   * Get all errors for fields starting with a prefix
   * Useful for array-level error display
   */
  function getErrorsForPrefix(prefix: string): Record<string, string> {
    const errors = formState.value.errors as Record<string, unknown>
    const result: Record<string, string> = {}

    function collectErrors(obj: unknown, currentPath: string) {
      if (typeof obj === 'string') {
        result[currentPath] = obj
        return
      }
      if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          const newPath = currentPath ? `${currentPath}.${key}` : key
          if (newPath.startsWith(prefix)) {
            collectErrors(value, newPath)
          }
        }
      }
    }

    collectErrors(errors, '')
    return result
  }

  /**
   * Create a computed error getter for a specific field
   * Returns a reactive computed ref that updates when errors change
   */
  function errorFor(path: string): ComputedRef<string | undefined> {
    return computed(() => getError(path))
  }

  /**
   * Get the first error from the form (useful for displaying a single error message)
   */
  function getFirstError(): string | undefined {
    const errors = formState.value.errors as Record<string, unknown>

    function findFirst(obj: unknown): string | undefined {
      if (typeof obj === 'string') return obj
      if (obj && typeof obj === 'object') {
        for (const value of Object.values(obj)) {
          const found = findFirst(value)
          if (found) return found
        }
      }
      return undefined
    }

    return findFirst(errors)
  }

  /**
   * Get error count for the form
   */
  function getErrorCount(): number {
    const errors = formState.value.errors as Record<string, unknown>
    let count = 0

    function countErrors(obj: unknown) {
      if (typeof obj === 'string') {
        count++
        return
      }
      if (obj && typeof obj === 'object') {
        for (const value of Object.values(obj)) {
          countErrors(value)
        }
      }
    }

    countErrors(errors)
    return count
  }

  return {
    getError,
    hasError,
    getErrorsForPrefix,
    errorFor,
    getFirstError,
    getErrorCount,
  }
}
