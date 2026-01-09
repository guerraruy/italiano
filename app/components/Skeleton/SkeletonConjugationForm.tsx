import React from 'react'

import { Box, Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'

const FilterRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  alignItems: 'center',
}))

const TenseSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}))

const ConjugationRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
}))

/**
 * Skeleton for verb tenses filter bar.
 * Shows verb type filter and verb selection dropdowns.
 */
export const SkeletonVerbFilters: React.FC = () => {
  return (
    <FilterRow>
      <Skeleton animation="wave" variant="rounded" width={150} height={40} />
      <Skeleton animation="wave" variant="rounded" width={200} height={40} />
      <Box sx={{ flexGrow: 1 }} />
      <Skeleton animation="wave" variant="circular" width={40} height={40} />
    </FilterRow>
  )
}

interface SkeletonTenseSectionProps {
  rows?: number
}

/**
 * Skeleton for a single verb tense conjugation section.
 *
 * @param rows - Number of conjugation rows (default: 6 for all pronouns)
 */
export const SkeletonTenseSection: React.FC<SkeletonTenseSectionProps> = ({
  rows = 6,
}) => {
  return (
    <TenseSection>
      <Skeleton
        animation="wave"
        variant="text"
        width={180}
        height={32}
        sx={{ mb: 2 }}
      />
      {Array.from({ length: rows }).map((_, index) => (
        <ConjugationRow key={index}>
          <Skeleton animation="wave" variant="text" width={80} height={24} />
          <Skeleton
            animation="wave"
            variant="rounded"
            width={200}
            height={40}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={32}
            height={32}
          />
          <Skeleton animation="wave" variant="text" width={50} height={24} />
        </ConjugationRow>
      ))}
    </TenseSection>
  )
}

interface SkeletonConjugationFormProps {
  tenseSections?: number
  rowsPerSection?: number
}

/**
 * Skeleton placeholder for the verb conjugation form.
 * Shows filter bar and multiple tense sections.
 *
 * @param tenseSections - Number of tense sections to show (default: 2)
 * @param rowsPerSection - Number of rows per section (default: 6)
 */
export const SkeletonConjugationForm: React.FC<
  SkeletonConjugationFormProps
> = ({ tenseSections = 2, rowsPerSection = 6 }) => {
  return (
    <Box>
      <SkeletonVerbFilters />
      {Array.from({ length: tenseSections }).map((_, index) => (
        <SkeletonTenseSection key={index} rows={rowsPerSection} />
      ))}
    </Box>
  )
}
