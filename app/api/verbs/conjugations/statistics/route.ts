import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function authenticate(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/verbs/conjugations/statistics - Get all conjugation statistics for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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
    console.error('Get conjugation statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/verbs/conjugations/statistics - Update conjugation statistics
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { verbId, mood, tense, person, correct } = await request.json()

    // Validation
    if (!verbId || !mood || !tense || !person || typeof correct !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Verb ID, mood, tense, person, and correct flag are required',
        },
        { status: 400 }
      )
    }

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
    console.error('Update conjugation statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
