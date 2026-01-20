import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

import '@testing-library/jest-dom'
import Home from './page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Home', () => {
  const mockPush = jest.fn()
  const mockUseRouter = useRouter as jest.Mock

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the main heading', () => {
      render(<Home />)
      expect(
        screen.getByRole('heading', { name: /welcome to italiano/i })
      ).toBeInTheDocument()
    })

    it('renders the subtitle and description', () => {
      render(<Home />)
      expect(
        screen.getByText(/your journey to learning italian starts here/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /choose a learning path below to begin mastering the italian language/i
        )
      ).toBeInTheDocument()
    })

    it('renders all four feature cards', () => {
      render(<Home />)
      expect(
        screen.getByRole('heading', { name: /nouns translations/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /adjectives translations/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /verbs translations/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /verb tenses/i })
      ).toBeInTheDocument()
    })

    it('renders feature descriptions', () => {
      render(<Home />)
      expect(
        screen.getByText(
          /learn and practice italian vocabulary with interactive translations/i
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /practice italian adjectives with masculine, feminine, singular and plural forms/i
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /master italian verbs with comprehensive translation exercises/i
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(/practice verb conjugations across different tenses/i)
      ).toBeInTheDocument()
    })

    it('renders the Get Started button', () => {
      render(<Home />)
      expect(
        screen.getByRole('button', { name: /get started/i })
      ).toBeInTheDocument()
    })

    it('renders call-to-action section', () => {
      render(<Home />)
      expect(screen.getByText(/ready to start learning\?/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /click on any of the cards above to begin your italian learning journey/i
        )
      ).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('navigates to nouns-translations when Nouns card is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const nounsCard = screen
        .getByRole('heading', { name: /nouns translations/i })
        .closest('.MuiCard-root')

      if (nounsCard) {
        await user.click(nounsCard)
        expect(mockPush).toHaveBeenCalledWith('/nouns-translations')
      }
    })

    it('navigates to adjectives-translations when Adjectives card is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const adjectivesCard = screen
        .getByRole('heading', { name: /adjectives translations/i })
        .closest('.MuiCard-root')

      if (adjectivesCard) {
        await user.click(adjectivesCard)
        expect(mockPush).toHaveBeenCalledWith('/adjectives-translations')
      }
    })

    it('navigates to verbs-translations when Verbs card is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const verbsCard = screen
        .getByRole('heading', { name: /verbs translations/i })
        .closest('.MuiCard-root')

      if (verbsCard) {
        await user.click(verbsCard)
        expect(mockPush).toHaveBeenCalledWith('/verbs-translations')
      }
    })

    it('navigates to verb-tenses when Verb Tenses card is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const verbTensesCard = screen
        .getByRole('heading', { name: /verb tenses/i })
        .closest('.MuiCard-root')

      if (verbTensesCard) {
        await user.click(verbTensesCard)
        expect(mockPush).toHaveBeenCalledWith('/verb-tenses')
      }
    })

    it('navigates to nouns-translations when Get Started button is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const getStartedButton = screen.getByRole('button', {
        name: /get started/i,
      })
      await user.click(getStartedButton)

      expect(mockPush).toHaveBeenCalledWith('/nouns-translations')
    })
  })

  describe('structure', () => {
    it('renders feature cards with proper icons', () => {
      const { container } = render(<Home />)

      const translateIcons = container.querySelectorAll(
        '[data-testid="TranslateIcon"]'
      )
      const styleIcons = container.querySelectorAll('[data-testid="StyleIcon"]')
      const recordVoiceOverIcons = container.querySelectorAll(
        '[data-testid="RecordVoiceOverIcon"]'
      )
      const scheduleIcons = container.querySelectorAll(
        '[data-testid="ScheduleIcon"]'
      )

      expect(translateIcons.length).toBeGreaterThan(0)
      expect(styleIcons.length).toBeGreaterThan(0)
      expect(recordVoiceOverIcons.length).toBeGreaterThan(0)
      expect(scheduleIcons.length).toBeGreaterThan(0)
    })

    it('renders all cards in a grid layout', () => {
      const { container } = render(<Home />)

      const cards = container.querySelectorAll('.MuiCard-root')
      expect(cards).toHaveLength(4)
    })
  })

  describe('accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Home />)

      const h1 = screen.getByRole('heading', {
        level: 1,
        name: /welcome to italiano/i,
      })
      expect(h1).toBeInTheDocument()

      const h2Headings = screen.getAllByRole('heading', { level: 2 })
      expect(h2Headings).toHaveLength(4)
    })

    it('has clickable cards for keyboard navigation', () => {
      const { container } = render(<Home />)

      const cards = container.querySelectorAll('.MuiCard-root')
      cards.forEach((card) => {
        expect(card).toHaveStyle({ cursor: 'pointer' })
      })
    })
  })
})
