import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import * as api from '@/app/store/api'
import { TIMING } from '@/lib/constants'

import SettingsModal from './SettingsModal'

// Mock the RTK Query hooks
jest.mock('@/app/store/api', () => ({
  useGetProfileQuery: jest.fn(),
  useUpdateProfileMutation: jest.fn(),
}))

// Mock the internal components
jest.mock('./internals', () => ({
  LanguageSelector: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (val: 'pt-BR' | 'en') => void
  }) => (
    <div data-testid="language-selector">
      <span data-testid="language-value">{value}</span>
      <button
        data-testid="change-language-pt"
        onClick={() => onChange('pt-BR')}
      >
        Portuguese
      </button>
      <button data-testid="change-language-en" onClick={() => onChange('en')}>
        English
      </button>
    </div>
  ),
  VerbTenseSelector: ({
    enabledTenses,
    onTenseToggle,
    onCategoryToggle,
  }: {
    enabledTenses: string[]
    onTenseToggle: (tense: string) => void
    onCategoryToggle: (category: string) => void
  }) => (
    <div data-testid="verb-tense-selector">
      <span data-testid="enabled-tenses">{enabledTenses.join(',')}</span>
      <button
        data-testid="toggle-tense"
        onClick={() => onTenseToggle('Indicativo.Presente')}
      >
        Toggle Tense
      </button>
      <button
        data-testid="toggle-category"
        onClick={() => onCategoryToggle('Indicativo')}
      >
        Toggle Category
      </button>
    </div>
  ),
  VERB_TENSES: [
    {
      category: 'Indicativo',
      tenses: ['Presente', 'Passato Prossimo', 'Futuro Semplice', 'Imperfetto'],
    },
    {
      category: 'Congiuntivo',
      tenses: ['Presente', 'Passato'],
    },
  ],
}))

describe('SettingsModal', () => {
  const mockOnClose = jest.fn()
  const mockUpdateProfile = jest.fn()

  const defaultProfileData = {
    profile: {
      nativeLanguage: 'pt-BR' as const,
      enabledVerbTenses: [
        'Indicativo.Presente',
        'Indicativo.Passato Prossimo',
        'Indicativo.Futuro Semplice',
      ],
      masteryThreshold: 10,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Default mock implementations
    ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
      data: defaultProfileData,
      isLoading: false,
      error: null,
    })
    ;(api.useUpdateProfileMutation as jest.Mock).mockReturnValue([
      mockUpdateProfile,
      { isLoading: false },
    ])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render the modal when open is true', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByText('Profile Settings')).toBeInTheDocument()
      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
      expect(screen.getByTestId('verb-tense-selector')).toBeInTheDocument()
    })

    it('should not render content when open is false', () => {
      render(<SettingsModal open={false} onClose={mockOnClose} />)

      expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument()
    })

    it('should render Cancel and Save buttons', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    it('should render close icon button', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when data is loading', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument()
    })

    it('should disable Save button while loading', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })
  })

  describe('Error State', () => {
    it('should show error alert when there is an error loading profile', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(
        screen.getByText('Failed to load profile settings. Please try again.')
      ).toBeInTheDocument()
      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('should initialize with profile data when available', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: {
          profile: {
            nativeLanguage: 'en',
            enabledVerbTenses: ['Congiuntivo.Presente'],
          },
        },
        isLoading: false,
        error: null,
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('language-value')).toHaveTextContent('en')
      expect(screen.getByTestId('enabled-tenses')).toHaveTextContent(
        'Congiuntivo.Presente'
      )
    })

    it('should use default values when profile data is not available', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: { profile: null },
        isLoading: false,
        error: null,
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('language-value')).toHaveTextContent('pt-BR')
      expect(screen.getByTestId('enabled-tenses')).toHaveTextContent(
        'Indicativo.Presente,Indicativo.Passato Prossimo,Indicativo.Futuro Semplice'
      )
    })

    it('should reset form when modal opens', () => {
      const { rerender } = render(
        <SettingsModal open={false} onClose={mockOnClose} />
      )

      rerender(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('language-value')).toHaveTextContent('pt-BR')
    })
  })

  describe('Language Selection', () => {
    it('should update language when changed', async () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByTestId('change-language-en'))

      expect(screen.getByTestId('language-value')).toHaveTextContent('en')
    })
  })

  describe('Verb Tense Toggle', () => {
    it('should toggle individual tense', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      const initialTenses = screen.getByTestId('enabled-tenses').textContent

      fireEvent.click(screen.getByTestId('toggle-tense'))

      // The tense should be removed since it was in the initial list
      expect(screen.getByTestId('enabled-tenses').textContent).not.toBe(
        initialTenses
      )
    })

    it('should toggle entire category', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByTestId('toggle-category'))

      // After toggling Indicativo category, all Indicativo tenses should be added
      const tenses = screen.getByTestId('enabled-tenses').textContent
      expect(tenses).toContain('Indicativo.Imperfetto')
    })
  })

  describe('Save Functionality', () => {
    it('should call updateProfile with correct data on save', async () => {
      mockUpdateProfile.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          nativeLanguage: 'pt-BR',
          enabledVerbTenses: [
            'Indicativo.Presente',
            'Indicativo.Passato Prossimo',
            'Indicativo.Futuro Semplice',
          ],
          masteryThreshold: 10,
        })
      })
    })

    it('should show success message after successful save', async () => {
      mockUpdateProfile.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Profile updated successfully!')
        ).toBeInTheDocument()
      })
    })

    it('should close modal after success delay', async () => {
      mockUpdateProfile.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Profile updated successfully!')
        ).toBeInTheDocument()
      })

      // Advance timers by the success delay
      jest.advanceTimersByTime(TIMING.SUCCESS_MODAL_CLOSE_DELAY_MS)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should show error message on save failure', async () => {
      mockUpdateProfile.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue({
          data: { error: 'Server error occurred' },
        }),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument()
      })
    })

    it('should show default error message when error has no message', async () => {
      mockUpdateProfile.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Unknown error')),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Failed to update profile. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('should show "Saving..." text while updating', () => {
      ;(api.useUpdateProfileMutation as jest.Mock).mockReturnValue([
        mockUpdateProfile,
        { isLoading: true },
      ])

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(
        screen.getByRole('button', { name: /saving/i })
      ).toBeInTheDocument()
    })

    it('should disable buttons while updating', () => {
      ;(api.useUpdateProfileMutation as jest.Mock).mockReturnValue([
        mockUpdateProfile,
        { isLoading: true },
      ])

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })

  describe('Close Functionality', () => {
    it('should call onClose when Cancel button is clicked', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when close icon is clicked', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByRole('button', { name: /close/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should clear messages when closing', async () => {
      mockUpdateProfile.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue({
          data: { error: 'Error message' },
        }),
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Query Options', () => {
    it('should skip query when modal is closed', () => {
      render(<SettingsModal open={false} onClose={mockOnClose} />)

      expect(api.useGetProfileQuery).toHaveBeenCalledWith(undefined, {
        skip: true,
      })
    })

    it('should not skip query when modal is open', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(api.useGetProfileQuery).toHaveBeenCalledWith(undefined, {
        skip: false,
      })
    })
  })

  describe('Category Toggle Logic', () => {
    it('should add all tenses when category is not fully selected', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: {
          profile: {
            nativeLanguage: 'pt-BR',
            enabledVerbTenses: ['Indicativo.Presente'], // Only one tense selected
          },
        },
        isLoading: false,
        error: null,
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByTestId('toggle-category'))

      const tenses = screen.getByTestId('enabled-tenses').textContent
      // Should now contain all Indicativo tenses
      expect(tenses).toContain('Indicativo.Presente')
      expect(tenses).toContain('Indicativo.Passato Prossimo')
      expect(tenses).toContain('Indicativo.Futuro Semplice')
      expect(tenses).toContain('Indicativo.Imperfetto')
    })

    it('should remove all tenses when category is fully selected', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: {
          profile: {
            nativeLanguage: 'pt-BR',
            enabledVerbTenses: [
              'Indicativo.Presente',
              'Indicativo.Passato Prossimo',
              'Indicativo.Futuro Semplice',
              'Indicativo.Imperfetto',
            ],
          },
        },
        isLoading: false,
        error: null,
      })

      render(<SettingsModal open={true} onClose={mockOnClose} />)

      fireEvent.click(screen.getByTestId('toggle-category'))

      const tenses = screen.getByTestId('enabled-tenses').textContent
      // Should now be empty (no Indicativo tenses)
      expect(tenses).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible dialog structure', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible close button', () => {
      render(<SettingsModal open={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toHaveAttribute('aria-label', 'close')
    })
  })
})
