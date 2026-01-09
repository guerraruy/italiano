/**
 * Verb Conjugation Repository
 *
 * Handles all database operations for verb conjugations
 */

import { Prisma } from '@prisma/client'
import type { VerbConjugation } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { BaseRepository } from './base.repository'

type CreateConjugationInput = Prisma.VerbConjugationCreateInput
type UpdateConjugationInput = Prisma.VerbConjugationUpdateInput

export class ConjugationRepository extends BaseRepository<
  VerbConjugation,
  CreateConjugationInput,
  UpdateConjugationInput
> {
  protected modelName = Prisma.ModelName.VerbConjugation
  protected model = prisma.verbConjugation

  /**
   * Find conjugation by verb ID
   */
  async findByVerbId(verbId: string): Promise<VerbConjugation | null> {
    try {
      return await prisma.verbConjugation.findFirst({
        where: { verbId },
        include: {
          verb: true,
        },
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all conjugations with verb details
   */
  async findAllWithVerbs() {
    return this.findMany({
      include: {
        verb: {
          select: {
            italian: true,
            regular: true,
            reflexive: true,
          },
        },
      },
      orderBy: {
        verb: {
          italian: 'asc',
        },
      },
    })
  }

  /**
   * Find conjugations by verb IDs
   */
  async findByVerbIds(verbIds: string[]): Promise<VerbConjugation[]> {
    return this.findMany({
      where: {
        verbId: {
          in: verbIds,
        },
      },
      include: {
        verb: true,
      },
    })
  }

  /**
   * Update conjugation by verb ID
   */
  async updateByVerbId(
    verbId: string,
    data: Omit<UpdateConjugationInput, 'verb'>
  ): Promise<VerbConjugation> {
    try {
      // First, find the conjugation
      const conjugation = await this.findByVerbId(verbId)

      if (!conjugation) {
        throw new Error(`Conjugation not found for verb ID: ${verbId}`)
      }

      return await this.update(conjugation.id, data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete conjugations by verb ID
   */
  async deleteByVerbId(verbId: string): Promise<{ count: number }> {
    return this.deleteMany({ verbId })
  }
}

// Export singleton instance
export const conjugationRepository = new ConjugationRepository()
