/**
 * Adjective Service
 *
 * Handles adjective-related business logic
 */

import type { Adjective, Prisma } from '@prisma/client'

import { NotFoundError, DuplicateResourceError } from '@/lib/errors'
import { adjectiveRepository } from '@/lib/repositories'

import { BaseService } from './base.service'

interface AdjectiveTranslations {
  it: string
  pt: string
  en: string
}

interface AdjectiveGenderForms {
  singolare: AdjectiveTranslations
  plurale: AdjectiveTranslations
}

interface UpdateAdjectiveInput {
  italian: string
  maschile: AdjectiveGenderForms
  femminile: AdjectiveGenderForms
}

export class AdjectiveService extends BaseService {
  constructor() {
    super('AdjectiveService')
  }

  /**
   * Get all adjectives
   */
  async getAllAdjectives(): Promise<Adjective[]> {
    try {
      return await adjectiveRepository.findAllOrdered()
    } catch (error) {
      return this.handleError('getAllAdjectives', error)
    }
  }

  /**
   * Get adjective by ID
   */
  async getAdjectiveById(adjectiveId: string): Promise<Adjective | null> {
    try {
      return await adjectiveRepository.findById(adjectiveId)
    } catch (error) {
      return this.handleError('getAdjectiveById', error, { adjectiveId })
    }
  }

  /**
   * Update adjective
   */
  async updateAdjective(
    adjectiveId: string,
    input: UpdateAdjectiveInput
  ): Promise<Adjective> {
    try {
      this.logOperation('updateAdjective', { adjectiveId, ...input })

      // Check if adjective exists
      const existing = await adjectiveRepository.findById(adjectiveId)
      if (!existing) {
        throw new NotFoundError('Adjective')
      }

      // Check for Italian name conflict (if name changed)
      if (input.italian !== existing.italian) {
        const conflict = await adjectiveRepository.findByItalian(input.italian)
        if (conflict) {
          throw new DuplicateResourceError(
            'italian',
            'An adjective with this Italian name already exists'
          )
        }
      }

      // Update adjective
      return await adjectiveRepository.update(adjectiveId, {
        italian: input.italian,
        maschile: input.maschile as unknown as Prisma.InputJsonValue,
        femminile: input.femminile as unknown as Prisma.InputJsonValue,
      })
    } catch (error) {
      return this.handleError('updateAdjective', error, {
        adjectiveId,
        ...input,
      })
    }
  }

  /**
   * Delete adjective
   * @param adjectiveId - The ID of the adjective to delete
   * @returns Void
   * @throws Error if adjective not found
   */
  async deleteAdjective(adjectiveId: string): Promise<void> {
    try {
      this.logOperation('deleteAdjective', { adjectiveId })

      // Check if adjective exists
      const adjective = await adjectiveRepository.findById(adjectiveId)
      if (!adjective) {
        throw new NotFoundError('Adjective')
      }

      // Delete adjective (will cascade delete statistics)
      await adjectiveRepository.delete(adjectiveId)
    } catch (error) {
      return this.handleError('deleteAdjective', error, { adjectiveId })
    }
  }
}

// Export singleton instance
export const adjectiveService = new AdjectiveService()
