/**
 * Validation schemas for user management endpoints (admin)
 */

import { z } from 'zod'

export const userIdSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),
})

export const updateUserSchema = z.object({
  admin: z.boolean(),
})

export type UserIdInput = z.infer<typeof userIdSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

