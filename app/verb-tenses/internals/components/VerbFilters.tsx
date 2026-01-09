import React from 'react'

import AutorenewIcon from '@mui/icons-material/Autorenew'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'

import { VerbTypeFilter } from '../types'

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center',
}))

interface Verb {
  id: string
  italian: string
  translation: string
  regular: boolean
  reflexive: boolean
}

interface VerbFiltersProps {
  verbTypeFilter: VerbTypeFilter
  selectedVerbId: string
  filteredVerbs: Verb[]
  hasSelectedVerb: boolean
  onVerbTypeFilterChange: (filter: VerbTypeFilter) => void
  onVerbSelection: (verbId: string) => void
  onResetStatistics: () => void
}

// Get verb icon
const getVerbIcon = (regular: boolean, reflexive: boolean) => {
  if (reflexive) {
    return (
      <Tooltip title="Reflexive">
        <AutorenewIcon
          color="secondary"
          fontSize="small"
          data-testid="reflexive-icon"
        />
      </Tooltip>
    )
  }
  if (regular) {
    return (
      <Tooltip title="Regular">
        <RadioButtonCheckedIcon
          color="info"
          fontSize="small"
          data-testid="regular-icon"
        />
      </Tooltip>
    )
  }
  return (
    <Tooltip title="Irregular">
      <ShowChartIcon
        color="warning"
        fontSize="small"
        data-testid="irregular-icon"
      />
    </Tooltip>
  )
}

export const VerbFilters: React.FC<VerbFiltersProps> = ({
  verbTypeFilter,
  selectedVerbId,
  filteredVerbs,
  hasSelectedVerb,
  onVerbTypeFilterChange,
  onVerbSelection,
  onResetStatistics,
}) => {
  return (
    <FilterBox>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="verb-type-filter-label">Verb Type</InputLabel>
        <Select
          labelId="verb-type-filter-label"
          id="verb-type-filter"
          value={verbTypeFilter}
          label="Verb Type"
          onChange={(e) =>
            onVerbTypeFilterChange(e.target.value as VerbTypeFilter)
          }
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="regular">Regular</MenuItem>
          <MenuItem value="irregular">Irregular</MenuItem>
          <MenuItem value="reflexive">Reflexive</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 300 }}>
        <InputLabel id="verb-select-label">Select Verb</InputLabel>
        <Select
          labelId="verb-select-label"
          id="verb-select"
          value={selectedVerbId}
          label="Select Verb"
          onChange={(e) => onVerbSelection(e.target.value)}
        >
          <MenuItem value="">
            <em>Choose a verb</em>
          </MenuItem>
          {filteredVerbs.map((verb) => (
            <MenuItem key={verb.id} value={verb.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getVerbIcon(verb.regular, verb.reflexive)}
                <span>
                  {verb.italian} - {verb.translation}
                </span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {hasSelectedVerb && (
        <Tooltip title="Reset all statistics for this verb">
          <IconButton size="small" onClick={onResetStatistics} color="default">
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
        {filteredVerbs.length} verb{filteredVerbs.length !== 1 ? 's' : ''}{' '}
        available
      </Typography>
    </FilterBox>
  )
}
