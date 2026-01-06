/**
 * Validation schemas for verb endpoints
 */

import { z } from 'zod'

export const verbIdSchema = z.object({
  verbId: z.string().cuid('Invalid verb ID format'),
})

export const importVerbsSchema = z.object({
  verbs: z.record(
    z.string(),
    z.object({
      regular: z.boolean(),
      reflexive: z.boolean(),
      tr_ptBR: z.string().min(1, 'Portuguese translation is required'),
      tr_en: z.string().optional(),
    })
  ),
  resolveConflicts: z
    .record(z.string(), z.enum(['keep', 'replace']))
    .optional(),
})

export const updateVerbSchema = z.object({
  italian: z
    .string()
    .min(1, 'Italian verb is required')
    .max(100, 'Italian verb must be at most 100 characters'),
  regular: z.boolean(),
  reflexive: z.boolean(),
  tr_ptBR: z.string().min(1, 'Portuguese translation is required'),
  tr_en: z.string().optional(),
})

export const updateVerbStatisticSchema = z.object({
  verbId: z.string().cuid('Invalid verb ID format'),
  correct: z.boolean(),
})

export const importConjugationsSchema = z.object({
  conjugations: z.record(z.string(), z.any()), // ConjugationData is complex, validate structure separately
  resolveConflicts: z
    .record(z.string(), z.enum(['keep', 'replace']))
    .optional(),
})

export const updateConjugationSchema = z.object({
  conjugation: z.any(), // ConjugationData structure
})

export const updateConjugationStatisticSchema = z.object({
  verbId: z.string().cuid('Invalid verb ID format'),
  mood: z.string().min(1, 'Mood is required'),
  tense: z.string().min(1, 'Tense is required'),
  person: z.string().min(1, 'Person is required'),
  correct: z.boolean(),
})

export type VerbIdInput = z.infer<typeof verbIdSchema>
export type ImportVerbsInput = z.infer<typeof importVerbsSchema>
export type UpdateVerbInput = z.infer<typeof updateVerbSchema>
export type UpdateVerbStatisticInput = z.infer<typeof updateVerbStatisticSchema>
export type ImportConjugationsInput = z.infer<typeof importConjugationsSchema>
export type UpdateConjugationInput = z.infer<typeof updateConjugationSchema>
export type UpdateConjugationStatisticInput = z.infer<
  typeof updateConjugationStatisticSchema
>

