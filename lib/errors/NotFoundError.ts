import { AppError } from './AppError'

/**
 * Error thrown when a requested resource is not found.
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends AppError {
  public readonly resource: string

  constructor(resource: string, message?: string) {
    super(message || `${resource} not found`, 404, 'NOT_FOUND')
    this.resource = resource
  }
}

/**
 * Error thrown when a user is not found.
 */
export class UserNotFoundError extends NotFoundError {
  constructor(message = 'User not found') {
    super('User', message)
  }
}

/**
 * Error thrown when a profile is not found.
 */
export class ProfileNotFoundError extends NotFoundError {
  constructor(message = 'Profile not found') {
    super('Profile', message)
  }
}
