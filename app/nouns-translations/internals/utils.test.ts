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
    const nounId = 'test-noun-id'

    it('should return true for exact match', () => {
      expect(validateAnswer(nounId, 'gatto', 'gatto')).toBe(true)
      expect(validateAnswer(nounId, 'casa', 'casa')).toBe(true)
    })

    it('should return true for case-insensitive match', () => {
      expect(validateAnswer(nounId, 'GATTO', 'gatto')).toBe(true)
      expect(validateAnswer(nounId, 'Gatto', 'gatto')).toBe(true)
      expect(validateAnswer(nounId, 'gatto', 'GATTO')).toBe(true)
    })

    it('should return true when input has extra whitespace', () => {
      expect(validateAnswer(nounId, '  gatto  ', 'gatto')).toBe(true)
      expect(validateAnswer(nounId, 'gatto', '  gatto  ')).toBe(true)
    })

    it('should return true for accent-insensitive match', () => {
      expect(validateAnswer(nounId, 'citta', 'città')).toBe(true)
      expect(validateAnswer(nounId, 'città', 'citta')).toBe(true)
      expect(validateAnswer(nounId, 'caffe', 'caffè')).toBe(true)
      expect(validateAnswer(nounId, 'perche', 'perché')).toBe(true)
    })

    it('should return true for combined normalizations', () => {
      expect(validateAnswer(nounId, '  CITTÀ  ', 'citta')).toBe(true)
      expect(validateAnswer(nounId, 'PERCHÉ', '  perche  ')).toBe(true)
    })

    it('should return false for incorrect answers', () => {
      expect(validateAnswer(nounId, 'gatto', 'cane')).toBe(false)
      expect(validateAnswer(nounId, 'casa', 'libro')).toBe(false)
    })

    it('should return false for partial matches', () => {
      expect(validateAnswer(nounId, 'gat', 'gatto')).toBe(false)
      expect(validateAnswer(nounId, 'gatto', 'gattino')).toBe(false)
    })

    it('should return false for empty input when answer is not empty', () => {
      expect(validateAnswer(nounId, '', 'gatto')).toBe(false)
      expect(validateAnswer(nounId, '   ', 'gatto')).toBe(false)
    })

    it('should return true for both empty strings', () => {
      expect(validateAnswer(nounId, '', '')).toBe(true)
      expect(validateAnswer(nounId, '   ', '   ')).toBe(true)
    })

    it('should handle Italian plural forms correctly', () => {
      expect(validateAnswer(nounId, 'gatti', 'gatti')).toBe(true)
      expect(validateAnswer(nounId, 'case', 'case')).toBe(true)
      expect(validateAnswer(nounId, 'libri', 'libri')).toBe(true)
    })
  })
})
