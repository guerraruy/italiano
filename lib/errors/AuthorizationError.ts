import { AppError } from './AppError'

/**
 * Error thrown when user lacks required permissions.
 * HTTP Status: 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * Error thrown when admin privileges are required.
 * HTTP Status: 403 Forbidden
 */
export class AdminRequiredError extends AppError {
  constructor(message = 'Admin privileges required') {
    super(message, 403, 'ADMIN_REQUIRED')
  }
}
