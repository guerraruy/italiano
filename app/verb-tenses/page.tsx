'use client'
import React from 'react'

import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material'
import { styled } from '@mui/material/styles'

import {
  VerbFilters,
  ConjugationForm,
  ResetStatisticsDialog,
} from './internals/components'
import { PageHeader } from '../components/PageHeader'
import { useVerbConjugationPractice } from './internals/hooks/useVerbConjugationPractice'

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: '400px',
}))

export default function VerbTensesPage() {
  const {
    isLoading,
    error,
    verbs,
    filteredVerbs,
    selectedVerb,
    enabledVerbTenses,
    verbTypeFilter,
    selectedVerbId,
    inputValues,
    validationState,
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
    handleVerbTypeFilterChange,
    handleVerbSelection,
    getStatistics,
  } = useVerbConjugationPractice()

  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Verb Tenses" />
        <ContentPaper elevation={3}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </ContentPaper>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader title="Verb Tenses" />
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
      <PageHeader title="Verb Tenses" />

      <ContentPaper elevation={3}>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Practice verb conjugations for all selected tenses
        </Typography>

        <VerbFilters
          verbTypeFilter={verbTypeFilter}
          selectedVerbId={selectedVerbId}
          filteredVerbs={filteredVerbs}
          hasSelectedVerb={!!selectedVerb}
          onVerbTypeFilterChange={handleVerbTypeFilterChange}
          onVerbSelection={handleVerbSelection}
          onResetStatistics={handleOpenResetDialog}
        />

        <ConjugationForm
          selectedVerb={selectedVerb}
          enabledVerbTenses={enabledVerbTenses}
          inputValues={inputValues}
          validationState={validationState}
          inputRefs={inputRefs}
          verbsCount={verbs.length}
          getStatistics={getStatistics}
          onInputChange={handleInputChange}
          onValidation={handleValidation}
          onClearInput={handleClearInput}
          onShowAnswer={handleShowAnswer}
          onKeyDown={handleKeyDown}
        />
      </ContentPaper>

      <ResetStatisticsDialog
        open={resetDialog.open}
        verbName={resetDialog.verbName}
        isResetting={isResetting}
        onClose={handleCloseResetDialog}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
