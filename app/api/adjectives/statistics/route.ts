import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { updateAdjectiveStatisticSchema } from '@/lib/validation/adjectives'
import { z } from 'zod'

// GET /api/adjectives/statistics - Get all adjective statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get all statistics for the user
    const statistics = await prisma.adjectiveStatistic.findMany({
      where: { userId },
      select: {
        id: true,
        adjectiveId: true,
        correctAttempts: true,
        wrongAttempts: true,
        lastPracticed: true,
      },
    })

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    const adjective = await prisma.adjective.findUnique({
      where: { id: adjectiveId },
    })

    if (!adjective) {
      return NextResponse.json(
        { error: 'Adjective not found' },
        { status: 404 }
      )
    }

    // Upsert adjective statistics
    const statistic = await prisma.adjectiveStatistic.upsert({
      where: {
        userId_adjectiveId: {
          userId,
          adjectiveId,
        },
      },
      update: {
        correctAttempts: correct ? { increment: 1 } : undefined,
        wrongAttempts: !correct ? { increment: 1 } : undefined,
        lastPracticed: new Date(),
      },
      create: {
        userId,
        adjectiveId,
        correctAttempts: correct ? 1 : 0,
        wrongAttempts: correct ? 0 : 1,
        lastPracticed: new Date(),
      },
      select: {
        id: true,
        adjectiveId: true,
        correctAttempts: true,
        wrongAttempts: true,
        lastPracticed: true,
      },
    })

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
