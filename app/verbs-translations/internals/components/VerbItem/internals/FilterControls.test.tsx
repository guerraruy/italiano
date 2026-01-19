import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import FilterControls, {
  SortOption,
  DisplayCount,
  VerbTypeFilter,
} from './FilterControls'

describe('FilterControls', () => {
  const defaultProps = {
    verbTypeFilter: 'all' as VerbTypeFilter,
    sortOption: 'none' as SortOption,
    displayCount: 10 as DisplayCount,
    excludeMastered: true,
    masteryThreshold: 10,
    onVerbTypeChange: jest.fn(),
    onSortChange: jest.fn(),
    onDisplayCountChange: jest.fn(),
    onExcludeMasteredChange: jest.fn(),
    onRefresh: jest.fn(),
    showRefreshButton: true,
    displayedCount: 10,
    totalCount: 50,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the verb type select with correct label', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Verb Type')).toBeInTheDocument()
    })

    it('renders the sort option select with correct label', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
    })

    it('renders the display count select with correct label', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Display')).toBeInTheDocument()
    })

    it('renders the displaying count text correctly', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByText('Showing 10 of 50 verbs')).toBeInTheDocument()
    })

    it('renders refresh button when showRefreshButton is true', () => {
      render(<FilterControls {...defaultProps} showRefreshButton={true} />)

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
    })

    it('does not render refresh button when showRefreshButton is false', () => {
      render(<FilterControls {...defaultProps} showRefreshButton={false} />)

      expect(
        screen.queryByRole('button', { name: /refresh list/i })
      ).not.toBeInTheDocument()
    })

    it('displays correct count when all verbs are shown', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={50} totalCount={50} />
      )

      expect(screen.getByText('Showing 50 of 50 verbs')).toBeInTheDocument()
    })

    it('displays correct count when filtered', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={5} totalCount={100} />
      )

      expect(screen.getByText('Showing 5 of 100 verbs')).toBeInTheDocument()
    })
  })

  describe('Verb Type Select', () => {
    it('displays the current verb type filter value', () => {
      render(<FilterControls {...defaultProps} verbTypeFilter="regular" />)

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('Regular')
    })

    it('displays "All" when verbTypeFilter is all', () => {
      render(<FilterControls {...defaultProps} verbTypeFilter="all" />)

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('All')
    })

    it('displays "Regular" when verbTypeFilter is regular', () => {
      render(<FilterControls {...defaultProps} verbTypeFilter="regular" />)

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('Regular')
    })

    it('displays "Irregular" when verbTypeFilter is irregular', () => {
      render(<FilterControls {...defaultProps} verbTypeFilter="irregular" />)

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('Irregular')
    })

    it('displays "Reflexive" when verbTypeFilter is reflexive', () => {
      render(<FilterControls {...defaultProps} verbTypeFilter="reflexive" />)

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('Reflexive')
    })

    it('calls onVerbTypeChange when a new verb type is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)

      const regularOption = screen.getByRole('option', { name: 'Regular' })
      await user.click(regularOption)

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledWith('regular')
    })

    it('calls onVerbTypeChange with "irregular" when Irregular option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)

      const irregularOption = screen.getByRole('option', { name: 'Irregular' })
      await user.click(irregularOption)

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledWith('irregular')
    })

    it('calls onVerbTypeChange with "reflexive" when Reflexive option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)

      const reflexiveOption = screen.getByRole('option', { name: 'Reflexive' })
      await user.click(reflexiveOption)

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledWith('reflexive')
    })

    it('calls onVerbTypeChange with "all" when All option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} verbTypeFilter="regular" />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)

      const allOption = screen.getByRole('option', { name: 'All' })
      await user.click(allOption)

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledWith('all')
    })
  })

  describe('Sort Option Select', () => {
    it('displays the current sort option value', () => {
      render(<FilterControls {...defaultProps} sortOption="alphabetical" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Alphabetical')
    })

    it('displays "None" when sortOption is none', () => {
      render(<FilterControls {...defaultProps} sortOption="none" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('None')
    })

    it('displays "Random" when sortOption is random', () => {
      render(<FilterControls {...defaultProps} sortOption="random" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Random')
    })

    it('displays "Most Errors" when sortOption is most-errors', () => {
      render(<FilterControls {...defaultProps} sortOption="most-errors" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Most Errors')
    })

    it('displays "Worst Performance" when sortOption is worst-performance', () => {
      render(
        <FilterControls {...defaultProps} sortOption="worst-performance" />
      )

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Worst Performance')
    })

    it('calls onSortChange when a new sort option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const alphabeticalOption = screen.getByRole('option', {
        name: 'Alphabetical',
      })
      await user.click(alphabeticalOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith('alphabetical')
    })

    it('calls onSortChange with "random" when Random option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const randomOption = screen.getByRole('option', { name: 'Random' })
      await user.click(randomOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith('random')
    })

    it('calls onSortChange with "most-errors" when Most Errors option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const mostErrorsOption = screen.getByRole('option', {
        name: 'Most Errors',
      })
      await user.click(mostErrorsOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith('most-errors')
    })

    it('calls onSortChange with "worst-performance" when Worst Performance option is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const worstPerformanceOption = screen.getByRole('option', {
        name: 'Worst Performance',
      })
      await user.click(worstPerformanceOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledWith(
        'worst-performance'
      )
    })
  })

  describe('Display Count Select', () => {
    it('displays the current display count value', () => {
      render(<FilterControls {...defaultProps} displayCount={20} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('20 verbs')
    })

    it('displays "10 verbs" when displayCount is 10', () => {
      render(<FilterControls {...defaultProps} displayCount={10} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('10 verbs')
    })

    it('displays "30 verbs" when displayCount is 30', () => {
      render(<FilterControls {...defaultProps} displayCount={30} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('30 verbs')
    })

    it('displays "All verbs" when displayCount is all', () => {
      render(<FilterControls {...defaultProps} displayCount="all" />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('All verbs')
    })

    it('calls onDisplayCountChange when a new display count is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option20 = screen.getByRole('option', { name: '20 verbs' })
      await user.click(option20)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(20)
    })

    it('calls onDisplayCountChange with 30 when 30 verbs is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option30 = screen.getByRole('option', { name: '30 verbs' })
      await user.click(option30)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(30)
    })

    it('calls onDisplayCountChange with "all" when All verbs is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const optionAll = screen.getByRole('option', { name: 'All verbs' })
      await user.click(optionAll)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith('all')
    })
  })

  describe('Refresh Button', () => {
    it('calls onRefresh when refresh button is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} showRefreshButton={true} />)

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      await user.click(refreshButton)

      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1)
    })

    it('has the correct tooltip', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} showRefreshButton={true} />)

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      await user.hover(refreshButton)

      // The tooltip "Refresh list" is present via the aria-label
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh list')
    })
  })

  describe('Select Options Availability', () => {
    it('shows all verb type options when verb type select is opened', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)

      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Regular' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Irregular' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Reflexive' })
      ).toBeInTheDocument()
    })

    it('shows all sort options when sort select is opened', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      expect(screen.getByRole('option', { name: 'None' })).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Alphabetical' })
      ).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Random' })).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Most Errors' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Worst Performance' })
      ).toBeInTheDocument()
    })

    it('shows all display count options when display select is opened', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      expect(
        screen.getByRole('option', { name: '10 verbs' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: '20 verbs' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: '30 verbs' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'All verbs' })
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero verbs correctly', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={0} totalCount={0} />
      )

      expect(screen.getByText('Showing 0 of 0 verbs')).toBeInTheDocument()
    })

    it('handles large verb counts correctly', () => {
      render(
        <FilterControls
          {...defaultProps}
          displayedCount={500}
          totalCount={1000}
        />
      )

      expect(screen.getByText('Showing 500 of 1000 verbs')).toBeInTheDocument()
    })

    it('handles single verb correctly', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={1} totalCount={1} />
      )

      expect(screen.getByText('Showing 1 of 1 verbs')).toBeInTheDocument()
    })
  })

  describe('Combined Filter Interactions', () => {
    it('allows changing multiple filters in sequence', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      // Change verb type
      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)
      await user.click(screen.getByRole('option', { name: 'Regular' }))

      // Change sort option
      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)
      await user.click(screen.getByRole('option', { name: 'Alphabetical' }))

      // Change display count
      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)
      await user.click(screen.getByRole('option', { name: '20 verbs' }))

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledWith('regular')
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('alphabetical')
      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(20)
    })

    it('does not call other handlers when changing one filter', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)
      await user.click(screen.getByRole('option', { name: 'Irregular' }))

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSortChange).not.toHaveBeenCalled()
      expect(defaultProps.onDisplayCountChange).not.toHaveBeenCalled()
      expect(defaultProps.onRefresh).not.toHaveBeenCalled()
    })
  })
})
