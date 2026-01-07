/**
 * User Repository
 *
 * Handles all database operations for users
 */

import { Prisma } from '@prisma/client'
import type { User } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { BaseRepository } from '@/lib/repositories/base.repository'

type CreateUserInput = Prisma.UserCreateInput
type UpdateUserInput = Prisma.UserUpdateInput

export class UserRepository extends BaseRepository<
  User,
  CreateUserInput,
  UpdateUserInput
> {
  protected modelName = Prisma.ModelName.User
  protected model = prisma.user

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.findUnique({ username })
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findUnique({ email })
  }

  /**
   * Find user with profile
   */
  async findByIdWithProfile(id: string) {
    return this.findById(id, {
      profile: true,
    })
  }

  /**
   * Get all users (admin only)
   */
  async findAllWithProfiles() {
    return this.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    return this.exists({ username })
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email })
  }

  /**
   * Update user admin status
   */
  async updateAdminStatus(id: string, admin: boolean): Promise<User> {
    return this.update(id, { admin })
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
