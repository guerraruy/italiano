import { normalizeString, validateAnswer } from './utils'

describe('utils', () => {
  describe('normalizeString', () => {
    it('should convert string to lowercase', () => {
      expect(normalizeString('HELLO')).toBe('hello')
      expect(normalizeString('HeLLo WoRLd')).toBe('hello world')
    })

    it('should trim whitespace from both ends', () => {
      expect(normalizeString('  hello  ')).toBe('hello')
      expect(normalizeString('\t hello \n')).toBe('hello')
    })

    it('should remove accents from characters', () => {
      expect(normalizeString('café')).toBe('cafe')
      expect(normalizeString('città')).toBe('citta')
      expect(normalizeString('perché')).toBe('perche')
      expect(normalizeString('così')).toBe('cosi')
    })

    it('should handle Italian accented characters', () => {
      expect(normalizeString('à')).toBe('a')
      expect(normalizeString('è')).toBe('e')
      expect(normalizeString('é')).toBe('e')
      expect(normalizeString('ì')).toBe('i')
      expect(normalizeString('ò')).toBe('o')
      expect(normalizeString('ù')).toBe('u')
    })

    it('should handle combined transformations', () => {
      expect(normalizeString('  CITTÀ  ')).toBe('citta')
      expect(normalizeString('  Perché  ')).toBe('perche')
      expect(normalizeString('   CAFFÈ   ')).toBe('caffe')
    })

    it('should handle empty string', () => {
      expect(normalizeString('')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(normalizeString('   ')).toBe('')
    })

    it('should preserve non-accented special characters', () => {
      expect(normalizeString("l'amore")).toBe("l'amore")
      expect(normalizeString('ciao-mondo')).toBe('ciao-mondo')
    })
  })

  describe('validateAnswer', () => {
    it('should return true for exact match', () => {
      expect(validateAnswer('bello', 'bello')).toBe(true)
      expect(validateAnswer('grande', 'grande')).toBe(true)
    })

    it('should return true for case-insensitive match', () => {
      expect(validateAnswer('BELLO', 'bello')).toBe(true)
      expect(validateAnswer('Bello', 'bello')).toBe(true)
      expect(validateAnswer('bello', 'BELLO')).toBe(true)
    })

    it('should return true when input has extra whitespace', () => {
      expect(validateAnswer('  bello  ', 'bello')).toBe(true)
      expect(validateAnswer('bello', '  bello  ')).toBe(true)
    })

    it('should return true for accent-insensitive match', () => {
      expect(validateAnswer('cattivo', 'cattivo')).toBe(true)
      expect(validateAnswer('piu', 'più')).toBe(true)
      expect(validateAnswer('più', 'piu')).toBe(true)
    })

    it('should return true for combined normalizations', () => {
      expect(validateAnswer('  PIÙ  ', 'piu')).toBe(true)
      expect(validateAnswer('BELLO', '  bello  ')).toBe(true)
    })

    it('should return false for incorrect answers', () => {
      expect(validateAnswer('bello', 'brutto')).toBe(false)
      expect(validateAnswer('grande', 'piccolo')).toBe(false)
    })

    it('should return false for partial matches', () => {
      expect(validateAnswer('bell', 'bello')).toBe(false)
      expect(validateAnswer('bello', 'bellissimo')).toBe(false)
    })

    it('should return false for empty input when answer is not empty', () => {
      expect(validateAnswer('', 'bello')).toBe(false)
      expect(validateAnswer('   ', 'bello')).toBe(false)
    })

    it('should return true for both empty strings', () => {
      expect(validateAnswer('', '')).toBe(true)
      expect(validateAnswer('   ', '   ')).toBe(true)
    })

    it('should handle Italian adjective forms correctly', () => {
      expect(validateAnswer('bella', 'bella')).toBe(true)
      expect(validateAnswer('belli', 'belli')).toBe(true)
      expect(validateAnswer('belle', 'belle')).toBe(true)
    })
  })
})
