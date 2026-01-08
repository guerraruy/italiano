import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { logger } from '../logger'
import { AppError } from './AppError'

interface ErrorResponse {
  error: string
  code?: string
  issues?: Array<{ field: string; message: string }>
}

/**
 * Converts an error to a Next.js API response.
 * Handles AppError instances, ZodErrors, and unknown errors.
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Handle custom AppError instances
  if (error instanceof AppError) {
    logger.warn(`[${error.code}] ${error.message}`, {
      statusCode: error.statusCode,
      code: error.code,
    })

    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))

    logger.warn('Validation error', { issues })

    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        issues,
      },
      { status: 400 }
    )
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : 'An error occurred'

  logger.error('Unhandled error', {
    error: message,
    stack: error instanceof Error ? error.stack : undefined,
  })

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Type guard to check if an error is operational (expected).
 * Operational errors are safe to expose to clients.
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}
