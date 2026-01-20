import React, { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import {
  PracticeFiltersProvider,
  PracticeFiltersContextType,
} from '@/app/contexts'

import FilterControls from './FilterControls'

// Mock context with customizable values
const createMockFiltersContext = (
  overrides: Partial<PracticeFiltersContextType> = {}
): PracticeFiltersContextType => ({
  sortOption: 'none',
  displayCount: 10,
  excludeMastered: true,
  masteryThreshold: 10,
  masteredCount: 0,
  shouldShowRefreshButton: true,
  displayedCount: 10,
  totalCount: 50,
  onSortChange: jest.fn(),
  onDisplayCountChange: jest.fn(),
  onExcludeMasteredChange: jest.fn(),
  onRefresh: jest.fn(),
  ...overrides,
})

const renderWithContext = (
  ui: React.ReactElement,
  contextOverrides: Partial<PracticeFiltersContextType> = {}
) => {
  const mockContext = createMockFiltersContext(contextOverrides)
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <PracticeFiltersProvider value={mockContext}>
      {children}
    </PracticeFiltersProvider>
  )
  return { ...render(ui, { wrapper: Wrapper }), mockContext }
}

describe('FilterControls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the sort dropdown', () => {
      renderWithContext(<FilterControls />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
    })

    it('should render the display count dropdown', () => {
      renderWithContext(<FilterControls />)

      expect(screen.getByLabelText('Display')).toBeInTheDocument()
    })

    it('should render the count text', () => {
      renderWithContext(<FilterControls />)

      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should render refresh button when shouldShowRefreshButton is true', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
    })

    it('should not render refresh button when shouldShowRefreshButton is false', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: false,
      })

      expect(
        screen.queryByRole('button', { name: /refresh list/i })
      ).not.toBeInTheDocument()
    })

    it('should display correct count when all adjectives are shown', () => {
      renderWithContext(<FilterControls />, {
        displayedCount: 50,
        totalCount: 50,
      })

      expect(
        screen.getByText('Showing 50 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should display correct count when filtered', () => {
      renderWithContext(<FilterControls />, {
        displayedCount: 5,
        totalCount: 100,
      })

      expect(
        screen.getByText('Showing 5 of 100 adjectives')
      ).toBeInTheDocument()
    })
  })

  describe('Sort Dropdown', () => {
    it('should display the current sort option as "None"', () => {
      renderWithContext(<FilterControls />, {
        sortOption: 'none',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('None')
    })

    it('should display "Alphabetical" when sortOption is alphabetical', () => {
      renderWithContext(<FilterControls />, {
        sortOption: 'alphabetical',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Alphabetical')
    })

    it('should display "Random" when sortOption is random', () => {
      renderWithContext(<FilterControls />, {
        sortOption: 'random',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Random')
    })

    it('should display "Most Errors" when sortOption is most-errors', () => {
      renderWithContext(<FilterControls />, {
        sortOption: 'most-errors',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Most Errors')
    })

    it('should display "Worst Performance" when sortOption is worst-performance', () => {
      renderWithContext(<FilterControls />, {
        sortOption: 'worst-performance',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Worst Performance')
    })

    it('should have all sort options available when opened', async () => {
      const user = userEvent.setup()
      renderWithContext(<FilterControls />)

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
      const { mockContext } = renderWithContext(<FilterControls />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const alphabeticalOption = screen.getByRole('option', {
        name: 'Alphabetical',
      })
      await user.click(alphabeticalOption)

      expect(mockContext.onSortChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onSortChange).toHaveBeenCalledWith('alphabetical')
    })

    it('should call onSortChange with "random" when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const randomOption = screen.getByRole('option', { name: 'Random' })
      await user.click(randomOption)

      expect(mockContext.onSortChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onSortChange).toHaveBeenCalledWith('random')
    })

    it('should call onSortChange with "most-errors" when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const mostErrorsOption = screen.getByRole('option', {
        name: 'Most Errors',
      })
      await user.click(mostErrorsOption)

      expect(mockContext.onSortChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onSortChange).toHaveBeenCalledWith('most-errors')
    })

    it('should call onSortChange with "worst-performance" when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const worstPerformanceOption = screen.getByRole('option', {
        name: 'Worst Performance',
      })
      await user.click(worstPerformanceOption)

      expect(mockContext.onSortChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onSortChange).toHaveBeenCalledWith('worst-performance')
    })

    it('should call onSortChange with "none" when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />, {
        sortOption: 'alphabetical',
      })

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const noneOption = screen.getByRole('option', { name: 'None' })
      await user.click(noneOption)

      expect(mockContext.onSortChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onSortChange).toHaveBeenCalledWith('none')
    })
  })

  describe('Display Count Dropdown', () => {
    it('should display "10 adjectives" when displayCount is 10', () => {
      renderWithContext(<FilterControls />, {
        displayCount: 10,
      })

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('10 adjectives')
    })

    it('should display "20 adjectives" when displayCount is 20', () => {
      renderWithContext(<FilterControls />, {
        displayCount: 20,
      })

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('20 adjectives')
    })

    it('should display "30 adjectives" when displayCount is 30', () => {
      renderWithContext(<FilterControls />, {
        displayCount: 30,
      })

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('30 adjectives')
    })

    it('should display "All adjectives" when displayCount is all', () => {
      renderWithContext(<FilterControls />, {
        displayCount: 'all',
      })

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('All adjectives')
    })

    it('should have all display count options available when opened', async () => {
      const user = userEvent.setup()
      renderWithContext(<FilterControls />)

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
      const { mockContext } = renderWithContext(<FilterControls />, {
        displayCount: 20,
      })

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option10 = screen.getByRole('option', { name: '10 adjectives' })
      await user.click(option10)

      expect(mockContext.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onDisplayCountChange).toHaveBeenCalledWith(10)
    })

    it('should call onDisplayCountChange with 20 when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option20 = screen.getByRole('option', { name: '20 adjectives' })
      await user.click(option20)

      expect(mockContext.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onDisplayCountChange).toHaveBeenCalledWith(20)
    })

    it('should call onDisplayCountChange with 30 when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option30 = screen.getByRole('option', { name: '30 adjectives' })
      await user.click(option30)

      expect(mockContext.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onDisplayCountChange).toHaveBeenCalledWith(30)
    })

    it('should call onDisplayCountChange with "all" when selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const optionAll = screen.getByRole('option', { name: 'All adjectives' })
      await user.click(optionAll)

      expect(mockContext.onDisplayCountChange).toHaveBeenCalledTimes(1)
      expect(mockContext.onDisplayCountChange).toHaveBeenCalledWith('all')
    })
  })

  describe('Refresh Button', () => {
    it('should call onRefresh when clicked', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      await user.click(refreshButton)

      expect(mockContext.onRefresh).toHaveBeenCalledTimes(1)
    })

    it('should render refresh button with primary color', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button).toHaveClass('MuiIconButton-colorPrimary')
    })

    it('should render refresh button with small size', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button).toHaveClass('MuiIconButton-sizeSmall')
    })

    it('should render refresh icon', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should handle multiple clicks on refresh button', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const button = screen.getByRole('button', { name: /refresh list/i })
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockContext.onRefresh).toHaveBeenCalledTimes(3)
    })

    it('should have the correct aria-label', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh list')
    })
  })

  describe('Count Display', () => {
    it('should display correct counts', () => {
      renderWithContext(<FilterControls />)

      expect(
        screen.getByText('Showing 10 of 50 adjectives')
      ).toBeInTheDocument()
    })

    it('should display zero counts correctly', () => {
      renderWithContext(<FilterControls />, {
        displayedCount: 0,
        totalCount: 0,
      })

      expect(screen.getByText('Showing 0 of 0 adjectives')).toBeInTheDocument()
    })

    it('should display when all items are shown', () => {
      renderWithContext(<FilterControls />, {
        displayedCount: 50,
        totalCount: 50,
        displayCount: 'all',
      })

      expect(
        screen.getByText('Showing 50 of 50 adjectives')
      ).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render controls in a flex container', () => {
      const { container } = renderWithContext(<FilterControls />)

      const filterBox = container.querySelector('.MuiBox-root')
      expect(filterBox).toBeInTheDocument()
    })

    it('should render controls with proper spacing', () => {
      renderWithContext(<FilterControls />)

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
      renderWithContext(<FilterControls />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /sort by/i })
      ).toBeInTheDocument()
    })

    it('should have proper labels for display dropdown', () => {
      renderWithContext(<FilterControls />)

      expect(screen.getByLabelText('Display')).toBeInTheDocument()
      expect(
        screen.getByRole('combobox', { name: /display/i })
      ).toBeInTheDocument()
    })

    it('should have proper label for refresh button', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
    })

    it('should have accessible button role for refresh', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

      const button = screen.getByRole('button', { name: /refresh list/i })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have proper ARIA labels for select elements', () => {
      renderWithContext(<FilterControls />)

      const sortSelect = screen.getByLabelText('Sort By')
      const displaySelect = screen.getByLabelText('Display')

      expect(sortSelect).toHaveAttribute('id', 'sort-option')
      expect(displaySelect).toHaveAttribute('id', 'display-count')
    })
  })

  describe('Edge Cases', () => {
    it('should handle large count numbers', () => {
      renderWithContext(<FilterControls />, {
        displayedCount: 9999,
        totalCount: 10000,
      })

      expect(
        screen.getByText('Showing 9999 of 10000 adjectives')
      ).toBeInTheDocument()
    })

    it('should handle single adjective count', () => {
      renderWithContext(<FilterControls />, {
        displayedCount: 1,
        totalCount: 1,
      })

      expect(screen.getByText('Showing 1 of 1 adjectives')).toBeInTheDocument()
    })

    it('should not call callbacks when dropdown is opened without selection', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(<FilterControls />)

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      expect(mockContext.onSortChange).not.toHaveBeenCalled()
    })
  })

  describe('Component Integration', () => {
    it('should render all components together correctly', () => {
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: true,
      })

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
      renderWithContext(<FilterControls />, {
        shouldShowRefreshButton: false,
      })

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
})
