import { ref } from 'vue'
import type { FormContext } from './formContext'
import type { FieldArray, FieldArrayItem, Path } from '../types'
import { get, set, generateId } from '../utils/paths'

/**
 * Create field array management functions
 */
export function createFieldArrayManager<FormValues>(
  ctx: FormContext<FormValues>,
  validate: (fieldPath?: string) => Promise<boolean>,
) {
  /**
   * Manage dynamic field arrays
   */
  function fields<TPath extends Path<FormValues>>(name: TPath): FieldArray {
    // Get or create field array entry
    let fieldArray = ctx.fieldArrays.get(name)

    if (!fieldArray) {
      const existingValues = (get(ctx.formData, name) || []) as unknown[]
      fieldArray = {
        items: ref<FieldArrayItem[]>([]),
        values: existingValues,
      }
      ctx.fieldArrays.set(name, fieldArray)

      // Initialize form data if needed
      if (!get(ctx.formData, name)) {
        set(ctx.formData, name, [] as unknown[])
      }
    }

    // Capture reference for closures
    const fa = fieldArray

    /**
     * Helper to create items with dynamic index lookup
     * Uses getters so index is always current, not stale
     */
    const createItem = (key: string): FieldArrayItem => ({
      key,
      get index() {
        return fa.items.value.findIndex((item) => item.key === key)
      },
      remove() {
        const currentIndex = fa.items.value.findIndex((item) => item.key === key)
        if (currentIndex !== -1) {
          removeAt(currentIndex)
        }
      },
    })

    // Populate items if empty (first access after creation)
    if (fa.items.value.length === 0 && fa.values.length > 0) {
      fa.items.value = fa.values.map(() => createItem(generateId()))
    }

    const append = (value: unknown) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      const newValues = [...currentValues, value]
      set(ctx.formData, name, newValues)

      fa.items.value = [...fa.items.value, createItem(generateId())]

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const prepend = (value: unknown) => {
      insert(0, value)
    }

    const update = (index: number, value: unknown) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      if (index < 0 || index >= currentValues.length) {
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
      const newValues = currentValues.filter((_: unknown, i: number) => i !== index)
      set(ctx.formData, name, newValues)

      // Remove item by current index, keep others (indices auto-update via getter)
      const keyToRemove = fa.items.value[index]?.key
      fa.items.value = fa.items.value.filter((item) => item.key !== keyToRemove)

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const insert = (index: number, value: unknown) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      const newValues = [...currentValues.slice(0, index), value, ...currentValues.slice(index)]
      set(ctx.formData, name, newValues)

      const newItem = createItem(generateId())
      fa.items.value = [...fa.items.value.slice(0, index), newItem, ...fa.items.value.slice(index)]

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const swap = (indexA: number, indexB: number) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      const newValues = [...currentValues]
      ;[newValues[indexA], newValues[indexB]] = [newValues[indexB], newValues[indexA]]
      set(ctx.formData, name, newValues)

      // Swap items in array (indices auto-update via getter)
      const newItems = [...fa.items.value]
      const itemA = newItems[indexA]
      const itemB = newItems[indexB]
      if (itemA && itemB) {
        newItems[indexA] = itemB
        newItems[indexB] = itemA
        fa.items.value = newItems
      }

      ctx.dirtyFields.value = { ...ctx.dirtyFields.value, [name]: true }

      if (ctx.options.mode === 'onChange') {
        validate(name)
      }
    }

    const move = (from: number, to: number) => {
      const currentValues = (get(ctx.formData, name) || []) as unknown[]
      const newValues = [...currentValues]
      const [removed] = newValues.splice(from, 1)
      if (removed !== undefined) {
        newValues.splice(to, 0, removed)
        set(ctx.formData, name, newValues)
      }

      // Move item in array (indices auto-update via getter)
      const newItems = [...fa.items.value]
      const [removedItem] = newItems.splice(from, 1)
      if (removedItem) {
        newItems.splice(to, 0, removedItem)
        fa.items.value = newItems
      }

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
      insert,
      swap,
      move,
      update,
    }
  }

  return { fields }
}
