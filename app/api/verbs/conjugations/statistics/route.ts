import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { updateConjugationStatisticSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// GET /api/verbs/conjugations/statistics - Get all conjugation statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get all statistics for the user
    const statistics = await prisma.conjugationStatistic.findMany({
      where: { userId },
      select: {
        id: true,
        verbId: true,
        mood: true,
        tense: true,
        person: true,
        correctAttempts: true,
        wrongAttempts: true,
        lastPracticed: true,
      },
    })

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
    const verb = await prisma.verb.findUnique({
      where: { id: verbId },
    })

    if (!verb) {
      return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
    }

    // Upsert conjugation statistics
    const statistic = await prisma.conjugationStatistic.upsert({
      where: {
        userId_verbId_mood_tense_person: {
          userId,
          verbId,
          mood,
          tense,
          person,
        },
      },
      update: {
        correctAttempts: correct ? { increment: 1 } : undefined,
        wrongAttempts: !correct ? { increment: 1 } : undefined,
        lastPracticed: new Date(),
      },
      create: {
        userId,
        verbId,
        mood,
        tense,
        person,
        correctAttempts: correct ? 1 : 0,
        wrongAttempts: correct ? 0 : 1,
        lastPracticed: new Date(),
      },
      select: {
        id: true,
        verbId: true,
        mood: true,
        tense: true,
        person: true,
        correctAttempts: true,
        wrongAttempts: true,
        lastPracticed: true,
      },
    })

    const key = `${statistic.verbId}:${statistic.mood}:${statistic.tense}:${statistic.person}`

    return NextResponse.json(
      {
        message: 'Statistics updated successfully',
        statistic: {
          id: statistic.id,
          key,
          correctAttempts: statistic.correctAttempts,
          wrongAttempts: statistic.wrongAttempts,
          lastPracticed: statistic.lastPracticed,
        },
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
