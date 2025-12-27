import { ref, nextTick } from 'vue'
import type { FormContext } from './formContext'
import type {
  FieldArray,
  FieldArrayItem,
  FieldArrayOptions,
  FieldArrayFocusOptions,
  Path,
} from '../types'
import { get, set, generateId } from '../utils/paths'
import {
  __DEV__,
  validatePathSyntax,
  validatePathAgainstSchema,
  isArrayFieldInSchema,
  warnInvalidPath,
  warnPathNotInSchema,
  warnFieldsOnNonArray,
  warnArrayOperationRejected,
  warnArrayIndexOutOfBounds,
} from '../utils/devWarnings'

/**
 * Create field array management functions
 */
export function createFieldArrayManager<FormValues>(
  ctx: FormContext<FormValues>,
  validate: (fieldPath?: string) => Promise<boolean>,
  setFocus: (name: string) => void,
) {
  /**
   * Manage dynamic field arrays
   * @param name - Array field path
   * @param options - Optional configuration including rules
   */
  function fields<TPath extends Path<FormValues>>(
    name: TPath,
    options?: FieldArrayOptions,
  ): FieldArray {
    // Dev-mode path validation (tree-shaken in production)
    if (__DEV__) {
      // Check for syntax errors in the path
      const syntaxError = validatePathSyntax(name)
      if (syntaxError) {
        warnInvalidPath('fields', name, syntaxError)
      }

      // Validate path exists in schema
      const schemaResult = validatePathAgainstSchema(ctx.options.schema, name)
      if (!schemaResult.valid) {
        warnPathNotInSchema('fields', name, schemaResult.availableFields)
      }

      // Warn if path is not an array field
      const isArray = isArrayFieldInSchema(ctx.options.schema, name)
      if (isArray === false) {
        warnFieldsOnNonArray(name)
      }
    }

    // Get or create field array entry
    let fieldArray = ctx.fieldArrays.get(name)

    if (!fieldArray) {
      const existingValues = (get(ctx.formData, name) || []) as unknown[]
      fieldArray = {
        items: ref<FieldArrayItem[]>([]),
        values: existingValues,
        // Index cache stored on fieldArray for O(1) lookups, shared across fields() calls
        indexCache: new Map<string, number>(),
        // Store rules for validation
        rules: options?.rules,
      }
      ctx.fieldArrays.set(name, fieldArray)

      // Initialize form data if needed
      if (!get(ctx.formData, name)) {
        set(ctx.formData, name, [] as unknown[])
      }
    } else if (options?.rules) {
      // Update rules if provided on subsequent calls
      fieldArray.rules = options.rules
    }

    // Capture reference for closures
    const fa = fieldArray

    // Use the shared index cache from fieldArray state
    const indexCache = fa.indexCache

    /**
     * Rebuild the index cache from current items array
     */
    const rebuildIndexCache = () => {
      indexCache.clear()
      fa.items.value.forEach((item, idx) => {
        indexCache.set(item.key, idx)
      })
    }

    /**
     * Helper to create items with cached index lookup
     */
    const createItem = (key: string): FieldArrayItem => ({
      key,
      get index() {
        // O(1) lookup instead of O(n) findIndex
        return indexCache.get(key) ?? -1
      },
      remove() {
        const currentIndex = indexCache.get(key) ?? -1
        if (currentIndex !== -1) {
          removeAt(currentIndex)
        }
      },
    })

    // Populate items if empty (first access after creation)
    if (fa.items.value.length === 0 && fa.values.length > 0) {
      fa.items.value = fa.values.map(() => createItem(generateId()))
      rebuildIndexCache()
    }

    /**
     * Handle focus after array operations
     */
    const handleFocus = async (
      baseIndex: number,
      addedCount: number,
      focusOptions?: FieldArrayFocusOptions,
    ) => {
      // Default shouldFocus to false (opt-in behavior)
      if (!focusOptions?.shouldFocus) return

      // Wait for DOM to update
      await nextTick()

      // Determine which item to focus (relative index within added items)
      const focusItemOffset = focusOptions?.focusIndex ?? 0
      const targetIndex = baseIndex + Math.min(focusItemOffset, addedCount - 1)

      // Build the full field path
      let fieldPath = `${name}.${targetIndex}`
      if (focusOptions?.focusName) {
        fieldPath = `${fieldPath}.${focusOptions.focusName}`
      }

      // Use setFocus from useForm
      setFocus(fieldPath)
    }

    /**
     * Normalize input to always be an array (supports batch operations)
     */
    const normalizeToArray = <T>(value: T | T[]): T[] => {
      return Array.isArray(value) ? value : [value]
    }

    const append = (value: unknown | unknown[], focusOptions?: FieldArrayFocusOptions) => {
      const values = normalizeToArray(value)
      if (values.length === 0) return

      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      const insertIndex = currentValues.length // Items will be added starting at this index

      // Check maxLength rule before adding
      const rules = fa.rules
      if (rules?.maxLength && currentValues.length + values.length > rules.maxLength.value) {
        if (__DEV__) {
          warnArrayOperationRejected('append', name, 'maxLength', {
            current: currentValues.length,
            limit: rules.maxLength.value,
          })
        }
        return // Reject operation - maxLength exceeded
      }

      // Update form data (batch)
      const newValues = [...currentValues, ...values]
      set(ctx.formData, name, newValues)

      // Create items with unique keys (batch)
      const newItems = values.map(() => createItem(generateId()))
      fa.items.value = [...fa.items.value, ...newItems]
      rebuildIndexCache()

      // Mark dirty (single update for batch)
      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }

      // Handle focus
      handleFocus(insertIndex, values.length, focusOptions)
    }

    const prepend = (value: unknown | unknown[], focusOptions?: FieldArrayFocusOptions) => {
      const values = normalizeToArray(value)
      if (values.length === 0) return

      const currentValues = (get(ctx.formData, name) || []) as unknown[]

      // Check maxLength rule before adding
      const rules = fa.rules
      if (rules?.maxLength && currentValues.length + values.length > rules.maxLength.value) {
        if (__DEV__) {
          warnArrayOperationRejected('prepend', name, 'maxLength', {
            current: currentValues.length,
            limit: rules.maxLength.value,
          })
        }
        return // Reject operation - maxLength exceeded
      }

      // Update form data (batch)
      const newValues = [...values, ...currentValues]
      set(ctx.formData, name, newValues)

      // Create items with unique keys (batch)
      const newItems = values.map(() => createItem(generateId()))
      fa.items.value = [...newItems, ...fa.items.value]
      rebuildIndexCache()

      // Mark dirty
      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }

      // Handle focus (items added at index 0)
      handleFocus(0, values.length, focusOptions)
    }

    const update = (index: number, value: unknown) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      if (index < 0 || index >= currentValues.length) {
        if (__DEV__) {
          warnArrayIndexOutOfBounds('update', name, index, currentValues.length)
        }
        return // Invalid index, do nothing
      }
      const newValues = [...currentValues]
      newValues[index] = value
      set(ctx.formData, name, newValues)

      // Keep the same key - no items array change needed (preserves stable identity)
      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const removeAt = (index: number) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]

      // Bounds check
      if (index < 0 || index >= currentValues.length) {
        if (__DEV__) {
          warnArrayIndexOutOfBounds('remove', name, index, currentValues.length)
        }
        return
      }

      // Check minLength rule before removing
      const rules = fa.rules
      if (rules?.minLength && currentValues.length - 1 < rules.minLength.value) {
        if (__DEV__) {
          warnArrayOperationRejected('remove', name, 'minLength', {
            current: currentValues.length,
            limit: rules.minLength.value,
          })
        }
        return // Reject operation - minLength would be violated
      }

      const newValues = currentValues.filter((_: unknown, i: number) => i !== index)
      set(ctx.formData, name, newValues)

      // Remove item by current index, keep others
      const keyToRemove = fa.items.value[index]?.key
      fa.items.value = fa.items.value.filter((item) => item.key !== keyToRemove)
      rebuildIndexCache()

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const insert = (
      index: number,
      value: unknown | unknown[],
      focusOptions?: FieldArrayFocusOptions,
    ) => {
      const values = normalizeToArray(value)
      if (values.length === 0) return

      const currentValues = (get(ctx.formData, name) || []) as unknown[]

      // Check maxLength rule before adding
      const rules = fa.rules
      if (rules?.maxLength && currentValues.length + values.length > rules.maxLength.value) {
        if (__DEV__) {
          warnArrayOperationRejected('insert', name, 'maxLength', {
            current: currentValues.length,
            limit: rules.maxLength.value,
          })
        }
        return // Reject operation - maxLength exceeded
      }

      // Bounds validation: clamp index to valid range [0, length]
      const clampedIndex = Math.max(0, Math.min(index, currentValues.length))

      // Update form data (batch)
      const newValues = [
        ...currentValues.slice(0, clampedIndex),
        ...values,
        ...currentValues.slice(clampedIndex),
      ]
      set(ctx.formData, name, newValues)

      // Create items with unique keys (batch)
      const newItems = values.map(() => createItem(generateId()))
      fa.items.value = [
        ...fa.items.value.slice(0, clampedIndex),
        ...newItems,
        ...fa.items.value.slice(clampedIndex),
      ]
      rebuildIndexCache()

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }

      // Handle focus
      handleFocus(clampedIndex, values.length, focusOptions)
    }

    const swap = (indexA: number, indexB: number) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]

      // Bounds validation: reject invalid indices
      if (
        indexA < 0 ||
        indexB < 0 ||
        indexA >= currentValues.length ||
        indexB >= currentValues.length
      ) {
        if (__DEV__) {
          const invalidIndex = indexA < 0 || indexA >= currentValues.length ? indexA : indexB
          warnArrayIndexOutOfBounds('swap', name, invalidIndex, currentValues.length)
        }
        return // Invalid indices, do nothing
      }

      const newValues = [...currentValues]
      ;[newValues[indexA], newValues[indexB]] = [newValues[indexB], newValues[indexA]]
      set(ctx.formData, name, newValues)

      // Swap items in array
      const newItems = [...fa.items.value]
      const itemA = newItems[indexA]
      const itemB = newItems[indexB]
      if (itemA && itemB) {
        newItems[indexA] = itemB
        newItems[indexB] = itemA
        fa.items.value = newItems
        rebuildIndexCache()
      }

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const move = (from: number, to: number) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]

      // Bounds validation: reject invalid indices
      if (from < 0 || from >= currentValues.length || to < 0) {
        if (__DEV__) {
          const invalidIndex = from < 0 || from >= currentValues.length ? from : to
          warnArrayIndexOutOfBounds('move', name, invalidIndex, currentValues.length)
        }
        return // Invalid indices, do nothing
      }

      const newValues = [...currentValues]
      const [removed] = newValues.splice(from, 1)
      if (removed !== undefined) {
        // Clamp 'to' index to valid range after removal
        const clampedTo = Math.min(to, newValues.length)
        newValues.splice(clampedTo, 0, removed)
        set(ctx.formData, name, newValues)
      }

      // Move item in array
      const newItems = [...fa.items.value]
      const [removedItem] = newItems.splice(from, 1)
      if (removedItem) {
        const clampedTo = Math.min(to, newItems.length)
        newItems.splice(clampedTo, 0, removedItem)
        fa.items.value = newItems
        rebuildIndexCache()
      }

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const replace = (newValues: unknown[]) => {
      // Validate input is array
      if (!Array.isArray(newValues)) {
        return
      }

      // Update form data with new values
      set(ctx.formData, name, newValues)

      // Create new items with fresh keys for each value
      fa.items.value = newValues.map(() => createItem(generateId()))
      rebuildIndexCache()

      // Mark as dirty
      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      // Validate if needed
      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const removeAll = () => {
      // Check minLength rule - if minLength > 0, reject
      const rules = fa.rules
      if (rules?.minLength && rules.minLength.value > 0) {
        if (__DEV__) {
          warnArrayOperationRejected('removeAll', name, 'minLength', {
            current: fa.items.value.length,
            limit: rules.minLength.value,
          })
        }
        return // Reject operation - minLength would be violated
      }

      // Clear form data array
      set(ctx.formData, name, [])

      // Clear items tracking
      fa.items.value = []
      rebuildIndexCache()

      // Mark dirty
      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const removeMany = (indices: number[]) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]

      // Validate indices and filter to valid ones
      const validIndices = indices.filter((i) => i >= 0 && i < currentValues.length)

      if (validIndices.length === 0) return

      // Check minLength rule
      const rules = fa.rules
      const remainingCount = currentValues.length - validIndices.length
      if (rules?.minLength && remainingCount < rules.minLength.value) {
        if (__DEV__) {
          warnArrayOperationRejected('removeMany', name, 'minLength', {
            current: currentValues.length,
            limit: rules.minLength.value,
          })
        }
        return // Reject operation - minLength would be violated
      }

      // Sort descending to remove from highest index first (prevents shifting issues)
      const sortedIndices = [...new Set(validIndices)].sort((a, b) => b - a)

      // Create set of indices to remove for O(1) lookup
      const indicesToRemove = new Set(sortedIndices)

      // Filter out removed values
      const newValues = currentValues.filter((_, i) => !indicesToRemove.has(i))
      set(ctx.formData, name, newValues)

      // Remove items by indices
      fa.items.value = fa.items.value.filter((_, i) => !indicesToRemove.has(i))
      rebuildIndexCache()

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    return {
      value: fa.items.value,
      append,
      prepend,
      remove: removeAt,
      removeAll,
      removeMany,
      insert,
      swap,
      move,
      update,
      replace,
    }
  }

  return { fields }
}
