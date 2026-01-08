import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { adjectiveService, statisticsService } from '@/lib/services'
import { updateAdjectiveStatisticSchema } from '@/lib/validation/adjectives'

// GET /api/adjectives/statistics - Get all adjective statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Use statistics service to get adjective statistics
    const statistics = await statisticsService.getAdjectiveStatistics(userId)

    // Return statistics as a map for easy lookup
    const statsMap = statistics.reduce(
      (acc, stat) => {
        acc[stat.adjectiveId] = {
          correctAttempts: stat.correctAttempts,
          wrongAttempts: stat.wrongAttempts,
          lastPracticed: stat.lastPracticed,
        }
        return acc
      },
      {} as Record<
        string,
        { correctAttempts: number; wrongAttempts: number; lastPracticed: Date }
      >
    )

    return NextResponse.json({ statistics: statsMap }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
})

// POST /api/adjectives/statistics - Update adjective statistics
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateAdjectiveStatisticSchema.parse(body)
    const { adjectiveId, correct } = validatedData

    // Verify adjective exists
    const adjective = await adjectiveService.getAdjectiveById(adjectiveId)

    if (!adjective) {
      throw new NotFoundError('Adjective')
    }

    // Use statistics service to update adjective statistic
    const statistic = await statisticsService.updateAdjectiveStatistic(
      userId,
      adjectiveId,
      correct
    )

    return NextResponse.json(
      {
        message: 'Statistics updated successfully',
        statistic,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
})
