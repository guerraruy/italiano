import { useState, useRef, useCallback, useMemo } from 'react'

import {
  useGetNounsForPracticeQuery,
  useGetNounStatisticsQuery,
  useResetNounStatisticMutation,
  useUpdateNounStatisticMutation,
  useGetProfileQuery,
} from '@/app/store/api'
import { usePracticeFiltersStore } from '@/app/store/practiceFiltersStore'
import { TIMING } from '@/lib/constants'
import {
  useStatisticsError,
  useResetDialog,
  useSortingAndFiltering,
} from '@/lib/hooks'
import { PracticeNoun } from '@/lib/types'

import { InputValues, ValidationState } from '../types'
import { validateAnswer } from '../utils'

export const useNounsPractice = () => {
  const { data, isLoading, error } = useGetNounsForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetNounStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const { data: profileData } = useGetProfileQuery()
  const [updateNounStatistic] = useUpdateNounStatisticMutation()
  const [resetNounStatisticMutation] = useResetNounStatisticMutation()

  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})

  // Use persisted filter preferences from Zustand store
  const {
    excludeMastered,
    setExcludeMastered,
    sortOption: storedSortOption,
    setSortOption,
    displayCount: storedDisplayCount,
    setDisplayCount: setStoredDisplayCount,
  } = usePracticeFiltersStore()

  const inputRefsSingular = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  )
  const inputRefsPlural = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  // Use shared statistics error hook
  const { statisticsError, showError } = useStatisticsError()

  // Memoize nouns array to prevent unnecessary re-renders
  const nouns = useMemo(() => data?.nouns || [], [data?.nouns])

  // Get statistics callback
  const getStatistics = useCallback(
    (nounId: string) => {
      const stats = statisticsData?.statistics[nounId]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  // Use shared reset dialog hook
  const resetStatistic = useCallback(
    async (nounId: string) => {
      await resetNounStatisticMutation(nounId).unwrap()
    },
    [resetNounStatisticMutation]
  )

  const {
    resetDialog: resetDialogState,
    isResetting,
    handleOpenResetDialog: openResetDialog,
    handleCloseResetDialog,
    handleConfirmReset,
  } = useResetDialog<PracticeNoun>({
    getItemLabel: (noun) => noun.translation,
    resetStatistic,
  })

  // Transform reset dialog state to match expected interface
  const resetDialog = useMemo(
    () => ({
      open: resetDialogState.open,
      nounId: resetDialogState.itemId,
      nounTranslation: resetDialogState.itemLabel,
      error: resetDialogState.error,
    }),
    [resetDialogState]
  )

  // Get mastery threshold from profile
  const masteryThreshold = profileData?.profile?.masteryThreshold ?? 10

  // Calculate mastered count
  const masteredCount = useMemo(() => {
    return nouns.filter((noun) => {
      const stats = getStatistics(noun.id)
      const netScore = stats.correct - stats.wrong
      return netScore >= masteryThreshold
    }).length
  }, [nouns, getStatistics, masteryThreshold])

  // Mastery exclusion filter function
  const filterFn = useCallback(
    (noun: PracticeNoun) => {
      if (excludeMastered) {
        const stats = getStatistics(noun.id)
        const netScore = stats.correct - stats.wrong
        if (netScore >= masteryThreshold) return false
      }
      return true
    },
    [excludeMastered, masteryThreshold, getStatistics]
  )

  // Use shared sorting and filtering hook with persisted values
  const {
    sortOption,
    displayCount,
    filteredAndSortedItems: filteredAndSortedNouns,
    handleRefresh: baseHandleRefresh,
    handleSortChange: baseHandleSortChange,
    setDisplayCount,
    shouldShowRefreshButton,
  } = useSortingAndFiltering({
    items: nouns as PracticeNoun[],
    getStatistics,
    filterFn,
    refetchStatistics,
    initialSortOption: storedSortOption,
    initialDisplayCount: storedDisplayCount,
    onSortOptionChange: setSortOption,
    onDisplayCountChange: setStoredDisplayCount,
  })

  // Wrap refresh handler to also clear input/validation state
  const handleRefresh = useCallback(() => {
    baseHandleRefresh()
    setInputValues({})
    setValidationState({})
  }, [baseHandleRefresh])

  // Wrap sort change handler to also clear input/validation state
  const handleSortChange = useCallback(
    (newSort: Parameters<typeof baseHandleSortChange>[0]) => {
      baseHandleSortChange(newSort)
      setInputValues({})
      setValidationState({})
    },
    [baseHandleSortChange]
  )

  const handleInputChange = useCallback(
    (nounId: string, field: 'singular' | 'plural', value: string) => {
      setInputValues((prev) => ({
        ...prev,
        [nounId]: {
          singular: field === 'singular' ? value : prev[nounId]?.singular || '',
          plural: field === 'plural' ? value : prev[nounId]?.plural || '',
        },
      }))
      // Clear validation visual feedback when user starts typing again
      setValidationState((prev) => {
        const currentState = prev[nounId]
        if (!currentState || !currentState[field]) return prev // No change needed
        return {
          ...prev,
          [nounId]: {
            singular: field === 'singular' ? null : currentState.singular,
            plural: field === 'plural' ? null : currentState.plural,
          },
        }
      })
    },
    []
  )

  const handleValidation = useCallback(
    (nounId: string, saveStatistics = true) => {
      const noun = data?.nouns.find((n) => n.id === nounId)
      if (!noun) return

      const userInputs = inputValues[nounId] || { singular: '', plural: '' }

      // Check if both fields have input
      if (!userInputs.singular.trim() && !userInputs.plural.trim()) return

      // Prevent duplicate validation within debounce period
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[nounId] || 0
      if (now - lastValidated < TIMING.VALIDATION_DEBOUNCE_MS) {
        return
      }
      lastValidatedRef.current[nounId] = now

      const isSingularCorrect = validateAnswer(
        nounId,
        userInputs.singular,
        noun.italian
      )
      const isPluralCorrect = validateAnswer(
        nounId,
        userInputs.plural,
        noun.italianPlural
      )

      // Only set validation state for fields that have input
      const hasSingularInput = userInputs.singular.trim() !== ''
      const hasPluralInput = userInputs.plural.trim() !== ''

      setValidationState((prev) => ({
        ...prev,
        [nounId]: {
          singular: hasSingularInput
            ? isSingularCorrect
              ? 'correct'
              : 'incorrect'
            : null,
          plural: hasPluralInput
            ? isPluralCorrect
              ? 'correct'
              : 'incorrect'
            : null,
        },
      }))

      // Both must be correct to count as correct in statistics
      const bothCorrect = isSingularCorrect && isPluralCorrect

      // Only save statistics if both fields have input and saveStatistics is true
      if (saveStatistics && hasSingularInput && hasPluralInput) {
        updateNounStatistic({ nounId, correct: bothCorrect }).catch((err) => {
          console.error('Failed to update statistics:', err)
          showError(
            'Failed to save statistics. Your progress may not be saved.'
          )
        })
      }
    },
    [inputValues, updateNounStatistic, data?.nouns, showError]
  )

  const handleClearInput = useCallback(
    (nounId: string, field: 'singular' | 'plural') => {
      setInputValues((prev) => ({
        ...prev,
        [nounId]: {
          singular: field === 'singular' ? '' : prev[nounId]?.singular || '',
          plural: field === 'plural' ? '' : prev[nounId]?.plural || '',
        },
      }))
      setValidationState((prev) => ({
        ...prev,
        [nounId]: {
          singular:
            field === 'singular' ? null : prev[nounId]?.singular || null,
          plural: field === 'plural' ? null : prev[nounId]?.plural || null,
        },
      }))
      // Focus the cleared input
      setTimeout(() => {
        const input =
          field === 'singular'
            ? inputRefsSingular.current[nounId]
            : inputRefsPlural.current[nounId]
        if (input) {
          input.focus()
        }
      }, 0)
    },
    []
  )

  const handleShowAnswer = useCallback(
    (nounId: string) => {
      const noun = data?.nouns.find((n) => n.id === nounId)
      if (!noun) return

      setInputValues((prev) => ({
        ...prev,
        [nounId]: { singular: noun.italian, plural: noun.italianPlural },
      }))
      setValidationState((prev) => ({
        ...prev,
        [nounId]: { singular: 'correct', plural: 'correct' },
      }))
    },
    [data?.nouns]
  )

  const handleOpenResetDialog = useCallback(
    (nounId: string) => {
      const noun = data?.nouns.find((n) => n.id === nounId)
      if (noun) {
        openResetDialog(noun as PracticeNoun)
      }
    },
    [data?.nouns, openResetDialog]
  )

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      nounId: string,
      field: 'singular' | 'plural',
      currentIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()

        if (field === 'singular') {
          // Move to plural field of same noun
          const pluralInput = inputRefsPlural.current[nounId]
          if (pluralInput) {
            pluralInput.focus()
          }
        } else {
          // Validate and move to next noun
          handleValidation(nounId)

          if (currentIndex < filteredAndSortedNouns.length - 1) {
            const nextNoun = filteredAndSortedNouns[currentIndex + 1]
            if (nextNoun) {
              const nextInput = inputRefsSingular.current[nextNoun.id]
              if (nextInput) {
                nextInput.focus()
              }
            }
          }
        }
      }
    },
    [filteredAndSortedNouns, handleValidation]
  )

  return {
    // Data
    isLoading,
    error,
    nouns,
    filteredAndSortedNouns,

    // State
    inputValues,
    validationState,
    sortOption,
    displayCount,
    excludeMastered,
    masteryThreshold,
    resetDialog,
    isResetting,
    statisticsError,

    // Refs
    inputRefsSingular,
    inputRefsPlural,

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
    setDisplayCount,
    setExcludeMastered,

    // Computed
    getStatistics,
    shouldShowRefreshButton,
    masteredCount,
  }
}
