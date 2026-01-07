/**
 * Noun Repository
 *
 * Handles all database operations for nouns
 */

import { Prisma } from '@prisma/client'
import type { Noun } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { BaseRepository } from './base.repository'

type CreateNounInput = Prisma.NounCreateInput
type UpdateNounInput = Prisma.NounUpdateInput

export class NounRepository extends BaseRepository<
  Noun,
  CreateNounInput,
  UpdateNounInput
> {
  protected modelName = Prisma.ModelName.Noun
  protected model = prisma.noun

  /**
   * Find noun by Italian name
   */
  async findByItalian(italian: string): Promise<Noun | null> {
    return this.findUnique({ italian })
  }

  /**
   * Find nouns by Italian names
   */
  async findByItalianNames(italianNames: string[]): Promise<Noun[]> {
    return this.findMany({
      where: {
        italian: {
          in: italianNames,
        },
      },
    })
  }

  /**
   * Get all nouns ordered by Italian name
   */
  async findAllOrdered(): Promise<Noun[]> {
    return this.findMany({
      orderBy: {
        italian: 'asc',
      },
    })
  }

  /**
   * Update noun by Italian name
   */
  async updateByItalian(
    italian: string,
    data: Omit<UpdateNounInput, 'italian'>
  ): Promise<Noun> {
    try {
      return await prisma.noun.update({
        where: { italian },
        data,
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Check if Italian name exists
   */
  async italianExists(italian: string): Promise<boolean> {
    return this.exists({ italian })
  }
}

// Export singleton instance
export const nounRepository = new NounRepository()
