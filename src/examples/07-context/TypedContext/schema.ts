import { z } from 'zod'

/**
 * Shared settings schema - single source of truth for types and validation
 */
export const settingsSchema = z.object({
  profile: z.object({
    displayName: z.string().min(2, 'Display name must be at least 2 characters'),
    bio: z.string().max(160, 'Bio cannot exceed 160 characters'),
    avatarUrl: z.url('Please enter a valid URL').optional().or(z.literal('')),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    frequency: z.enum(['immediate', 'daily', 'weekly']),
  }),
})

export type SettingsSchema = typeof settingsSchema
export type SettingsData = z.infer<SettingsSchema>
