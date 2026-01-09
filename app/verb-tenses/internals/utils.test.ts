import {
  normalizeString,
  validateAnswer,
  getFilterStorageKey,
  createInputKey,
} from './utils'

describe('utils', () => {
  describe('normalizeString', () => {
    it('should convert string to lowercase', () => {
      expect(normalizeString('HELLO')).toBe('hello')
      expect(normalizeString('HeLLo WoRLd')).toBe('hello world')
    })

    it('should trim whitespace from both ends', () => {
      expect(normalizeString('  hello  ')).toBe('hello')
      expect(normalizeString('\t\nhello\n\t')).toBe('hello')
    })

    it('should remove accents from characters', () => {
      // Italian accents
      expect(normalizeString('è')).toBe('e')
      expect(normalizeString('é')).toBe('e')
      expect(normalizeString('à')).toBe('a')
      expect(normalizeString('ò')).toBe('o')
      expect(normalizeString('ù')).toBe('u')
      expect(normalizeString('ì')).toBe('i')

      // Common accented words
      expect(normalizeString('caffè')).toBe('caffe')
      expect(normalizeString('città')).toBe('citta')
      expect(normalizeString('perché')).toBe('perche')
    })

    it('should handle combined transformations', () => {
      expect(normalizeString('  CAFFÈ  ')).toBe('caffe')
      expect(normalizeString('  Città  ')).toBe('citta')
      expect(normalizeString('  PERCHÉ  ')).toBe('perche')
    })

    it('should handle empty strings', () => {
      expect(normalizeString('')).toBe('')
      expect(normalizeString('   ')).toBe('')
    })

    it('should handle strings without accents', () => {
      expect(normalizeString('parlo')).toBe('parlo')
      expect(normalizeString('mangiare')).toBe('mangiare')
    })

    it('should handle special characters that are not accents', () => {
      expect(normalizeString('hello-world')).toBe('hello-world')
      expect(normalizeString("it's")).toBe("it's")
    })
  })

  describe('validateAnswer', () => {
    it('should return true for exact matches', () => {
      expect(validateAnswer('parlo', 'parlo')).toBe(true)
      expect(validateAnswer('mangio', 'mangio')).toBe(true)
    })

    it('should return true for case-insensitive matches', () => {
      expect(validateAnswer('PARLO', 'parlo')).toBe(true)
      expect(validateAnswer('parlo', 'PARLO')).toBe(true)
      expect(validateAnswer('PaRlO', 'pArLo')).toBe(true)
    })

    it('should return true when accents differ', () => {
      expect(validateAnswer('caffe', 'caffè')).toBe(true)
      expect(validateAnswer('caffè', 'caffe')).toBe(true)
      expect(validateAnswer('perche', 'perché')).toBe(true)
      expect(validateAnswer('citta', 'città')).toBe(true)
    })

    it('should return true ignoring leading/trailing whitespace', () => {
      expect(validateAnswer('  parlo  ', 'parlo')).toBe(true)
      expect(validateAnswer('parlo', '  parlo  ')).toBe(true)
      expect(validateAnswer('  parlo  ', '  parlo  ')).toBe(true)
    })

    it('should return true for combined differences', () => {
      expect(validateAnswer('  CAFFÈ  ', 'caffe')).toBe(true)
      expect(validateAnswer('  perche  ', 'PERCHÉ')).toBe(true)
    })

    it('should return false for different words', () => {
      expect(validateAnswer('parlo', 'mangio')).toBe(false)
      expect(validateAnswer('io', 'tu')).toBe(false)
    })

    it('should return false for partial matches', () => {
      expect(validateAnswer('parl', 'parlo')).toBe(false)
      expect(validateAnswer('parlo', 'parl')).toBe(false)
    })

    it('should return false for empty input against non-empty answer', () => {
      expect(validateAnswer('', 'parlo')).toBe(false)
      expect(validateAnswer('   ', 'parlo')).toBe(false)
    })

    it('should return true for both empty strings', () => {
      expect(validateAnswer('', '')).toBe(true)
      expect(validateAnswer('   ', '   ')).toBe(true)
    })
  })

  describe('getFilterStorageKey', () => {
    it('should create a key with the user ID', () => {
      expect(getFilterStorageKey('user123')).toBe('verbTypeFilter_user123')
    })

    it('should handle different user IDs', () => {
      expect(getFilterStorageKey('abc')).toBe('verbTypeFilter_abc')
      expect(getFilterStorageKey('user-456')).toBe('verbTypeFilter_user-456')
      expect(getFilterStorageKey('test@example.com')).toBe(
        'verbTypeFilter_test@example.com'
      )
    })

    it('should handle empty string', () => {
      expect(getFilterStorageKey('')).toBe('verbTypeFilter_')
    })

    it('should handle UUID-style user IDs', () => {
      expect(getFilterStorageKey('550e8400-e29b-41d4-a716-446655440000')).toBe(
        'verbTypeFilter_550e8400-e29b-41d4-a716-446655440000'
      )
    })
  })

  describe('createInputKey', () => {
    it('should create a key with mood, tense, and person', () => {
      expect(createInputKey('Indicativo', 'Presente', 'io')).toBe(
        'Indicativo:Presente:io'
      )
    })

    it('should handle different moods', () => {
      expect(createInputKey('Congiuntivo', 'Presente', 'io')).toBe(
        'Congiuntivo:Presente:io'
      )
      expect(createInputKey('Condizionale', 'Presente', 'io')).toBe(
        'Condizionale:Presente:io'
      )
      expect(createInputKey('Imperativo', 'Presente', 'tu')).toBe(
        'Imperativo:Presente:tu'
      )
    })

    it('should handle different tenses', () => {
      expect(createInputKey('Indicativo', 'Imperfetto', 'io')).toBe(
        'Indicativo:Imperfetto:io'
      )
      expect(createInputKey('Indicativo', 'Passato Remoto', 'io')).toBe(
        'Indicativo:Passato Remoto:io'
      )
      expect(createInputKey('Indicativo', 'Futuro Semplice', 'io')).toBe(
        'Indicativo:Futuro Semplice:io'
      )
    })

    it('should handle all Italian person forms', () => {
      expect(createInputKey('Indicativo', 'Presente', 'io')).toBe(
        'Indicativo:Presente:io'
      )
      expect(createInputKey('Indicativo', 'Presente', 'tu')).toBe(
        'Indicativo:Presente:tu'
      )
      expect(createInputKey('Indicativo', 'Presente', 'lui/lei')).toBe(
        'Indicativo:Presente:lui/lei'
      )
      expect(createInputKey('Indicativo', 'Presente', 'noi')).toBe(
        'Indicativo:Presente:noi'
      )
      expect(createInputKey('Indicativo', 'Presente', 'voi')).toBe(
        'Indicativo:Presente:voi'
      )
      expect(createInputKey('Indicativo', 'Presente', 'loro')).toBe(
        'Indicativo:Presente:loro'
      )
    })

    it('should handle simple form key', () => {
      expect(createInputKey('Participio', 'Passato', 'form')).toBe(
        'Participio:Passato:form'
      )
      expect(createInputKey('Gerundio', 'Presente', 'form')).toBe(
        'Gerundio:Presente:form'
      )
      expect(createInputKey('Infinito', 'Presente', 'form')).toBe(
        'Infinito:Presente:form'
      )
    })

    it('should preserve exact input without transformation', () => {
      // Ensure no case transformation or trimming happens
      expect(createInputKey('  Mood  ', '  Tense  ', '  person  ')).toBe(
        '  Mood  :  Tense  :  person  '
      )
    })
  })
})
