import React from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import { Box, IconButton, Tooltip } from '@mui/material'

interface AdjectiveActionsProps {
  adjectiveId: string
  hasStatistics: boolean
  onShowAnswer: (adjectiveId: string) => void
  onClearInput: (adjectiveId: string) => void
  onResetStatistics: (adjectiveId: string) => void
  showResetButton?: boolean
}

function AdjectiveActions({
  adjectiveId,
  hasStatistics,
  onShowAnswer,
  onClearInput,
  onResetStatistics,
  showResetButton = true,
}: AdjectiveActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Show all answers">
        <IconButton
          size="small"
          onClick={() => onShowAnswer(adjectiveId)}
          color="primary"
        >
          <LightbulbOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Clear all fields">
        <IconButton
          size="small"
          onClick={() => onClearInput(adjectiveId)}
          color="default"
        >
          <ClearIcon />
        </IconButton>
      </Tooltip>

      {showResetButton && (
        <Tooltip title="Reset statistics">
          <IconButton
            size="small"
            onClick={() => onResetStatistics(adjectiveId)}
            color="default"
            disabled={!hasStatistics}
          >
            <DeleteSweepIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default React.memo(AdjectiveActions)
