import React from 'react'

import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VerbFilters } from './VerbFilters'
import { VerbTypeFilter } from '../types'

describe('VerbFilters', () => {
  const mockVerbs = [
    {
      id: '1',
      italian: 'mangiare',
      translation: 'to eat',
      regular: true,
      reflexive: false,
    },
    {
      id: '2',
      italian: 'essere',
      translation: 'to be',
      regular: false,
      reflexive: false,
    },
    {
      id: '3',
      italian: 'alzarsi',
      translation: 'to get up',
      regular: true,
      reflexive: true,
    },
  ]

  const defaultProps = {
    verbTypeFilter: 'all' as VerbTypeFilter,
    selectedVerbId: '',
    filteredVerbs: mockVerbs,
    hasSelectedVerb: false,
    onVerbTypeFilterChange: jest.fn(),
    onVerbSelection: jest.fn(),
    onResetStatistics: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders verb type filter select', () => {
      render(<VerbFilters {...defaultProps} />)

      expect(screen.getByLabelText('Verb Type')).toBeInTheDocument()
    })

    it('renders verb selection select', () => {
      render(<VerbFilters {...defaultProps} />)

      expect(screen.getByLabelText('Select Verb')).toBeInTheDocument()
    })

    it('renders verb count text', () => {
      render(<VerbFilters {...defaultProps} />)

      expect(screen.getByText('3 verbs available')).toBeInTheDocument()
    })

    it('renders singular verb count text when only one verb', () => {
      render(<VerbFilters {...defaultProps} filteredVerbs={[mockVerbs[0]!]} />)

      expect(screen.getByText('1 verb available')).toBeInTheDocument()
    })

    it('renders zero verbs count text', () => {
      render(<VerbFilters {...defaultProps} filteredVerbs={[]} />)

      expect(screen.getByText('0 verbs available')).toBeInTheDocument()
    })

    it('does not render reset button when no verb is selected', () => {
      render(<VerbFilters {...defaultProps} />)

      expect(
        screen.queryByRole('button', { name: /reset/i })
      ).not.toBeInTheDocument()
    })

    it('renders reset button when a verb is selected', () => {
      render(<VerbFilters {...defaultProps} hasSelectedVerb={true} />)

      expect(
        screen.getByRole('button', { name: /reset all statistics/i })
      ).toBeInTheDocument()
    })
  })

  describe('Verb Type Filter', () => {
    it('displays all verb type options', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      // Open the select dropdown
      const verbTypeSelect = screen.getByLabelText('Verb Type')
      await user.click(verbTypeSelect)

      // Check all options are present
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

    it('calls onVerbTypeFilterChange when selecting regular', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      const verbTypeSelect = screen.getByLabelText('Verb Type')
      await user.click(verbTypeSelect)
      await user.click(screen.getByRole('option', { name: 'Regular' }))

      expect(defaultProps.onVerbTypeFilterChange).toHaveBeenCalledWith(
        'regular'
      )
    })

    it('calls onVerbTypeFilterChange when selecting irregular', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      const verbTypeSelect = screen.getByLabelText('Verb Type')
      await user.click(verbTypeSelect)
      await user.click(screen.getByRole('option', { name: 'Irregular' }))

      expect(defaultProps.onVerbTypeFilterChange).toHaveBeenCalledWith(
        'irregular'
      )
    })

    it('calls onVerbTypeFilterChange when selecting reflexive', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      const verbTypeSelect = screen.getByLabelText('Verb Type')
      await user.click(verbTypeSelect)
      await user.click(screen.getByRole('option', { name: 'Reflexive' }))

      expect(defaultProps.onVerbTypeFilterChange).toHaveBeenCalledWith(
        'reflexive'
      )
    })

    it('displays the correct selected filter value', () => {
      render(<VerbFilters {...defaultProps} verbTypeFilter="regular" />)

      expect(screen.getByLabelText('Verb Type')).toHaveTextContent('Regular')
    })
  })

  describe('Verb Selection', () => {
    it('displays "Choose a verb" placeholder option', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      expect(screen.getByText('Choose a verb')).toBeInTheDocument()
    })

    it('displays all filtered verbs in the dropdown', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      // Check all verbs are listed
      expect(
        screen.getByText('mangiare - to eat', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.getByText('essere - to be', { exact: false })
      ).toBeInTheDocument()
      expect(
        screen.getByText('alzarsi - to get up', { exact: false })
      ).toBeInTheDocument()
    })

    it('calls onVerbSelection when selecting a verb', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} />)

      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      const listbox = screen.getByRole('listbox')
      const options = within(listbox).getAllByRole('option')
      // First option is "Choose a verb", second is first verb
      await user.click(options[1]!)

      expect(defaultProps.onVerbSelection).toHaveBeenCalledWith('1')
    })

    it('displays the selected verb', () => {
      render(
        <VerbFilters
          {...defaultProps}
          selectedVerbId="1"
          hasSelectedVerb={true}
        />
      )

      expect(screen.getByLabelText('Select Verb')).toHaveTextContent(
        'mangiare - to eat'
      )
    })
  })

  describe('Verb Icons', () => {
    it('renders regular verb icon for regular verbs', async () => {
      const user = userEvent.setup()
      const regularVerbs = [
        {
          id: '1',
          italian: 'mangiare',
          translation: 'to eat',
          regular: true,
          reflexive: false,
        },
      ]
      render(<VerbFilters {...defaultProps} filteredVerbs={regularVerbs} />)

      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      // Check for Regular icon
      expect(screen.getByTestId('regular-icon')).toBeInTheDocument()
    })

    it('renders irregular verb icon for irregular verbs', async () => {
      const user = userEvent.setup()
      const irregularVerbs = [
        {
          id: '2',
          italian: 'essere',
          translation: 'to be',
          regular: false,
          reflexive: false,
        },
      ]
      render(<VerbFilters {...defaultProps} filteredVerbs={irregularVerbs} />)

      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      // Check for Irregular icon
      expect(screen.getByTestId('irregular-icon')).toBeInTheDocument()
    })

    it('renders reflexive verb icon for reflexive verbs', async () => {
      const user = userEvent.setup()
      const reflexiveVerbs = [
        {
          id: '3',
          italian: 'alzarsi',
          translation: 'to get up',
          regular: true,
          reflexive: true,
        },
      ]
      render(<VerbFilters {...defaultProps} filteredVerbs={reflexiveVerbs} />)

      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      // Check for Reflexive icon
      expect(screen.getByTestId('reflexive-icon')).toBeInTheDocument()
    })
  })

  describe('Reset Statistics Button', () => {
    it('does not show reset button when hasSelectedVerb is false', () => {
      render(<VerbFilters {...defaultProps} hasSelectedVerb={false} />)

      expect(
        screen.queryByRole('button', { name: /reset/i })
      ).not.toBeInTheDocument()
    })

    it('shows reset button when hasSelectedVerb is true', () => {
      render(<VerbFilters {...defaultProps} hasSelectedVerb={true} />)

      expect(
        screen.getByRole('button', { name: /reset all statistics/i })
      ).toBeInTheDocument()
    })

    it('calls onResetStatistics when clicking reset button', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} hasSelectedVerb={true} />)

      const resetButton = screen.getByRole('button', {
        name: /reset all statistics/i,
      })
      await user.click(resetButton)

      expect(defaultProps.onResetStatistics).toHaveBeenCalledTimes(1)
    })
  })

  describe('Different Filter States', () => {
    it('renders correctly with regular filter active', () => {
      const regularVerbs = mockVerbs.filter((v) => v.regular && !v.reflexive)
      render(
        <VerbFilters
          {...defaultProps}
          verbTypeFilter="regular"
          filteredVerbs={regularVerbs}
        />
      )

      expect(screen.getByLabelText('Verb Type')).toHaveTextContent('Regular')
      expect(screen.getByText('1 verb available')).toBeInTheDocument()
    })

    it('renders correctly with irregular filter active', () => {
      const irregularVerbs = mockVerbs.filter((v) => !v.regular && !v.reflexive)
      render(
        <VerbFilters
          {...defaultProps}
          verbTypeFilter="irregular"
          filteredVerbs={irregularVerbs}
        />
      )

      expect(screen.getByLabelText('Verb Type')).toHaveTextContent('Irregular')
      expect(screen.getByText('1 verb available')).toBeInTheDocument()
    })

    it('renders correctly with reflexive filter active', () => {
      const reflexiveVerbs = mockVerbs.filter((v) => v.reflexive)
      render(
        <VerbFilters
          {...defaultProps}
          verbTypeFilter="reflexive"
          filteredVerbs={reflexiveVerbs}
        />
      )

      expect(screen.getByLabelText('Verb Type')).toHaveTextContent('Reflexive')
      expect(screen.getByText('1 verb available')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('renders correctly with no verbs', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} filteredVerbs={[]} />)

      expect(screen.getByText('0 verbs available')).toBeInTheDocument()

      // Dropdown should still work but only show placeholder
      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)

      const listbox = screen.getByRole('listbox')
      const options = within(listbox).getAllByRole('option')
      expect(options).toHaveLength(1) // Only "Choose a verb" option
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for all form controls', () => {
      render(<VerbFilters {...defaultProps} hasSelectedVerb={true} />)

      expect(screen.getByLabelText('Verb Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Select Verb')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /reset all statistics/i })
      ).toBeInTheDocument()
    })

    it('form controls are keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<VerbFilters {...defaultProps} hasSelectedVerb={true} />)

      // Tab to first control
      await user.tab()
      expect(screen.getByLabelText('Verb Type')).toHaveFocus()

      // Tab to second control
      await user.tab()
      expect(screen.getByLabelText('Select Verb')).toHaveFocus()

      // Tab to reset button
      await user.tab()
      expect(
        screen.getByRole('button', { name: /reset all statistics/i })
      ).toHaveFocus()
    })
  })

  describe('Props Validation', () => {
    it('handles selectedVerbId that does not match any verb', () => {
      render(
        <VerbFilters
          {...defaultProps}
          selectedVerbId="non-existent-id"
          hasSelectedVerb={true}
        />
      )

      // Should not crash and should render normally
      expect(screen.getByLabelText('Select Verb')).toBeInTheDocument()
    })

    it('handles empty string selectedVerbId', () => {
      render(<VerbFilters {...defaultProps} selectedVerbId="" />)

      expect(screen.getByLabelText('Select Verb')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('allows changing filter and selecting a verb', async () => {
      const user = userEvent.setup()
      const onVerbTypeFilterChange = jest.fn()
      const onVerbSelection = jest.fn()

      render(
        <VerbFilters
          {...defaultProps}
          onVerbTypeFilterChange={onVerbTypeFilterChange}
          onVerbSelection={onVerbSelection}
        />
      )

      // Change verb type filter
      const verbTypeSelect = screen.getByLabelText('Verb Type')
      await user.click(verbTypeSelect)
      await user.click(screen.getByRole('option', { name: 'Regular' }))

      expect(onVerbTypeFilterChange).toHaveBeenCalledWith('regular')

      // Select a verb
      const verbSelect = screen.getByLabelText('Select Verb')
      await user.click(verbSelect)
      const listbox = screen.getByRole('listbox')
      const options = within(listbox).getAllByRole('option')
      await user.click(options[1]!) // First verb after placeholder

      expect(onVerbSelection).toHaveBeenCalledWith('1')
    })
  })
})
