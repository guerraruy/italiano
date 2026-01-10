/**
 * UI-related constants
 *
 * Centralizes magic numbers used across the UI for consistency and maintainability.
 */

/**
 * Timing constants for UI interactions
 */
export const TIMING = {
  /**
   * Debounce time (ms) for validation to prevent duplicate submissions
   * when user rapidly triggers validation (e.g., pressing Enter quickly)
   */
  VALIDATION_DEBOUNCE_MS: 100,

  /**
   * Delay (ms) before auto-closing a modal after successful action
   */
  SUCCESS_MODAL_CLOSE_DELAY_MS: 1500,

  /**
   * Delay (ms) before auto-closing password change modal after success
   */
  PASSWORD_CHANGE_SUCCESS_DELAY_MS: 2000,
} as const

/**
 * Z-index values for layered UI elements
 */
export const Z_INDEX = {
  /**
   * Z-index for settings modal to appear above navbar
   */
  SETTINGS_MODAL: 1300,
} as const

/**
 * Validation constraints
 */
export const VALIDATION = {
  /**
   * Minimum required password length
   */
  MIN_PASSWORD_LENGTH: 6,
} as const
