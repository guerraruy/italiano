/**
 * Validation schemas for adjective endpoints
 */

import { z } from 'zod'

const adjectiveTranslationsSchema = z.object({
  it: z.string().min(1, 'Italian translation is required'),
  pt: z.string().min(1, 'Portuguese translation is required'),
  en: z.string().min(1, 'English translation is required'),
})

const adjectiveGenderFormsSchema = z.object({
  singolare: adjectiveTranslationsSchema,
  plurale: adjectiveTranslationsSchema,
})

export const adjectiveIdSchema = z.object({
  adjectiveId: z.string().cuid('Invalid adjective ID format'),
})

export const importAdjectivesSchema = z.object({
  adjectives: z.record(
    z.string(),
    z.object({
      maschile: adjectiveGenderFormsSchema,
      femminile: adjectiveGenderFormsSchema,
    })
  ),
  resolveConflicts: z
    .record(z.string(), z.enum(['keep', 'replace']))
    .optional(),
})

export const updateAdjectiveSchema = z.object({
  italian: z
    .string()
    .min(1, 'Italian adjective is required')
    .max(100, 'Italian adjective must be at most 100 characters'),
  maschile: adjectiveGenderFormsSchema,
  femminile: adjectiveGenderFormsSchema,
})

export const updateAdjectiveStatisticSchema = z.object({
  adjectiveId: z.string().cuid('Invalid adjective ID format'),
  correct: z.boolean(),
})

export type AdjectiveIdInput = z.infer<typeof adjectiveIdSchema>
export type ImportAdjectivesInput = z.infer<typeof importAdjectivesSchema>
export type UpdateAdjectiveInput = z.infer<typeof updateAdjectiveSchema>
export type UpdateAdjectiveStatisticInput = z.infer<
  typeof updateAdjectiveStatisticSchema
>

