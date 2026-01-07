/**
 * Profile Service
 *
 * Handles user profile business logic
 */

import type { UserProfile } from '@prisma/client'

import { profileRepository } from '@/lib/repositories'

import { BaseService } from './base.service'

interface UpdateProfileInput {
  nativeLanguage?: 'pt-BR' | 'en'
  enabledVerbTenses?: string[]
}

export class ProfileService extends BaseService {
  constructor() {
    super('ProfileService')
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      return await profileRepository.findOrCreate(userId)
    } catch (error) {
      return this.handleError('getProfile', error, { userId })
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    try {
      this.logOperation('updateProfile', { userId, ...input })

      // Ensure profile exists
      await profileRepository.findOrCreate(userId)

      // Update profile
      return await profileRepository.updateByUserId(userId, input)
    } catch (error) {
      return this.handleError('updateProfile', error, { userId, ...input })
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService()
