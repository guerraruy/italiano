// Base error class
export { AppError } from './AppError'

// Authentication errors (401)
export {
  AuthenticationError,
  InvalidCredentialsError,
  InvalidPasswordError,
} from './AuthenticationError'

// Authorization errors (403)
export { AuthorizationError, AdminRequiredError } from './AuthorizationError'

// Not found errors (404)
export {
  NotFoundError,
  UserNotFoundError,
  ProfileNotFoundError,
} from './NotFoundError'

// Conflict errors (409)
export {
  ConflictError,
  DuplicateResourceError,
  DuplicateUsernameError,
  DuplicateEmailError,
} from './ConflictError'

// Validation errors (400)
export {
  ValidationError,
  MissingFieldError,
  InvalidFormatError,
} from './ValidationError'

// Error handling utilities
export { handleApiError, isAppError, isOperationalError } from './errorHandler'
