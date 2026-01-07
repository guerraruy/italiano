'use client'
import React from 'react'

import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import { styled } from '@mui/material/styles'

import { PageHeader } from '../components/PageHeader'
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
    resetDialog,
    isResetting,
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
    getStatistics,
    shouldShowRefreshButton,
  } = useAdjectivesPractice()

  const setInputRef = React.useCallback(
    (adjectiveId: string, field: string) => (el: HTMLInputElement | null) => {
      inputRefs.current[`${adjectiveId}-${field}`] = el
    },
    // Refs are stable and don't need to be in dependency arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (isLoading) {
    return (
      <PageContainer maxWidth='lg'>
        <PageHeader title='Adjectives Translations' />
        <ContentPaper elevation={3}>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='400px'
          >
            <CircularProgress />
          </Box>
        </ContentPaper>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth='lg'>
        <PageHeader title='Adjectives Translations' />
        <ContentPaper elevation={3}>
          <Alert severity='error'>
            Error loading adjectives. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth='lg'>
      <PageHeader title='Adjectives Translations' />

      <ContentPaper elevation={3}>
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Translate each adjective from your native language to Italian (all 4
          forms: masculine/feminine, singular/plural)
        </Typography>

        <AdjectivesList
          adjectives={adjectives}
          filteredAndSortedAdjectives={filteredAndSortedAdjectives}
          inputValues={inputValues}
          validationState={validationState}
          sortOption={sortOption}
          displayCount={displayCount}
          shouldShowRefreshButton={shouldShowRefreshButton}
          getStatistics={getStatistics}
          onInputChange={handleInputChange}
          onValidation={handleValidation}
          onClearInput={handleClearInput}
          onShowAnswer={handleShowAnswer}
          onResetStatistics={handleOpenResetDialog}
          onKeyDown={handleKeyDown}
          onSortChange={handleSortChange}
          onDisplayCountChange={setDisplayCount}
          onRefresh={handleRefresh}
          setInputRef={setInputRef}
        />
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        adjectiveTranslation={resetDialog.adjectiveTranslation}
        isResetting={isResetting}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
