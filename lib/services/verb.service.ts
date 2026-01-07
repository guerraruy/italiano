/**
 * Verb Service
 *
 * Handles verb-related business logic
 */

import type { Verb, Prisma } from '@prisma/client'

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
   */
  async updateVerb(verbId: string, input: UpdateVerbInput): Promise<Verb> {
    try {
      this.logOperation('updateVerb', { verbId, ...input })

      // Check if verb exists
      const existing = await verbRepository.findById(verbId)
      if (!existing) {
        throw new Error('Verb not found')
      }

      // Check for Italian name conflict (if name changed)
      if (input.italian !== existing.italian) {
        const conflict = await verbRepository.findByItalian(input.italian)
        if (conflict) {
          throw new Error('A verb with this Italian name already exists')
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
        throw new Error('Verb not found')
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
    conjugationData: any
  ): Promise<any> {
    try {
      this.logOperation('updateConjugation', { conjugationId })

      // Check if conjugation exists
      const existing = await conjugationRepository.findById(conjugationId)
      if (!existing) {
        throw new Error('Conjugation not found')
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
   */
  async deleteConjugation(conjugationId: string): Promise<void> {
    try {
      this.logOperation('deleteConjugation', { conjugationId })

      // Check if conjugation exists
      const conjugation = await conjugationRepository.findById(conjugationId)
      if (!conjugation) {
        throw new Error('Conjugation not found')
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
