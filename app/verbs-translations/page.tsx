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

import { PageHeader } from './internals/components/PageHeader'
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
    setVerbTypeFilter,
    setDisplayCount,
    getStatistics,
    shouldShowRefreshButton,
  } = useVerbsPractice()

  if (isLoading) {
    return (
      <PageContainer maxWidth='lg'>
        <PageHeader />
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
        <PageHeader />
        <ContentPaper elevation={3}>
          <Alert severity='error'>
            Error loading verbs. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth='lg'>
      <PageHeader />

      <ContentPaper elevation={3}>
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Translate each verb from your native language to Italian
        </Typography>

        <VerbsList
          verbs={verbs}
          filteredAndSortedVerbs={filteredAndSortedVerbs}
          inputValues={inputValues}
          validationState={validationState}
          verbTypeFilter={verbTypeFilter}
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
          onVerbTypeChange={setVerbTypeFilter}
          onSortChange={handleSortChange}
          onDisplayCountChange={setDisplayCount}
          onRefresh={handleRefresh}
          inputRef={(verbId) => (el) => (inputRefs.current[verbId] = el)}
        />
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        verbTranslation={resetDialog.verbTranslation}
        isResetting={isResetting}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
