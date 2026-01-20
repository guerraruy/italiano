import React, { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import {
  PracticeFiltersProvider,
  PracticeFiltersContextType,
} from '@/app/contexts'

import FilterControls, { VerbTypeFilter } from './FilterControls'

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
  const defaultProps = {
    verbTypeFilter: 'all' as VerbTypeFilter,
    onVerbTypeChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the verb type select with correct label', () => {
      renderWithContext(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Verb Type')).toBeInTheDocument()
    })

    it('renders the sort option select with correct label', () => {
      renderWithContext(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
    })

    it('renders the display count select with correct label', () => {
      renderWithContext(<FilterControls {...defaultProps} />)

      expect(screen.getByLabelText('Display')).toBeInTheDocument()
    })

    it('renders the displaying count text correctly', () => {
      renderWithContext(<FilterControls {...defaultProps} />)

      expect(screen.getByText('Showing 10 of 50 verbs')).toBeInTheDocument()
    })

    it('renders refresh button when shouldShowRefreshButton is true', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        shouldShowRefreshButton: true,
      })

      expect(
        screen.getByRole('button', { name: /refresh list/i })
      ).toBeInTheDocument()
    })

    it('does not render refresh button when shouldShowRefreshButton is false', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        shouldShowRefreshButton: false,
      })

      expect(
        screen.queryByRole('button', { name: /refresh list/i })
      ).not.toBeInTheDocument()
    })

    it('displays correct count when all verbs are shown', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        displayedCount: 50,
        totalCount: 50,
      })

      expect(screen.getByText('Showing 50 of 50 verbs')).toBeInTheDocument()
    })

    it('displays correct count when filtered', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        displayedCount: 5,
        totalCount: 100,
      })

      expect(screen.getByText('Showing 5 of 100 verbs')).toBeInTheDocument()
    })
  })

  describe('Verb Type Select', () => {
    it('displays the current verb type filter value', () => {
      renderWithContext(
        <FilterControls {...defaultProps} verbTypeFilter="regular" />
      )

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('Regular')
    })

    it('displays "All" when verbTypeFilter is all', () => {
      renderWithContext(
        <FilterControls {...defaultProps} verbTypeFilter="all" />
      )

      expect(
        screen.getByRole('combobox', { name: 'Verb Type' })
      ).toHaveTextContent('All')
    })

    it('calls onVerbTypeChange when a new verb type is selected', async () => {
      const user = userEvent.setup()
      renderWithContext(<FilterControls {...defaultProps} />)

      const verbTypeSelect = screen.getByRole('combobox', { name: 'Verb Type' })
      await user.click(verbTypeSelect)

      const regularOption = screen.getByRole('option', { name: 'Regular' })
      await user.click(regularOption)

      expect(defaultProps.onVerbTypeChange).toHaveBeenCalledWith('regular')
    })
  })

  describe('Sort Option Select', () => {
    it('displays the current sort option value', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        sortOption: 'alphabetical',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('Alphabetical')
    })

    it('displays "None" when sortOption is none', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        sortOption: 'none',
      })

      expect(
        screen.getByRole('combobox', { name: 'Sort By' })
      ).toHaveTextContent('None')
    })

    it('calls onSortChange when a new sort option is selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(
        <FilterControls {...defaultProps} />
      )

      const sortSelect = screen.getByRole('combobox', { name: 'Sort By' })
      await user.click(sortSelect)

      const alphabeticalOption = screen.getByRole('option', {
        name: 'Alphabetical',
      })
      await user.click(alphabeticalOption)

      expect(mockContext.onSortChange).toHaveBeenCalledWith('alphabetical')
    })
  })

  describe('Display Count Select', () => {
    it('displays the current display count value', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        displayCount: 20,
      })

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('20 verbs')
    })

    it('displays "All verbs" when displayCount is all', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        displayCount: 'all',
      })

      expect(
        screen.getByRole('combobox', { name: 'Display' })
      ).toHaveTextContent('All verbs')
    })

    it('calls onDisplayCountChange when a new display count is selected', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(
        <FilterControls {...defaultProps} />
      )

      const displaySelect = screen.getByRole('combobox', { name: 'Display' })
      await user.click(displaySelect)

      const option20 = screen.getByRole('option', { name: '20 verbs' })
      await user.click(option20)

      expect(mockContext.onDisplayCountChange).toHaveBeenCalledWith(20)
    })
  })

  describe('Refresh Button', () => {
    it('calls onRefresh when refresh button is clicked', async () => {
      const user = userEvent.setup()
      const { mockContext } = renderWithContext(
        <FilterControls {...defaultProps} />,
        { shouldShowRefreshButton: true }
      )

      const refreshButton = screen.getByRole('button', {
        name: /refresh list/i,
      })
      await user.click(refreshButton)

      expect(mockContext.onRefresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Select Options Availability', () => {
    it('shows all verb type options when verb type select is opened', async () => {
      const user = userEvent.setup()
      renderWithContext(<FilterControls {...defaultProps} />)

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
      renderWithContext(<FilterControls {...defaultProps} />)

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
  })

  describe('Edge Cases', () => {
    it('handles zero verbs correctly', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        displayedCount: 0,
        totalCount: 0,
      })

      expect(screen.getByText('Showing 0 of 0 verbs')).toBeInTheDocument()
    })

    it('handles large verb counts correctly', () => {
      renderWithContext(<FilterControls {...defaultProps} />, {
        displayedCount: 500,
        totalCount: 1000,
      })

      expect(screen.getByText('Showing 500 of 1000 verbs')).toBeInTheDocument()
    })
  })
})
