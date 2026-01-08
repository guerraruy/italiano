import React from 'react'

import { Typography, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

interface PageHeaderProps {
  title: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <HeaderBox>
      <Typography
        variant="h5"
        component="h1"
        fontWeight="bold"
        style={{ textTransform: 'uppercase' }}
      >
        {title}
      </Typography>
    </HeaderBox>
  )
}
