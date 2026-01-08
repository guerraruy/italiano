'use client'
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material'

interface TenseCategoryProps {
  category: string
  tenses: string[]
  enabledTenses: string[]
  onTenseToggle: (tenseKey: string) => void
  onCategoryToggle: (category: string) => void
}

export default function TenseCategory({
  category,
  tenses,
  enabledTenses,
  onTenseToggle,
  onCategoryToggle,
}: TenseCategoryProps) {
  const categoryKeys = tenses.map((tense) => `${category}.${tense}`)
  const allSelected = categoryKeys.every((key) => enabledTenses.includes(key))
  const someSelected = categoryKeys.some((key) => enabledTenses.includes(key))

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={() => onCategoryToggle(category)}
              size="small"
              sx={{ py: 0.5 }}
            />
          }
          label={
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ fontSize: '14px' }}
            >
              {category}
            </Typography>
          }
          sx={{ mb: 0, my: 0.25 }}
        />
      </Box>
      <FormGroup sx={{ ml: 4 }}>
        {tenses.map((tense) => {
          const tenseKey = `${category}.${tense}`
          return (
            <FormControlLabel
              key={tenseKey}
              control={
                <Checkbox
                  checked={enabledTenses.includes(tenseKey)}
                  onChange={() => onTenseToggle(tenseKey)}
                  size="small"
                  sx={{ py: 0.5 }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '14px' }}>
                  {tense}
                </Typography>
              }
              sx={{ mb: 0, mt: 0, my: 0.25 }}
            />
          )
        })}
      </FormGroup>
    </Box>
  )
}
