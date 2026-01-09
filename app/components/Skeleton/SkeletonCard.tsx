import React from 'react'

import { Box, Paper, Skeleton, SxProps, Theme } from '@mui/material'
import { styled } from '@mui/material/styles'

const SkeletonPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
}))

interface SkeletonCardProps {
  showHeader?: boolean
  showSubheader?: boolean
  contentLines?: number
  showActions?: boolean
  elevation?: number
  sx?: SxProps<Theme>
}

/**
 * Skeleton placeholder for card-based content.
 * Matches the ContentPaper layout used in practice pages.
 *
 * @param showHeader - Whether to show header skeleton (default: true)
 * @param showSubheader - Whether to show subheader skeleton (default: true)
 * @param contentLines - Number of content lines (default: 0)
 * @param showActions - Whether to show action buttons skeleton (default: false)
 * @param elevation - Paper elevation (default: 3)
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showHeader = true,
  showSubheader = true,
  contentLines = 0,
  showActions = false,
  elevation = 3,
  sx,
}) => {
  return (
    <SkeletonPaper elevation={elevation} sx={sx}>
      {showHeader && (
        <Skeleton
          animation="wave"
          variant="text"
          width="40%"
          height={40}
          sx={{ mb: 1 }}
        />
      )}

      {showSubheader && (
        <Skeleton
          animation="wave"
          variant="text"
          width="70%"
          height={28}
          sx={{ mb: 3 }}
        />
      )}

      {contentLines > 0 && (
        <Box sx={{ mb: 2 }}>
          {Array.from({ length: contentLines }).map((_, index) => (
            <Skeleton
              key={index}
              animation="wave"
              variant="text"
              width={index === contentLines - 1 ? '60%' : '100%'}
              height={24}
              sx={{ mb: 0.5 }}
            />
          ))}
        </Box>
      )}

      {showActions && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Skeleton
            animation="wave"
            variant="rounded"
            width={100}
            height={36}
          />
          <Skeleton
            animation="wave"
            variant="rounded"
            width={100}
            height={36}
          />
        </Box>
      )}
    </SkeletonPaper>
  )
}

interface SkeletonFilterBarProps {
  showFilters?: number
  showSearch?: boolean
  showRefresh?: boolean
}

/**
 * Skeleton placeholder for filter bars used in practice pages.
 *
 * @param showFilters - Number of filter dropdowns to show (default: 3)
 * @param showSearch - Whether to show search field (default: false)
 * @param showRefresh - Whether to show refresh button (default: true)
 */
export const SkeletonFilterBar: React.FC<SkeletonFilterBarProps> = ({
  showFilters = 3,
  showSearch = false,
  showRefresh = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
        alignItems: 'center',
      }}
    >
      {Array.from({ length: showFilters }).map((_, index) => (
        <Skeleton
          key={index}
          animation="wave"
          variant="rounded"
          width={150}
          height={40}
        />
      ))}

      {showSearch && (
        <Skeleton
          animation="wave"
          variant="rounded"
          width={200}
          height={40}
          sx={{ flexGrow: 1, maxWidth: 300 }}
        />
      )}

      <Box sx={{ flexGrow: 1 }} />

      {showRefresh && (
        <Skeleton animation="wave" variant="circular" width={40} height={40} />
      )}
    </Box>
  )
}
