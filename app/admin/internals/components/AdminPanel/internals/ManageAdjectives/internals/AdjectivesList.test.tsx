import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useGetAdjectivesQuery } from '@/app/store/api'

import AdjectivesList from './AdjectivesList'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useGetAdjectivesQuery: jest.fn(),
}))

// Mock dialog components
jest.mock('./EditAdjectiveDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="edit-dialog" data-open={open}>
      <button onClick={onClose}>Close Edit</button>
    </div>
  ),
}))

jest.mock('./DeleteAdjectiveDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="delete-dialog" data-open={open}>
      <button onClick={onClose}>Close Delete</button>
    </div>
  ),
}))

jest.mock('./ImportAdjectives', () => ({
  __esModule: true,
  default: () => <div data-testid="import-adjectives">Import Adjectives</div>,
}))

const mockAdjectives = [
  {
    italian: 'bello',
    maschile: {
      singolare: { it: 'bello', pt: 'bonito', en: 'beautiful' },
      plurale: { it: 'belli', pt: 'bonitos', en: 'beautiful' },
    },
    femminile: {
      singolare: { it: 'bella', pt: 'bonita', en: 'beautiful' },
      plurale: { it: 'belle', pt: 'bonitas', en: 'beautiful' },
    },
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    italian: 'brutto',
    maschile: {
      singolare: { it: 'brutto', pt: 'feio', en: 'ugly' },
      plurale: { it: 'brutti', pt: 'feios', en: 'ugly' },
    },
    femminile: {
      singolare: { it: 'brutta', pt: 'feia', en: 'ugly' },
      plurale: { it: 'brutte', pt: 'feias', en: 'ugly' },
    },
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
]

describe('AdjectivesList', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    const { container } = render(
      <AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // SkeletonTable renders MUI Skeleton components
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no adjectives', () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: [] },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(
      screen.getByText(/No adjectives in the database yet/i)
    ).toBeInTheDocument()
  })

  it('renders list of adjectives', () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('bello')).toBeInTheDocument()
    expect(screen.getByText('brutto')).toBeInTheDocument()
    expect(
      screen.getByText('Current Adjectives in Database (2)')
    ).toBeInTheDocument()
  })

  it('filters adjectives', async () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'bello' } })

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('bello')).toBeInTheDocument()
      expect(screen.queryByText('brutto')).not.toBeInTheDocument()
    })

    expect(
      screen.getByText('Current Adjectives in Database (1 of 2)')
    ).toBeInTheDocument()
  })

  it('shows no matches message when filter returns nothing', async () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'xyz' } })

    await waitFor(() => {
      expect(
        screen.getByText(/No adjectives found matching "xyz"/i)
      ).toBeInTheDocument()
    })
  })

  it('clears filter', async () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const searchInput = screen.getByPlaceholderText('Filter by Italian name...')
    fireEvent.change(searchInput, { target: { value: 'bello' } })

    // Check filter applied
    await waitFor(() => {
      expect(screen.queryByText('brutto')).not.toBeInTheDocument()
    })

    const clearButton = screen.getByLabelText('clear filter')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText('bello')).toBeInTheDocument()
      expect(screen.getByText('brutto')).toBeInTheDocument()
    })
  })

  it('opens edit dialog', () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const editButtons = screen.getAllByTestId('EditOutlinedIcon')
    const firstEditButton = editButtons[0]
    if (!firstEditButton) throw new Error('Edit button not found')
    fireEvent.click(firstEditButton.closest('button')!)

    const dialog = screen.getByTestId('edit-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('opens delete dialog', () => {
    ;(useGetAdjectivesQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
    })

    render(<AdjectivesList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
    const firstDeleteButton = deleteButtons[0]
    if (!firstDeleteButton) throw new Error('Delete button not found')
    fireEvent.click(firstDeleteButton.closest('button')!)

    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })
})
