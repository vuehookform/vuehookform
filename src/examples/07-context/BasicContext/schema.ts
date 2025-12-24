import { z } from 'zod'

/**
 * Shared contact schema - single source of truth for types and validation
 */
export const contactSchema = z.object({
  email: z.email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactSchema = typeof contactSchema
export type ContactForm = z.infer<ContactSchema>
