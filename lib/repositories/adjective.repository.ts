/**
 * Adjective Repository
 *
 * Handles all database operations for adjectives
 */

import { Prisma } from '@prisma/client'
import type { Adjective } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { BaseRepository } from './base.repository'

type CreateAdjectiveInput = Prisma.AdjectiveCreateInput
type UpdateAdjectiveInput = Prisma.AdjectiveUpdateInput

export class AdjectiveRepository extends BaseRepository<
  Adjective,
  CreateAdjectiveInput,
  UpdateAdjectiveInput
> {
  protected modelName = Prisma.ModelName.Adjective
  protected model = prisma.adjective

  /**
   * Find adjective by Italian name
   */
  async findByItalian(italian: string): Promise<Adjective | null> {
    return this.findUnique({ italian })
  }

  /**
   * Find adjectives by Italian names
   */
  async findByItalianNames(italianNames: string[]): Promise<Adjective[]> {
    return this.findMany({
      where: {
        italian: {
          in: italianNames,
        },
      },
    })
  }

  /**
   * Get all adjectives ordered by Italian name
   */
  async findAllOrdered(): Promise<Adjective[]> {
    return this.findMany({
      orderBy: {
        italian: 'asc',
      },
    })
  }

  /**
   * Update adjective by Italian name
   */
  async updateByItalian(
    italian: string,
    data: Omit<UpdateAdjectiveInput, 'italian'>
  ): Promise<Adjective> {
    try {
      return await prisma.adjective.update({
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
export const adjectiveRepository = new AdjectiveRepository()
