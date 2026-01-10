/**
 * Utility functions for handling API errors
 */

/**
 * Type guard to check if an error has the RTK Query error shape
 */
function isRtkQueryError(error: unknown): error is { data: { error: string } } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'data' in error &&
    error.data !== null &&
    typeof error.data === 'object' &&
    'error' in error.data &&
    typeof error.data.error === 'string'
  )
}

/**
 * Extracts error message from RTK Query error response.
 *
 * RTK Query wraps API errors in a specific shape: { data: { error: string } }
 * This function safely extracts that error message or returns a default.
 *
 * @param error - The error caught from an RTK Query mutation
 * @param defaultMessage - Fallback message if error extraction fails
 * @returns The extracted error message or the default message
 *
 * @example
 * ```typescript
 * try {
 *   await loginMutation(credentials).unwrap()
 * } catch (error) {
 *   const message = extractApiErrorMessage(error, 'Login failed')
 *   setError(message)
 * }
 * ```
 */
export function extractApiErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (isRtkQueryError(error)) {
    return error.data.error
  }
  return defaultMessage
}
