/**
 * Base repository class
 *
 * Provides common CRUD operations and can be extended by specific repositories
 */

import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

import { logger } from '@/lib/logger'

/**
 * Represents a Prisma model delegate with the standard CRUD operations.
 *
 * This interface uses function overloads to be compatible with Prisma's complex
 * generic delegates. The first overload accepts unknown args (for our base
 * repository calls), while Prisma's more specific overloads take precedence
 * in concrete repositories.
 *
 * Note: Prisma doesn't export a common base interface for model delegates, making
 * it impossible to type this without some type loosening. This approach is safer
 * than using `any` because:
 * 1. Method names must exist on the delegate
 * 2. Return types maintain Promise structure
 * 3. Concrete repositories use actual Prisma delegate types with full type safety
 */
interface PrismaModelDelegate {
  findUnique(args: unknown): PromiseLike<unknown>
  findMany(args?: unknown): PromiseLike<unknown[]>
  create(args: unknown): PromiseLike<unknown>
  createMany(args: unknown): PromiseLike<{ count: number }>
  update(args: unknown): PromiseLike<unknown>
  updateMany(args: unknown): PromiseLike<{ count: number }>
  delete(args: unknown): PromiseLike<unknown>
  deleteMany(args: unknown): PromiseLike<{ count: number }>
  count(args?: unknown): PromiseLike<number>
}

/**
 * Type alias for the model delegate used in the base repository.
 * Exported for use in testing or extension scenarios.
 */
export type { PrismaModelDelegate }

/**
 * Type helper to get the model delegate type from a PrismaClient instance.
 * Usage: type UserDelegate = ModelDelegate<'user'>
 */
export type ModelDelegate<K extends keyof PrismaClient> = PrismaClient[K]

/**
 * Base repository class providing common CRUD operations for Prisma models.
 *
 * The model property is typed as PrismaModelDelegate which provides structural
 * type checking while being compatible with any Prisma delegate. Concrete
 * repositories should assign their specific Prisma delegate (e.g., prisma.user).
 *
 * @template T - The entity type returned by queries
 * @template CreateInput - The input type for create operations
 * @template UpdateInput - The input type for update operations
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract modelName: Prisma.ModelName
  protected abstract model: PrismaModelDelegate

  /**
   * Find a single record by ID
   */
  async findById(
    id: string,
    include?: Record<string, unknown>
  ): Promise<T | null> {
    try {
      return (await this.model.findUnique({
        where: { id },
        ...(include && { include }),
      })) as T | null
    } catch (error) {
      logger.error(`${this.modelName}.findById failed`, error, { id })
      throw error
    }
  }

  /**
   * Find a single record by unique field
   */
  async findUnique(
    where: Record<string, unknown>,
    include?: Record<string, unknown>
  ): Promise<T | null> {
    try {
      return (await this.model.findUnique({
        where,
        ...(include && { include }),
      })) as T | null
    } catch (error) {
      logger.error(`${this.modelName}.findUnique failed`, error, { where })
      throw error
    }
  }

  /**
   * Find many records
   */
  async findMany(options?: {
    where?: Record<string, unknown>
    include?: Record<string, unknown>
    orderBy?: Record<string, unknown>
    skip?: number
    take?: number
  }): Promise<T[]> {
    try {
      return (await this.model.findMany(options)) as T[]
    } catch (error) {
      logger.error(`${this.modelName}.findMany failed`, error, { options })
      throw error
    }
  }

  /**
   * Create a new record
   */
  async create(
    data: CreateInput,
    include?: Record<string, unknown>
  ): Promise<T> {
    try {
      return (await this.model.create({
        data,
        ...(include && { include }),
      })) as T
    } catch (error) {
      logger.error(`${this.modelName}.create failed`, error, { data })
      throw error
    }
  }

  /**
   * Create many records
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    try {
      return await this.model.createMany({
        data,
        skipDuplicates: true,
      })
    } catch (error) {
      logger.error(`${this.modelName}.createMany failed`, error)
      throw error
    }
  }

  /**
   * Update a record
   */
  async update(
    id: string,
    data: UpdateInput,
    include?: Record<string, unknown>
  ): Promise<T> {
    try {
      return (await this.model.update({
        where: { id },
        data,
        ...(include && { include }),
      })) as T
    } catch (error) {
      logger.error(`${this.modelName}.update failed`, error, { id, data })
      throw error
    }
  }

  /**
   * Update many records
   */
  async updateMany(
    where: Record<string, unknown>,
    data: Partial<UpdateInput>
  ): Promise<{ count: number }> {
    try {
      return await this.model.updateMany({
        where,
        data,
      })
    } catch (error) {
      logger.error(`${this.modelName}.updateMany failed`, error, {
        where,
        data,
      })
      throw error
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<T> {
    try {
      return (await this.model.delete({
        where: { id },
      })) as T
    } catch (error) {
      logger.error(`${this.modelName}.delete failed`, error, { id })
      throw error
    }
  }

  /**
   * Delete many records
   */
  async deleteMany(where: Record<string, unknown>): Promise<{ count: number }> {
    try {
      return await this.model.deleteMany({
        where,
      })
    } catch (error) {
      logger.error(`${this.modelName}.deleteMany failed`, error, { where })
      throw error
    }
  }

  /**
   * Count records
   */
  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await this.model.count({
        ...(where && { where }),
      })
    } catch (error) {
      logger.error(`${this.modelName}.count failed`, error, { where })
      throw error
    }
  }

  /**
   * Check if a record exists
   */
  async exists(where: Record<string, unknown>): Promise<boolean> {
    try {
      const count = await this.model.count({ where })
      return count > 0
    } catch (error) {
      logger.error(`${this.modelName}.exists failed`, error, { where })
      throw error
    }
  }
}
