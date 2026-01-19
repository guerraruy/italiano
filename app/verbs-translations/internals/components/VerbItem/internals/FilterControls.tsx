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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center',
}))

export type VerbTypeFilter = 'all' | 'regular' | 'irregular' | 'reflexive'

export type SortOption =
  | 'none'
  | 'alphabetical'
  | 'random'
  | 'most-errors'
  | 'worst-performance'

export type DisplayCount = 10 | 20 | 30 | 'all'

interface FilterControlsProps {
  verbTypeFilter: VerbTypeFilter
  sortOption: SortOption
  displayCount: DisplayCount
  excludeMastered: boolean
  masteryThreshold: number
  onVerbTypeChange: (value: VerbTypeFilter) => void
  onSortChange: (value: SortOption) => void
  onDisplayCountChange: (value: DisplayCount) => void
  onExcludeMasteredChange: (value: boolean) => void
  onRefresh: () => void
  showRefreshButton: boolean
  displayedCount: number
  totalCount: number
}

export default function FilterControls({
  verbTypeFilter,
  sortOption,
  displayCount,
  excludeMastered,
  masteryThreshold,
  onVerbTypeChange,
  onSortChange,
  onDisplayCountChange,
  onExcludeMasteredChange,
  onRefresh,
  showRefreshButton,
  displayedCount,
  totalCount,
}: FilterControlsProps) {
  return (
    <FilterBox>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="verb-type-filter-label">Verb Type</InputLabel>
        <Select
          labelId="verb-type-filter-label"
          id="verb-type-filter"
          value={verbTypeFilter}
          label="Verb Type"
          onChange={(e) => onVerbTypeChange(e.target.value as VerbTypeFilter)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="regular">Regular</MenuItem>
          <MenuItem value="irregular">Irregular</MenuItem>
          <MenuItem value="reflexive">Reflexive</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="sort-option-label">Sort By</InputLabel>
        <Select
          labelId="sort-option-label"
          id="sort-option"
          value={sortOption}
          label="Sort By"
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="alphabetical">Alphabetical</MenuItem>
          <MenuItem value="random">Random</MenuItem>
          <MenuItem value="most-errors">Most Errors</MenuItem>
          <MenuItem value="worst-performance">Worst Performance</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="display-count-label">Display</InputLabel>
        <Select
          labelId="display-count-label"
          id="display-count"
          value={displayCount}
          label="Display"
          onChange={(e) => onDisplayCountChange(e.target.value as DisplayCount)}
        >
          <MenuItem value={10}>10 verbs</MenuItem>
          <MenuItem value={20}>20 verbs</MenuItem>
          <MenuItem value={30}>30 verbs</MenuItem>
          <MenuItem value="all">All verbs</MenuItem>
        </Select>
      </FormControl>

      {showRefreshButton && (
        <Tooltip title="Refresh list">
          <IconButton
            onClick={onRefresh}
            color="primary"
            size="small"
            sx={{ ml: 1 }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip
        title={`Exclude words with (correct - errors) >= ${masteryThreshold}`}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={excludeMastered}
              onChange={(e) => onExcludeMasteredChange(e.target.checked)}
              size="small"
            />
          }
          label="Exclude mastered"
          sx={{ ml: 1 }}
        />
      </Tooltip>

      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
        Showing {displayedCount} of {totalCount} verbs
      </Typography>
    </FilterBox>
  )
}
