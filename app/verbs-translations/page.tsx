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
import { ResetStatisticsDialog } from './internals/components/VerbItem/internals'
import { VerbsList } from './internals/components/VerbsList'
import { useVerbsPractice } from './internals/hooks/useVerbsPractice'

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: '400px',
}))

export default function VerbsTranslationsPage() {
  const {
    isLoading,
    error,
    verbs,
    filteredAndSortedVerbs,
    inputValues,
    validationState,
    verbTypeFilter,
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
    setVerbTypeFilter,
    setDisplayCount,
    setExcludeMastered,
    getStatistics,
    shouldShowRefreshButton,
    masteredCount,
  } = useVerbsPractice()

  const actionsValue: PracticeActionsContextType = useMemo(
    () => ({
      onInputChange: handleInputChange,
      onValidation: handleValidation,
      onClearInput: handleClearInput,
      onShowAnswer: handleShowAnswer,
      onResetStatistics: handleOpenResetDialog,
      onKeyDown: handleKeyDown,
      getStatistics,
      getInputRef: (verbId: string) => (el: HTMLInputElement | null) => {
        inputRefs.current[verbId] = el
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
      displayedCount: filteredAndSortedVerbs.length,
      totalCount: verbs.length,
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
      filteredAndSortedVerbs.length,
      verbs.length,
      handleSortChange,
      setDisplayCount,
      setExcludeMastered,
      handleRefresh,
    ]
  )

  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Verbs Translations" />
        <ContentPaper elevation={3}>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Translate each verb from your native language to Italian
          </Typography>
          <SkeletonFilterBar showFilters={3} showRefresh />
          <SkeletonPracticeList count={5} />
        </ContentPaper>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Verbs Translations" />
        <ContentPaper elevation={3}>
          <Alert severity="error">
            Error loading verbs. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Verbs Translations" />

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
          Translate each verb from your native language to Italian
        </Typography>

        <PracticeFiltersProvider value={filtersValue}>
          <PracticeActionsProvider value={actionsValue}>
            <VerbsList
              verbs={verbs}
              filteredAndSortedVerbs={filteredAndSortedVerbs}
              inputValues={inputValues}
              validationState={validationState}
              verbTypeFilter={verbTypeFilter}
              onVerbTypeChange={setVerbTypeFilter}
            />
          </PracticeActionsProvider>
        </PracticeFiltersProvider>
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        verbTranslation={resetDialog.verbTranslation}
        isResetting={isResetting}
        error={resetDialog.error}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
