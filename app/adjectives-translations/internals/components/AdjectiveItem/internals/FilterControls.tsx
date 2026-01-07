import React from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'
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

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center',
}))

export type SortOption =
  | 'none'
  | 'alphabetical'
  | 'random'
  | 'most-errors'
  | 'worst-performance'

export type DisplayCount = 10 | 20 | 30 | 'all'

interface FilterControlsProps {
  sortOption: SortOption
  displayCount: DisplayCount
  onSortChange: (value: SortOption) => void
  onDisplayCountChange: (value: DisplayCount) => void
  onRefresh: () => void
  showRefreshButton: boolean
  displayedCount: number
  totalCount: number
}

export default function FilterControls({
  sortOption,
  displayCount,
  onSortChange,
  onDisplayCountChange,
  onRefresh,
  showRefreshButton,
  displayedCount,
  totalCount,
}: FilterControlsProps) {
  return (
    <FilterBox>
      <FormControl size='small' sx={{ minWidth: 180 }}>
        <InputLabel id='sort-option-label'>Sort By</InputLabel>
        <Select
          labelId='sort-option-label'
          id='sort-option'
          value={sortOption}
          label='Sort By'
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <MenuItem value='none'>None</MenuItem>
          <MenuItem value='alphabetical'>Alphabetical</MenuItem>
          <MenuItem value='random'>Random</MenuItem>
          <MenuItem value='most-errors'>Most Errors</MenuItem>
          <MenuItem value='worst-performance'>Worst Performance</MenuItem>
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ minWidth: 140 }}>
        <InputLabel id='display-count-label'>Display</InputLabel>
        <Select
          labelId='display-count-label'
          id='display-count'
          value={displayCount}
          label='Display'
          onChange={(e) => onDisplayCountChange(e.target.value as DisplayCount)}
        >
          <MenuItem value={10}>10 adjectives</MenuItem>
          <MenuItem value={20}>20 adjectives</MenuItem>
          <MenuItem value={30}>30 adjectives</MenuItem>
          <MenuItem value='all'>All adjectives</MenuItem>
        </Select>
      </FormControl>

      {showRefreshButton && (
        <Tooltip title='Refresh list'>
          <IconButton
            onClick={onRefresh}
            color='primary'
            size='small'
            sx={{ ml: 1 }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}

      <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
        Showing {displayedCount} of {totalCount} adjectives
      </Typography>
    </FilterBox>
  )
}

