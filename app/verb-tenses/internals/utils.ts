// Normalize strings for comparison (remove accents, lowercase, trim)
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export const validateAnswer = (
  userInput: string,
  correctAnswer: string
): boolean => {
  const normalizedInput = normalizeString(userInput)
  const normalizedAnswer = normalizeString(correctAnswer)

  return normalizedInput === normalizedAnswer
}

// Get localStorage key for verb type filter
export const getFilterStorageKey = (userId: string) =>
  `verbTypeFilter_${userId}`

// Create input key for conjugation fields
export const createInputKey = (mood: string, tense: string, person: string) =>
  `${mood}:${tense}:${person}`
