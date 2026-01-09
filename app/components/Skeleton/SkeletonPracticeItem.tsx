import React from 'react'

import { Box, ListItem, Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'

const SkeletonListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}))

const IconBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '32px',
}))

const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: '250px',
}))

const InputBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
  maxWidth: '500px',
}))

const StatisticsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: '50px',
}))

/**
 * Skeleton placeholder for practice items (verbs, nouns, adjectives).
 * Matches the layout of VerbItem, NounItem, and AdjectiveItem components.
 */
export const SkeletonPracticeItem: React.FC = () => {
  return (
    <SkeletonListItem>
      <IconBox>
        <Skeleton animation="wave" variant="circular" width={24} height={24} />
      </IconBox>

      <InfoBox>
        <Skeleton
          animation="wave"
          variant="text"
          width={140}
          height={28}
          sx={{ minWidth: '180px' }}
        />
      </InfoBox>

      <InputBox>
        <Skeleton animation="wave" variant="rounded" width="100%" height={40} />
        <Skeleton animation="wave" variant="circular" width={32} height={32} />
      </InputBox>

      <StatisticsBox>
        <Skeleton animation="wave" variant="text" width={40} height={20} />
        <Skeleton animation="wave" variant="text" width={40} height={20} />
      </StatisticsBox>

      <Skeleton animation="wave" variant="circular" width={28} height={28} />
    </SkeletonListItem>
  )
}

interface SkeletonPracticeListProps {
  count?: number
}

/**
 * Renders multiple skeleton practice items.
 * Use this for loading states in practice pages.
 *
 * @param count - Number of skeleton items to render (default: 5)
 */
export const SkeletonPracticeList: React.FC<SkeletonPracticeListProps> = ({
  count = 5,
}) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPracticeItem key={index} />
      ))}
    </Box>
  )
}
