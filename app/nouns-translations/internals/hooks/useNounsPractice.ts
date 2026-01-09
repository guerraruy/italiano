import { useState, useRef, useCallback, useMemo } from 'react'

import {
  useGetNounsForPracticeQuery,
  useGetNounStatisticsQuery,
  useResetNounStatisticMutation,
  useUpdateNounStatisticMutation,
} from '@/app/store/api'

import { SortOption, DisplayCount } from '../components/NounItem/internals'
import {
  InputValues,
  ResetDialogState,
  StatisticsError,
  ValidationState,
} from '../types'
import { validateAnswer } from '../utils'

export const useNounsPractice = () => {
  const { data, isLoading, error } = useGetNounsForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetNounStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateNounStatistic] = useUpdateNounStatisticMutation()
  const [resetNounStatistic, { isLoading: isResetting }] =
    useResetNounStatisticMutation()

  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    nounId: null,
    nounTranslation: null,
    error: null,
  })
  const [statisticsError, setStatisticsError] =
    useState<StatisticsError | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>(10)
  const [randomSeed, setRandomSeed] = useState(0)

  const inputRefsSingular = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  )
  const inputRefsPlural = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

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

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[nounId] || 0
      if (now - lastValidated < 100) {
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
          setStatisticsError({
            message:
              'Failed to save statistics. Your progress may not be saved.',
            timestamp: Date.now(),
          })
          setTimeout(() => setStatisticsError(null), 5000)
        })
      }
    },
    [inputValues, updateNounStatistic, data?.nouns]
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
        setResetDialog({
          open: true,
          nounId,
          nounTranslation: noun.translation,
          error: null,
        })
      }
    },
    [data?.nouns]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      nounId: null,
      nounTranslation: null,
      error: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.nounId) return

    try {
      await resetNounStatistic(resetDialog.nounId).unwrap()
      handleCloseResetDialog()
    } catch (err) {
      console.error('Failed to reset statistics:', err)
      setResetDialog((prev) => ({
        ...prev,
        error: 'Failed to reset statistics. Please try again.',
      }))
    }
  }, [resetDialog.nounId, resetNounStatistic, handleCloseResetDialog])

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

  // Memoize nouns array to prevent unnecessary re-renders
  const nouns = useMemo(() => data?.nouns || [], [data?.nouns])

  // Apply filters, sorting, and limit
  const filteredAndSortedNouns = useMemo(() => {
    let result = [...nouns]

    // Apply sorting
    if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.translation.localeCompare(b.translation))
    } else if (sortOption === 'random') {
      // Use Fisher-Yates shuffle with a seeded random
      const shuffled = [...result]
      let seed = randomSeed
      const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1))
        const iItem = shuffled[i]
        const jItem = shuffled[j]
        if (iItem !== undefined && jItem !== undefined) {
          ;[shuffled[i], shuffled[j]] = [jItem, iItem]
        }
      }
      result = shuffled
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      result.sort((a, b) => {
        const statsA = getStatistics(a.id)
        const statsB = getStatistics(b.id)

        if (sortOption === 'most-errors') {
          return statsB.wrong - statsA.wrong
        } else {
          // worst-performance: highest (errors - correct) first
          const performanceA = statsA.wrong - statsA.correct
          const performanceB = statsB.wrong - statsB.correct
          return performanceB - performanceA
        }
      })
    }

    // Apply display count limit
    if (displayCount !== 'all') {
      result = result.slice(0, displayCount)
    }

    return result
  }, [nouns, sortOption, displayCount, getStatistics, randomSeed])

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

  const handleRefresh = useCallback(() => {
    if (sortOption === 'random') {
      // Update random seed to reshuffle
      setRandomSeed(Date.now())
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      // Refetch statistics to get latest data
      refetchStatistics()
    }
  }, [sortOption, refetchStatistics])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortOption(newSort)
    if (newSort === 'random') {
      setRandomSeed(Date.now())
    }
  }, [])

  const shouldShowRefreshButton =
    sortOption === 'random' ||
    sortOption === 'most-errors' ||
    sortOption === 'worst-performance'

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

    // Computed
    getStatistics,
    shouldShowRefreshButton,
  }
}
