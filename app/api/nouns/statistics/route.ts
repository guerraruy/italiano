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

// GET /api/nouns/statistics - Get all noun statistics for the logged-in user
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
    console.error('Get noun statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/nouns/statistics - Update noun statistics
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { nounId, correct } = await request.json()

    // Validation
    if (!nounId || typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: 'Noun ID and correct flag are required' },
        { status: 400 }
      )
    }

    // Verify noun exists
    const noun = await prisma.noun.findUnique({
      where: { id: nounId },
    })

    if (!noun) {
      return NextResponse.json(
        { error: 'Noun not found' },
        { status: 404 }
      )
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

    return NextResponse.json({ 
      message: 'Statistics updated successfully',
      statistic,
    }, { status: 200 })
  } catch (error) {
    console.error('Update noun statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

