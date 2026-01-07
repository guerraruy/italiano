/**
 * Noun Service
 *
 * Handles noun-related business logic
 */

import type { Noun, Prisma } from '@prisma/client'

import { nounRepository } from '@/lib/repositories'

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
   * Get all nouns
   */
  async getAllNouns(): Promise<Noun[]> {
    try {
      return await nounRepository.findAllOrdered()
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
   */
  async updateNoun(nounId: string, input: UpdateNounInput): Promise<Noun> {
    try {
      this.logOperation('updateNoun', { nounId, ...input })

      // Check if noun exists
      const existing = await nounRepository.findById(nounId)
      if (!existing) {
        throw new Error('Noun not found')
      }

      // Check for Italian name conflict (if name changed)
      if (input.italian !== existing.italian) {
        const conflict = await nounRepository.findByItalian(input.italian)
        if (conflict) {
          throw new Error('A noun with this Italian name already exists')
        }
      }

      // Update noun
      return await nounRepository.update(nounId, {
        italian: input.italian,
        singolare: input.singolare as unknown as Prisma.InputJsonValue,
        plurale: input.plurale as unknown as Prisma.InputJsonValue,
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
        throw new Error('Noun not found')
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
