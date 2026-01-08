/**
 * Validation schemas for noun endpoints
 */

import { z } from 'zod'

const nounTranslationsSchema = z.object({
  it: z.string().min(1, 'Italian translation is required'),
  pt: z.string().min(1, 'Portuguese translation is required'),
  en: z.string().min(1, 'English translation is required'),
})

export const nounIdSchema = z.object({
  nounId: z.string().cuid('Invalid noun ID format'),
})

export const importNounsSchema = z.object({
  nouns: z.record(
    z.string(),
    z.object({
      singolare: nounTranslationsSchema,
      plurale: nounTranslationsSchema,
    })
  ),
  resolveConflicts: z
    .record(z.string(), z.enum(['keep', 'replace']))
    .optional(),
})

export const updateNounSchema = z.object({
  italian: z
    .string()
    .min(1, 'Italian noun is required')
    .max(100, 'Italian noun must be at most 100 characters'),
  singolare: nounTranslationsSchema,
  plurale: nounTranslationsSchema,
})

export const updateNounStatisticSchema = z.object({
  nounId: z.string().cuid('Invalid noun ID format'),
  correct: z.boolean(),
})

export type NounIdInput = z.infer<typeof nounIdSchema>
export type ImportNounsInput = z.infer<typeof importNounsSchema>
export type UpdateNounInput = z.infer<typeof updateNounSchema>
export type UpdateNounStatisticInput = z.infer<typeof updateNounStatisticSchema>
