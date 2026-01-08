import { AppError } from './AppError'

interface ValidationIssue {
  field: string
  message: string
}

/**
 * Error thrown when input validation fails.
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends AppError {
  public readonly issues: ValidationIssue[]

  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message, 400, 'VALIDATION_ERROR')
    this.issues = issues
  }

  static fromFieldError(field: string, message: string): ValidationError {
    return new ValidationError(message, [{ field, message }])
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      issues: this.issues.length > 0 ? this.issues : undefined,
    }
  }
}

/**
 * Error thrown when a required field is missing.
 */
export class MissingFieldError extends ValidationError {
  constructor(field: string) {
    super(`${field} is required`, [{ field, message: `${field} is required` }])
  }
}

/**
 * Error thrown when a field has an invalid format.
 */
export class InvalidFormatError extends ValidationError {
  constructor(field: string, message?: string) {
    const errorMessage = message || `Invalid format for ${field}`
    super(errorMessage, [{ field, message: errorMessage }])
  }
}
