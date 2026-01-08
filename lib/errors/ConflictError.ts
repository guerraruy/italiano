import { AppError } from './AppError'

/**
 * Error thrown when a resource conflict occurs (e.g., duplicate entries).
 * HTTP Status: 409 Conflict
 */
export class ConflictError extends AppError {
  public readonly field?: string

  constructor(message: string, field?: string) {
    super(message, 409, 'CONFLICT')
    this.field = field
  }
}

/**
 * Error thrown when attempting to create a resource that already exists.
 */
export class DuplicateResourceError extends AppError {
  public readonly field: string

  constructor(field: string, message?: string) {
    super(message || `${field} already exists`, 409, 'DUPLICATE_RESOURCE')
    this.field = field
  }
}

/**
 * Error thrown when a username already exists.
 */
export class DuplicateUsernameError extends DuplicateResourceError {
  constructor(message = 'Username already exists') {
    super('username', message)
  }
}

/**
 * Error thrown when an email already exists.
 */
export class DuplicateEmailError extends DuplicateResourceError {
  constructor(message = 'Email already exists') {
    super('email', message)
  }
}
