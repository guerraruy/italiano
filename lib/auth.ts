/**
 * Centralized authentication utilities
 * Provides reusable authentication middleware and JWT utilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { sign, verify } from 'jsonwebtoken'
import { env } from './env'

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
}

export interface JWTPayload {
  userId: string
  iat?: number
  exp?: number
}

/**
 * Authenticates a request by verifying the JWT token
 * @param request - The incoming Next.js request
 * @returns The userId if authenticated, null otherwise
 */
export async function authenticate(
  request: NextRequest
): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, env.JWT_SECRET) as JWTPayload

    return decoded.userId
  } catch (error) {
    // Token is invalid or expired
    return null
  }
}

/**
 * Middleware wrapper that requires authentication
 * Returns 401 Unauthorized if authentication fails
 */
export function withAuth<T = unknown>(
  handler: (
    request: NextRequest,
    userId: string,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(request, userId, context)
  }
}

/**
 * Middleware wrapper that requires admin privileges
 * Returns 401 if not authenticated, 403 if not admin
 */
export function withAdmin<T = unknown>(
  handler: (
    request: NextRequest,
    userId: string,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Import prisma here to avoid circular dependencies
    const { prisma } = await import('./prisma')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { admin: true },
    })

    if (!user || !user.admin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    return handler(request, userId, context)
  }
}

/**
 * Generates a new JWT access token
 */
export function generateAccessToken(userId: string): string {
  // Use type assertion to avoid TypeScript strict checking on expiresIn
  return sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Generates a new JWT refresh token (if refresh secret is configured)
 */
export function generateRefreshToken(userId: string): string | null {
  if (!env.JWT_REFRESH_SECRET) {
    return null
  }

  return sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
}

/**
 * Verifies a refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  if (!env.JWT_REFRESH_SECRET) {
    return null
  }

  try {
    return verify(token, env.JWT_REFRESH_SECRET) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Sanitizes user object by removing sensitive fields
 */
export function sanitizeUser<T extends { password?: string }>(
  user: T
): Omit<T, 'password'> {
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}
