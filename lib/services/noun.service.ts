/**
 * Noun Service
 *
 * Handles noun-related business logic
 */

import type { Noun } from '@prisma/client'

import { NotFoundError, DuplicateResourceError } from '@/lib/errors'
import { nounRepository } from '@/lib/repositories'
import { toJsonInput } from '@/lib/utils'

import { BaseService } from './base.service'

interface NounTranslations {
  it: string
  pt: string
  en: string
}

interface UpdateNounInput {
  italian: string
  singolare: NounTranslations
  plurale: NounTranslations
}

export class NounService extends BaseService {
  constructor() {
    super('NounService')
  }

  /**
   * Get all nouns with optional pagination
   * @returns List of nouns ordered by Italian name with total count
   */
  async getAllNouns(options?: {
    limit?: number
    offset?: number
  }): Promise<{ items: Noun[]; total: number }> {
    try {
      const [items, total] = await Promise.all([
        nounRepository.findAllOrdered({
          skip: options?.offset,
          take: options?.limit,
        }),
        nounRepository.count(),
      ])
      return { items, total }
    } catch (error) {
      return this.handleError('getAllNouns', error)
    }
  }

  /**
   * Get noun by ID
   */
  async getNounById(nounId: string): Promise<Noun | null> {
    try {
      return await nounRepository.findById(nounId)
    } catch (error) {
      return this.handleError('getNounById', error, { nounId })
    }
  }

  /**
   * Update noun
   * @param nounId - The ID of the noun to update
   * @param input - The update data
   * @returns The updated noun
   * @throws Error if noun not found or Italian name conflict
   */
  async updateNoun(nounId: string, input: UpdateNounInput): Promise<Noun> {
    try {
      this.logOperation('updateNoun', { nounId, ...input })

      // Check if noun exists
      const existing = await nounRepository.findById(nounId)
      if (!existing) {
        throw new NotFoundError('Noun')
      }

      // Check for Italian name conflict (if name changed)
      if (input.italian !== existing.italian) {
        const conflict = await nounRepository.findByItalian(input.italian)
        if (conflict) {
          throw new DuplicateResourceError(
            'italian',
            'A noun with this Italian name already exists'
          )
        }
      }

      // Update noun
      return await nounRepository.update(nounId, {
        italian: input.italian,
        singolare: toJsonInput(input.singolare),
        plurale: toJsonInput(input.plurale),
      })
    } catch (error) {
      return this.handleError('updateNoun', error, { nounId, ...input })
    }
  }

  /**
   * Delete noun
   */
  async deleteNoun(nounId: string): Promise<void> {
    try {
      this.logOperation('deleteNoun', { nounId })

      // Check if noun exists
      const noun = await nounRepository.findById(nounId)
      if (!noun) {
        throw new NotFoundError('Noun')
      }

      // Delete noun (will cascade delete statistics)
      await nounRepository.delete(nounId)
    } catch (error) {
      return this.handleError('deleteNoun', error, { nounId })
    }
  }
}

// Export singleton instance
export const nounService = new NounService()
