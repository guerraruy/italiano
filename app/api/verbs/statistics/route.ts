import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { updateVerbStatisticSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// GET /api/verbs/statistics - Get all verb statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get all statistics for the user
    const statistics = await prisma.verbStatistic.findMany({
      where: { userId },
      select: {
        id: true,
        verbId: true,
        correctAttempts: true,
        wrongAttempts: true,
        lastPracticed: true,
      },
    })

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
    const verb = await prisma.verb.findUnique({
      where: { id: verbId },
    })

    if (!verb) {
      return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
    }

    // Upsert verb statistics
    const statistic = await prisma.verbStatistic.upsert({
      where: {
        userId_verbId: {
          userId,
          verbId,
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
        correctAttempts: correct ? 1 : 0,
        wrongAttempts: correct ? 0 : 1,
        lastPracticed: new Date(),
      },
      select: {
        id: true,
        verbId: true,
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
