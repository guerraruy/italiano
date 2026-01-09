import { useState, useRef, useCallback, useMemo, useEffect } from 'react'

import {
  useGetVerbsForConjugationPracticeQuery,
  useGetConjugationStatisticsQuery,
  useUpdateConjugationStatisticMutation,
  useResetConjugationStatisticsMutation,
  useGetProfileQuery,
} from '@/app/store/api'

import {
  VerbTypeFilter,
  ValidationState,
  InputValues,
  ResetDialogState,
  StatisticsError,
} from '../types'
import { validateAnswer, getFilterStorageKey, createInputKey } from '../utils'

export const useVerbConjugationPractice = () => {
  const { data, isLoading, error } = useGetVerbsForConjugationPracticeQuery()
  const { data: profileData } = useGetProfileQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetConjugationStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateConjugationStatistic] = useUpdateConjugationStatisticMutation()
  const [resetConjugationStatistics, { isLoading: isResetting }] =
    useResetConjugationStatisticsMutation()

  // Get user ID from profile
  const userId = profileData?.profile?.userId || ''

  // Track the last userId that we loaded/saved preferences for
  const lastUserIdRef = useRef<string>('')

  // Initialize verb type filter with localStorage value if available
  const [verbTypeFilter, setVerbTypeFilter] = useState<VerbTypeFilter>(() => {
    // Try to load from localStorage on initial mount
    if (typeof window !== 'undefined') {
      // Try to find any existing filter in localStorage
      // This is a best-effort attempt - will be properly synced when userId is available
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith('verbTypeFilter_')
      )
      if (keys.length > 0) {
        const firstKey = keys[0]
        if (!firstKey) return 'all'
        const saved = localStorage.getItem(firstKey)
        if (
          saved &&
          ['all', 'regular', 'irregular', 'reflexive'].includes(saved)
        ) {
          return saved as VerbTypeFilter
        }
      }
    }
    return 'all'
  })

  const [selectedVerbId, setSelectedVerbId] = useState<string>('')
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    verbId: null,
    verbName: null,
    error: null,
  })
  const [statisticsError, setStatisticsError] =
    useState<StatisticsError | null>(null)
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  // Load and save verb type filter to/from localStorage
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return

    const storageKey = getFilterStorageKey(userId)

    // If this is a new user (different from last one), load their preference
    if (lastUserIdRef.current !== userId) {
      const saved = localStorage.getItem(storageKey)
      if (
        saved &&
        ['all', 'regular', 'irregular', 'reflexive'].includes(saved)
      ) {
        // Only update if different from current value
        if (saved !== verbTypeFilter) {
          // Using a microtask to avoid synchronous setState in effect
          Promise.resolve().then(() => {
            setVerbTypeFilter(saved as VerbTypeFilter)
          })
        }
      }
      lastUserIdRef.current = userId
    } else {
      // Save current preference
      localStorage.setItem(storageKey, verbTypeFilter)
    }
  }, [userId, verbTypeFilter])

  const verbs = useMemo(() => data?.verbs || [], [data?.verbs])

  // Get enabled verb tenses from profile
  const enabledVerbTenses = useMemo(
    () => profileData?.profile?.enabledVerbTenses || ['Indicativo.Presente'],
    [profileData?.profile?.enabledVerbTenses]
  )

  // Filter verbs by type
  const filteredVerbs = useMemo(() => {
    if (verbTypeFilter === 'all') return verbs

    return verbs.filter((verb) => {
      if (verbTypeFilter === 'reflexive') return verb.reflexive
      if (verbTypeFilter === 'regular') return verb.regular && !verb.reflexive
      if (verbTypeFilter === 'irregular')
        return !verb.regular && !verb.reflexive
      return true
    })
  }, [verbs, verbTypeFilter])

  // Get selected verb
  const selectedVerb = useMemo(
    () => verbs.find((v) => v.id === selectedVerbId),
    [verbs, selectedVerbId]
  )

  // Get statistics for a specific conjugation
  const getStatistics = useCallback(
    (verbId: string, mood: string, tense: string, person: string) => {
      const key = `${verbId}:${mood}:${tense}:${person}`
      const stats = statisticsData?.statistics[key]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  const handleInputChange = useCallback((key: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }))
    setValidationState((prev) => {
      if (!prev[key]) return prev
      return { ...prev, [key]: null }
    })
  }, [])

  const handleValidation = useCallback(
    (
      key: string,
      correctAnswer: string,
      verbId: string,
      mood: string,
      tense: string,
      person: string
    ) => {
      const userInput = inputValues[key] || ''
      if (!userInput.trim()) return

      // Check if already validated (don't validate again if already has a state)
      if (validationState[key] !== null && validationState[key] !== undefined) {
        return
      }

      // Prevent duplicate validation within 500ms
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[key] || 0
      if (now - lastValidated < 500) {
        return
      }
      lastValidatedRef.current[key] = now

      const isCorrect = validateAnswer(userInput, correctAnswer)

      setValidationState((prev) => ({
        ...prev,
        [key]: isCorrect ? 'correct' : 'incorrect',
      }))

      // Save statistics to backend asynchronously
      updateConjugationStatistic({
        verbId,
        mood,
        tense,
        person,
        correct: isCorrect,
      }).catch((err) => {
        console.error('Failed to update statistics:', err)
        setStatisticsError({
          message: 'Failed to save statistics. Your progress may not be saved.',
          timestamp: Date.now(),
        })
        setTimeout(() => setStatisticsError(null), 5000)
      })
    },
    [inputValues, validationState, updateConjugationStatistic]
  )

  const handleClearInput = useCallback((key: string) => {
    setInputValues((prev) => ({ ...prev, [key]: '' }))
    setValidationState((prev) => ({ ...prev, [key]: null }))
    setTimeout(() => {
      const input = inputRefs.current[key]
      if (input) {
        input.focus()
      }
    }, 0)
  }, [])

  const handleShowAnswer = useCallback((key: string, correctAnswer: string) => {
    setInputValues((prev) => ({ ...prev, [key]: correctAnswer }))
    setValidationState((prev) => ({ ...prev, [key]: 'correct' }))
  }, [])

  const handleOpenResetDialog = useCallback(() => {
    if (selectedVerb) {
      setResetDialog({
        open: true,
        verbId: selectedVerb.id,
        verbName: selectedVerb.italian,
        error: null,
      })
    }
  }, [selectedVerb])

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      verbId: null,
      verbName: null,
      error: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.verbId) return

    try {
      await resetConjugationStatistics(resetDialog.verbId).unwrap()
      handleCloseResetDialog()
      refetchStatistics()
    } catch (err) {
      console.error('Failed to reset statistics:', err)
      setResetDialog((prev) => ({
        ...prev,
        error: 'Failed to reset statistics. Please try again.',
      }))
    }
  }, [
    resetDialog.verbId,
    resetConjugationStatistics,
    handleCloseResetDialog,
    refetchStatistics,
  ])

  // Get all input keys in order based on enabled tenses
  const getAllInputKeys = useCallback(() => {
    if (!selectedVerb) return []

    const keys: string[] = []
    const conjugation = selectedVerb.conjugation

    if (!conjugation) return []

    enabledVerbTenses.forEach((tenseKey) => {
      const [mood, tense] = tenseKey.split('.')
      if (!mood || !tense) return
      const moodData = conjugation[mood]

      if (!moodData || !moodData[tense]) return

      const tenseData = moodData[tense]

      // Simple form (string value)
      if (typeof tenseData === 'string') {
        keys.push(createInputKey(mood, tense, 'form'))
      } else {
        // Person-based conjugations
        Object.keys(tenseData).forEach((person) => {
          keys.push(createInputKey(mood, tense, person))
        })
      }
    })

    return keys
  }, [selectedVerb, enabledVerbTenses])

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      key: string,
      correctAnswer: string,
      verbId: string,
      mood: string,
      tense: string,
      person: string
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleValidation(key, correctAnswer, verbId, mood, tense, person)

        // Move focus to next input
        const allKeys = getAllInputKeys()
        const currentIndex = allKeys.indexOf(key)

        if (currentIndex !== -1 && currentIndex < allKeys.length - 1) {
          const nextKey = allKeys[currentIndex + 1]
          if (nextKey) {
            setTimeout(() => {
              const nextInput = inputRefs.current[nextKey]
              if (nextInput) {
                nextInput.focus()
              }
            }, 0)
          }
        }
      }
    },
    [handleValidation, getAllInputKeys]
  )

  const handleVerbTypeFilterChange = useCallback(
    (newFilter: VerbTypeFilter) => {
      setVerbTypeFilter(newFilter)
    },
    []
  )

  const handleVerbSelection = useCallback((verbId: string) => {
    setSelectedVerbId(verbId)
    setInputValues({})
    setValidationState({})
  }, [])

  return {
    // Data
    isLoading,
    error,
    verbs,
    filteredVerbs,
    selectedVerb,
    enabledVerbTenses,

    // State
    verbTypeFilter,
    selectedVerbId,
    inputValues,
    validationState,
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
    handleVerbTypeFilterChange,
    handleVerbSelection,

    // Computed
    getStatistics,
  }
}
