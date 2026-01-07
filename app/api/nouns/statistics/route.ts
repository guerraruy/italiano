import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
import { statisticsService, nounService } from '@/lib/services'
import { updateNounStatisticSchema } from '@/lib/validation/nouns'

// GET /api/nouns/statistics - Get all noun statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Use statistics service to get noun statistics
    const statistics = await statisticsService.getNounStatistics(userId)

    // Return statistics as a map for easy lookup
    const statsMap = statistics.reduce(
      (acc, stat) => {
        acc[stat.nounId] = {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/nouns/statistics - Update noun statistics
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateNounStatisticSchema.parse(body)
    const { nounId, correct } = validatedData

    // Verify noun exists
    const noun = await nounService.getNounById(nounId)

    if (!noun) {
      return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
    }

    // Use statistics service to update noun statistic
    const statistic = await statisticsService.updateNounStatistic(
      userId,
      nounId,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
