/**
 * Authentication Service
 *
 * Handles authentication business logic:
 * - User login and registration
 * - Password management
 * - Token generation
 */

import type { User } from '@prisma/client'
import { compare, hash } from 'bcryptjs'

import { generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { userRepository, profileRepository } from '@/lib/repositories'

import { BaseService } from './base.service'

interface LoginInput {
  username: string
  password: string
}

interface RegisterInput {
  username: string
  email: string
  password: string
  name?: string | null
}

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

type UserWithoutPassword = Omit<User, 'password'>

interface AuthResult {
  user: UserWithoutPassword
  accessToken: string
  refreshToken: string
}

export class AuthService extends BaseService {
  constructor() {
    super('AuthService')
  }

  /**
   * Login user with username and password
   */
  async login(input: LoginInput): Promise<AuthResult> {
    try {
      this.logOperation('login', { username: input.username })

      // Find user
      const user = await userRepository.findByUsername(input.username)

      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isPasswordValid = await compare(input.password, user.password)

      if (!isPasswordValid) {
        throw new Error('Invalid credentials')
      }

      // Generate tokens
      const accessToken = generateAccessToken(user.id)
      const refreshToken = generateRefreshToken(user.id) || ''

      // Remove password from response
      const { password, ...userWithoutPassword } = user

      return {
        user: userWithoutPassword as UserWithoutPassword,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      return this.handleError('login', error, { username: input.username })
    }
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    try {
      this.logOperation('register', {
        username: input.username,
        email: input.email,
      })

      // Check if username already exists
      const existingUser = await userRepository.findByUsername(input.username)
      if (existingUser) {
        throw new Error('Username already exists')
      }

      // Check if email already exists
      const existingEmail = await userRepository.findByEmail(input.email)
      if (existingEmail) {
        throw new Error('Email already exists')
      }

      // Hash password
      const hashedPassword = await hash(input.password, 10)

      // Create user
      const user = await userRepository.create({
        username: input.username,
        email: input.email,
        password: hashedPassword,
        name: input.name || null,
      })

      // Create user profile
      await profileRepository.create({
        user: {
          connect: { id: user.id },
        },
      })

      // Generate tokens
      const accessToken = generateAccessToken(user.id)
      const refreshToken = generateRefreshToken(user.id) || ''

      // Remove password from response
      const { password, ...userWithoutPassword } = user

      return {
        user: userWithoutPassword as UserWithoutPassword,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      return this.handleError('register', error, {
        username: input.username,
        email: input.email,
      })
    }
  }

  /**
   * Change user password
   * @param userId - ID of the user
   * @param input - Current and new passwords
   * @returns Void
   * @throws Error if user not found or current password is incorrect
   */
  async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<void> {
    try {
      this.logOperation('changePassword', { userId })

      // Find user
      const user = await userRepository.findById(userId)

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const isPasswordValid = await compare(
        input.currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedPassword = await hash(input.newPassword, 10)

      // Update password
      await userRepository.update(userId, {
        password: hashedPassword,
      })

      this.logger.info('Password changed successfully', { userId })
    } catch (error) {
      return this.handleError('changePassword', error, { userId })
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
