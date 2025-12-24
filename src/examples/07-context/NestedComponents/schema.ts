import { z } from 'zod'

/**
 * Shared order schema - single source of truth for types and validation
 */
export const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
  }),
  shipping: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    express: z.boolean(),
  }),
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Item name required'),
        quantity: z.coerce.number().min(1, 'Minimum quantity is 1'),
      }),
    )
    .min(1, 'At least one item is required'),
})

export type OrderSchema = typeof orderSchema
export type OrderForm = z.infer<OrderSchema>
