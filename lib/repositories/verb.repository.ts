/**
 * Verb Repository
 *
 * Handles all database operations for verbs
 */

import { Prisma } from '@prisma/client'
import type { Verb } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { BaseRepository } from './base.repository'

type CreateVerbInput = Prisma.VerbCreateInput
type UpdateVerbInput = Prisma.VerbUpdateInput

export class VerbRepository extends BaseRepository<
  Verb,
  CreateVerbInput,
  UpdateVerbInput
> {
  protected modelName = Prisma.ModelName.Verb
  protected model = prisma.verb

  /**
   * Find verb by Italian name
   */
  async findByItalian(italian: string): Promise<Verb | null> {
    return this.findUnique({ italian })
  }

  /**
   * Find verbs by Italian names
   */
  async findByItalianNames(italianNames: string[]): Promise<Verb[]> {
    return this.findMany({
      where: {
        italian: {
          in: italianNames,
        },
      },
    })
  }

  /**
   * Get all verbs ordered by Italian name
   */
  async findAllOrdered(): Promise<Verb[]> {
    return this.findMany({
      orderBy: {
        italian: 'asc',
      },
    })
  }

  /**
   * Get verbs with conjugations
   */
  async findWithConjugations(options?: {
    where?: Prisma.VerbWhereInput
    skip?: number
    take?: number
  }) {
    return this.findMany({
      ...options,
      include: {
        conjugations: true,
      },
    })
  }

  /**
   * Update verb by Italian name
   */
  async updateByItalian(
    italian: string,
    data: Omit<UpdateVerbInput, 'italian'>
  ): Promise<Verb> {
    try {
      return await prisma.verb.update({
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
export const verbRepository = new VerbRepository()
