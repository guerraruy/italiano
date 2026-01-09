import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useGetVerbsQuery } from '@/app/store/api'

import VerbsList from './VerbsList'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useGetVerbsQuery: jest.fn(),
}))

// Mock dialog components
jest.mock('./EditVerbDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="edit-dialog" data-open={open}>
      <button onClick={onClose}>Close Edit</button>
    </div>
  ),
}))

jest.mock('./DeleteVerbDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="delete-dialog" data-open={open}>
      <button onClick={onClose}>Close Delete</button>
    </div>
  ),
}))

jest.mock('./ImportVerbs', () => ({
  __esModule: true,
  default: () => <div data-testid="import-verbs">Import Verbs</div>,
}))

const mockVerbs = [
  {
    id: '1',
    italian: 'parlare',
    tr_ptBR: 'falar',
    tr_en: 'to speak',
    regular: true,
    reflexive: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    italian: 'essere',
    tr_ptBR: 'ser/estar',
    tr_en: 'to be',
    regular: false,
    reflexive: false,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    italian: 'lavarsi',
    tr_ptBR: 'lavar-se',
    tr_en: 'to wash oneself',
    regular: true,
    reflexive: true,
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-03T00:00:00.000Z',
  },
]

describe('VerbsList', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    const { container } = render(
      <VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // SkeletonTable renders MUI Skeleton components
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no verbs', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: [] },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(
      screen.getByText(/No verbs in the database yet/i)
    ).toBeInTheDocument()
  })

  it('renders list of verbs', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('parlare')).toBeInTheDocument()
    expect(screen.getByText('essere')).toBeInTheDocument()
    expect(screen.getByText('lavarsi')).toBeInTheDocument()
    expect(
      screen.getByText('Current Verbs in Database (3)')
    ).toBeInTheDocument()
  })

  it('renders Import Verbs component', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByTestId('import-verbs')).toBeInTheDocument()
  })

  it('displays verb translations correctly', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check for Italian verbs
    expect(screen.getByText('parlare')).toBeInTheDocument()
    expect(screen.getByText('essere')).toBeInTheDocument()

    // Check for Portuguese translations
    expect(screen.getByText('falar')).toBeInTheDocument()
    expect(screen.getByText('ser/estar')).toBeInTheDocument()

    // Check for English translations
    expect(screen.getByText('to speak')).toBeInTheDocument()
    expect(screen.getByText('to be')).toBeInTheDocument()
  })

  it('displays verb properties correctly', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check for regular/irregular chips
    expect(screen.getAllByText('Regular').length).toBeGreaterThan(0)
    expect(screen.getByText('Irregular')).toBeInTheDocument()

    // Check for reflexive chips
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No').length).toBeGreaterThan(0)
  })

  it('displays last updated dates', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('1/1/2023')).toBeInTheDocument()
    expect(screen.getByText('1/2/2023')).toBeInTheDocument()
    expect(screen.getByText('1/3/2023')).toBeInTheDocument()
  })

  it('filters verbs by Italian name', async () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'parlare' } })

    await waitFor(() => {
      expect(screen.getByText('parlare')).toBeInTheDocument()
      expect(screen.queryByText('essere')).not.toBeInTheDocument()
      expect(screen.queryByText('lavarsi')).not.toBeInTheDocument()
    })

    expect(
      screen.getByText('Current Verbs in Database (1 of 3)')
    ).toBeInTheDocument()
  })

  it('shows no matches message when filter returns nothing', async () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(
        screen.getByText(/No verbs found matching "nonexistent"/i)
      ).toBeInTheDocument()
    })
  })

  it('clears filter when clear button is clicked', async () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'parlare' } })

    // Check filter applied
    await waitFor(() => {
      expect(screen.queryByText('essere')).not.toBeInTheDocument()
    })

    const clearButton = screen.getByLabelText('clear filter')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('parlare')).toBeInTheDocument()
      expect(screen.getByText('essere')).toBeInTheDocument()
      expect(screen.getByText('lavarsi')).toBeInTheDocument()
    })
  })

  it('opens edit dialog when edit button is clicked', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const editButtons = screen.getAllByTestId('EditOutlinedIcon')
    const firstEditButton = editButtons[0]
    if (!firstEditButton) throw new Error('Edit button not found')
    fireEvent.click(firstEditButton.closest('button')!)

    const dialog = screen.getByTestId('edit-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('closes edit dialog when close is triggered', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const editButtons = screen.getAllByTestId('EditOutlinedIcon')
    const firstEditButton = editButtons[0]
    if (!firstEditButton) throw new Error('Edit button not found')
    fireEvent.click(firstEditButton.closest('button')!)

    const closeButton = screen.getByText('Close Edit')
    fireEvent.click(closeButton)

    const dialog = screen.getByTestId('edit-dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('opens delete dialog when delete button is clicked', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
    const firstDeleteButton = deleteButtons[0]
    if (!firstDeleteButton) throw new Error('Delete button not found')
    fireEvent.click(firstDeleteButton.closest('button')!)

    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('closes delete dialog when close is triggered', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
    const firstDeleteButton = deleteButtons[0]
    if (!firstDeleteButton) throw new Error('Delete button not found')
    fireEvent.click(firstDeleteButton.closest('button')!)

    const closeButton = screen.getByText('Close Delete')
    fireEvent.click(closeButton)

    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  describe('Pagination', () => {
    it('displays pagination controls', () => {
      ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
        data: { verbs: mockVerbs },
        isLoading: false,
      })

      render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

      expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument()
    })

    it('changes page when next page is clicked', async () => {
      // Create more verbs to test pagination
      const manyVerbs = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        italian: `verb${i + 1}`,
        tr_ptBR: `verbo${i + 1}`,
        tr_en: `verb${i + 1}`,
        regular: i % 2 === 0,
        reflexive: i % 3 === 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
        data: { verbs: manyVerbs },
        isLoading: false,
      })

      render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Should show first 25 by default
      expect(screen.getByText(/1–25 of 30/)).toBeInTheDocument()

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next page/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
      })
    })

    it('changes rows per page', async () => {
      // Create more verbs
      const manyVerbs = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        italian: `verb${i + 1}`,
        tr_ptBR: `verbo${i + 1}`,
        tr_en: `verb${i + 1}`,
        regular: i % 2 === 0,
        reflexive: i % 3 === 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
        data: { verbs: manyVerbs },
        isLoading: false,
      })

      render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Change rows per page
      const rowsPerPageSelect = screen.getByRole('combobox', {
        name: /rows per page/i,
      })
      fireEvent.mouseDown(rowsPerPageSelect)

      const option10 = screen.getByRole('option', { name: '10' })
      fireEvent.click(option10)

      await waitFor(() => {
        expect(screen.getByText(/1–10 of 30/)).toBeInTheDocument()
      })
    })

    it('resets to first page when filtering', async () => {
      // Create more verbs
      const manyVerbs = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        italian: `verb${i + 1}`,
        tr_ptBR: `verbo${i + 1}`,
        tr_en: `verb${i + 1}`,
        regular: i % 2 === 0,
        reflexive: i % 3 === 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
        data: { verbs: manyVerbs },
        isLoading: false,
      })

      render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next page/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
      })

      // Apply filter - use "verb25" which will only match verb25 in a list of 30
      const searchInput = screen.getByPlaceholderText(
        'Filter by Italian name...'
      )
      fireEvent.change(searchInput, { target: { value: 'verb25' } })

      // Should reset to first page
      await waitFor(() => {
        expect(screen.getByText(/1–1 of 1/)).toBeInTheDocument()
      })
    })
  })

  it('disables filter input when loading', () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    expect(searchInput).toBeDisabled()
  })

  it('displays null English translations as dash', () => {
    const verbsWithNullEnglish = [
      {
        id: '1',
        italian: 'parlare',
        tr_ptBR: 'falar',
        tr_en: null,
        regular: true,
        reflexive: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    ]

    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: verbsWithNullEnglish },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check that the dash is displayed for null English translation
    const tableRows = screen.getAllByRole('row')
    const dataRow = tableRows.find((row) =>
      row.textContent?.includes('parlare')
    )
    expect(dataRow?.textContent).toContain('-')
  })

  it('filters are case-insensitive', async () => {
    ;(useGetVerbsQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
    })

    render(<VerbsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'PARLARE' } })

    await waitFor(() => {
      expect(screen.getByText('parlare')).toBeInTheDocument()
      expect(screen.queryByText('essere')).not.toBeInTheDocument()
    })
  })
})
