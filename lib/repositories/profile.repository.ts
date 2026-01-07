/**
 * User Profile Repository
 *
 * Handles all database operations for user profiles
 */

import { Prisma } from '@prisma/client'
import type { UserProfile } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { BaseRepository } from './base.repository'

type CreateProfileInput = Prisma.UserProfileCreateInput
type UpdateProfileInput = Prisma.UserProfileUpdateInput

export class ProfileRepository extends BaseRepository<
  UserProfile,
  CreateProfileInput,
  UpdateProfileInput
> {
  protected modelName = Prisma.ModelName.UserProfile
  protected model = prisma.userProfile

  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.findUnique({ userId })
  }

  /**
   * Find or create profile for user
   */
  async findOrCreate(userId: string): Promise<UserProfile> {
    let profile = await this.findByUserId(userId)

    if (!profile) {
      profile = await this.create({
        user: {
          connect: { id: userId },
        },
      })
    }

    return profile
  }

  /**
   * Update profile by user ID
   */
  async updateByUserId(
    userId: string,
    data: Omit<UpdateProfileInput, 'user'>
  ): Promise<UserProfile> {
    try {
      return await prisma.userProfile.update({
        where: { userId },
        data,
      })
    } catch (error) {
      throw error
    }
  }
}

// Export singleton instance
export const profileRepository = new ProfileRepository()
