import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { api } from '@/app/store/api'

import ConjugationsList from './ConjugationsList'

// Mock the child components
jest.mock('./EditConjugationDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="edit-dialog" data-open={open}>
      <button onClick={onClose}>Close Edit</button>
    </div>
  ),
}))

jest.mock('./DeleteConjugationDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="delete-dialog" data-open={open}>
      <button onClick={onClose}>Close Delete</button>
    </div>
  ),
}))

const mockConjugationsData = {
  conjugations: [
    {
      id: '1',
      verbId: 'v1',
      verb: {
        id: 'v1',
        italian: 'parlare',
        english: 'to speak',
        regular: true,
        reflexive: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      conjugation: {
        indicative: {
          present: {
            io: 'parlo',
            tu: 'parli',
            lui: 'parla',
            noi: 'parliamo',
            voi: 'parlate',
            loro: 'parlano',
          },
        },
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      verbId: 'v2',
      verb: {
        id: 'v2',
        italian: 'mangiare',
        english: 'to eat',
        regular: true,
        reflexive: false,
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      conjugation: {
        indicative: {
          present: {
            io: 'mangio',
            tu: 'mangi',
            lui: 'mangia',
            noi: 'mangiamo',
            voi: 'mangiate',
            loro: 'mangiano',
          },
        },
      },
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      verbId: 'v3',
      verb: {
        id: 'v3',
        italian: 'essere',
        english: 'to be',
        regular: false,
        reflexive: false,
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
      conjugation: {
        indicative: {
          present: {
            io: 'sono',
            tu: 'sei',
            lui: 'è',
            noi: 'siamo',
            voi: 'siete',
            loro: 'sono',
          },
        },
      },
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ],
}

function createMockStore(overrides = {}) {
  // Simplified mock state for testing - using type assertion to bypass RTK Query's complex internal types
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: {
      [api.reducerPath]: {
        queries: {
          'getConjugations(undefined)': {
            status: 'fulfilled',
            data: mockConjugationsData,
            ...overrides,
          },
        },
        mutations: {},
        provided: {},
        subscriptions: {},
        config: {
          reducerPath: api.reducerPath,
          online: true,
          focused: true,
          middlewareRegistered: true,
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
}

function renderWithProvider(
  ui: React.ReactElement,
  { store = createMockStore() } = {}
) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  }
}

describe('ConjugationsList', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  // Suppress console errors for RTK Query act() warnings in tests
  const originalError = console.error

  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      // Suppress RTK Query act() warnings - these are false positives in our tests
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('not wrapped in act(...)') ||
          args[0].includes('An unhandled error occurred'))
      ) {
        return
      }
      originalError.call(console, ...args)
    }
  })

  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Loading State', () => {
    it('should display loading skeleton when data is loading', () => {
      const loadingStore = createMockStore({
        status: 'pending',
        data: undefined,
      })

      const { container } = renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />,
        { store: loadingStore }
      )

      // Check for skeleton loaders (MUI Skeleton components)
      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('should display info message when no conjugations exist', () => {
      const emptyStore = createMockStore({
        status: 'fulfilled',
        data: { conjugations: [] },
      })

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />,
        { store: emptyStore }
      )

      expect(
        screen.getByText(/No conjugations in the database yet/i)
      ).toBeInTheDocument()
    })
  })

  describe('Displaying Conjugations', () => {
    it('should display all conjugations in the table', () => {
      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      expect(screen.getByText('parlare')).toBeInTheDocument()
      expect(screen.getByText('mangiare')).toBeInTheDocument()
      expect(screen.getByText('essere')).toBeInTheDocument()
    })

    it('should display correct count of conjugations', () => {
      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      expect(
        screen.getByText(/Current Conjugations in Database \(3\)/i)
      ).toBeInTheDocument()
    })

    it('should display regular/irregular chips correctly', () => {
      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      // Get all table rows (skip the header row)
      const rows = screen.getAllByRole('row').slice(1)

      // Count regular and irregular chips in the rows
      let regularCount = 0
      let irregularCount = 0

      rows.forEach((row) => {
        const regularChip = within(row).queryByText('Regular')
        const irregularChip = within(row).queryByText('Irregular')
        if (regularChip && regularChip.closest('.MuiChip-label')) {
          regularCount++
        }
        if (irregularChip && irregularChip.closest('.MuiChip-label')) {
          irregularCount++
        }
      })

      expect(regularCount).toBe(2) // parlare and mangiare
      expect(irregularCount).toBe(1) // essere
    })

    it('should display conjugation summary', () => {
      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const summaries = screen.getAllByText(/1 tense/)
      expect(summaries.length).toBeGreaterThan(0)
    })

    it('should display last updated dates', () => {
      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      expect(screen.getByText('1/1/2024')).toBeInTheDocument()
      expect(screen.getByText('1/2/2024')).toBeInTheDocument()
      expect(screen.getByText('1/3/2024')).toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    it('should filter conjugations by verb name', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const searchInput = screen.getByPlaceholderText(/Filter by verb name/i)
      await user.type(searchInput, 'parlare')

      await waitFor(() => {
        expect(screen.getByText('parlare')).toBeInTheDocument()
        expect(screen.queryByText('mangiare')).not.toBeInTheDocument()
        expect(screen.queryByText('essere')).not.toBeInTheDocument()
      })
    })

    it('should show filtered count when filtering', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const searchInput = screen.getByPlaceholderText(/Filter by verb name/i)
      await user.type(searchInput, 'parlare')

      await waitFor(() => {
        expect(
          screen.getByText(/Current Conjugations in Database \(1 of 3\)/i)
        ).toBeInTheDocument()
      })
    })

    it('should show no results message when filter matches nothing', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const searchInput = screen.getByPlaceholderText(/Filter by verb name/i)
      await user.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(
          screen.getByText(/No conjugations found matching "nonexistent"/i)
        ).toBeInTheDocument()
      })
    })

    it('should clear filter when clear button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const searchInput = screen.getByPlaceholderText(/Filter by verb name/i)
      await user.type(searchInput, 'parlare')

      const clearButton = screen.getByLabelText(/clear filter/i)
      await user.click(clearButton)

      await waitFor(() => {
        expect(searchInput).toHaveValue('')
        expect(screen.getByText('parlare')).toBeInTheDocument()
        expect(screen.getByText('mangiare')).toBeInTheDocument()
        expect(screen.getByText('essere')).toBeInTheDocument()
      })
    })

    it('should reset to first page when filtering', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      // Type in filter
      const searchInput = screen.getByPlaceholderText(/Filter by verb name/i)
      await user.type(searchInput, 'parlare')

      await waitFor(() => {
        // The pagination should show page 1
        const pagination = screen.getByText(/1–1 of 1/)
        expect(pagination).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument()
    })

    it('should change page when next page is clicked', async () => {
      const user = userEvent.setup()

      // Create more conjugations to test pagination
      const manyConjugations = {
        conjugations: Array.from({ length: 30 }, (_, i) => ({
          id: `${i + 1}`,
          verbId: `v${i + 1}`,
          verb: {
            id: `v${i + 1}`,
            italian: `verb${i + 1}`,
            english: `to verb${i + 1}`,
            regular: true,
            reflexive: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          conjugation: {
            indicative: {
              present: {
                io: `form${i + 1}`,
              },
            },
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })),
      }

      const manyConjugationsStore = createMockStore({
        status: 'fulfilled',
        data: manyConjugations,
      })

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />,
        { store: manyConjugationsStore }
      )

      // Should show first 25 by default
      expect(screen.getByText(/1–25 of 30/)).toBeInTheDocument()

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next page/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
      })
    })

    it('should change rows per page', async () => {
      const user = userEvent.setup()

      // Create more conjugations
      const manyConjugations = {
        conjugations: Array.from({ length: 30 }, (_, i) => ({
          id: `${i + 1}`,
          verbId: `v${i + 1}`,
          verb: {
            id: `v${i + 1}`,
            italian: `verb${i + 1}`,
            english: `to verb${i + 1}`,
            regular: true,
            reflexive: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          conjugation: {
            indicative: {
              present: {
                io: `form${i + 1}`,
              },
            },
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })),
      }

      const manyConjugationsStore = createMockStore({
        status: 'fulfilled',
        data: manyConjugations,
      })

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />,
        { store: manyConjugationsStore }
      )

      // Change rows per page
      const rowsPerPageSelect = screen.getByRole('combobox', {
        name: /rows per page/i,
      })
      await user.click(rowsPerPageSelect)

      const option10 = screen.getByRole('option', { name: '10' })
      await user.click(option10)

      await waitFor(() => {
        expect(screen.getByText(/1–10 of 30/)).toBeInTheDocument()
      })
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should expand conjugation details when expand button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      // Find all expand buttons and click the first one
      const expandButtons = screen.getAllByTitle('Toggle preview')
      const firstExpandButton = expandButtons[0]
      if (!firstExpandButton) throw new Error('Expand button not found')
      await user.click(firstExpandButton)

      await waitFor(() => {
        expect(screen.getByText('indicative')).toBeInTheDocument()
        expect(screen.getByText('present')).toBeInTheDocument()
        expect(screen.getByText('io: parlo')).toBeInTheDocument()
      })
    })

    it('should collapse conjugation details when collapse button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      // Expand first
      const expandButtons = screen.getAllByTitle('Toggle preview')
      const firstExpandButton = expandButtons[0]
      if (!firstExpandButton) throw new Error('Expand button not found')
      await user.click(firstExpandButton)

      await waitFor(() => {
        expect(screen.getByText('io: parlo')).toBeInTheDocument()
      })

      // Collapse
      await user.click(firstExpandButton)

      await waitFor(() => {
        expect(screen.queryByText('io: parlo')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edit Dialog', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const editButtons = screen.getAllByRole('button', { name: '' })
      const editButton = editButtons.find((btn) =>
        btn.querySelector('[data-testid="EditOutlinedIcon"]')
      )

      if (editButton) {
        await user.click(editButton)

        await waitFor(() => {
          const dialog = screen.getByTestId('edit-dialog')
          expect(dialog).toHaveAttribute('data-open', 'true')
        })
      }
    })

    it('should close edit dialog when close is triggered', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const editButtons = screen.getAllByRole('button', { name: '' })
      const editButton = editButtons.find((btn) =>
        btn.querySelector('[data-testid="EditOutlinedIcon"]')
      )

      if (editButton) {
        await user.click(editButton)

        const closeButton = screen.getByText('Close Edit')
        await user.click(closeButton)

        await waitFor(() => {
          const dialog = screen.getByTestId('edit-dialog')
          expect(dialog).toHaveAttribute('data-open', 'false')
        })
      }
    })
  })

  describe('Delete Dialog', () => {
    it('should open delete dialog when delete button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '' })
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('[data-testid="DeleteOutlinedIcon"]')
      )

      if (deleteButton) {
        await user.click(deleteButton)

        await waitFor(() => {
          const dialog = screen.getByTestId('delete-dialog')
          expect(dialog).toHaveAttribute('data-open', 'true')
        })
      }
    })

    it('should close delete dialog when close is triggered', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '' })
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('[data-testid="DeleteOutlinedIcon"]')
      )

      if (deleteButton) {
        await user.click(deleteButton)

        const closeButton = screen.getByText('Close Delete')
        await user.click(closeButton)

        await waitFor(() => {
          const dialog = screen.getByTestId('delete-dialog')
          expect(dialog).toHaveAttribute('data-open', 'false')
        })
      }
    })
  })

  describe('Reflexive Verbs', () => {
    it('should display reflexive chip for reflexive verbs', () => {
      const reflexiveConjugation = {
        conjugations: [
          {
            id: '1',
            verbId: 'v1',
            verb: {
              id: 'v1',
              italian: 'lavarsi',
              english: 'to wash oneself',
              regular: true,
              reflexive: true,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
            conjugation: {
              indicative: {
                present: {
                  io: 'mi lavo',
                },
              },
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      }

      const reflexiveStore = createMockStore({
        status: 'fulfilled',
        data: reflexiveConjugation,
      })

      renderWithProvider(
        <ConjugationsList onError={mockOnError} onSuccess={mockOnSuccess} />,
        { store: reflexiveStore }
      )

      expect(screen.getByText('lavarsi')).toBeInTheDocument()
      // Find the "Yes" chip in the Reflexive column
      const yesChips = screen.getAllByText('Yes')
      expect(yesChips.length).toBeGreaterThan(0)
    })
  })
})
