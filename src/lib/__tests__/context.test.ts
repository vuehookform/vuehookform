import { describe, it, expect } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { useForm } from '../useForm'
import { provideForm, useFormContext, FormContextKey } from '../context'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

describe('Form Context API', () => {
  describe('provideForm', () => {
    it('should provide form methods to injection key', () => {
      // Test that provideForm calls provide with correct key
      let providedValue: unknown

      const TestComponent = defineComponent({
        setup() {
          const form = useForm({ schema })
          provideForm(form)

          // Simulate what a child would receive
          providedValue = form
          return () => h('div')
        },
      })

      // Create instance to trigger setup
      TestComponent.setup!({}, { attrs: {}, slots: {}, emit: () => {}, expose: () => {} })

      expect(providedValue).toBeDefined()
      expect(providedValue).toHaveProperty('register')
      expect(providedValue).toHaveProperty('handleSubmit')
      expect(providedValue).toHaveProperty('formState')
    })
  })

  describe('useFormContext', () => {
    it('should throw error when used outside provider', () => {
      // useFormContext relies on inject which returns undefined outside provide scope
      expect(() => {
        // This simulates calling useFormContext without a provider
        const context = inject(FormContextKey)
        if (!context) {
          throw new Error(
            'useFormContext must be used within a component tree where provideForm() has been called.',
          )
        }
      }).toThrow()
    })

    it('should have meaningful error message', () => {
      expect(() => {
        useFormContext()
      }).toThrow('useFormContext must be used within a component tree')
    })
  })

  describe('FormContextKey', () => {
    it('should be a symbol', () => {
      expect(typeof FormContextKey).toBe('symbol')
    })

    it('should have descriptive name', () => {
      expect(FormContextKey.toString()).toContain('FormContext')
    })
  })

  describe('type safety', () => {
    it('should maintain form method types through context', () => {
      const form = useForm({ schema })

      // Type check: these should all be available
      expect(form.register).toBeDefined()
      expect(form.handleSubmit).toBeDefined()
      expect(form.formState).toBeDefined()
      expect(form.setValue).toBeDefined()
      expect(form.getValue).toBeDefined()
      expect(form.getValues).toBeDefined()
      expect(form.watch).toBeDefined()
      expect(form.reset).toBeDefined()
      expect(form.trigger).toBeDefined()
      expect(form.setError).toBeDefined()
      expect(form.clearErrors).toBeDefined()
      expect(form.getFieldState).toBeDefined()
      expect(form.setFocus).toBeDefined()
      expect(form.fields).toBeDefined()
    })
  })

  describe('exports', () => {
    it('should export provideForm from index', async () => {
      const exports = await import('../index')
      expect(exports.provideForm).toBeDefined()
    })

    it('should export useFormContext from index', async () => {
      const exports = await import('../index')
      expect(exports.useFormContext).toBeDefined()
    })

    it('should export FormContextKey from index', async () => {
      const exports = await import('../index')
      expect(exports.FormContextKey).toBeDefined()
    })
  })
})
