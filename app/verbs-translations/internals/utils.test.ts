import { normalizeString, validateAnswer } from './utils'

describe('utils', () => {
  describe('normalizeString', () => {
    it('should convert string to lowercase', () => {
      expect(normalizeString('PARLARE')).toBe('parlare')
      expect(normalizeString('MaNGiaRe')).toBe('mangiare')
    })

    it('should trim whitespace from both ends', () => {
      expect(normalizeString('  dormire  ')).toBe('dormire')
      expect(normalizeString('\t scrivere \n')).toBe('scrivere')
    })

    it('should remove accents from characters', () => {
      expect(normalizeString('andrà')).toBe('andra')
      expect(normalizeString('potrò')).toBe('potro')
      expect(normalizeString('perché')).toBe('perche')
      expect(normalizeString('finirà')).toBe('finira')
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
      expect(normalizeString('  ANDRÀ  ')).toBe('andra')
      expect(normalizeString('  Perché  ')).toBe('perche')
      expect(normalizeString('   POTRÒ   ')).toBe('potro')
    })

    it('should handle empty string', () => {
      expect(normalizeString('')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(normalizeString('   ')).toBe('')
    })

    it('should preserve non-accented special characters', () => {
      expect(normalizeString("c'è")).toBe("c'e")
      expect(normalizeString('non-parlare')).toBe('non-parlare')
    })

    it('should handle reflexive verb pronouns', () => {
      expect(normalizeString('alzarsi')).toBe('alzarsi')
      expect(normalizeString('SVEGLIARSI')).toBe('svegliarsi')
      expect(normalizeString('  lavarsi  ')).toBe('lavarsi')
    })
  })

  describe('validateAnswer', () => {
    const verbId = 'test-verb-id'

    it('should return true for exact match', () => {
      expect(validateAnswer(verbId, 'parlare', 'parlare')).toBe(true)
      expect(validateAnswer(verbId, 'dormire', 'dormire')).toBe(true)
    })

    it('should return true for case-insensitive match', () => {
      expect(validateAnswer(verbId, 'PARLARE', 'parlare')).toBe(true)
      expect(validateAnswer(verbId, 'Mangiare', 'mangiare')).toBe(true)
      expect(validateAnswer(verbId, 'dormire', 'DORMIRE')).toBe(true)
    })

    it('should return true when input has extra whitespace', () => {
      expect(validateAnswer(verbId, '  parlare  ', 'parlare')).toBe(true)
      expect(validateAnswer(verbId, 'dormire', '  dormire  ')).toBe(true)
    })

    it('should return true for accent-insensitive match', () => {
      expect(validateAnswer(verbId, 'andra', 'andrà')).toBe(true)
      expect(validateAnswer(verbId, 'andrà', 'andra')).toBe(true)
      expect(validateAnswer(verbId, 'potro', 'potrò')).toBe(true)
      expect(validateAnswer(verbId, 'perche', 'perché')).toBe(true)
    })

    it('should return true for combined normalizations', () => {
      expect(validateAnswer(verbId, '  ANDRÀ  ', 'andra')).toBe(true)
      expect(validateAnswer(verbId, 'PERCHÉ', '  perche  ')).toBe(true)
    })

    it('should return false for incorrect answers', () => {
      expect(validateAnswer(verbId, 'parlare', 'dormire')).toBe(false)
      expect(validateAnswer(verbId, 'mangiare', 'bere')).toBe(false)
    })

    it('should return false for partial matches', () => {
      expect(validateAnswer(verbId, 'parl', 'parlare')).toBe(false)
      expect(validateAnswer(verbId, 'parlare', 'parlando')).toBe(false)
    })

    it('should return false for empty input when answer is not empty', () => {
      expect(validateAnswer(verbId, '', 'parlare')).toBe(false)
      expect(validateAnswer(verbId, '   ', 'dormire')).toBe(false)
    })

    it('should return true for both empty strings', () => {
      expect(validateAnswer(verbId, '', '')).toBe(true)
      expect(validateAnswer(verbId, '   ', '   ')).toBe(true)
    })

    it('should handle reflexive verbs correctly', () => {
      expect(validateAnswer(verbId, 'alzarsi', 'alzarsi')).toBe(true)
      expect(validateAnswer(verbId, 'SVEGLIARSI', 'svegliarsi')).toBe(true)
      expect(validateAnswer(verbId, '  lavarsi  ', 'lavarsi')).toBe(true)
    })

    it('should handle infinitive verb endings correctly', () => {
      expect(validateAnswer(verbId, 'parlare', 'parlare')).toBe(true) // -are
      expect(validateAnswer(verbId, 'credere', 'credere')).toBe(true) // -ere
      expect(validateAnswer(verbId, 'dormire', 'dormire')).toBe(true) // -ire
    })
  })
})
