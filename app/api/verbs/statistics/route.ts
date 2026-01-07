import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { statisticsService, verbService } from '@/lib/services'
import { updateVerbStatisticSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// GET /api/verbs/statistics - Get all verb statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Use statistics service to get verb statistics
    const statistics = await statisticsService.getVerbStatistics(userId)

    // Return statistics as a map for easy lookup
    const statsMap = statistics.reduce(
      (acc, stat) => {
        acc[stat.verbId] = {
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

// POST /api/verbs/statistics - Update verb statistics
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateVerbStatisticSchema.parse(body)
    const { verbId, correct } = validatedData

    // Verify verb exists
    const verb = await verbService.getVerbById(verbId)

    if (!verb) {
      return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
    }

    // Use statistics service to update verb statistic
    const statistic = await statisticsService.updateVerbStatistic(
      userId,
      verbId,
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
