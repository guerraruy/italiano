import { AppError } from './AppError'

/**
 * Error thrown when authentication fails.
 * HTTP Status: 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * Error thrown when login credentials are invalid.
 * HTTP Status: 401 Unauthorized
 */
export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid credentials') {
    super(message, 401, 'INVALID_CREDENTIALS')
  }
}

/**
 * Error thrown when the current password is incorrect.
 * HTTP Status: 401 Unauthorized
 */
export class InvalidPasswordError extends AppError {
  constructor(message = 'Current password is incorrect') {
    super(message, 401, 'INVALID_PASSWORD')
  }
}
