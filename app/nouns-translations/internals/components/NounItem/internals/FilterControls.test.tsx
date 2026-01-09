import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import FilterControls, { SortOption, DisplayCount } from './FilterControls'

describe('FilterControls', () => {
  const defaultProps = {
    sortOption: 'none' as SortOption,
    displayCount: 10 as DisplayCount,
    onSortChange: jest.fn(),
    onDisplayCountChange: jest.fn(),
    onRefresh: jest.fn(),
    showRefreshButton: true,
    displayedCount: 10,
    totalCount: 50,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
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

      expect(screen.getByText('Showing 10 of 50 nouns')).toBeInTheDocument()
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

    it('displays correct count when all nouns are shown', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={50} totalCount={50} />
      )

      expect(screen.getByText('Showing 50 of 50 nouns')).toBeInTheDocument()
    })

    it('displays correct count when filtered', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={5} totalCount={100} />
      )

      expect(screen.getByText('Showing 5 of 100 nouns')).toBeInTheDocument()
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
      ).toHaveTextContent('20 nouns')
    })

    it('displays "10 nouns" when displayCount is 10', () => {
      render(<FilterControls {...defaultProps} displayCount={10} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('10 nouns')
    })

    it('displays "30 nouns" when displayCount is 30', () => {
      render(<FilterControls {...defaultProps} displayCount={30} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('30 nouns')
    })

    it('displays "All nouns" when displayCount is all', () => {
      render(<FilterControls {...defaultProps} displayCount="all" />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('All nouns')
    })

    it('calls onDisplayCountChange when a new display count is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option20 = screen.getByRole('option', { name: '20 nouns' })
      await user.click(option20)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(20)
    })

    it('calls onDisplayCountChange with 30 when 30 nouns is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option30 = screen.getByRole('option', { name: '30 nouns' })
      await user.click(option30)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(30)
    })

    it('calls onDisplayCountChange with "all" when All nouns is selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const optionAll = screen.getByRole('option', { name: 'All nouns' })
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
        screen.getByRole('option', { name: '10 nouns' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: '20 nouns' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: '30 nouns' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'All nouns' })
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero nouns correctly', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={0} totalCount={0} />
      )

      expect(screen.getByText('Showing 0 of 0 nouns')).toBeInTheDocument()
    })

    it('handles large noun counts correctly', () => {
      render(
        <FilterControls
          {...defaultProps}
          displayedCount={500}
          totalCount={1000}
        />
      )

      expect(screen.getByText('Showing 500 of 1000 nouns')).toBeInTheDocument()
    })
  })
})
