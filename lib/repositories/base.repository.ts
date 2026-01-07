/**
 * Base repository class
 *
 * Provides common CRUD operations and can be extended by specific repositories
 */

import { Prisma } from '@prisma/client'

import { logger } from '@/lib/logger'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract modelName: Prisma.ModelName
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract model: any // Prisma model delegate

  /**
   * Find a single record by ID
   */
  async findById(id: string, include?: object): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        ...(include && { include }),
      })
    } catch (error) {
      logger.error(`${this.modelName}.findById failed`, error, { id })
      throw error
    }
  }

  /**
   * Find a single record by unique field
   */
  async findUnique(where: object, include?: object): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where,
        ...(include && { include }),
      })
    } catch (error) {
      logger.error(`${this.modelName}.findUnique failed`, error, { where })
      throw error
    }
  }

  /**
   * Find many records
   */
  async findMany(options?: {
    where?: object
    include?: object
    orderBy?: object
    skip?: number
    take?: number
  }): Promise<T[]> {
    try {
      return await this.model.findMany(options)
    } catch (error) {
      logger.error(`${this.modelName}.findMany failed`, error, { options })
      throw error
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateInput, include?: object): Promise<T> {
    try {
      return await this.model.create({
        data,
        ...(include && { include }),
      })
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
  async update(id: string, data: UpdateInput, include?: object): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data,
        ...(include && { include }),
      })
    } catch (error) {
      logger.error(`${this.modelName}.update failed`, error, { id, data })
      throw error
    }
  }

  /**
   * Update many records
   */
  async updateMany(
    where: object,
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
      return await this.model.delete({
        where: { id },
      })
    } catch (error) {
      logger.error(`${this.modelName}.delete failed`, error, { id })
      throw error
    }
  }

  /**
   * Delete many records
   */
  async deleteMany(where: object): Promise<{ count: number }> {
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
  async count(where?: object): Promise<number> {
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
  async exists(where: object): Promise<boolean> {
    try {
      const count = await this.model.count({ where })
      return count > 0
    } catch (error) {
      logger.error(`${this.modelName}.exists failed`, error, { where })
      throw error
    }
  }
}
