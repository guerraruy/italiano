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

import { ResetStatisticsDialog } from './internals/components/NounItem/internals'
import { NounsList } from './internals/components/NounsList'
import { PageHeader } from './internals/components/PageHeader'
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
    resetDialog,
    isResetting,
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
    getStatistics,
    shouldShowRefreshButton,
  } = useNounsPractice()

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
            Error loading nouns. Please try again later.
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
          Translate each noun from your native language to Italian
        </Typography>

        <NounsList
          nouns={nouns}
          filteredAndSortedNouns={filteredAndSortedNouns}
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
          inputRefSingular={(nounId) => (el) =>
            (inputRefsSingular.current[nounId] = el)
          }
          inputRefPlural={(nounId) => (el) =>
            (inputRefsPlural.current[nounId] = el)
          }
        />
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        nounTranslation={resetDialog.nounTranslation}
        isResetting={isResetting}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
