import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import FilterControls, {
  type DisplayCount,
  type SortOption,
} from './FilterControls'

describe('FilterControls', () => {
  const defaultProps = {
    sortOption: 'none' as SortOption,
    displayCount: 10 as DisplayCount,
    excludeMastered: true,
    masteryThreshold: 10,
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
    it('should render the sort dropdown', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
    })

    it('should render the display count dropdown', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Display')).toBeInTheDocument()
    })

    it('should render the count text', () => {
      render(<FilterControls {...defaultProps} />)

      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should render refresh button when showRefreshButton is true', () => {
      render(<FilterControls {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
    })

    it('should not render refresh button when showRefreshButton is false', () => {
      render(<FilterControls {...defaultProps} showRefreshButton={false} />)

      expect(
        screen.queryByRole('button', { name: /refresh list/i })
      ).not.toBeInTheDocument()
    })

    it('should display correct count when all adjectives are shown', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={50} totalCount={50} />
      )

      expect(
        screen.getByText('Showing 50 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should display correct count when filtered', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={5} totalCount={100} />
      )

      expect(
        screen.getByText('Showing 5 of 100 adjectives')
      ).toBeInTheDocument()
    })
  })

  describe('Sort Dropdown', () => {
    it('should display the current sort option as "None"', () => {
      render(<FilterControls {...defaultProps} sortOption="none" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('None')
    })

    it('should display "Alphabetical" when sortOption is alphabetical', () => {
      render(<FilterControls {...defaultProps} sortOption="alphabetical" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Alphabetical')
    })

    it('should display "Random" when sortOption is random', () => {
      render(<FilterControls {...defaultProps} sortOption="random" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Random')
    })

    it('should display "Most Errors" when sortOption is most-errors', () => {
      render(<FilterControls {...defaultProps} sortOption="most-errors" />)

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Most Errors')
    })

    it('should display "Worst Performance" when sortOption is worst-performance', () => {
      render(
        <FilterControls {...defaultProps} sortOption="worst-performance" />
      )

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Worst Performance')
    })

    it('should have all sort options available when opened', async () => {
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

    it('should call onSortChange with "alphabetical" when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const alphabeticalOption = screen.getByRole('option', {
        name: 'Alphabetical',
      })
      await user.click(alphabeticalOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('alphabetical')
    })

    it('should call onSortChange with "random" when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const randomOption = screen.getByRole('option', { name: 'Random' })
      await user.click(randomOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('random')
    })

    it('should call onSortChange with "most-errors" when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const mostErrorsOption = screen.getByRole('option', {
        name: 'Most Errors',
      })
      await user.click(mostErrorsOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('most-errors')
    })

    it('should call onSortChange with "worst-performance" when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const worstPerformanceOption = screen.getByRole('option', {
        name: 'Worst Performance',
      })
      await user.click(worstPerformanceOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSortChange).toHaveBeenCalledWith(
        'worst-performance'
      )
    })

    it('should call onSortChange with "none" when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} sortOption="alphabetical" />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const noneOption = screen.getByRole('option', { name: 'None' })
      await user.click(noneOption)

      expect(defaultProps.onSortChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('none')
    })
  })

  describe('Display Count Dropdown', () => {
    it('should display "10 adjectives" when displayCount is 10', () => {
      render(<FilterControls {...defaultProps} displayCount={10} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('10 adjectives')
    })

    it('should display "20 adjectives" when displayCount is 20', () => {
      render(<FilterControls {...defaultProps} displayCount={20} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('20 adjectives')
    })

    it('should display "30 adjectives" when displayCount is 30', () => {
      render(<FilterControls {...defaultProps} displayCount={30} />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('30 adjectives')
    })

    it('should display "All adjectives" when displayCount is all', () => {
      render(<FilterControls {...defaultProps} displayCount="all" />)

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('All adjectives')
    })

    it('should have all display count options available when opened', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      expect(
        screen.getByRole('option', { name: '10 adjectives' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: '20 adjectives' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: '30 adjectives' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'All adjectives' })
      ).toBeInTheDocument()
    })

    it('should call onDisplayCountChange with 10 when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} displayCount={20} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option10 = screen.getByRole('option', { name: '10 adjectives' })
      await user.click(option10)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(10)
    })

    it('should call onDisplayCountChange with 20 when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option20 = screen.getByRole('option', { name: '20 adjectives' })
      await user.click(option20)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(20)
    })

    it('should call onDisplayCountChange with 30 when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option30 = screen.getByRole('option', { name: '30 adjectives' })
      await user.click(option30)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith(30)
    })

    it('should call onDisplayCountChange with "all" when selected', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const optionAll = screen.getByRole('option', { name: 'All adjectives' })
      await user.click(optionAll)

      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onDisplayCountChange).toHaveBeenCalledWith('all')
    })
  })

  describe('Refresh Button', () => {
    it('should call onRefresh when clicked', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      await user.click(refreshButton)

      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1)
    })

    it('should render refresh button with primary color', () => {
      render(<FilterControls {...defaultProps} />)

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button).toHaveClass('MuiIconButton-colorPrimary')
    })

    it('should render refresh button with small size', () => {
      render(<FilterControls {...defaultProps} />)

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button).toHaveClass('MuiIconButton-sizeSmall')
    })

    it('should render refresh icon', () => {
      render(<FilterControls {...defaultProps} />)

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should handle multiple clicks on refresh button', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const button = screen.getByRole('button', { name: /refresh list/i })
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(3)
    })

    it('should have the correct aria-label', () => {
      render(<FilterControls {...defaultProps} />)

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh list')
    })
  })

  describe('Count Display', () => {
    it('should display correct counts', () => {
      render(<FilterControls {...defaultProps} />)

      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should update counts when props change', () => {
      const { rerender } = render(<FilterControls {...defaultProps} />)

      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()

      rerender(
        <FilterControls
          {...defaultProps}
          displayedCount={25}
          totalCount={100}
        />
      )

      expect(
        screen.getByText('Showing 25 of 100 adjectives')
      ).toBeInTheDocument()
    })

    it('should display zero counts correctly', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={0} totalCount={0} />
      )

      expect(screen.getByText('Showing 0 of 0 adjectives')).toBeInTheDocument()
    })

    it('should display when all items are shown', () => {
      render(
        <FilterControls
          {...defaultProps}
          displayedCount={50}
          totalCount={50}
          displayCount="all"
        />
      )

      expect(
        screen.getByText('Showing 50 of 50 adjectives')
      ).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render controls in a flex container', () => {
      const { container } = render(<FilterControls {...defaultProps} />)

      const filterBox = container.querySelector('.MuiBox-root')
      expect(filterBox).toBeInTheDocument()
    })

    it('should render controls with proper spacing', () => {
      render(<FilterControls {...defaultProps} />)

      const sortControl = screen
        .getByLabelText('Sort By')
        .closest('.MuiFormControl-root')
      const displayControl = screen
        .getByLabelText('Display')
        .closest('.MuiFormControl-root')

      expect(sortControl).toBeInTheDocument()
      expect(displayControl).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for sort dropdown', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /sort by/i })
      ).toBeInTheDocument()
    })

    it('should have proper labels for display dropdown', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Display')).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /display/i })
      ).toBeInTheDocument()
    })

    it('should have proper label for refresh button', () => {
      render(<FilterControls {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
    })

    it('should have accessible button role for refresh', () => {
      render(<FilterControls {...defaultProps} />)

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have proper ARIA labels for select elements', () => {
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByLabelText('Sort By')
      const displaySelect = screen.getByLabelText('Display')

      expect(sortSelect).toHaveAttribute('id', 'sort-option')
      expect(displaySelect).toHaveAttribute('id', 'display-count')
    })
  })

  describe('Edge Cases', () => {
    it('should handle large count numbers', () => {
      render(
        <FilterControls
          {...defaultProps}
          displayedCount={9999}
          totalCount={10000}
        />
      )

      expect(
        screen.getByText('Showing 9999 of 10000 adjectives')
      ).toBeInTheDocument()
    })

    it('should handle single adjective count', () => {
      render(
        <FilterControls {...defaultProps} displayedCount={1} totalCount={1} />
      )

      expect(screen.getByText('Showing 1 of 1 adjectives')).toBeInTheDocument()
    })

    it('should not call callbacks when dropdown is opened without selection', async () => {
      const user = userEvent.setup()
      render(<FilterControls {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      expect(defaultProps.onSortChange).not.toHaveBeenCalled()
    })
  })

  describe('Component Integration', () => {
    it('should render all components together correctly', () => {
      render(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
      expect(screen.getByLabelText('Display')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should work correctly without refresh button', () => {
      render(<FilterControls {...defaultProps} showRefreshButton={false} />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
      expect(screen.getByLabelText('Display')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /refresh list/i })
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()
    })
  })

  describe('Props Updates', () => {
    it('should update when sortOption prop changes', () => {
      const { rerender } = render(<FilterControls {...defaultProps} />)

      let select = screen.getByRole('combobox', { name: 'Sort By' })
      expect(select).toHaveTextContent('None')

      rerender(<FilterControls {...defaultProps} sortOption="alphabetical" />)

      select = screen.getByRole('combobox', { name: 'Sort By' })
      expect(select).toHaveTextContent('Alphabetical')
    })

    it('should update when displayCount prop changes', () => {
      const { rerender } = render(<FilterControls {...defaultProps} />)

      let select = screen.getByRole('combobox', { name: 'Display' })
      expect(select).toHaveTextContent('10 adjectives')

      rerender(<FilterControls {...defaultProps} displayCount={30} />)

      select = screen.getByRole('combobox', { name: 'Display' })
      expect(select).toHaveTextContent('30 adjectives')
    })

    it('should toggle refresh button when showRefreshButton changes', () => {
      const { rerender } = render(<FilterControls {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()

      rerender(<FilterControls {...defaultProps} showRefreshButton={false} />)

      expect(
        screen.queryByRole('button', { name: /refresh list/i })
      ).not.toBeInTheDocument()
    })
  })
})
