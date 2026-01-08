/**
 * Base Service Class
 *
 * Provides common service patterns and utilities
 */

import { AppError } from '@/lib/errors'
import { logger, type ChildLogger } from '@/lib/logger'

export abstract class BaseService {
  protected logger: ChildLogger

  constructor(serviceName: string) {
    this.logger = logger.child({ service: serviceName })
  }

  /**
   * Handle service errors consistently
   * AppErrors are logged as warnings (expected errors)
   * Other errors are logged as errors (unexpected)
   */
  protected handleError(
    operation: string,
    error: unknown,
    context?: Record<string, unknown>
  ): never {
    if (error instanceof AppError) {
      // Operational errors - log as warning
      this.logger.warn(`${operation}: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        ...context,
      })
    } else {
      // Unexpected errors - log as error
      this.logger.error(`${operation} failed`, error, context)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error(`${operation} failed: ${String(error)}`)
  }

  /**
   * Log service operation
   */
  protected logOperation(
    operation: string,
    context?: Record<string, unknown>
  ): void {
    this.logger.info(operation, context)
  }
}
