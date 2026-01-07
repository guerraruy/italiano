/**
 * Statistics Service
 *
 * Handles all statistics-related business logic
 */

import { statisticsRepository } from '@/lib/repositories'

import { BaseService } from './base.service'

export class StatisticsService extends BaseService {
  constructor() {
    super('StatisticsService')
  }

  // ===== Verb Statistics =====

  /**
   * Get verb statistics for a user
   * @param userId - The ID of the user
   * @returns List of verb statistics
   */
  async getVerbStatistics(userId: string) {
    try {
      return await statisticsRepository.findVerbStatisticsByUserId(userId)
    } catch (error) {
      return this.handleError('getVerbStatistics', error, { userId })
    }
  }

  /**
   * Update verb statistic
   * @param userId - The ID of the user
   * @param verbId - The ID of the verb
   * @param correct - Whether the answer was correct
   * @returns The updated statistic
   */
  async updateVerbStatistic(userId: string, verbId: string, correct: boolean) {
    try {
      this.logOperation('updateVerbStatistic', { userId, verbId, correct })
      return await statisticsRepository.updateVerbStatistic(
        userId,
        verbId,
        correct
      )
    } catch (error) {
      return this.handleError('updateVerbStatistic', error, {
        userId,
        verbId,
        correct,
      })
    }
  }

  /**
   * Reset verb statistics
   * @param userId - The ID of the user
   * @param verbId - The ID of the verb
   * @returns Void
   */
  async resetVerbStatistics(userId: string, verbId: string): Promise<void> {
    try {
      this.logOperation('resetVerbStatistics', { userId, verbId })
      await statisticsRepository.resetVerbStatistics(userId, verbId)
    } catch (error) {
      return this.handleError('resetVerbStatistics', error, { userId, verbId })
    }
  }

  // ===== Noun Statistics =====

  /**
   * Get noun statistics for a user
   * @param userId - The ID of the user
   * @returns List of noun statistics
   */
  async getNounStatistics(userId: string) {
    try {
      return await statisticsRepository.findNounStatisticsByUserId(userId)
    } catch (error) {
      return this.handleError('getNounStatistics', error, { userId })
    }
  }

  /**
   * Update noun statistic
   * @param userId - The ID of the user
   * @param nounId - The ID of the noun
   * @param correct - Whether the answer was correct
   * @returns The updated statistic
   */
  async updateNounStatistic(userId: string, nounId: string, correct: boolean) {
    try {
      this.logOperation('updateNounStatistic', { userId, nounId, correct })
      return await statisticsRepository.updateNounStatistic(
        userId,
        nounId,
        correct
      )
    } catch (error) {
      return this.handleError('updateNounStatistic', error, {
        userId,
        nounId,
        correct,
      })
    }
  }

  /**
   * Reset noun statistics
   * @param userId - The ID of the user
   * @param nounId - The ID of the noun
   * @returns Void
   */
  async resetNounStatistics(userId: string, nounId: string): Promise<void> {
    try {
      this.logOperation('resetNounStatistics', { userId, nounId })
      await statisticsRepository.resetNounStatistics(userId, nounId)
    } catch (error) {
      return this.handleError('resetNounStatistics', error, { userId, nounId })
    }
  }

  // ===== Adjective Statistics =====

  /**
   * Get adjective statistics for a user
   * @param userId - The ID of the user
   * @returns List of adjective statistics
   */
  async getAdjectiveStatistics(userId: string) {
    try {
      return await statisticsRepository.findAdjectiveStatisticsByUserId(userId)
    } catch (error) {
      return this.handleError('getAdjectiveStatistics', error, { userId })
    }
  }

  /**
   * Update adjective statistic
   * @param userId - The ID of the user
   * @param adjectiveId - The ID of the adjective
   * @param correct - Whether the answer was correct
   * @returns The updated statistic
   */
  async updateAdjectiveStatistic(
    userId: string,
    adjectiveId: string,
    correct: boolean
  ) {
    try {
      this.logOperation('updateAdjectiveStatistic', {
        userId,
        adjectiveId,
        correct,
      })
      return await statisticsRepository.updateAdjectiveStatistic(
        userId,
        adjectiveId,
        correct
      )
    } catch (error) {
      return this.handleError('updateAdjectiveStatistic', error, {
        userId,
        adjectiveId,
        correct,
      })
    }
  }

  /**
   * Reset adjective statistics
   * @param userId - The ID of the user
   * @param adjectiveId - The ID of the adjective
   * @returns Void
   */
  async resetAdjectiveStatistics(
    userId: string,
    adjectiveId: string
  ): Promise<void> {
    try {
      this.logOperation('resetAdjectiveStatistics', { userId, adjectiveId })
      await statisticsRepository.resetAdjectiveStatistics(userId, adjectiveId)
    } catch (error) {
      return this.handleError('resetAdjectiveStatistics', error, {
        userId,
        adjectiveId,
      })
    }
  }

  // ===== Conjugation Statistics =====

  async getConjugationStatistics(userId: string) {
    try {
      return await statisticsRepository.findConjugationStatisticsByUserId(
        userId
      )
    } catch (error) {
      return this.handleError('getConjugationStatistics', error, { userId })
    }
  }

  async updateConjugationStatistic(
    userId: string,
    verbId: string,
    mood: string,
    tense: string,
    person: string,
    correct: boolean
  ) {
    try {
      this.logOperation('updateConjugationStatistic', {
        userId,
        verbId,
        mood,
        tense,
        person,
        correct,
      })
      return await statisticsRepository.updateConjugationStatistic(
        userId,
        verbId,
        mood,
        tense,
        person,
        correct
      )
    } catch (error) {
      return this.handleError('updateConjugationStatistic', error, {
        userId,
        verbId,
        mood,
        tense,
        person,
        correct,
      })
    }
  }

  /**
   * Reset conjugation statistics
   * @param userId - The ID of the user
   * @param verbId - The ID of the verb
   * @returns Void
   */
  async resetConjugationStatistics(
    userId: string,
    verbId: string
  ): Promise<void> {
    try {
      this.logOperation('resetConjugationStatistics', { userId, verbId })
      await statisticsRepository.resetConjugationStatistics(userId, verbId)
    } catch (error) {
      return this.handleError('resetConjugationStatistics', error, {
        userId,
        verbId,
      })
    }
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService()
