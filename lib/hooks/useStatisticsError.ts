import { useState, useCallback, useRef, useEffect } from 'react'

import { StatisticsError } from './types'

const ERROR_AUTO_CLEAR_MS = 5000

/**
 * Hook for managing statistics error state with auto-clear functionality
 */
export function useStatisticsError() {
  const [statisticsError, setStatisticsError] =
    useState<StatisticsError | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const showError = useCallback((message: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setStatisticsError({
      message,
      timestamp: Date.now(),
    })

    // Auto-clear after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setStatisticsError(null)
      timeoutRef.current = null
    }, ERROR_AUTO_CLEAR_MS)
  }, [])

  const clearError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setStatisticsError(null)
  }, [])

  /**
   * Handles async statistics operations with error handling
   */
  const handleStatisticsOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      errorMessage = 'Failed to save statistics. Your progress may not be saved.'
    ): Promise<T | undefined> => {
      try {
        return await operation()
      } catch (err) {
        console.error('Statistics operation failed:', err)
        showError(errorMessage)
        return undefined
      }
    },
    [showError]
  )

  return {
    statisticsError,
    showError,
    clearError,
    handleStatisticsOperation,
  }
}
