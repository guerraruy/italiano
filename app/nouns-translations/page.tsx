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
import { ResetStatisticsDialog } from './internals/components/NounItem/internals'
import { NounsList } from './internals/components/NounsList'
import { useNounsPractice } from './internals/hooks/useNounsPractice'

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: '400px',
}))

export default function NounsTranslationsPage() {
  const {
    isLoading,
    error,
    nouns,
    filteredAndSortedNouns,
    inputValues,
    validationState,
    sortOption,
    displayCount,
    excludeMastered,
    masteryThreshold,
    resetDialog,
    isResetting,
    statisticsError,
    inputRefsSingular,
    inputRefsPlural,
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
  } = useNounsPractice()

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
        (nounId: string, field: 'singular' | 'plural') =>
        (el: HTMLInputElement | null) => {
          if (field === 'singular') {
            inputRefsSingular.current[nounId] = el
          } else {
            inputRefsPlural.current[nounId] = el
          }
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
      inputRefsSingular,
      inputRefsPlural,
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
      displayedCount: filteredAndSortedNouns.length,
      totalCount: nouns.length,
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
      filteredAndSortedNouns.length,
      nouns.length,
      handleSortChange,
      setDisplayCount,
      setExcludeMastered,
      handleRefresh,
    ]
  )

  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Nouns Translations" />
        <ContentPaper elevation={3}>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Translate each noun from your native language to Italian
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
        <PageHeader title="Nouns Translations" />
        <ContentPaper elevation={3}>
          <Alert severity="error">
            Error loading nouns. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Nouns Translations" />

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
          Translate each noun from your native language to Italian
        </Typography>

        <PracticeFiltersProvider value={filtersValue}>
          <PracticeActionsProvider value={actionsValue}>
            <NounsList
              nouns={nouns}
              filteredAndSortedNouns={filteredAndSortedNouns}
              inputValues={inputValues}
              validationState={validationState}
            />
          </PracticeActionsProvider>
        </PracticeFiltersProvider>
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        nounTranslation={resetDialog.nounTranslation}
        isResetting={isResetting}
        error={resetDialog.error}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
