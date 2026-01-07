import React from 'react'

import TranslateIcon from '@mui/icons-material/Translate'
import { Typography, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}))

export const PageHeader: React.FC = () => {
  return (
    <HeaderBox>
      <TranslateIcon color='primary' sx={{ fontSize: 40 }} />
      <Typography variant='h3' component='h1' fontWeight='bold'>
        Nouns Translations
      </Typography>
    </HeaderBox>
  )
}
