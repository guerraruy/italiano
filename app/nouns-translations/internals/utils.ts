// Normalize strings for comparison (remove accents, lowercase, trim)
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export const validateAnswer = (
  nounId: string,
  userInput: string,
  correctAnswer: string
): boolean => {
  const normalizedInput = normalizeString(userInput)
  const normalizedAnswer = normalizeString(correctAnswer)

  return normalizedInput === normalizedAnswer
}
