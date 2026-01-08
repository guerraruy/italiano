/**
 * Validation schemas for user profile endpoints
 */

import { z } from 'zod'

export const updateProfileSchema = z.object({
  nativeLanguage: z.enum(['pt-BR', 'en']).optional(),
  enabledVerbTenses: z.array(z.string()).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
