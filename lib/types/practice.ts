/**
 * Shared types for practice features
 *
 * These types represent the data structures used in practice hooks
 * for verbs, nouns, and adjectives translations.
 */

/**
 * Base interface for practice items with common properties
 */
interface BasePracticeItem {
  id: string
}

/**
 * Verb data for practice sessions
 */
export interface PracticeVerb extends BasePracticeItem {
  italian: string
  translation: string
  reflexive: boolean
  regular: boolean
}

/**
 * Noun data for practice sessions
 */
export interface PracticeNoun extends BasePracticeItem {
  translation: string
  translationPlural: string
  italian: string
  italianPlural: string
}

/**
 * Adjective data for practice sessions
 */
export interface PracticeAdjective extends BasePracticeItem {
  italian: string
  translation: string
  masculineSingular: string
  masculinePlural: string
  feminineSingular: string
  femininePlural: string
}

/**
 * Statistics for a practice item
 */
export interface PracticeStatistics {
  correct: number
  wrong: number
}

/**
 * Generic type for items that can be practiced
 */
export type PracticeItem = PracticeVerb | PracticeNoun | PracticeAdjective
