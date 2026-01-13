import { fromJsonValue, toJsonInput } from './prisma-json'

describe('prisma-json utilities', () => {
  describe('fromJsonValue', () => {
    it('should return primitive string value unchanged', () => {
      const value = 'test string'
      const result = fromJsonValue<string>(value)

      expect(result).toBe('test string')
    })

    it('should return primitive number value unchanged', () => {
      const value = 42
      const result = fromJsonValue<number>(value)

      expect(result).toBe(42)
    })

    it('should return primitive boolean value unchanged', () => {
      const value = true
      const result = fromJsonValue<boolean>(value)

      expect(result).toBe(true)
    })

    it('should return null unchanged', () => {
      const value = null
      const result = fromJsonValue<null>(value)

      expect(result).toBeNull()
    })

    it('should return object unchanged', () => {
      const value = { singular: 'bello', plural: 'belli' }
      const result = fromJsonValue<{ singular: string; plural: string }>(value)

      expect(result).toEqual({ singular: 'bello', plural: 'belli' })
    })

    it('should return nested object unchanged', () => {
      const value = {
        maschile: { singular: 'bello', plural: 'belli' },
        femminile: { singular: 'bella', plural: 'belle' },
      }
      type AdjectiveForms = {
        maschile: { singular: string; plural: string }
        femminile: { singular: string; plural: string }
      }
      const result = fromJsonValue<AdjectiveForms>(value)

      expect(result).toEqual({
        maschile: { singular: 'bello', plural: 'belli' },
        femminile: { singular: 'bella', plural: 'belle' },
      })
    })

    it('should return array unchanged', () => {
      const value = ['one', 'two', 'three']
      const result = fromJsonValue<string[]>(value)

      expect(result).toEqual(['one', 'two', 'three'])
    })

    it('should return array of objects unchanged', () => {
      const value = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ]
      const result = fromJsonValue<Array<{ id: number; name: string }>>(value)

      expect(result).toEqual([
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ])
    })

    it('should preserve object reference', () => {
      const value = { key: 'value' }
      const result = fromJsonValue<{ key: string }>(value)

      expect(result).toBe(value)
    })
  })

  describe('toJsonInput', () => {
    it('should return simple object unchanged', () => {
      const value = { singular: 'cane', plural: 'cani' }
      const result = toJsonInput(value)

      expect(result).toEqual({ singular: 'cane', plural: 'cani' })
    })

    it('should return nested object unchanged', () => {
      const value = {
        maschile: { singular: 'alto', plural: 'alti' },
        femminile: { singular: 'alta', plural: 'alte' },
      }
      const result = toJsonInput(value)

      expect(result).toEqual({
        maschile: { singular: 'alto', plural: 'alti' },
        femminile: { singular: 'alta', plural: 'alte' },
      })
    })

    it('should return object with array property unchanged', () => {
      const value = {
        forms: ['io parlo', 'tu parli', 'lui parla'],
        tense: 'present',
      }
      const result = toJsonInput(value)

      expect(result).toEqual({
        forms: ['io parlo', 'tu parli', 'lui parla'],
        tense: 'present',
      })
    })

    it('should return array unchanged', () => {
      const value = [{ id: 1 }, { id: 2 }]
      const result = toJsonInput(value)

      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return empty object unchanged', () => {
      const value = {}
      const result = toJsonInput(value)

      expect(result).toEqual({})
    })

    it('should return empty array unchanged', () => {
      const value: unknown[] = []
      const result = toJsonInput(value)

      expect(result).toEqual([])
    })

    it('should preserve object reference', () => {
      const value = { key: 'value' }
      const result = toJsonInput(value)

      expect(result).toBe(value)
    })

    it('should handle object with mixed value types', () => {
      const value = {
        stringProp: 'text',
        numberProp: 123,
        booleanProp: false,
        nullProp: null,
        arrayProp: [1, 2, 3],
        nestedProp: { inner: 'value' },
      }
      const result = toJsonInput(value)

      expect(result).toEqual({
        stringProp: 'text',
        numberProp: 123,
        booleanProp: false,
        nullProp: null,
        arrayProp: [1, 2, 3],
        nestedProp: { inner: 'value' },
      })
    })
  })
})
