import React from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

const StatisticsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: '50px',
}))

interface StatisticsProps {
  correct: number
  wrong: number
}

/**
 * Statistics component that displays correct and wrong attempt counts
 * in a vertical stacked layout.
 *
 * @param correct - Number of correct attempts
 * @param wrong - Number of wrong attempts
 */
export const Statistics: React.FC<StatisticsProps> = ({ correct, wrong }) => {
  return (
    <StatisticsBox>
      <Tooltip title='Correct attempts' placement='top' arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'success.main',
          }}
        >
          <CheckIcon sx={{ fontSize: 16 }} />
          <Typography variant='caption' fontWeight='bold'>
            {correct}
          </Typography>
        </Box>
      </Tooltip>
      <Tooltip title='Wrong attempts' placement='bottom' arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'error.main',
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
          <Typography variant='caption' fontWeight='bold'>
            {wrong}
          </Typography>
        </Box>
      </Tooltip>
    </StatisticsBox>
  )
}
