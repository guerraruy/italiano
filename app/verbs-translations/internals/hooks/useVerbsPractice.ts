import { useState, useRef, useCallback, useMemo } from 'react'

import {
  useGetVerbsForPracticeQuery,
  useGetVerbStatisticsQuery,
  useResetVerbStatisticMutation,
  useUpdateVerbStatisticMutation,
} from '@/app/store/api'
import {
  useStatisticsError,
  useResetDialog,
  useSortingAndFiltering,
} from '@/lib/hooks'
import { PracticeVerb } from '@/lib/types'

import { VerbTypeFilter } from '../components/VerbItem/internals'
import { InputValues, ValidationState } from '../types'
import { validateAnswer } from '../utils'

export const useVerbsPractice = () => {
  const { data, isLoading, error } = useGetVerbsForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetVerbStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateVerbStatistic] = useUpdateVerbStatisticMutation()
  const [resetVerbStatisticMutation] = useResetVerbStatisticMutation()

  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [verbTypeFilter, setVerbTypeFilter] = useState<VerbTypeFilter>('all')

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  // Use shared statistics error hook
  const { statisticsError, showError } = useStatisticsError()

  // Memoize verbs array to prevent unnecessary re-renders
  const verbs = useMemo(() => data?.verbs || [], [data?.verbs])

  // Get statistics callback
  const getStatistics = useCallback(
    (verbId: string) => {
      const stats = statisticsData?.statistics[verbId]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  // Use shared reset dialog hook
  const resetStatistic = useCallback(
    async (verbId: string) => {
      await resetVerbStatisticMutation(verbId).unwrap()
    },
    [resetVerbStatisticMutation]
  )

  const {
    resetDialog: resetDialogState,
    isResetting,
    handleOpenResetDialog: openResetDialog,
    handleCloseResetDialog,
    handleConfirmReset,
  } = useResetDialog<PracticeVerb>({
    getItemLabel: (verb) => verb.translation,
    resetStatistic,
  })

  // Transform reset dialog state to match expected interface
  const resetDialog = useMemo(
    () => ({
      open: resetDialogState.open,
      verbId: resetDialogState.itemId,
      verbTranslation: resetDialogState.itemLabel,
      error: resetDialogState.error,
    }),
    [resetDialogState]
  )

  // Verb type filter function
  const filterFn = useCallback(
    (verb: PracticeVerb) => {
      if (verbTypeFilter === 'all') return true
      if (verbTypeFilter === 'reflexive') return verb.reflexive
      if (verbTypeFilter === 'regular') return verb.regular && !verb.reflexive
      if (verbTypeFilter === 'irregular')
        return !verb.regular && !verb.reflexive
      return true
    },
    [verbTypeFilter]
  )

  // Use shared sorting and filtering hook
  const {
    sortOption,
    displayCount,
    filteredAndSortedItems: filteredAndSortedVerbs,
    handleRefresh,
    handleSortChange,
    setDisplayCount,
    shouldShowRefreshButton,
  } = useSortingAndFiltering({
    items: verbs as PracticeVerb[],
    getStatistics,
    filterFn,
    refetchStatistics,
  })

  const handleInputChange = useCallback((verbId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [verbId]: value }))
    // Clear validation visual feedback when user starts typing again
    setValidationState((prev) => {
      if (!prev[verbId]) return prev // No change needed
      return { ...prev, [verbId]: null }
    })
  }, [])

  const handleValidation = useCallback(
    (verbId: string, correctAnswer: string) => {
      const userInput = inputValues[verbId] || ''
      if (!userInput.trim()) return

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[verbId] || 0
      if (now - lastValidated < 100) {
        return
      }
      lastValidatedRef.current[verbId] = now

      const isCorrect = validateAnswer(verbId, userInput, correctAnswer)

      setValidationState((prev) => ({
        ...prev,
        [verbId]: isCorrect ? 'correct' : 'incorrect',
      }))

      // Save statistics to backend asynchronously
      updateVerbStatistic({ verbId, correct: isCorrect }).catch((err) => {
        console.error('Failed to update statistics:', err)
        showError('Failed to save statistics. Your progress may not be saved.')
      })
    },
    [inputValues, updateVerbStatistic, showError]
  )

  const handleClearInput = useCallback((verbId: string) => {
    setInputValues((prev) => ({ ...prev, [verbId]: '' }))
    setValidationState((prev) => ({ ...prev, [verbId]: null }))
    // Focus the input
    setTimeout(() => {
      const input = inputRefs.current[verbId]
      if (input) {
        input.focus()
      }
    }, 0)
  }, [])

  const handleShowAnswer = useCallback(
    (verbId: string, correctAnswer: string) => {
      setInputValues((prev) => ({ ...prev, [verbId]: correctAnswer }))
      setValidationState((prev) => ({ ...prev, [verbId]: 'correct' }))
    },
    []
  )

  const handleOpenResetDialog = useCallback(
    (verbId: string) => {
      const verb = data?.verbs.find((v) => v.id === verbId)
      if (verb) {
        openResetDialog(verb as PracticeVerb)
      }
    },
    [data?.verbs, openResetDialog]
  )

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      verbId: string,
      correctAnswer: string,
      currentIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleValidation(verbId, correctAnswer)

        // Move to next input in the filtered list
        if (currentIndex < filteredAndSortedVerbs.length - 1) {
          const nextVerb = filteredAndSortedVerbs[currentIndex + 1]
          if (nextVerb) {
            const nextInput = inputRefs.current[nextVerb.id]
            if (nextInput) {
              nextInput.focus()
            }
          }
        }
      }
    },
    [filteredAndSortedVerbs, handleValidation]
  )

  return {
    // Data
    isLoading,
    error,
    verbs,
    filteredAndSortedVerbs,

    // State
    inputValues,
    validationState,
    verbTypeFilter,
    sortOption,
    displayCount,
    resetDialog,
    isResetting,
    statisticsError,

    // Refs
    inputRefs,

    // Handlers
    handleInputChange,
    handleValidation,
    handleClearInput,
    handleShowAnswer,
    handleOpenResetDialog,
    handleCloseResetDialog,
    handleConfirmReset,
    handleKeyDown,
    handleRefresh,
    handleSortChange,
    setVerbTypeFilter,
    setDisplayCount,

    // Computed
    getStatistics,
    shouldShowRefreshButton,
  }
}
