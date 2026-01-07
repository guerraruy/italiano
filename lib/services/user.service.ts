/**
 * User Service
 *
 * Handles user management business logic
 */

import type { User } from '@prisma/client'

import { userRepository } from '@/lib/repositories'

import { BaseService } from './base.service'

export class UserService extends BaseService {
  constructor() {
    super('UserService')
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await userRepository.findById(userId)
    } catch (error) {
      return this.handleError('getUserById', error, { userId })
    }
  }

  /**
   * Get user with profile
   */
  async getUserWithProfile(userId: string) {
    try {
      return await userRepository.findByIdWithProfile(userId)
    } catch (error) {
      return this.handleError('getUserWithProfile', error, { userId })
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      this.logOperation('getAllUsers')
      return await userRepository.findAllWithProfiles()
    } catch (error) {
      return this.handleError('getAllUsers', error)
    }
  }

  /**
   * Update user admin status
   */
  async updateAdminStatus(userId: string, admin: boolean): Promise<User> {
    try {
      this.logOperation('updateAdminStatus', { userId, admin })
      return await userRepository.updateAdminStatus(userId, admin)
    } catch (error) {
      return this.handleError('updateAdminStatus', error, { userId, admin })
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      this.logOperation('deleteUser', { userId })
      await userRepository.delete(userId)
    } catch (error) {
      return this.handleError('deleteUser', error, { userId })
    }
  }
}

// Export singleton instance
export const userService = new UserService()
