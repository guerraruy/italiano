import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import type { ConjugationData } from '@/app/store/api'

import { ConjugationForm } from './ConjugationForm'

// Mock child component
jest.mock('./internals', () => ({
  TenseSection: ({
    mood,
    tense,
    tenseData,
    verbId,
  }: {
    mood: string
    tense: string
    tenseData: Record<string, string> | string
    verbId: string
  }) => (
    <div data-testid={`tense-section-${mood}-${tense}`}>
      TenseSection: {mood}.{tense} for verb {verbId}
      <div data-testid={`tense-data-${mood}-${tense}`}>
        {typeof tenseData === 'string'
          ? tenseData
          : Object.keys(tenseData).join(', ')}
      </div>
    </div>
  ),
}))

describe('ConjugationForm', () => {
  const mockConjugation: ConjugationData = {
    Indicativo: {
      Presente: {
        io: 'mangio',
        tu: 'mangi',
        'lui/lei': 'mangia',
        noi: 'mangiamo',
        voi: 'mangiate',
        loro: 'mangiano',
      },
      PassatoProssimo: {
        io: 'ho mangiato',
        tu: 'hai mangiato',
        'lui/lei': 'ha mangiato',
        noi: 'abbiamo mangiato',
        voi: 'avete mangiato',
        loro: 'hanno mangiato',
      },
    },
    Condizionale: {
      Presente: {
        io: 'mangerei',
        tu: 'mangeresti',
        'lui/lei': 'mangerebbe',
        noi: 'mangeremmo',
        voi: 'mangereste',
        loro: 'mangerebbero',
      },
    },
  }

  const mockVerb = {
    id: 'verb1',
    conjugation: mockConjugation,
  }

  const defaultProps = {
    selectedVerb: mockVerb,
    enabledVerbTenses: ['Indicativo.Presente'],
    inputValues: {},
    validationState: {},
    inputRefs: { current: {} },
    verbsCount: 5,
    getStatistics: jest.fn().mockReturnValue({ correct: 0, wrong: 0 }),
    onInputChange: jest.fn(),
    onValidation: jest.fn(),
    onClearInput: jest.fn(),
    onShowAnswer: jest.fn(),
    onKeyDown: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Alert States', () => {
    it('renders "No verbs with conjugations available" alert when verbsCount is 0', () => {
      render(<ConjugationForm {...defaultProps} verbsCount={0} />)

      expect(
        screen.getByText(
          /No verbs with conjugations available. Please ask your administrator to import verb conjugations./i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('tense-section-Indicativo-Presente')
      ).not.toBeInTheDocument()
    })

    it('renders "Please select a verb" alert when selectedVerb is undefined', () => {
      render(<ConjugationForm {...defaultProps} selectedVerb={undefined} />)

      expect(
        screen.getByText(
          /Please select a verb to start practicing conjugations./i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('tense-section-Indicativo-Presente')
      ).not.toBeInTheDocument()
    })

    it('renders "No conjugation data available" alert when conjugation is null', () => {
      const verbWithoutConjugation = {
        id: 'verb1',
        conjugation: null as unknown as ConjugationData,
      }

      render(
        <ConjugationForm
          {...defaultProps}
          selectedVerb={verbWithoutConjugation}
        />
      )

      expect(
        screen.getByText(
          /No conjugation data available for this verb. Please ask your administrator to import conjugation data./i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('tense-section-Indicativo-Presente')
      ).not.toBeInTheDocument()
    })

    it('renders "No conjugation data available" alert when conjugation is undefined', () => {
      const verbWithUndefinedConjugation = {
        id: 'verb1',
        conjugation: undefined as unknown as ConjugationData,
      }

      render(
        <ConjugationForm
          {...defaultProps}
          selectedVerb={verbWithUndefinedConjugation}
        />
      )

      expect(
        screen.getByText(
          /No conjugation data available for this verb. Please ask your administrator to import conjugation data./i
        )
      ).toBeInTheDocument()
    })
  })

  describe('Normal Rendering', () => {
    it('renders TenseSection for enabled verb tenses', () => {
      render(<ConjugationForm {...defaultProps} />)

      expect(
        screen.getByTestId('tense-section-Indicativo-Presente')
      ).toBeInTheDocument()
      expect(
        screen.getByText('TenseSection: Indicativo.Presente for verb verb1')
      ).toBeInTheDocument()
    })

    it('renders multiple TenseSections when multiple tenses are enabled', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={[
            'Indicativo.Presente',
            'Indicativo.PassatoProssimo',
            'Condizionale.Presente',
          ]}
        />
      )

      expect(
        screen.getByTestId('tense-section-Indicativo-Presente')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('tense-section-Indicativo-PassatoProssimo')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('tense-section-Condizionale-Presente')
      ).toBeInTheDocument()
    })

    it('does not render TenseSection when mood does not exist in conjugation', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={['Imperativo.Presente']}
        />
      )

      expect(
        screen.queryByTestId('tense-section-Imperativo-Presente')
      ).not.toBeInTheDocument()
    })

    it('does not render TenseSection when tense does not exist in mood', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={['Indicativo.Imperfetto']}
        />
      )

      expect(
        screen.queryByTestId('tense-section-Indicativo-Imperfetto')
      ).not.toBeInTheDocument()
    })

    it('handles malformed tenseKey without mood', () => {
      render(
        <ConjugationForm {...defaultProps} enabledVerbTenses={['.Presente']} />
      )

      expect(screen.queryByTestId(/tense-section/)).not.toBeInTheDocument()
    })

    it('handles malformed tenseKey without tense', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={['Indicativo.']}
        />
      )

      expect(screen.queryByTestId(/tense-section/)).not.toBeInTheDocument()
    })

    it('handles tenseKey without separator', () => {
      render(
        <ConjugationForm {...defaultProps} enabledVerbTenses={['Indicativo']} />
      )

      expect(screen.queryByTestId(/tense-section/)).not.toBeInTheDocument()
    })

    it('renders only existing tenses when some are missing', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={[
            'Indicativo.Presente',
            'Indicativo.Imperfetto', // does not exist
            'Condizionale.Presente',
          ]}
        />
      )

      expect(
        screen.getByTestId('tense-section-Indicativo-Presente')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('tense-section-Indicativo-Imperfetto')
      ).not.toBeInTheDocument()
      expect(
        screen.getByTestId('tense-section-Condizionale-Presente')
      ).toBeInTheDocument()
    })

    it('renders empty when no enabled tenses are provided', () => {
      render(<ConjugationForm {...defaultProps} enabledVerbTenses={[]} />)

      expect(screen.queryByTestId(/tense-section/)).not.toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('passes tenseData to TenseSection', () => {
      render(<ConjugationForm {...defaultProps} />)

      const tenseDataDiv = screen.getByTestId('tense-data-Indicativo-Presente')
      expect(tenseDataDiv).toHaveTextContent('io, tu, lui/lei, noi, voi, loro')
    })

    it('passes verbId to TenseSection', () => {
      render(<ConjugationForm {...defaultProps} />)

      expect(screen.getByText(/for verb verb1/)).toBeInTheDocument()
    })

    it('passes different verbId when verb changes', () => {
      const differentVerb = {
        id: 'verb2',
        conjugation: mockConjugation,
      }

      render(<ConjugationForm {...defaultProps} selectedVerb={differentVerb} />)

      expect(screen.getByText(/for verb verb2/)).toBeInTheDocument()
    })
  })

  describe('Priority of Alert States', () => {
    it('shows verbsCount=0 alert even when selectedVerb is also undefined', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          verbsCount={0}
          selectedVerb={undefined}
        />
      )

      expect(
        screen.getByText(
          /No verbs with conjugations available. Please ask your administrator to import verb conjugations./i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Please select a verb/i)
      ).not.toBeInTheDocument()
    })

    it('shows selectedVerb undefined alert when verbsCount > 0 but no verb selected', () => {
      render(<ConjugationForm {...defaultProps} selectedVerb={undefined} />)

      expect(
        screen.getByText(
          /Please select a verb to start practicing conjugations./i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/No verbs with conjugations available/i)
      ).not.toBeInTheDocument()
    })

    it('shows no conjugation data alert when verb exists but has no conjugation', () => {
      const verbWithoutConjugation = {
        id: 'verb1',
        conjugation: null as unknown as ConjugationData,
      }

      render(
        <ConjugationForm
          {...defaultProps}
          selectedVerb={verbWithoutConjugation}
        />
      )

      expect(
        screen.getByText(
          /No conjugation data available for this verb. Please ask your administrator to import conjugation data./i
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Please select a verb/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty conjugation object', () => {
      const verbWithEmptyConjugation = {
        id: 'verb1',
        conjugation: {} as ConjugationData,
      }

      render(
        <ConjugationForm
          {...defaultProps}
          selectedVerb={verbWithEmptyConjugation}
          enabledVerbTenses={['Indicativo.Presente']}
        />
      )

      expect(
        screen.queryByTestId('tense-section-Indicativo-Presente')
      ).not.toBeInTheDocument()
    })

    it('handles mood with empty tenses object', () => {
      const verbWithEmptyMood = {
        id: 'verb1',
        conjugation: {
          Indicativo: {},
        } as ConjugationData,
      }

      render(
        <ConjugationForm
          {...defaultProps}
          selectedVerb={verbWithEmptyMood}
          enabledVerbTenses={['Indicativo.Presente']}
        />
      )

      expect(
        screen.queryByTestId('tense-section-Indicativo-Presente')
      ).not.toBeInTheDocument()
    })

    it('renders TenseSections in the order they appear in enabledVerbTenses', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={[
            'Condizionale.Presente',
            'Indicativo.Presente',
            'Indicativo.PassatoProssimo',
          ]}
        />
      )

      const sections = screen.getAllByTestId(/^tense-section-/)
      expect(sections).toHaveLength(3)
      expect(sections[0]).toHaveAttribute(
        'data-testid',
        'tense-section-Condizionale-Presente'
      )
      expect(sections[1]).toHaveAttribute(
        'data-testid',
        'tense-section-Indicativo-Presente'
      )
      expect(sections[2]).toHaveAttribute(
        'data-testid',
        'tense-section-Indicativo-PassatoProssimo'
      )
    })

    it('handles tenseKey with extra dots', () => {
      render(
        <ConjugationForm
          {...defaultProps}
          enabledVerbTenses={['Indicativo.Presente.Extra']}
        />
      )

      // The split('.') will result in mood='Indicativo' and tense='Presente'
      // so it should still render the section
      expect(
        screen.getByTestId('tense-section-Indicativo-Presente')
      ).toBeInTheDocument()
    })
  })

  describe('Input Values and Validation State', () => {
    it('passes inputValues to TenseSection', () => {
      const inputValues = {
        'Indicativo.Presente.io': 'mangio',
        'Indicativo.Presente.tu': 'mangi',
      }

      render(<ConjugationForm {...defaultProps} inputValues={inputValues} />)

      expect(
        screen.getByTestId('tense-section-Indicativo-Presente')
      ).toBeInTheDocument()
    })

    it('passes validationState to TenseSection', () => {
      const validationState = {
        'Indicativo.Presente.io': 'correct' as const,
        'Indicativo.Presente.tu': 'incorrect' as const,
      }

      render(
        <ConjugationForm {...defaultProps} validationState={validationState} />
      )

      expect(
        screen.getByTestId('tense-section-Indicativo-Presente')
      ).toBeInTheDocument()
    })
  })
})
