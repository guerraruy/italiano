import React from 'react'

import { Skeleton as MuiSkeleton, SkeletonProps } from '@mui/material'

/**
 * Base Skeleton component that wraps MUI Skeleton with default styling.
 * Use this for simple skeleton placeholders.
 */
export const Skeleton: React.FC<SkeletonProps> = (props) => {
  return <MuiSkeleton animation="wave" {...props} />
}
