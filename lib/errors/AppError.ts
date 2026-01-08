/**
 * Base error class for application-specific errors.
 * Extends the native Error class with HTTP status code and error code support.
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    }
  }
}
