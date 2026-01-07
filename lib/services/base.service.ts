/**
 * Base Service Class
 *
 * Provides common service patterns and utilities
 */

import { logger, type ChildLogger } from '@/lib/logger'

export abstract class BaseService {
  protected logger: ChildLogger

  constructor(serviceName: string) {
    this.logger = logger.child({ service: serviceName })
  }

  /**
   * Handle service errors consistently
   */
  protected handleError(
    operation: string,
    error: unknown,
    context?: Record<string, unknown>
  ): never {
    this.logger.error(`${operation} failed`, error, context)

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
