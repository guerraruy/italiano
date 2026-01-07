/**
 * Request logging middleware
 *
 * Logs all incoming requests with:
 * - Request ID (generated)
 * - Method and path
 * - Response status
 * - Duration
 * - User ID (if authenticated)
 */

import { randomUUID } from 'crypto'

import { NextRequest, NextResponse } from 'next/server'

import { logger, PerformanceTimer } from '@/lib/logger'

/**
 * Wrap a route handler with logging
 */
export function withLogging<T = unknown>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse<T>> => {
    const requestId = randomUUID()
    const timer = new PerformanceTimer()

    const requestLogger = logger.child({
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
    })

    // Log incoming request
    requestLogger.info('Incoming request', {
      query: Object.fromEntries(request.nextUrl.searchParams),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    try {
      // Execute handler
      const response = await handler(request, ...args)

      // Log successful response
      const duration = timer.elapsed()
      requestLogger.info('Request completed', {
        statusCode: response.status,
        duration,
      })

      // Add request ID to response headers
      response.headers.set('X-Request-Id', requestId)

      return response
    } catch (error) {
      // Log error
      const duration = timer.elapsed()
      requestLogger.error('Request failed', error, {
        duration,
      })

      // Re-throw to be handled by error middleware
      throw error
    }
  }
}

/**
 * Wrap an authenticated route handler with logging (includes userId)
 */
export function withAuthLogging<T = unknown>(
  handler: (
    request: NextRequest,
    userId: string,
    ...args: any[]
  ) => Promise<NextResponse<T>>
) {
  return async (
    request: NextRequest,
    userId: string,
    ...args: any[]
  ): Promise<NextResponse<T>> => {
    const requestId = randomUUID()
    const timer = new PerformanceTimer()

    const requestLogger = logger.child({
      requestId,
      userId,
      method: request.method,
      path: request.nextUrl.pathname,
    })

    // Log incoming request
    requestLogger.info('Authenticated request', {
      query: Object.fromEntries(request.nextUrl.searchParams),
    })

    try {
      // Execute handler
      const response = await handler(request, userId, ...args)

      // Log successful response
      const duration = timer.elapsed()
      requestLogger.info('Request completed', {
        statusCode: response.status,
        duration,
      })

      // Add request ID to response headers
      response.headers.set('X-Request-Id', requestId)

      return response
    } catch (error) {
      // Log error
      const duration = timer.elapsed()
      requestLogger.error('Request failed', error, {
        duration,
      })

      // Re-throw to be handled by error middleware
      throw error
    }
  }
}
