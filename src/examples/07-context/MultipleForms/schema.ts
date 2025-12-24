import { z } from 'zod'

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
})

export type LoginSchema = typeof loginSchema
export type LoginForm = z.infer<LoginSchema>

/**
 * Feedback form schema
 */
export const feedbackSchema = z.object({
  rating: z.coerce.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
})

export type FeedbackSchema = typeof feedbackSchema
export type FeedbackForm = z.infer<FeedbackSchema>
