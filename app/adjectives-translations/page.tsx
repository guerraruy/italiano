'use client'
import React, { useMemo } from 'react'

import { Container, Typography, Paper, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'

import { PageHeader } from '../components/PageHeader'
import { SkeletonFilterBar, SkeletonPracticeList } from '../components/Skeleton'
import {
  PracticeActionsProvider,
  PracticeFiltersProvider,
  PracticeActionsContextType,
  PracticeFiltersContextType,
} from '../contexts'
import { ResetStatisticsDialog } from './internals/components/AdjectiveItem/internals'
import { AdjectivesList } from './internals/components/AdjectivesList'
import { useAdjectivesPractice } from './internals/hooks/useAdjectivesPractice'

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: '400px',
}))

export default function AdjectivesTranslationsPage() {
  const {
    isLoading,
    error,
    adjectives,
    filteredAndSortedAdjectives,
    inputValues,
    validationState,
    sortOption,
    displayCount,
    excludeMastered,
    masteryThreshold,
    resetDialog,
    isResetting,
    statisticsError,
    inputRefs,
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
    getStatistics,
    shouldShowRefreshButton,
    masteredCount,
  } = useAdjectivesPractice()

  const actionsValue: PracticeActionsContextType = useMemo(
    () => ({
      onInputChange: handleInputChange,
      onValidation: handleValidation,
      onClearInput: handleClearInput,
      onShowAnswer: handleShowAnswer,
      onResetStatistics: handleOpenResetDialog,
      onKeyDown: handleKeyDown,
      getStatistics,
      getInputRef:
        (adjectiveId: string, field: string) =>
        (el: HTMLInputElement | null) => {
          inputRefs.current[`${adjectiveId}-${field}`] = el
        },
    }),
    [
      handleInputChange,
      handleValidation,
      handleClearInput,
      handleShowAnswer,
      handleOpenResetDialog,
      handleKeyDown,
      getStatistics,
      inputRefs,
    ]
  )

  const filtersValue: PracticeFiltersContextType = useMemo(
    () => ({
      sortOption,
      displayCount,
      excludeMastered,
      masteryThreshold,
      masteredCount,
      shouldShowRefreshButton,
      displayedCount: filteredAndSortedAdjectives.length,
      totalCount: adjectives.length,
      onSortChange: handleSortChange,
      onDisplayCountChange: setDisplayCount,
      onExcludeMasteredChange: setExcludeMastered,
      onRefresh: handleRefresh,
    }),
    [
      sortOption,
      displayCount,
      excludeMastered,
      masteryThreshold,
      masteredCount,
      shouldShowRefreshButton,
      filteredAndSortedAdjectives.length,
      adjectives.length,
      handleSortChange,
      setDisplayCount,
      setExcludeMastered,
      handleRefresh,
    ]
  )

  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Adjectives Translations" />
        <ContentPaper elevation={3}>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Translate each adjective from your native language to Italian (all 4
            forms: masculine/feminine, singular/plural)
          </Typography>
          <SkeletonFilterBar showFilters={2} showRefresh />
          <SkeletonPracticeList count={5} />
        </ContentPaper>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Adjectives Translations" />
        <ContentPaper elevation={3}>
          <Alert severity="error">
            Error loading adjectives. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Adjectives Translations" />

      <ContentPaper elevation={3}>
        {statisticsError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {statisticsError.message}
          </Alert>
        )}

        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Translate each adjective from your native language to Italian (all 4
          forms: masculine/feminine, singular/plural)
        </Typography>

        <PracticeFiltersProvider value={filtersValue}>
          <PracticeActionsProvider value={actionsValue}>
            <AdjectivesList
              adjectives={adjectives}
              filteredAndSortedAdjectives={filteredAndSortedAdjectives}
              inputValues={inputValues}
              validationState={validationState}
            />
          </PracticeActionsProvider>
        </PracticeFiltersProvider>
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        adjectiveTranslation={resetDialog.adjectiveTranslation}
        isResetting={isResetting}
        error={resetDialog.error}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
