/**
 * Verb Service
 *
 * Handles verb-related business logic
 */

import type { Verb, Prisma } from '@prisma/client'

import { NotFoundError, DuplicateResourceError } from '@/lib/errors'
import { verbRepository, conjugationRepository } from '@/lib/repositories'

import { BaseService } from './base.service'

interface UpdateVerbInput {
  italian: string
  regular: boolean
  reflexive: boolean
  tr_ptBR: string
  tr_en?: string
}

export class VerbService extends BaseService {
  constructor() {
    super('VerbService')
  }

  /**
   * Get all verbs
   * @returns List of all verbs ordered by Italian name
   */
  async getAllVerbs(): Promise<Verb[]> {
    try {
      return await verbRepository.findAllOrdered()
    } catch (error) {
      return this.handleError('getAllVerbs', error)
    }
  }

  /**
   * Get verbs with conjugations
   * @param options - Pagination options (skip, take)
   * @returns List of verbs with their conjugations
   */
  async getVerbsWithConjugations(options?: { skip?: number; take?: number }) {
    try {
      return await verbRepository.findWithConjugations(options)
    } catch (error) {
      return this.handleError('getVerbsWithConjugations', error, options)
    }
  }

  /**
   * Get verb by ID
   * @param verbId - The ID of the verb to retrieve
   * @returns The verb if found, null otherwise
   */
  async getVerbById(verbId: string): Promise<Verb | null> {
    try {
      return await verbRepository.findById(verbId)
    } catch (error) {
      return this.handleError('getVerbById', error, { verbId })
    }
  }

  /**
   * Update verb
   * @param verbId - The ID of the verb to update
   * @param input - The update data
   * @returns The updated verb
   * @throws Error if verb not found or Italian name conflict
   */
  async updateVerb(verbId: string, input: UpdateVerbInput): Promise<Verb> {
    try {
      this.logOperation('updateVerb', { verbId, ...input })

      // Check if verb exists
      const existing = await verbRepository.findById(verbId)
      if (!existing) {
        throw new NotFoundError('Verb')
      }

      // Check for Italian name conflict (if name changed)
      if (input.italian !== existing.italian) {
        const conflict = await verbRepository.findByItalian(input.italian)
        if (conflict) {
          throw new DuplicateResourceError(
            'italian',
            'A verb with this Italian name already exists'
          )
        }
      }

      // Update verb
      return await verbRepository.update(verbId, {
        italian: input.italian,
        regular: input.regular,
        reflexive: input.reflexive,
        tr_ptBR: input.tr_ptBR,
        tr_en: input.tr_en || null,
      })
    } catch (error) {
      return this.handleError('updateVerb', error, { verbId, ...input })
    }
  }

  /**
   * Delete verb
   */
  async deleteVerb(verbId: string): Promise<void> {
    try {
      this.logOperation('deleteVerb', { verbId })

      // Check if verb exists
      const verb = await verbRepository.findById(verbId)
      if (!verb) {
        throw new NotFoundError('Verb')
      }

      // Delete verb (will cascade delete statistics and conjugations)
      await verbRepository.delete(verbId)
    } catch (error) {
      return this.handleError('deleteVerb', error, { verbId })
    }
  }

  /**
   * Update conjugation
   */
  async updateConjugation(
    conjugationId: string,
    conjugationData: Prisma.InputJsonValue
  ): Promise<{ id: string; verbId: string; conjugation: Prisma.JsonValue }> {
    try {
      this.logOperation('updateConjugation', { conjugationId })

      // Check if conjugation exists
      const existing = await conjugationRepository.findById(conjugationId)
      if (!existing) {
        throw new NotFoundError('Conjugation')
      }

      // Update conjugation
      return await conjugationRepository.update(conjugationId, {
        conjugation: conjugationData as Prisma.InputJsonValue,
      })
    } catch (error) {
      return this.handleError('updateConjugation', error, { conjugationId })
    }
  }

  /**
   * Delete conjugation
   * @param conjugationId - The ID of the conjugation to delete
   * @returns Void
   * @throws Error if conjugation not found
   */
  async deleteConjugation(conjugationId: string): Promise<void> {
    try {
      this.logOperation('deleteConjugation', { conjugationId })

      // Check if conjugation exists
      const conjugation = await conjugationRepository.findById(conjugationId)
      if (!conjugation) {
        throw new NotFoundError('Conjugation')
      }

      // Delete conjugation
      await conjugationRepository.delete(conjugationId)
    } catch (error) {
      return this.handleError('deleteConjugation', error, { conjugationId })
    }
  }
}

// Export singleton instance
export const verbService = new VerbService()
