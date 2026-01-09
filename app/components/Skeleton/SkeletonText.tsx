import React from 'react'

import { Box, Skeleton, SxProps, Theme } from '@mui/material'

interface SkeletonTextProps {
  lines?: number
  width?: string | number | (string | number)[]
  height?: number
  spacing?: number
  sx?: SxProps<Theme>
}

/**
 * Skeleton placeholder for text content.
 * Renders multiple skeleton lines to simulate loading text.
 *
 * @param lines - Number of lines to render (default: 3)
 * @param width - Width of lines. Can be a single value or array for varying widths (default: ['100%', '100%', '70%'])
 * @param height - Height of each line (default: 24)
 * @param spacing - Spacing between lines in theme units (default: 1)
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  width = ['100%', '100%', '70%'],
  height = 24,
  spacing = 1,
  sx,
}) => {
  const widthArray = Array.isArray(width)
    ? width
    : Array.from({ length: lines }).map(() => width)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing, ...sx }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          animation="wave"
          variant="text"
          width={widthArray[index % widthArray.length]}
          height={height}
        />
      ))}
    </Box>
  )
}

interface SkeletonHeadingProps {
  width?: string | number
  height?: number
  sx?: SxProps<Theme>
}

/**
 * Skeleton placeholder for headings.
 *
 * @param width - Width of the heading (default: '60%')
 * @param height - Height of the heading (default: 32)
 */
export const SkeletonHeading: React.FC<SkeletonHeadingProps> = ({
  width = '60%',
  height = 32,
  sx,
}) => {
  return (
    <Skeleton
      animation="wave"
      variant="text"
      width={width}
      height={height}
      sx={sx}
    />
  )
}
