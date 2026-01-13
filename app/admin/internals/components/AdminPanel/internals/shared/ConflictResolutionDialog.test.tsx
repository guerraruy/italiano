import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'

import ConflictResolutionDialog, {
  ConflictResolutions,
} from './ConflictResolutionDialog'

interface MockConflict {
  id: string
  name: string
  existingValue: string
  newValue: string
}

const mockConflicts: MockConflict[] = [
  {
    id: '1',
    name: 'Item One',
    existingValue: 'existing1',
    newValue: 'new1',
  },
  {
    id: '2',
    name: 'Item Two',
    existingValue: 'existing2',
    newValue: 'new2',
  },
]

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  conflicts: mockConflicts,
  resolutions: {} as ConflictResolutions,
  onResolve: jest.fn(),
  onContinue: jest.fn(),
  entityName: 'item',
  getConflictKey: (conflict: MockConflict) => conflict.id,
  renderConflictTitle: (conflict: MockConflict) => <span>{conflict.name}</span>,
  renderExistingData: (conflict: MockConflict) => (
    <span data-testid={`existing-${conflict.id}`}>
      {conflict.existingValue}
    </span>
  ),
  renderNewData: (conflict: MockConflict) => (
    <span data-testid={`new-${conflict.id}`}>{conflict.newValue}</span>
  ),
}

describe('ConflictResolutionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when open is false', () => {
    render(<ConflictResolutionDialog {...defaultProps} open={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when open is true', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays correct title with conflict count (plural)', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(screen.getByText('Resolve Conflicts (2 items)')).toBeInTheDocument()
  })

  it('displays correct title with conflict count (singular)', () => {
    render(
      <ConflictResolutionDialog
        {...defaultProps}
        conflicts={[mockConflicts[0]]}
      />
    )

    expect(screen.getByText('Resolve Conflicts (1 item)')).toBeInTheDocument()
  })

  it('displays description text with entity name', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(
      screen.getByText(/The following items already exist in the database/i)
    ).toBeInTheDocument()
  })

  it('renders all conflicts', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(screen.getByText('Item One')).toBeInTheDocument()
    expect(screen.getByText('Item Two')).toBeInTheDocument()
  })

  it('renders existing and new data for each conflict', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(screen.getByTestId('existing-1')).toHaveTextContent('existing1')
    expect(screen.getByTestId('new-1')).toHaveTextContent('new1')
    expect(screen.getByTestId('existing-2')).toHaveTextContent('existing2')
    expect(screen.getByTestId('new-2')).toHaveTextContent('new2')
  })

  it('displays "Existing Data" and "New Data" labels', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(screen.getAllByText('Existing Data')).toHaveLength(2)
    expect(screen.getAllByText('New Data')).toHaveLength(2)
  })

  it('renders Keep Existing and Replace with New buttons for each conflict', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(
      screen.getAllByRole('button', { name: /keep existing/i })
    ).toHaveLength(2)
    expect(
      screen.getAllByRole('button', { name: /replace with new/i })
    ).toHaveLength(2)
  })

  it('calls onResolve with "keep" when Keep Existing button is clicked', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    const keepButtons = screen.getAllByRole('button', {
      name: /keep existing/i,
    })
    fireEvent.click(keepButtons[0])

    expect(defaultProps.onResolve).toHaveBeenCalledWith('1', 'keep')
  })

  it('calls onResolve with "replace" when Replace with New button is clicked', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    const replaceButtons = screen.getAllByRole('button', {
      name: /replace with new/i,
    })
    fireEvent.click(replaceButtons[0])

    expect(defaultProps.onResolve).toHaveBeenCalledWith('1', 'replace')
  })

  it('shows Keep Existing button as contained when resolution is "keep"', () => {
    const resolutions: ConflictResolutions = { '1': 'keep' }
    render(
      <ConflictResolutionDialog {...defaultProps} resolutions={resolutions} />
    )

    const keepButtons = screen.getAllByRole('button', {
      name: /keep existing/i,
    })
    expect(keepButtons[0]).toHaveClass('MuiButton-contained')
  })

  it('shows Replace with New button as contained when resolution is "replace"', () => {
    const resolutions: ConflictResolutions = { '1': 'replace' }
    render(
      <ConflictResolutionDialog {...defaultProps} resolutions={resolutions} />
    )

    const replaceButtons = screen.getAllByRole('button', {
      name: /replace with new/i,
    })
    expect(replaceButtons[0]).toHaveClass('MuiButton-contained')
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('disables Continue Import button when not all conflicts are resolved', () => {
    render(<ConflictResolutionDialog {...defaultProps} resolutions={{}} />)

    const continueButton = screen.getByRole('button', {
      name: /continue import/i,
    })
    expect(continueButton).toBeDisabled()
  })

  it('disables Continue Import button when only some conflicts are resolved', () => {
    const resolutions: ConflictResolutions = { '1': 'keep' }
    render(
      <ConflictResolutionDialog {...defaultProps} resolutions={resolutions} />
    )

    const continueButton = screen.getByRole('button', {
      name: /continue import/i,
    })
    expect(continueButton).toBeDisabled()
  })

  it('enables Continue Import button when all conflicts are resolved', () => {
    const resolutions: ConflictResolutions = { '1': 'keep', '2': 'replace' }
    render(
      <ConflictResolutionDialog {...defaultProps} resolutions={resolutions} />
    )

    const continueButton = screen.getByRole('button', {
      name: /continue import/i,
    })
    expect(continueButton).not.toBeDisabled()
  })

  it('calls onContinue when Continue Import button is clicked', () => {
    const resolutions: ConflictResolutions = { '1': 'keep', '2': 'replace' }
    render(
      <ConflictResolutionDialog {...defaultProps} resolutions={resolutions} />
    )

    const continueButton = screen.getByRole('button', {
      name: /continue import/i,
    })
    fireEvent.click(continueButton)

    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1)
  })

  it('uses default maxWidth of "md"', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('MuiDialog-paperWidthMd')
  })

  it('accepts custom maxWidth prop', () => {
    render(<ConflictResolutionDialog {...defaultProps} maxWidth="lg" />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('MuiDialog-paperWidthLg')
  })

  it('renders with empty conflicts array', () => {
    render(
      <ConflictResolutionDialog
        {...defaultProps}
        conflicts={[]}
        resolutions={{}}
      />
    )

    expect(screen.getByText('Resolve Conflicts (0 items)')).toBeInTheDocument()
    const continueButton = screen.getByRole('button', {
      name: /continue import/i,
    })
    expect(continueButton).not.toBeDisabled()
  })

  it('renders warning icon', () => {
    render(<ConflictResolutionDialog {...defaultProps} />)

    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument()
  })
})
