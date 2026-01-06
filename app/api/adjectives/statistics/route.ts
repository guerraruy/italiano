import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function authenticate(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null

    const decoded = verify(token, JWT_SECRET) as { userId: string }

    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/adjectives/statistics - Get all adjective statistics for the logged-in user
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
    const statsMap = statistics.reduce((acc, stat) => {
      acc[stat.adjectiveId] = {
        correctAttempts: stat.correctAttempts,
        wrongAttempts: stat.wrongAttempts,
        lastPracticed: stat.lastPracticed,
      }
      return acc
    }, {} as Record<string, { correctAttempts: number; wrongAttempts: number; lastPracticed: Date }>)

    return NextResponse.json({ statistics: statsMap }, { status: 200 })
  } catch (error) {
    console.error('Get adjective statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/adjectives/statistics - Update adjective statistics
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { adjectiveId, correct } = await request.json()

    // Validation
    if (!adjectiveId || typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: 'Adjective ID and correct flag are required' },
        { status: 400 }
      )
    }

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
        correctAttempts: correct
          ? { increment: 1 }
          : undefined,
        wrongAttempts: !correct
          ? { increment: 1 }
          : undefined,
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

    return NextResponse.json({ 
      message: 'Statistics updated successfully',
      statistic,
    }, { status: 200 })
  } catch (error) {
    console.error('Update adjective statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

