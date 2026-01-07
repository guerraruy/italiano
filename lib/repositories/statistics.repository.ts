/**
 * Statistics Repository
 *
 * Handles all database operations for user statistics
 * (verb, noun, adjective, and conjugation statistics)
 */

import type {
  VerbStatistic,
  NounStatistic,
  AdjectiveStatistic,
  ConjugationStatistic,
} from '@prisma/client'

import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export class StatisticsRepository {
  // ===== Verb Statistics =====

  async findVerbStatisticsByUserId(userId: string): Promise<VerbStatistic[]> {
    try {
      return await prisma.verbStatistic.findMany({
        where: { userId },
        include: {
          verb: true,
        },
      })
    } catch (error) {
      logger.error('Failed to find verb statistics', error, { userId })
      throw error
    }
  }

  async findVerbStatistic(
    userId: string,
    verbId: string
  ): Promise<VerbStatistic | null> {
    try {
      return await prisma.verbStatistic.findUnique({
        where: {
          userId_verbId: { userId, verbId },
        },
      })
    } catch (error) {
      logger.error('Failed to find verb statistic', error, { userId, verbId })
      throw error
    }
  }

  async updateVerbStatistic(
    userId: string,
    verbId: string,
    correct: boolean
  ): Promise<VerbStatistic> {
    try {
      const existing = await prisma.verbStatistic.findUnique({
        where: {
          userId_verbId: { userId, verbId },
        },
      })

      if (existing) {
        return await prisma.verbStatistic.update({
          where: {
            userId_verbId: { userId, verbId },
          },
          data: {
            correctAttempts: existing.correctAttempts + (correct ? 1 : 0),
            wrongAttempts: existing.wrongAttempts + (correct ? 0 : 1),
            lastPracticed: new Date(),
          },
        })
      } else {
        return await prisma.verbStatistic.create({
          data: {
            userId,
            verbId,
            correctAttempts: correct ? 1 : 0,
            wrongAttempts: correct ? 0 : 1,
          },
        })
      }
    } catch (error) {
      logger.error('Failed to update verb statistic', error, {
        userId,
        verbId,
        correct,
      })
      throw error
    }
  }

  async resetVerbStatistics(userId: string, verbId: string): Promise<void> {
    try {
      await prisma.verbStatistic.deleteMany({
        where: { userId, verbId },
      })
    } catch (error) {
      logger.error('Failed to reset verb statistics', error, { userId, verbId })
      throw error
    }
  }

  // ===== Noun Statistics =====

  async findNounStatisticsByUserId(userId: string): Promise<NounStatistic[]> {
    try {
      return await prisma.nounStatistic.findMany({
        where: { userId },
        include: {
          noun: true,
        },
      })
    } catch (error) {
      logger.error('Failed to find noun statistics', error, { userId })
      throw error
    }
  }

  async updateNounStatistic(
    userId: string,
    nounId: string,
    correct: boolean
  ): Promise<NounStatistic> {
    try {
      const existing = await prisma.nounStatistic.findUnique({
        where: {
          userId_nounId: { userId, nounId },
        },
      })

      if (existing) {
        return await prisma.nounStatistic.update({
          where: {
            userId_nounId: { userId, nounId },
          },
          data: {
            correctAttempts: existing.correctAttempts + (correct ? 1 : 0),
            wrongAttempts: existing.wrongAttempts + (correct ? 0 : 1),
            lastPracticed: new Date(),
          },
        })
      } else {
        return await prisma.nounStatistic.create({
          data: {
            userId,
            nounId,
            correctAttempts: correct ? 1 : 0,
            wrongAttempts: correct ? 0 : 1,
          },
        })
      }
    } catch (error) {
      logger.error('Failed to update noun statistic', error, {
        userId,
        nounId,
        correct,
      })
      throw error
    }
  }

  async resetNounStatistics(userId: string, nounId: string): Promise<void> {
    try {
      await prisma.nounStatistic.deleteMany({
        where: { userId, nounId },
      })
    } catch (error) {
      logger.error('Failed to reset noun statistics', error, { userId, nounId })
      throw error
    }
  }

  // ===== Adjective Statistics =====

  async findAdjectiveStatisticsByUserId(
    userId: string
  ): Promise<AdjectiveStatistic[]> {
    try {
      return await prisma.adjectiveStatistic.findMany({
        where: { userId },
        include: {
          adjective: true,
        },
      })
    } catch (error) {
      logger.error('Failed to find adjective statistics', error, { userId })
      throw error
    }
  }

  async updateAdjectiveStatistic(
    userId: string,
    adjectiveId: string,
    correct: boolean
  ): Promise<AdjectiveStatistic> {
    try {
      const existing = await prisma.adjectiveStatistic.findUnique({
        where: {
          userId_adjectiveId: { userId, adjectiveId },
        },
      })

      if (existing) {
        return await prisma.adjectiveStatistic.update({
          where: {
            userId_adjectiveId: { userId, adjectiveId },
          },
          data: {
            correctAttempts: existing.correctAttempts + (correct ? 1 : 0),
            wrongAttempts: existing.wrongAttempts + (correct ? 0 : 1),
            lastPracticed: new Date(),
          },
        })
      } else {
        return await prisma.adjectiveStatistic.create({
          data: {
            userId,
            adjectiveId,
            correctAttempts: correct ? 1 : 0,
            wrongAttempts: correct ? 0 : 1,
          },
        })
      }
    } catch (error) {
      logger.error('Failed to update adjective statistic', error, {
        userId,
        adjectiveId,
        correct,
      })
      throw error
    }
  }

  async resetAdjectiveStatistics(
    userId: string,
    adjectiveId: string
  ): Promise<void> {
    try {
      await prisma.adjectiveStatistic.deleteMany({
        where: { userId, adjectiveId },
      })
    } catch (error) {
      logger.error('Failed to reset adjective statistics', error, {
        userId,
        adjectiveId,
      })
      throw error
    }
  }

  // ===== Conjugation Statistics =====

  async findConjugationStatisticsByUserId(
    userId: string
  ): Promise<ConjugationStatistic[]> {
    try {
      return await prisma.conjugationStatistic.findMany({
        where: { userId },
      })
    } catch (error) {
      logger.error('Failed to find conjugation statistics', error, { userId })
      throw error
    }
  }

  async updateConjugationStatistic(
    userId: string,
    verbId: string,
    mood: string,
    tense: string,
    person: string,
    correct: boolean
  ): Promise<ConjugationStatistic> {
    try {
      const existing = await prisma.conjugationStatistic.findUnique({
        where: {
          userId_verbId_mood_tense_person: {
            userId,
            verbId,
            mood,
            tense,
            person,
          },
        },
      })

      if (existing) {
        return await prisma.conjugationStatistic.update({
          where: {
            userId_verbId_mood_tense_person: {
              userId,
              verbId,
              mood,
              tense,
              person,
            },
          },
          data: {
            correctAttempts: existing.correctAttempts + (correct ? 1 : 0),
            wrongAttempts: existing.wrongAttempts + (correct ? 0 : 1),
            lastPracticed: new Date(),
          },
        })
      } else {
        return await prisma.conjugationStatistic.create({
          data: {
            userId,
            verbId,
            mood,
            tense,
            person,
            correctAttempts: correct ? 1 : 0,
            wrongAttempts: correct ? 0 : 1,
          },
        })
      }
    } catch (error) {
      logger.error('Failed to update conjugation statistic', error, {
        userId,
        verbId,
        mood,
        tense,
        person,
        correct,
      })
      throw error
    }
  }

  async resetConjugationStatistics(
    userId: string,
    verbId: string
  ): Promise<void> {
    try {
      await prisma.conjugationStatistic.deleteMany({
        where: { userId, verbId },
      })
    } catch (error) {
      logger.error('Failed to reset conjugation statistics', error, {
        userId,
        verbId,
      })
      throw error
    }
  }
}

// Export singleton instance
export const statisticsRepository = new StatisticsRepository()
