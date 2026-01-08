/**
 * Structured logging utility
 *
 * Provides consistent logging across the application with:
 * - Log levels (debug, info, warn, error)
 * - Structured JSON output in production
 * - Pretty printing in development
 * - Request ID tracking
 * - Performance timing
 * - Error stack traces
 */

import { env } from './env'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  requestId?: string
  userId?: string
  path?: string
  method?: string
  duration?: number
  statusCode?: number
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = env.NODE_ENV === 'development'
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context)
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
    }

    let errorDetails: LogEntry['error'] | undefined

    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      }
    } else if (error) {
      errorDetails = {
        name: 'UnknownError',
        message: String(error),
      }
    }

    this.log(LogLevel.ERROR, message, errorContext, errorDetails)
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: LogEntry['error']
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    if (this.isDevelopment) {
      this.prettyPrint(entry)
    } else {
      // Production: JSON output for log aggregators
      console.log(JSON.stringify(entry))
    }
  }

  /**
   * Pretty print logs for development
   */
  private prettyPrint(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    const color = colors[entry.level] || reset

    const timestamp = entry.timestamp.split('T')[1]?.substring(0, 12)
    const level = entry.level.toUpperCase().padEnd(5)

    console.log(`${color}[${timestamp}] ${level}${reset} ${entry.message}`)

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log(`  Context:`, entry.context)
    }

    if (entry.error) {
      console.log(`  Error: ${entry.error.name}: ${entry.error.message}`)
      if (entry.error.stack) {
        console.log(`  Stack:\n${entry.error.stack}`)
      }
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context)
  }
}

/**
 * Child logger that inherits parent context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private baseContext: LogContext
  ) {}

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.baseContext, ...context })
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.baseContext, ...context })
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.baseContext, ...context })
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.error(message, error, { ...this.baseContext, ...context })
  }
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Get elapsed time in milliseconds
   */
  elapsed(): number {
    return Date.now() - this.startTime
  }

  /**
   * Get elapsed time and log it
   */
  end(
    logger: Logger | ChildLogger,
    message: string,
    context?: LogContext
  ): number {
    const duration = this.elapsed()
    logger.info(message, { ...context, duration })
    return duration
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger()

/**
 * Type exports
 */
export type { LogContext, ChildLogger }
