import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { updateNounStatisticSchema } from '@/lib/validation/nouns'
import { z } from 'zod'

// GET /api/nouns/statistics - Get all noun statistics for the logged-in user
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get all statistics for the user
    const statistics = await prisma.nounStatistic.findMany({
      where: { userId },
      select: {
        id: true,
        nounId: true,
        correctAttempts: true,
        wrongAttempts: true,
        lastPracticed: true,
      },
    })

    // Return statistics as a map for easy lookup
    const statsMap = statistics.reduce((acc, stat) => {
      acc[stat.nounId] = {
        correctAttempts: stat.correctAttempts,
        wrongAttempts: stat.wrongAttempts,
        lastPracticed: stat.lastPracticed,
      }
      return acc
    }, {} as Record<string, { correctAttempts: number; wrongAttempts: number; lastPracticed: Date }>)

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
    const noun = await prisma.noun.findUnique({
      where: { id: nounId },
    })

    if (!noun) {
      return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
    }

    // Upsert noun statistics
    const statistic = await prisma.nounStatistic.upsert({
      where: {
        userId_nounId: {
          userId,
          nounId,
        },
      },
      update: {
        correctAttempts: correct ? { increment: 1 } : undefined,
        wrongAttempts: !correct ? { increment: 1 } : undefined,
        lastPracticed: new Date(),
      },
      create: {
        userId,
        nounId,
        correctAttempts: correct ? 1 : 0,
        wrongAttempts: correct ? 0 : 1,
        lastPracticed: new Date(),
      },
      select: {
        id: true,
        nounId: true,
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
