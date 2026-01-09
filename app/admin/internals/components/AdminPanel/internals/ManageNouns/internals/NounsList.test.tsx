import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useGetNounsQuery } from '@/app/store/api'

import NounsList from './NounsList'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useGetNounsQuery: jest.fn(),
}))

// Mock dialog components
jest.mock('./EditNounDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="edit-dialog" data-open={open}>
      <button onClick={onClose}>Close Edit</button>
    </div>
  ),
}))

jest.mock('./DeleteNounDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="delete-dialog" data-open={open}>
      <button onClick={onClose}>Close Delete</button>
    </div>
  ),
}))

jest.mock('./ImportNouns', () => ({
  __esModule: true,
  default: () => <div data-testid="import-nouns">Import Nouns</div>,
}))

const mockNouns = [
  {
    italian: 'casa',
    singolare: {
      it: 'casa',
      pt: 'casa',
      en: 'house',
    },
    plurale: {
      it: 'case',
      pt: 'casas',
      en: 'houses',
    },
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    italian: 'libro',
    singolare: {
      it: 'libro',
      pt: 'livro',
      en: 'book',
    },
    plurale: {
      it: 'libri',
      pt: 'livros',
      en: 'books',
    },
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
  {
    italian: 'tavolo',
    singolare: {
      it: 'tavolo',
      pt: 'mesa',
      en: 'table',
    },
    plurale: {
      it: 'tavoli',
      pt: 'mesas',
      en: 'tables',
    },
    updatedAt: '2023-01-03T00:00:00.000Z',
  },
]

describe('NounsList', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    const { container } = render(
      <NounsList onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // SkeletonTable renders MUI Skeleton components
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no nouns', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: [] },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(
      screen.getByText(/No nouns in the database yet/i)
    ).toBeInTheDocument()
  })

  it('renders list of nouns', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Text appears multiple times (in Italian column, singular, and plural)
    expect(screen.getAllByText('casa').length).toBeGreaterThan(0)
    expect(screen.getAllByText('libro').length).toBeGreaterThan(0)
    expect(screen.getAllByText('tavolo').length).toBeGreaterThan(0)
    expect(
      screen.getByText('Current Nouns in Database (3)')
    ).toBeInTheDocument()
  })

  it('renders Import Nouns component', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByTestId('import-nouns')).toBeInTheDocument()
  })

  it('displays noun translations correctly', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check for Italian translations (may appear multiple times)
    expect(screen.getAllByText('casa').length).toBeGreaterThan(0)
    expect(screen.getByText('case')).toBeInTheDocument()

    // Check for Portuguese translations
    expect(screen.getByText('livro')).toBeInTheDocument()
    expect(screen.getByText('livros')).toBeInTheDocument()

    // Check for English translations
    expect(screen.getByText('book')).toBeInTheDocument()
    expect(screen.getByText('books')).toBeInTheDocument()
  })

  it('displays last updated dates', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('1/1/2023')).toBeInTheDocument()
    expect(screen.getByText('1/2/2023')).toBeInTheDocument()
    expect(screen.getByText('1/3/2023')).toBeInTheDocument()
  })

  it('filters nouns by Italian name', async () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'casa' } })

    await waitFor(() => {
      expect(screen.getAllByText('casa').length).toBeGreaterThan(0)
      expect(screen.queryByText('book')).not.toBeInTheDocument()
      expect(screen.queryByText('table')).not.toBeInTheDocument()
    })

    expect(
      screen.getByText('Current Nouns in Database (1 of 3)')
    ).toBeInTheDocument()
  })

  it('shows no matches message when filter returns nothing', async () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(
        screen.getByText(/No nouns found matching "nonexistent"/i)
      ).toBeInTheDocument()
    })
  })

  it('clears filter when clear button is clicked', async () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'casa' } })

    // Check filter applied
    await waitFor(() => {
      expect(screen.queryByText('book')).not.toBeInTheDocument()
    })

    const clearButton = screen.getByLabelText('clear filter')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(screen.getAllByText('casa').length).toBeGreaterThan(0)
      expect(screen.getByText('book')).toBeInTheDocument()
      expect(screen.getByText('table')).toBeInTheDocument()
    })
  })

  it('opens edit dialog when edit button is clicked', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const editButtons = screen.getAllByTestId('EditOutlinedIcon')
    const firstEditButton = editButtons[0]
    if (!firstEditButton) throw new Error('Edit button not found')
    fireEvent.click(firstEditButton.closest('button')!)

    const dialog = screen.getByTestId('edit-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('closes edit dialog when close is triggered', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

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
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
    const firstDeleteButton = deleteButtons[0]
    if (!firstDeleteButton) throw new Error('Delete button not found')
    fireEvent.click(firstDeleteButton.closest('button')!)

    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('closes delete dialog when close is triggered', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

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
      ;(useGetNounsQuery as jest.Mock).mockReturnValue({
        data: { nouns: mockNouns },
        isLoading: false,
      })

      render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

      expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument()
    })

    it('changes page when next page is clicked', async () => {
      // Create more nouns to test pagination
      const manyNouns = Array.from({ length: 30 }, (_, i) => ({
        italian: `noun${i + 1}`,
        singolare: {
          it: `noun${i + 1}`,
          pt: `palavra${i + 1}`,
          en: `word${i + 1}`,
        },
        plurale: {
          it: `nouns${i + 1}`,
          pt: `palavras${i + 1}`,
          en: `words${i + 1}`,
        },
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetNounsQuery as jest.Mock).mockReturnValue({
        data: { nouns: manyNouns },
        isLoading: false,
      })

      render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

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
      // Create more nouns
      const manyNouns = Array.from({ length: 30 }, (_, i) => ({
        italian: `noun${i + 1}`,
        singolare: {
          it: `noun${i + 1}`,
          pt: `palavra${i + 1}`,
          en: `word${i + 1}`,
        },
        plurale: {
          it: `nouns${i + 1}`,
          pt: `palavras${i + 1}`,
          en: `words${i + 1}`,
        },
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetNounsQuery as jest.Mock).mockReturnValue({
        data: { nouns: manyNouns },
        isLoading: false,
      })

      render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

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
      // Create more nouns
      const manyNouns = Array.from({ length: 30 }, (_, i) => ({
        italian: `noun${i + 1}`,
        singolare: {
          it: `noun${i + 1}`,
          pt: `palavra${i + 1}`,
          en: `word${i + 1}`,
        },
        plurale: {
          it: `nouns${i + 1}`,
          pt: `palavras${i + 1}`,
          en: `words${i + 1}`,
        },
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetNounsQuery as jest.Mock).mockReturnValue({
        data: { nouns: manyNouns },
        isLoading: false,
      })

      render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next page/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
      })

      // Apply filter - use "noun25" which will only match noun25 in a list of 30
      const searchInput = screen.getByPlaceholderText(
        'Filter by Italian name...'
      )
      fireEvent.change(searchInput, { target: { value: 'noun25' } })

      // Should reset to first page
      await waitFor(() => {
        expect(screen.getByText(/1–1 of 1/)).toBeInTheDocument()
      })
    })
  })

  it('disables filter input when loading', () => {
    ;(useGetNounsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(<NounsList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    expect(searchInput).toBeDisabled()
  })
})
