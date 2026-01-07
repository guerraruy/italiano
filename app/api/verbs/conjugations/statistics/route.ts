import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { statisticsService, verbService } from '@/lib/services'
import { updateConjugationStatisticSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// GET /api/verbs/conjugations/statistics - Get all conjugation statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Use statistics service to get conjugation statistics
    const statistics = await statisticsService.getConjugationStatistics(userId)

    // Return statistics as a map for easy lookup
    // Key format: "verbId:mood:tense:person"
    type StatsRecord = Record<
      string,
      { correctAttempts: number; wrongAttempts: number; lastPracticed: Date }
    >
    const statsMap = statistics.reduce<StatsRecord>((acc, stat) => {
      const key = `${stat.verbId}:${stat.mood}:${stat.tense}:${stat.person}`
      acc[key] = {
        correctAttempts: stat.correctAttempts,
        wrongAttempts: stat.wrongAttempts,
        lastPracticed: stat.lastPracticed,
      }
      return acc
    }, {})

    return NextResponse.json({ statistics: statsMap }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/verbs/conjugations/statistics - Update conjugation statistics
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateConjugationStatisticSchema.parse(body)
    const { verbId, mood, tense, person, correct } = validatedData

    // Verify verb exists
    const verb = await verbService.getVerbById(verbId)

    if (!verb) {
      return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
    }

    // Use statistics service to update conjugation statistic
    const statistic = await statisticsService.updateConjugationStatistic(
      userId,
      verbId,
      mood,
      tense,
      person,
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
