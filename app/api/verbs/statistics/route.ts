import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to verify authentication
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}

// GET /api/verbs/statistics - Get all verb statistics for the logged-in user
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
    const statsMap = statistics.reduce((acc, stat) => {
      acc[stat.verbId] = {
        correctAttempts: stat.correctAttempts,
        wrongAttempts: stat.wrongAttempts,
        lastPracticed: stat.lastPracticed,
      }
      return acc
    }, {} as Record<string, { correctAttempts: number; wrongAttempts: number; lastPracticed: Date }>)

    return NextResponse.json({ statistics: statsMap }, { status: 200 })
  } catch (error) {
    console.error('Get verb statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/verbs/statistics - Update verb statistics
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { verbId, correct } = await request.json()

    // Validation
    if (!verbId || typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: 'Verb ID and correct flag are required' },
        { status: 400 }
      )
    }

    // Verify verb exists
    const verb = await prisma.verb.findUnique({
      where: { id: verbId },
    })

    if (!verb) {
      return NextResponse.json(
        { error: 'Verb not found' },
        { status: 404 }
      )
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

    return NextResponse.json({ 
      message: 'Statistics updated successfully',
      statistic,
    }, { status: 200 })
  } catch (error) {
    console.error('Update verb statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

