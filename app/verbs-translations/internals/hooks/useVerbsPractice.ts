import { useState, useRef, useCallback, useMemo } from 'react'

import {
  useGetVerbsForPracticeQuery,
  useGetVerbStatisticsQuery,
  useResetVerbStatisticMutation,
  useUpdateVerbStatisticMutation,
} from '@/app/store/api'

import {
  SortOption,
  DisplayCount,
  VerbTypeFilter,
} from '../components/VerbItem/internals'
import {
  InputValues,
  ResetDialogState,
  StatisticsError,
  ValidationState,
} from '../types'
import { validateAnswer } from '../utils'

export const useVerbsPractice = () => {
  const { data, isLoading, error } = useGetVerbsForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetVerbStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateVerbStatistic] = useUpdateVerbStatisticMutation()
  const [resetVerbStatistic, { isLoading: isResetting }] =
    useResetVerbStatisticMutation()

  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    verbId: null,
    verbTranslation: null,
    error: null,
  })
  const [statisticsError, setStatisticsError] =
    useState<StatisticsError | null>(null)
  const [verbTypeFilter, setVerbTypeFilter] = useState<VerbTypeFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>(10)
  const [randomSeed, setRandomSeed] = useState(0)

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

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
        setStatisticsError({
          message: 'Failed to save statistics. Your progress may not be saved.',
          timestamp: Date.now(),
        })
        // Auto-clear error after 5 seconds
        setTimeout(() => setStatisticsError(null), 5000)
      })
    },
    [inputValues, updateVerbStatistic]
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
        setResetDialog({
          open: true,
          verbId,
          verbTranslation: verb.translation,
          error: null,
        })
      }
    },
    [data?.verbs]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      verbId: null,
      verbTranslation: null,
      error: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.verbId) return

    try {
      await resetVerbStatistic(resetDialog.verbId).unwrap()
      handleCloseResetDialog()
    } catch (err) {
      console.error('Failed to reset statistics:', err)
      setResetDialog((prev) => ({
        ...prev,
        error: 'Failed to reset statistics. Please try again.',
      }))
    }
  }, [resetDialog.verbId, resetVerbStatistic, handleCloseResetDialog])

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

  // Memoize verbs array to prevent unnecessary re-renders
  const verbs = useMemo(() => data?.verbs || [], [data?.verbs])

  // Apply filters, sorting, and limit
  const filteredAndSortedVerbs = useMemo(() => {
    let result = [...verbs]

    // Apply verb type filter
    if (verbTypeFilter !== 'all') {
      result = result.filter((verb) => {
        if (verbTypeFilter === 'reflexive') return verb.reflexive
        if (verbTypeFilter === 'regular') return verb.regular && !verb.reflexive
        if (verbTypeFilter === 'irregular')
          return !verb.regular && !verb.reflexive
        return true
      })
    }

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
  }, [
    verbs,
    verbTypeFilter,
    sortOption,
    displayCount,
    getStatistics,
    randomSeed,
  ])

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
